/**
 * Samsung Battery Checker - Frontend Controller & Data Parsing Logic (Renderer Process)
 * 
 * Author: Djfox936
 * 
 * Responsible for managing the Electron application UI lifecycle, including:
 * 1. Initializing and switching languages dynamically (5 locales supported, persistent via localStorage)
 * 2. Starting a periodic 2-second ADB USB Plug-and-Play poll check
 * 3. Restricting access to Samsung-only devices (redirects unauthorized brands to warning view)
 * 4. Regex parsing of dumpsys battery telemetry logs (Samsung-specific ASOC and usage registers)
 * 5. Dynamic rendering of simple design visual metrics (gauge charts, lists, and diagnostic badges)
 */

// ==========================================================================
// 1. State Management
// ==========================================================================
let currentLanguage = 'en';       // Current UI language code (defaults to English, overridden by system locale)
let currentDeviceId = null;       // ADB device serial code of the active connected device
let deviceStatus = 'disconnected'; // Connection state: 'disconnected', 'unauthorized', 'connected', 'unsupported'
let deviceData = null;            // Cached parsed battery telemetry object
let pollInterval = null;          // Interval ID for adb status polling heartbeats

// ==========================================================================
// 2. DOM Elements Reference
// ==========================================================================
// Window shell & Header title elements
const elAppTitle = document.getElementById('app-title');
const elAppSubtitle = document.getElementById('app-subtitle');
const elConnectionStatus = document.getElementById('connection-status');
const elStatusDot = document.getElementById('status-dot');
const elLangSelect = document.getElementById('lang-select');

// Main view panels (Views)
const elWaitingView = document.getElementById('waiting-view');         // Connection instruction guide view
const elDashboardView = document.getElementById('dashboard-view');     // Main battery statistics dashboard
const elUnsupportedView = document.getElementById('unsupported-view'); // Access-blocked brand restriction warning card

// Waiting screen components
const elWaitingStatusTitle = document.getElementById('waiting-status-title');
const elWaitingStatusDesc = document.getElementById('waiting-status-desc');
const elWaitingIcon = document.getElementById('waiting-icon');
const elBtnRefresh = document.getElementById('refresh-btn');
const elTxtRefreshBtn = document.getElementById('txt-refresh-btn');

// Unsupported brand view elements
const elUnsupportedTitle = document.getElementById('unsupported-title');
const elUnsupportedSubtitle = document.getElementById('unsupported-subtitle');
const elLblUnsupportedDesc = document.getElementById('lbl-unsupported-desc');
const elLblUnsupportedBody = document.getElementById('lbl-unsupported-body');
const elLblDetectedDetails = document.getElementById('lbl-detected-details');
const elLblDetectedBrand = document.getElementById('lbl-detected-brand');
const elLblDetectedModel = document.getElementById('lbl-detected-model');
const elValDetectedBrand = document.getElementById('val-detected-brand');
const elValDetectedModel = document.getElementById('val-detected-model');
const elLblUnsupportedAction = document.getElementById('lbl-unsupported-action');
const elBtnUnsupportedRefresh = document.getElementById('unsupported-refresh-btn');
const elTxtUnsupportedRefresh = document.getElementById('txt-unsupported-refresh');

// Dashboard metrics widgets
const elHealthValue = document.getElementById('health-value');             // Battery health percentage text
const elHealthEvaluation = document.getElementById('health-evaluation');   // Hidden health label (preserved for safe evaluation lookup)
const elHealthRatingBadge = document.getElementById('health-rating-badge'); // Capsule badge overlay
const elHealthGaugeFill = document.getElementById('health-gauge-fill');     // SVG radial health indicator path
const elCycleValue = document.getElementById('cycle-value');               // Charge cycle counter
const elCycleBarFill = document.getElementById('cycle-bar-fill');           // Depletion progress overlay
const elLevelValue = document.getElementById('level-value');               // Live battery capacity text
const elLevelIconContainer = document.getElementById('level-icon-container');// Charging indicator shell
const elChargeBolt = document.getElementById('charge-bolt');               // Charge bolt typography element
const elStatusValue = document.getElementById('status-value');             // Dynamic battery status string (e.g. Charging)

// System detail specifications elements
const elValModelCode = document.getElementById('val-model-code');
const elValModelSub = document.getElementById('val-model-sub');
const elValTemp = document.getElementById('val-temp');
const elValTempSub = document.getElementById('val-temp-sub');
const elValVoltage = document.getElementById('val-voltage');
const elValVoltageSub = document.getElementById('val-voltage-sub');
const elValPowerSource = document.getElementById('val-power-source');
const elValMaxCurrent = document.getElementById('val-max-current');
const elValOsVersion = document.getElementById('val-os-version');
const elValSdkVersion = document.getElementById('val-sdk-version');
const elValHealthEvaluation = document.getElementById('val-health-evaluation'); // Dynamic diagnostics evaluation box

// First use calendar metrics elements
const elValFirstUse = document.getElementById('val-first-use');
const elValFirstUseSub = document.getElementById('val-first-use-sub');
const elLblFirstUse = document.getElementById('lbl-first-use');

// Dashboard footer control buttons
const elBtnDashboardRefresh = document.getElementById('dashboard-refresh-btn');
const elTxtDashboardRefresh = document.getElementById('txt-dashboard-refresh');

// Debug instruction guide text nodes
const elGuideMainTitle = document.getElementById('guide-main-title');
const elGuideStep1Title = document.getElementById('guide-step1-title');
const elGuideStep1Desc = document.getElementById('guide-step1-desc');
const elGuideStep2Title = document.getElementById('guide-step2-title');
const elGuideStep2Desc = document.getElementById('guide-step2-desc');
const elGuideStep3Title = document.getElementById('guide-step3-title');
const elGuideStep3Desc = document.getElementById('guide-step3-desc');

// Translation bindings label dictionary
const elLblHealth = document.getElementById('lbl-health');
const elLblCycles = document.getElementById('lbl-cycles');
const elLblLevel = document.getElementById('lbl-level');
const elLblStatus = document.getElementById('lbl-status');
const elLblModelCode = document.getElementById('lbl-model-code');
const elLblTemp = document.getElementById('lbl-temp');
const elLblVoltage = document.getElementById('lbl-voltage');
const elLblPowerSource = document.getElementById('lbl-power-source');
const elLblOsVersion = document.getElementById('lbl-os-version');
const elLblHealthStatus = document.getElementById('lbl-health-status');

// ==========================================================================
// 3. Samsung Device Lookup and Model Translator Database
// ==========================================================================
/**
 * Translates factory-assigned ADB hardware codes (e.g. SM-S9310) into customer-friendly commercial marketing names.
 * @param {string} modelCode - Raw device model code extracted from ADB getprop
 * @returns {string} Commercial marketing name, or fallback string with model code
 */
function getFriendlyModelName(modelCode) {
  if (!modelCode) return 'Samsung Phone';
  const cleaned = modelCode.trim();
  
  // Extract base model code (e.g. SM-S928B -> SM-S928)
  let baseModel = cleaned;
  const smMatch = cleaned.match(/SM-[A-Z0-9]+/i);
  if (smMatch) {
    baseModel = smMatch[0];
  }
  
  // Lookup dictionary for Samsung mainstream devices (Regularly updated)
  const samsungModels = {
    // S Flagship Series (S26 - S8)
    'SM-S948': 'Galaxy S26 Ultra',
    'SM-S946': 'Galaxy S26+',
    'SM-S941': 'Galaxy S26',
    'SM-S938': 'Galaxy S25 Ultra',
    'SM-S936': 'Galaxy S25+',
    'SM-S931': 'Galaxy S25',
    'SM-S928': 'Galaxy S24 Ultra',
    'SM-S926': 'Galaxy S24+',
    'SM-S921': 'Galaxy S24',
    'SM-S918': 'Galaxy S23 Ultra',
    'SM-S916': 'Galaxy S23+',
    'SM-S911': 'Galaxy S23',
    'SM-S908': 'Galaxy S22 Ultra',
    'SM-S906': 'Galaxy S22+',
    'SM-S901': 'Galaxy S22',
    'SM-G998': 'Galaxy S21 Ultra 5G',
    'SM-G996': 'Galaxy S21+ 5G',
    'SM-G991': 'Galaxy S21 5G',
    'SM-G990': 'Galaxy S21 FE 5G',
    'SM-G988': 'Galaxy S20 Ultra',
    'SM-G986': 'Galaxy S20+',
    'SM-G981': 'Galaxy S20 5G',
    'SM-G980': 'Galaxy S20',
    'SM-G977': 'Galaxy S10 5G',
    'SM-G975': 'Galaxy S10+',
    'SM-G973': 'Galaxy S10',
    'SM-G970': 'Galaxy S10e',
    'SM-G965': 'Galaxy S9+',
    'SM-G960': 'Galaxy S9',
    'SM-G955': 'Galaxy S8+',
    'SM-G950': 'Galaxy S8',
    
    // Z Foldable & Flip Series
    'SM-F966': 'Galaxy Z Fold7',
    'SM-F766': 'Galaxy Z Flip7',
    'SM-F956': 'Galaxy Z Fold6',
    'SM-F741': 'Galaxy Z Flip6',
    'SM-F946': 'Galaxy Z Fold5',
    'SM-F731': 'Galaxy Z Flip5',
    'SM-F936': 'Galaxy Z Fold4',
    'SM-F721': 'Galaxy Z Flip4',
    'SM-F926': 'Galaxy Z Fold3 5G',
    'SM-F711': 'Galaxy Z Flip3 5G',
    'SM-F916': 'Galaxy Z Fold2 5G',
    'SM-F707': 'Galaxy Z Flip 5G',
    'SM-F700': 'Galaxy Z Flip',
    'SM-F900': 'Galaxy Fold',
    
    // Note Productivity Series
    'SM-N986': 'Galaxy Note20 Ultra 5G',
    'SM-N981': 'Galaxy Note20 5G',
    'SM-N975': 'Galaxy Note10+',
    'SM-N970': 'Galaxy Note10',
    'SM-N960': 'Galaxy Note9',
    'SM-N950': 'Galaxy Note8',
    
    // FE Special Flagships
    'SM-S721': 'Galaxy S24 FE',
    'SM-S711': 'Galaxy S23 FE',

    // A Mid-range & Budget Series
    'SM-A566': 'Galaxy A56 5G',
    'SM-A366': 'Galaxy A36 5G',
    'SM-A556': 'Galaxy A55 5G',
    'SM-A356': 'Galaxy A35 5G',
    'SM-A546': 'Galaxy A54 5G',
    'SM-A346': 'Galaxy A34 5G',
    'SM-A156': 'Galaxy A15 5G',
    'SM-A256': 'Galaxy A25 5G',
    'SM-A536': 'Galaxy A53 5G',
    'SM-A336': 'Galaxy A33 5G',
    'SM-A736': 'Galaxy A73 5G',
    'SM-A528': 'Galaxy A52s 5G',
    'SM-A526': 'Galaxy A52 5G',
    'SM-A525': 'Galaxy A52',
    'SM-A725': 'Galaxy A72',
    'SM-A326': 'Galaxy A32 5G',
    'SM-A325': 'Galaxy A32',
    'SM-A426': 'Galaxy A42 5G',
    'SM-A515': 'Galaxy A51',
    'SM-A715': 'Galaxy A71',
    'SM-A505': 'Galaxy A50',
    'SM-A705': 'Galaxy A70',
    
    // Tab Premium Tablet Series
    'SM-X926': 'Galaxy Tab S10 Ultra 5G',
    'SM-X920': 'Galaxy Tab S10 Ultra (Wi-Fi)',
    'SM-X826': 'Galaxy Tab S10+ 5G',
    'SM-X820': 'Galaxy Tab S10+ (Wi-Fi)',
    'SM-X916': 'Galaxy Tab S9 Ultra',
    'SM-X910': 'Galaxy Tab S9 Ultra (Wi-Fi)',
    'SM-X816': 'Galaxy Tab S9+',
    'SM-X810': 'Galaxy Tab S9+ (Wi-Fi)',
    'SM-X716': 'Galaxy Tab S9',
    'SM-X710': 'Galaxy Tab S9 (Wi-Fi)',
    'SM-X906': 'Galaxy Tab S8 Ultra',
    'SM-X806': 'Galaxy Tab S8+',
    'SM-X706': 'Galaxy Tab S8',
    'SM-T870': 'Galaxy Tab S7',
    'SM-T970': 'Galaxy Tab S7+'
  };
  
  // Strip regional suffixes for exact matches (e.g. SM-S9310 / SM-S931B -> SM-S931)
  let lookupKey = baseModel;
  if (baseModel.length > 7) {
    const suffix = baseModel.slice(-1);
    if (/[A-Z0-9]/i.test(suffix)) {
      const stem = baseModel.slice(0, -1);
      if (samsungModels[stem]) {
        lookupKey = stem;
      }
    }
  }
  
  // Exact dictionary match
  if (samsungModels[lookupKey]) {
    return samsungModels[lookupKey];
  }
  
  // Fallback to fuzzy substring lookup
  for (const key in samsungModels) {
    if (baseModel.toUpperCase().includes(key.toUpperCase())) {
      return samsungModels[key];
    }
  }
  
  // Dynamic fallback mapping when unlisted (e.g. Samsung SM-S999B)
  return `Samsung ${cleaned}`;
}

// ==========================================================================
// 4. Dynamic Localization Engine
// ==========================================================================
/**
 * Localizes all labels and content elements based on selected language configuration.
 * @param {string} lang - Selected language code ('zh-TW', 'zh-CN', 'en', 'ja', 'ko')
 */
function updateLanguageUI(lang) {
  currentLanguage = lang;
  localStorage.setItem('samsung_battery_lang', lang); // Persist language preference
  
  const dict = window.translations[lang] || window.translations['en']; // Fallback to English
  
  // 1. Update title bars
  elAppTitle.textContent = dict.title;
  elAppSubtitle.textContent = dict.subtitle;
  elLangSelect.value = lang;
  
  // 2. Real-time system state labels update
  if (deviceStatus === 'disconnected') {
    elConnectionStatus.textContent = dict.noDevice;
    elWaitingStatusTitle.textContent = dict.noDevice;
    elWaitingStatusDesc.textContent = dict.searching;
  } else if (deviceStatus === 'unauthorized') {
    elConnectionStatus.textContent = dict.unauthorized;
    elWaitingStatusTitle.textContent = dict.unauthorized;
    elWaitingStatusDesc.textContent = dict.searching;
  } else if (deviceStatus === 'unsupported') {
    elConnectionStatus.textContent = dict.notSamsungTitle;
  } else {
    elConnectionStatus.textContent = dict.connected;
  }

  // 3. Instruction refresh btn update
  elTxtRefreshBtn.textContent = dict.refresh;
  
  // 4. Main telemetry metric title text
  elLblHealth.textContent = dict.health;
  elLblCycles.textContent = dict.cycles;
  elLblLevel.textContent = dict.currentLevel;
  elLblStatus.textContent = dict.status;
  
  // 5. Secondary device specifications title text
  elLblModelCode.textContent = dict.modelCode;
  elLblTemp.textContent = dict.temp;
  elLblVoltage.textContent = dict.voltage;
  elLblPowerSource.textContent = dict.powerSource;
  elLblOsVersion.textContent = dict.osVersion;
  elLblHealthStatus.textContent = dict.healthStatus;
  
  // 6. First use catalog title text
  elLblFirstUse.textContent = dict.firstUse;
  elValFirstUseSub.textContent = dict.firstUseSub;
  
  // 7. Refresh controls button update
  elTxtDashboardRefresh.textContent = dict.refresh;
  
  // 8. Connection debugging instruction guide list update
  elGuideMainTitle.textContent = dict.guideTitle;
  elGuideStep1Title.textContent = dict.step1Title;
  elGuideStep1Desc.textContent = dict.step1Desc;
  elGuideStep2Title.textContent = dict.step2Title;
  elGuideStep2Desc.textContent = dict.step2Desc;
  elGuideStep3Title.textContent = dict.step3Title;
  elGuideStep3Desc.textContent = dict.step3Desc;

  // 9. Unauthorized hardware restricted access error panel update
  if (elUnsupportedView) {
    elUnsupportedTitle.textContent = dict.notSamsungTitle;
    elUnsupportedSubtitle.textContent = dict.notSamsungDesc;
    elLblUnsupportedDesc.textContent = dict.notSamsungTitle;
    elLblUnsupportedBody.textContent = dict.notSamsungBody;
    elLblDetectedDetails.textContent = dict.notSamsungDetected;
    elLblDetectedBrand.textContent = dict.notSamsungBrand;
    elLblDetectedModel.textContent = dict.notSamsungModel;
    elLblUnsupportedAction.textContent = dict.notSamsungAction;
    elTxtUnsupportedRefresh.textContent = dict.refresh;
  }
  
  // 10. Re-trigger diagnostic text generation if device details exist
  if (deviceStatus === 'connected' && deviceData) {
    renderBatteryTelemetry(deviceData);
  }
}

// ==========================================================================
// 5. UI View Panels Navigation Router
// ==========================================================================
/**
 * Shows the target viewport panel and hides others with soft fading transition.
 * @param {string} viewId - Target view ID ('waiting-view', 'dashboard-view', 'unsupported-view')
 */
function showView(viewId) {
  const views = [elWaitingView, elDashboardView, elUnsupportedView];
  views.forEach(v => {
    if (v) {
      if (v.id === viewId) {
        v.classList.add('active');
      } else {
        v.classList.remove('active');
      }
    }
  });
}

// ==========================================================================
// 6. Calendar Register Formatting Helper
// ==========================================================================
/**
 * Formats the raw 8-character string (e.g. "20251125") from register into local format.
 * @param {string} rawVal - Cleaned date string from ADB dumpsys
 * @returns {string} Formatted date (YYYY/MM/DD or YYYY-MM-DD depending on locale)
 */
function formatFirstUseDate(rawVal) {
  if (!rawVal) return '--';
  const cleaned = rawVal.trim().replace(/[\[\]]/g, ''); // Strip bracket formatting
  if (cleaned.length === 8) {
    const year = cleaned.slice(0, 4);
    const month = cleaned.slice(4, 6);
    const day = cleaned.slice(6, 8);
    // Branch based on regional date formatting conventions
    if (currentLanguage.startsWith('zh') || currentLanguage === 'ja' || currentLanguage === 'ko') {
      return `${year}/${month}/${day}`;
    } else {
      return `${year}-${month}-${day}`;
    }
  }
  return cleaned;
}

// ==========================================================================
// 7. Telemetry Parsing Engine
// ==========================================================================
/**
 * Converts dumpsys battery stdout dump into structured JavaScript object.
 * @param {string} rawOutput - Raw battery dumpsys shell standard output
 * @returns {object} Standardized parsed telemetry details
 */
function parseBatteryDump(rawOutput) {
  const data = {};
  const lines = rawOutput.split('\n');
  
  // Extract key-value configurations and strip surrounding brackets
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.includes(':')) {
      const parts = trimmed.split(':');
      const key = parts[0].trim();
      const val = parts[1].trim().replace(/[\[\]]/g, '');
      data[key] = val;
    }
  });
  
  // Custom Regex scan for Samsung unique FirstUseDate calendar attribute
  const firstUseMatch = rawOutput.match(/FirstUseDate:\s*\[?(\d{8})\]?/i);
  
  return {
    acPowered: data['AC powered'] === 'true',
    usbPowered: data['USB powered'] === 'true',
    wirelessPowered: data['Wireless powered'] === 'true',
    status: parseInt(data['status']) || 1, // 1: Unknown, 2: Charging, 3: Discharging, 4: Not charging, 5: Full
    health: parseInt(data['health']) || 1,
    level: parseInt(data['level']) || 0,
    voltage: parseInt(data['voltage']) || 0,
    temp: parseInt(data['temperature'] || data['temp']) || 0, // Fallback for various device mappings
    maxCurrent: parseInt(data['Max charging current']) || 0,
    
    // Samsung Proprietary registers
    // mSavedBatteryAsoc: Battery ASOC (Actual State of Charge / Health %)
    // mSavedBatteryBsoh: Backup health index (Found on certain tablets)
    savedBatteryAsoc: data['mSavedBatteryAsoc'] ? parseInt(data['mSavedBatteryAsoc']) : (data['mSavedBatteryBsoh'] ? Math.round(parseFloat(data['mSavedBatteryBsoh'])) : null),
    // mSavedBatteryUsage: Total lifetime accumulated battery usage. Divide by 100 to get cycles.
    savedBatteryUsage: data['mSavedBatteryUsage'] ? parseInt(data['mSavedBatteryUsage']) : null,
    firstUseDate: firstUseMatch ? firstUseMatch[1] : null
  };
}

// ==========================================================================
// 8. Graphic Rendering & Live Diagnostics Generator
// ==========================================================================
/**
 * Renders battery telemetry data into corresponding cards and controls.
 * @param {object} stats - Parsed battery details
 */
function renderBatteryTelemetry(stats) {
  const dict = window.translations[currentLanguage] || window.translations['en'];
  
  // ------------------------------------------------------------------------
  // A. Battery Health (ASOC) & SVG Progress Ring Animation
  // ------------------------------------------------------------------------
  let healthPercent = 100;
  
  if (stats.savedBatteryAsoc !== null && stats.savedBatteryAsoc > 0 && stats.savedBatteryAsoc <= 100) {
    healthPercent = stats.savedBatteryAsoc;
  } else {
    // Graceful degradation: Fallback to Android generic Health profiles if ASOC register is empty
    if (stats.health === 2) {
      healthPercent = 95;      // Good
    } else if (stats.health === 3 || stats.health === 5) {
      healthPercent = 75;      // Overheat / Warning
    } else if (stats.health === 4) {
      healthPercent = 50;      // Dead
    } else {
      healthPercent = 88;      // Standard default estimation
    }
  }

  // Calculate SVG stroke offset for smooth radial progression (2 * PI * r = 314.16 for r = 50)
  const dashArray = 314.16;
  const offset = dashArray - (healthPercent / 100) * dashArray;
  elHealthGaugeFill.style.strokeDashoffset = offset;
  elHealthValue.textContent = `${healthPercent}%`;
  
  // Health ranking and detailed dynamic diagnostic description builder
  let ratingText = '';
  let evaluationDesc = '';
  let badgeClass = '';
  
  if (healthPercent >= 95) {
    ratingText = dict.excellent;
    badgeClass = 'status-connected'; // Success Green
    evaluationDesc = currentLanguage === 'zh-TW' ? `您的電池狀態極佳（${healthPercent}%）。極低的化學老化，能為手機提供充足的續航力與頂尖的效能。繼續保持良好的充電習慣（儘量維持在 20%-80% 之間）！` :
                     currentLanguage === 'zh-CN' ? `您的电池状态极佳（${healthPercent}%）。极低的化学老化，能为手机提供充足的续航力与顶尖的性能。继续保持良好的充电习惯（尽量维持在 20%-80% 之间）！` :
                     currentLanguage === 'ja' ? `バッテリーの状態は極めて良好です（${healthPercent}%）。化学的劣化が非常に低く、本来の持続時間と最高のパフォーマンスを発揮できます。現在の充電習慣（20%-80%維持）を継続してください。` :
                     currentLanguage === 'ko' ? `배터리 상태가 최상입니다 (${healthPercent}%). 화학적 노화가 거의 없으며, 최장 사용 시간과 최고 성능을 제공합니다. 20%~80% 사이를 유지하는 좋은 충전 습관을 계속 유지해 주세요!` :
                     `Your battery is in excellent condition (${healthPercent}%). Very low chemical wear means maximum backup time and top performance. Keep up your healthy charging habits (20%-80%)!`;
  } else if (healthPercent >= 85) {
    ratingText = dict.good;
    badgeClass = 'status-connected';
    evaluationDesc = currentLanguage === 'zh-TW' ? `您的電池狀態良好（${healthPercent}%）。已有輕微的化學損耗，但不影響日常的正常使用與系統效能。` :
                     currentLanguage === 'zh-CN' ? `您的电池状态良好（${healthPercent}%）。已有轻微的化学损耗，但不影响日常的正常使用与系统性能。` :
                     currentLanguage === 'ja' ? `バッテリーの状態は良好です（${healthPercent}%）。軽度の経年劣化が見られますが、日常の通常使用やシステム動作には影響ありません。` :
                     currentLanguage === 'ko' ? `배터리 상태가 양호합니다 (${healthPercent}%). 가벼운 성능 감소가 발생했으나, 일상 사용 및 하드웨어 성능 유지에는 문제없는 수준입니다.` :
                     `Your battery is in good condition (${healthPercent}%). Some slight chemical aging is present but it does not impact daily usage or device performance.`;
  } else if (healthPercent >= 80) {
    ratingText = dict.normal;
    badgeClass = 'status-unauthorized'; // Attention Amber
    evaluationDesc = currentLanguage === 'zh-TW' ? `您的電池處於普通狀態（${healthPercent}%）。電池已接近正常損耗的臨界點。在重度使用下可能感覺到續航力有些微下降。` :
                     currentLanguage === 'zh-CN' ? `您的电池处于普通状态（${healthPercent}%）。电池已接近正常损耗的临界点。在重度使用下可能感觉到续航力有些微下降。` :
                     currentLanguage === 'ja' ? `バッテリーの状態は普通です（${healthPercent}%）。通常の劣化限度に近づいています。高負荷時の稼働時間が多少短くなったと感じる場合があります。` :
                     currentLanguage === 'ko' ? `배터리 상태가 보통입니다 (${healthPercent}%). 일반적인 배터리 노화 기준에 근접했습니다. 무거운 앱을 실행할 때 배터리가 다소 빠르게 소모될 수 있습니다.` :
                     `Your battery is in normal condition (${healthPercent}%). It is approaching the standard threshold of wear. You may notice slightly reduced backup time under heavy usage.`;
  } else {
    ratingText = dict.service;
    badgeClass = 'status-disconnected'; // Warning Red
    evaluationDesc = currentLanguage === 'zh-TW' ? `電池已顯著老化（${healthPercent}%）。建議前往三星授權服務中心更換電池，以恢復原本的續航力，並避免在高負載下發生系統降頻或無故關機。` :
                     currentLanguage === 'zh-CN' ? `电池已显著老化（${healthPercent}%）。建议前往三星授权服务中心更换电池，以恢复原本的续航力，并避免在高负载下发生系统降频或无故关机。` :
                     currentLanguage === 'ja' ? `バッテリーの劣化が著しいです（${healthPercent}%）。本来の駆動時間を取り戻し、パフォーマンス低下や予期せぬシャットダウンを防ぐため、サムスン公式サポートでのバッテリー交換を推奨します。` :
                     currentLanguage === 'ko' ? `배터리 수명이 크게 저하되었습니다 (${healthPercent}%). 원래의 사용 시간을 회복하고 예기치 못한 종료 또는 성능 강하를 방지하기 위해 삼성 서비스 센터에서 배터리 교체를 권장합니다.` :
                     `Your battery is significantly degraded (${healthPercent}%). We highly recommend visiting a Samsung authorized service center to replace the battery to restore full capacity and prevent unexpected shutdowns.`;
  }
  
  elHealthEvaluation.textContent = ratingText;
  elHealthRatingBadge.textContent = ratingText;
  elHealthRatingBadge.className = `badge ${badgeClass}`;
  elValHealthEvaluation.textContent = evaluationDesc;
  
  // ------------------------------------------------------------------------
  // B. Charge Cycles Counter & Depletion Line Progress
  // ------------------------------------------------------------------------
  let cycles = 0;
  if (stats.savedBatteryUsage !== null) {
    // Restore raw accumulated usage register back to cycles count (e.g. 17825 -> 178 cycles)
    cycles = Math.round(stats.savedBatteryUsage / 100);
  }
  elCycleValue.textContent = stats.savedBatteryUsage !== null ? `${cycles}` : '--';
  
  // Render depletion ratio based on typical lithium battery limit (500 cycles)
  const cyclePercent = Math.min((cycles / 500) * 100, 100);
  elCycleBarFill.style.width = `${cyclePercent}%`;
  
  // ------------------------------------------------------------------------
  // C. Live Charging Status & Bolt Animations
  // ------------------------------------------------------------------------
  elLevelValue.textContent = `${stats.level}%`;
  
  let statusText = dict.unknown;
  const isCharging = stats.status === 2;
  
  if (stats.status === 2) {
    statusText = dict.charging;
    elChargeBolt.classList.add('active'); // Start charging lightning animation
  } else if (stats.status === 3) {
    statusText = dict.discharging;
    elChargeBolt.classList.remove('active');
  } else if (stats.status === 5) {
    statusText = dict.full;
    elChargeBolt.classList.remove('active');
  } else if (stats.status === 4) {
    statusText = dict.notCharging;
    elChargeBolt.classList.remove('active');
  } else {
    elChargeBolt.classList.remove('active');
  }
  elStatusValue.textContent = statusText;
  
  // Color code dynamic battery widgets based on current status and bounds
  if (isCharging) {
    elLevelIconContainer.style.color = 'var(--color-primary)';
  } else if (stats.level <= 15) {
    elLevelIconContainer.style.color = 'var(--color-rose)';
  } else if (stats.level <= 35) {
    elLevelIconContainer.style.color = 'var(--color-amber)';
  } else {
    elLevelIconContainer.style.color = 'var(--color-emerald)';
  }

  // ------------------------------------------------------------------------
  // D. Extended Metrics calculations
  // ------------------------------------------------------------------------
  // First Use Date
  elValFirstUse.textContent = formatFirstUseDate(stats.firstUseDate);
  
  // Temperature calculations (Dumpsys outputs in 10ths of degrees C, e.g. 290 -> 29.0°C)
  const celsius = stats.temp / 10;
  const fahrenheit = (celsius * 9) / 5 + 32;
  elValTemp.textContent = `${celsius.toFixed(1)} °C`;
  elValTempSub.textContent = `${fahrenheit.toFixed(1)} °F`;
  
  // Voltage conversions (Dumpsys outputs in mV, e.g. 4124 mV -> 4.124 V)
  const volts = stats.voltage / 1000;
  elValVoltage.textContent = `${stats.voltage.toLocaleString()} mV`;
  elValVoltageSub.textContent = `${volts.toFixed(3)} V`;
  
  // Power connection source interpretation
  let sourceText = dict.battery;
  if (stats.acPowered) {
    sourceText = dict.ac;
  } else if (stats.usbPowered) {
    sourceText = dict.usb;
  } else if (stats.wirelessPowered) {
    sourceText = dict.wireless;
  }
  elValPowerSource.textContent = sourceText;
  
  // Max Charging Current (Microamps uA -> Milliamps mA)
  const currentMA = stats.maxCurrent / 1000;
  elValMaxCurrent.textContent = stats.maxCurrent > 0 ? `${dict.maxCurrent}: ~${currentMA.toFixed(0)} mA` : `${dict.maxCurrent}: --`;
}

// ==========================================================================
// 9. Core Hardware Telemetry Fetcher
// ==========================================================================
/**
 * Communicates with main process via IPC Bridge to query details and populate dashboard view.
 * @param {string} deviceId - Connected device ID serial
 */
async function fetchDeviceBatteryReport(deviceId) {
  try {
    const info = await window.api.getDeviceInfo(deviceId);
    if (!info) return;
    
    // Resolve marketing name and bind to elements
    const prettyName = getFriendlyModelName(info.model);
    elValModelCode.textContent = prettyName;
    elValModelSub.textContent = info.model;
    
    // Output operating system build versions
    elValOsVersion.textContent = `Android ${info.androidVersion}`;
    elValSdkVersion.textContent = `API SDK ${info.sdk}`;
    
    // Request raw logs, parse, and trigger rendering
    const rawStats = await window.api.getBatteryStats(deviceId);
    const parsedData = parseBatteryDump(rawStats);
    
    deviceData = parsedData;
    renderBatteryTelemetry(parsedData);
    
  } catch (err) {
    console.error('Failed to query hardware telemetry details:', err);
  }
}

// ==========================================================================
// 10. Device Scanning Scheduler & Security Locks
// ==========================================================================
/**
 * Periodic poll operation checks connected adb nodes and executes authorization/brand checks.
 */
async function pollDevices() {
  try {
    const devices = await window.api.getDevices();
    
    if (devices.length === 0) {
      // --------------------------------------------------------------------
      // Scenario A: No devices detected
      // --------------------------------------------------------------------
      deviceStatus = 'disconnected';
      currentDeviceId = null;
      deviceData = null;
      
      elStatusDot.className = 'status-dot status-disconnected';
      elConnectionStatus.textContent = window.translations[currentLanguage].noDevice;
      
      elWaitingStatusTitle.textContent = window.translations[currentLanguage].noDevice;
      elWaitingStatusDesc.textContent = window.translations[currentLanguage].searching;
      elWaitingIcon.style.color = 'var(--color-primary)';
      
      showView('waiting-view');
      
    } else {
      const device = devices[0]; // Capture primary active USB device node
      currentDeviceId = device.id;
      
      if (device.status === 'unauthorized') {
        // --------------------------------------------------------------------
        // Scenario B: Device detected but unauthorized via USB debugging
        // --------------------------------------------------------------------
        deviceStatus = 'unauthorized';
        deviceData = null;
        
        elStatusDot.className = 'status-dot status-unauthorized';
        elConnectionStatus.textContent = window.translations[currentLanguage].unauthorized;
        
        elWaitingStatusTitle.textContent = window.translations[currentLanguage].unauthorized;
        elWaitingStatusDesc.textContent = window.translations[currentLanguage].searching;
        elWaitingIcon.style.color = 'var(--color-amber)';
        
        showView('waiting-view');
        
      } else if (device.status === 'device') {
        // --------------------------------------------------------------------
        // Scenario C: Device authorized. Confirming hardware compatibility locks.
        // --------------------------------------------------------------------
        const info = await window.api.getDeviceInfo(device.id);
        
        if (!info) {
          deviceStatus = 'disconnected';
          showView('waiting-view');
          return;
        }

        // Security check condition: Brand or manufacturer strings must match 'samsung'
        const isSamsung = info.brand.includes('samsung') || info.manufacturer.includes('samsung');
        
        if (!isSamsung) {
          // ----------------------------------------------------------------
          // Scenario C-1: Restricted brand ➜ Enforce locks and direct to warning
          // ----------------------------------------------------------------
          deviceStatus = 'unsupported';
          deviceData = null;
          
          elStatusDot.className = 'status-dot status-disconnected'; // Block indication
          elConnectionStatus.textContent = window.translations[currentLanguage].notSamsungTitle;
          
          // Display identified brand & specification info in details list
          elValDetectedBrand.textContent = info.brand.toUpperCase();
          elValDetectedModel.textContent = info.model;
          
          showView('unsupported-view');
          
        } else {
          // ----------------------------------------------------------------
          // Scenario C-2: Authenticated Samsung device ➜ Proceed to dashboard
          // ----------------------------------------------------------------
          const wasNotConnected = deviceStatus !== 'connected';
          deviceStatus = 'connected';
          
          elStatusDot.className = 'status-dot status-connected'; // Safe access verified
          elConnectionStatus.textContent = window.translations[currentLanguage].connected;
          
          await fetchDeviceBatteryReport(device.id);
          
          if (wasNotConnected) {
            showView('dashboard-view');
          }
        }
      }
    }
  } catch (err) {
    console.error('An error occurred during scheduled poll sequence:', err);
  }
}

// ==========================================================================
// 11. Application Bootstrap & Event Handlers Bindings
// ==========================================================================
async function init() {
  // A. Detect system regional configuration settings
  let defaultLang = 'en';
  try {
    const systemLocale = await window.api.getSystemLocale();
    console.log('Detected native system locale value:', systemLocale);
    
    const savedLang = localStorage.getItem('samsung_battery_lang');
    if (savedLang) {
      defaultLang = savedLang; // Respect manual user selections
    } else if (systemLocale) {
      const lowerLocale = systemLocale.toLowerCase();
      if (lowerLocale.startsWith('zh')) {
        // Diverge Traditional Chinese vs Simplified Chinese
        if (lowerLocale.includes('cn') || lowerLocale.includes('hans')) {
          defaultLang = 'zh-CN';
        } else {
          defaultLang = 'zh-TW';
        }
      } else if (lowerLocale.startsWith('ja')) {
        defaultLang = 'ja';
      } else if (lowerLocale.startsWith('ko')) {
        defaultLang = 'ko';
      } else {
        defaultLang = 'en';
      }
    }
  } catch (e) {
    console.error('Failed to locate system language context, fallback to English:', e);
  }
  
  // Render dynamic UI translations
  updateLanguageUI(defaultLang);
  
  // B. Select dynamic locale switcher configuration event
  elLangSelect.addEventListener('change', (e) => {
    updateLanguageUI(e.target.value);
  });
  
  // C. Initialize manual synchronization reload button hooks
  // Connection waiting panel synchronization
  elBtnRefresh.addEventListener('click', async () => {
    elBtnRefresh.querySelector('svg').classList.add('icon-spin-hover');
    await pollDevices();
    setTimeout(() => {
      elBtnRefresh.querySelector('svg').classList.remove('icon-spin-hover');
    }, 1000);
  });
  
  // Main statistics dashboard panel synchronization
  elBtnDashboardRefresh.addEventListener('click', async () => {
    elBtnDashboardRefresh.querySelector('svg').classList.add('icon-spin-hover');
    await pollDevices();
    setTimeout(() => {
      elBtnDashboardRefresh.querySelector('svg').classList.remove('icon-spin-hover');
    }, 1000);
  });

  // Unsupported warning panel synchronization
  if (elBtnUnsupportedRefresh) {
    elBtnUnsupportedRefresh.addEventListener('click', async () => {
      elBtnUnsupportedRefresh.querySelector('svg').classList.add('icon-spin-hover');
      await pollDevices();
      setTimeout(() => {
        elBtnUnsupportedRefresh.querySelector('svg').classList.remove('icon-spin-hover');
      }, 1000);
    });
  }
 
  // D. Launch poll scan loop heartbeat checking every 2 seconds
  pollDevices(); // Instantly fire initial device check scan
  pollInterval = setInterval(pollDevices, 2000);
}

// Bind DOM loaded listener to trigger application boots sequence
document.addEventListener('DOMContentLoaded', init);
