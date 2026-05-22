/**
 * Samsung Battery Checker - Localization Reference Dictionary (Translations Matrix)
 * 
 * Author: Djfox936
 * 
 * Defines support for five primary languages:
 * - zh-TW: Traditional Chinese (Default fallback locale)
 * - zh-CN: Simplified Chinese
 * - en: English
 * - ja: Japanese
 * - ko: Korean
 * 
 * Holds UI text, hardware status text, error codes, connection troubleshoot guides, 
 * and access restriction alerts. The frontend renderer query-binds keys here during initialization.
 */

window.translations = {
  // ==========================================================================
  // 1. Traditional Chinese (zh-TW)
  // ==========================================================================
  'zh-TW': {
    title: '三星手機電池健康度檢查器',
    subtitle: '三星裝置電池健康度與循環次數分析工具',
    searching: '正在偵測已連接的三星手機...',
    noDevice: '未偵測到裝置。請透過 USB 連接您的手機。',
    unauthorized: '裝置未授權。請在手機螢幕上點擊「允許 USB 偵錯」。',
    reading: '正在讀取電池數據，請稍候...',
    connected: '裝置已連接',
    
    // Core dashboard statistics
    health: '電池健康度',
    cycles: '電池循環次數',
    currentLevel: '目前電量',
    status: '充電狀態',
    
    // Device details specifications
    temp: '電池溫度',
    voltage: '電池電壓',
    powerSource: '電源來源',
    modelCode: '手機型號',
    osVersion: '系統版本',
    healthStatus: '健康狀態評估',
    chargerType: '充電器類型',
    maxCurrent: '最大充電電流',
    firstUse: '首次使用日期',
    firstUseSub: '電池首次啟用時間',
    
    // Battery state enumerations
    charging: '充電中',
    discharging: '放電中',
    full: '已充滿',
    notCharging: '未充電',
    unknown: '未知',
    
    // Charger connection sources
    ac: '交流電充電器 (AC)',
    usb: '電腦 USB 埠',
    wireless: '無線充電器',
    battery: '電池 (未充電)',
    
    // Health evaluation rating descriptions
    excellent: '極佳 (95% - 100%)',
    good: '良好 (85% - 95%)',
    normal: '正常 (80% - 85%)',
    service: '建議維修 (< 80%)',
    heavyWear: '嚴重磨損 (需更換)',
    
    // USB Debugging setup guide steps
    guideTitle: '如何啟用 USB 偵錯功能？',
    step1Title: '1. 啟用開發者選項',
    step1Desc: '開啟手機「設定」 ➔ 「關於手機」 ➔ 「軟體資訊」，連續點擊「版本號碼」7 次，直到螢幕顯示已啟用開發者模式。',
    step2Title: '2. 開啟 USB 偵錯',
    step2Desc: '返回「設定」主畫面，滑到最下方點擊「開發者選項」，找到「USB 偵錯」並將其開啟。',
    step3Title: '3. 連接並授權電腦',
    step3Desc: '使用傳輸線連接手機與電腦。當手機螢幕彈出「允許 USB 偵錯嗎？」提示時，勾選「永遠允許來自這台電腦的偵錯」並點擊「允許」。',
    
    // Action trigger controls
    refresh: '手動重新整理',
    troubleBtn: '連線排除教學',
    closeGuide: '返回主畫面',

    // Non-Samsung hardware warning card texts
    notSamsungTitle: '不支援的手機品牌',
    notSamsungDesc: '本應用程式專為三星 (Samsung) 手機設計',
    notSamsungBody: '此分析工具需要讀取三星裝置專有的底層核心電池暫存器暫存數據（如 `mSavedBatteryAsoc` 與 `mSavedBatteryUsage`），以提供精確的電池健康度與循環次數報告。由於非三星手機無此硬體暫存器，因此無法為您提供 analysis。',
    notSamsungDetected: '偵測到的裝置資訊：',
    notSamsungBrand: '廠牌',
    notSamsungModel: '型號',
    notSamsungAction: '請拔除目前裝置，並使用 USB 連線連接您的三星 (Samsung) 手機。'
  },

  // ==========================================================================
  // 2. Simplified Chinese (zh-CN)
  // ==========================================================================
  'zh-CN': {
    title: '三星手机电池健康度检查器',
    subtitle: '三星设备电池健康度与循环次数分析工具',
    searching: '正在检测已连接的三星手机...',
    noDevice: '未检测到设备。请通过 USB 连接您的手机。',
    unauthorized: '设备未授权。请在手机屏幕上点击“允许 USB 调试”。',
    reading: '正在读取电池数据，请稍候...',
    connected: '设备已连接',
    
    // Core dashboard statistics
    health: '电池健康度',
    cycles: '电池循环次数',
    currentLevel: '当前电量',
    status: '充电状态',
    
    // Device details specifications
    temp: '电池温度',
    voltage: '电池电压',
    powerSource: '电源来源',
    modelCode: '手机型号',
    osVersion: '系统版本',
    healthStatus: '健康状态评估',
    chargerType: '充电器类型',
    maxCurrent: '最大充电电流',
    firstUse: '首次使用日期',
    firstUseSub: '电池首次启用时间',
    
    // Battery state enumerations
    charging: '充电中',
    discharging: '放电中',
    full: '已充满',
    notCharging: '未充电',
    unknown: '未知',
    
    // Charger connection sources
    ac: '交流电充电器 (AC)',
    usb: '电脑 USB 端口',
    wireless: '无线充电器',
    battery: '电池 (未充电)',
    
    // Health evaluation rating descriptions
    excellent: '极佳 (95% - 100%)',
    good: '良好 (85% - 95%)',
    normal: '正常 (80% - 85%)',
    service: '建议维修 (< 80%)',
    heavyWear: '严重磨损 (需更换)',
    
    // USB Debugging setup guide steps
    guideTitle: '如何启用 USB 调试功能？',
    step1Title: '1. 启用开发者选项',
    step1Desc: '打开手机“设置” ➔ “关于手机” ➔ “软件信息”，连续点击“版本号”7次，直到屏幕显示已启用开发者模式。',
    step2Title: '2. 开启 USB 调试',
    step2Desc: '返回“设置”主画面，滑到最下方点击“开发者选项”，找到“USB 调试”并将其开启。',
    step3Title: '3. 连接并授权电脑',
    step3Desc: '使用数据线连接手机与电脑。当手机屏幕弹出“允许 USB 调试吗？”提示时，勾选“始终允许来自这台电脑的调试”并点击“允许”。',
    
    // Action trigger controls
    refresh: '手动刷新',
    troubleBtn: '连接排除指南',
    closeGuide: '返回主画面',

    // Non-Samsung hardware warning card texts
    notSamsungTitle: '不支持的手机品牌',
    notSamsungDesc: '本应用专为三星 (Samsung) 手机设计',
    notSamsungBody: '此分析工具需要读取三星设备专有的底层核心电池寄存器暂存数据（如 `mSavedBatteryAsoc` 与 `mSavedBatteryUsage`），以提供精确的电池健康度和循环次数报告。由于非三星手机无此硬件寄存器，因此无法为您提供分析。',
    notSamsungDetected: '检测到的设备信息：',
    notSamsungBrand: '品牌',
    notSamsungModel: '型号',
    notSamsungAction: '请拔除当前设备，并使用 USB 连接您的三星 (Samsung) 手机。'
  },

  // ==========================================================================
  // 3. English (en)
  // ==========================================================================
  'en': {
    title: 'Samsung Battery Checker',
    subtitle: 'Samsung Battery Health & Cycle Count Analyzer',
    searching: 'Searching for connected Samsung phones...',
    noDevice: 'No device detected. Please connect your phone via USB.',
    unauthorized: 'Device unauthorized. Please tap "Allow USB debugging" on your phone screen.',
    reading: 'Reading battery telemetry, please wait...',
    connected: 'Device Connected',
    
    // Core dashboard statistics
    health: 'Battery Health',
    cycles: 'Charge Cycles',
    currentLevel: 'Current Level',
    status: 'Charging Status',
    
    // Device details specifications
    temp: 'Temperature',
    voltage: 'Voltage',
    powerSource: 'Power Source',
    modelCode: 'Model Code',
    osVersion: 'Android Version',
    healthStatus: 'Health Evaluation',
    chargerType: 'Charger Connection',
    maxCurrent: 'Max Charging Current',
    firstUse: 'First Use Date',
    firstUseSub: 'Battery First Use Time',
    
    // Battery state enumerations
    charging: 'Charging',
    discharging: 'Discharging',
    full: 'Full',
    notCharging: 'Not Charging',
    unknown: 'Unknown',
    
    // Charger connection sources
    ac: 'AC Wall Charger',
    usb: 'Computer USB Port',
    wireless: 'Wireless Charger',
    battery: 'Battery (Discharging)',
    
    // Health evaluation rating descriptions
    excellent: 'Excellent (95% - 100%)',
    good: 'Good (85% - 95%)',
    normal: 'Normal (80% - 85%)',
    service: 'Service Recommended (< 80%)',
    heavyWear: 'Severely Degraded (Replace)',
    
    // USB Debugging setup guide steps
    guideTitle: 'How to Enable USB Debugging?',
    step1Title: '1. Enable Developer Options',
    step1Desc: 'Go to Settings ➔ About phone ➔ Software information. Tap "Build number" 7 times rapidly until "Developer mode has been enabled" appears.',
    step2Title: '2. Switch on USB Debugging',
    step2Desc: 'Go back to Settings main screen, scroll to the bottom, tap "Developer options". Find and toggle "USB debugging" to ON.',
    step3Title: '3. Connect & Authorize PC',
    step3Desc: 'Connect your phone to your computer via USB. When prompted on your phone screen with "Allow USB debugging?", check "Always allow from this computer" and tap "Allow".',
    
    // Action trigger controls
    refresh: 'Refresh Manually',
    troubleBtn: 'Troubleshooting Guide',
    closeGuide: 'Back to Dashboard',

    // Non-Samsung hardware warning card texts
    notSamsungTitle: 'Unsupported Device Brand',
    notSamsungDesc: 'This application is exclusively designed for Samsung phones',
    notSamsungBody: 'This analysis tool requires reading low-level proprietary battery registers unique to Samsung devices (such as `mSavedBatteryAsoc` and `mSavedBatteryUsage`) to deliver highly accurate health and cycle reports. Non-Samsung devices lack these custom hardware registers and cannot be analyzed.',
    notSamsungDetected: 'Detected Device Details:',
    notSamsungBrand: 'Brand',
    notSamsungModel: 'Model',
    notSamsungAction: 'Please unplug the current device and connect your Samsung phone via USB.'
  },

  // ==========================================================================
  // 4. Japanese (ja)
  // ==========================================================================
  'ja': {
    title: 'サムスン電池健康度チェッカー',
    subtitle: 'サムスン製スマホのバッテリー健康度および充電サイクル分析ツール',
    searching: '接続されたサムスン製スマホを検出しています...',
    noDevice: 'デバイスが検出されません。USBケーブルでスマートフォンを接続してください。',
    unauthorized: 'デバイスが未許可です。スマホ画面で「USBデバッグを許可する」をタップしてください。',
    reading: 'バッテリーデータを読み込んでいます。少々お待ちください...',
    connected: 'デバイス接続完了',
    
    // Core dashboard statistics
    health: 'バッテリー健康度',
    cycles: '充電サイクル数',
    currentLevel: '現在の残量',
    status: '充電ステータス',
    
    // Device details specifications
    temp: 'バッテリー温度',
    voltage: 'バッテリー電圧',
    powerSource: '電源ソース',
    modelCode: 'モデル番号',
    osVersion: 'Android バージョン',
    healthStatus: '健康状態の評価',
    chargerType: '充電器の種類',
    maxCurrent: '最大充電電流',
    firstUse: '初回使用日',
    firstUseSub: 'バッテリー初回使用時間',
    
    // Battery state enumerations
    charging: '充電中',
    discharging: '放電中',
    full: '満充電',
    notCharging: '充電していません',
    unknown: '不明',
    
    // Charger connection sources
    ac: 'AC充電器',
    usb: 'PCのUSBポート',
    wireless: 'ワイヤレス充電器',
    battery: 'バッテリー (放電中)',
    
    // Health evaluation rating descriptions
    excellent: '極めて良好 (95% - 100%)',
    good: '良好 (85% - 95%)',
    normal: '普通 (80% - 85%)',
    service: '要メンテナンス (< 80%)',
    heavyWear: '深刻な劣化 (交換推奨)',
    
    // USB Debugging setup guide steps
    guideTitle: 'USBデバッグを有効にする方法は？',
    step1Title: '1. 開発者向けオプションを有効化',
    step1Desc: '「設定」 ➔ 「端末情報」 ➔ 「ソフトウェア情報」を開きます。「ビルド番号」を7回連続でタップして開発者モードを有効にします。',
    step2Title: '2. USBデバッグをオンにする',
    step2Desc: '「設定」のホーム画面に戻り、一番下にある「開発者向けオプション」をタップします。「USBデバッグ」を探してオンにします。',
    step3Title: '3. 接続してPCを許可する',
    step3Desc: 'USBケーブルでスマホをPCに接続します。スマホ画面に「USBデバッグを許可しますか？」と表示されたら、「このパソコンからのデバッグを常に許可する」にチェックを入れて「許可」をタップします。',
    
    // Action trigger controls
    refresh: '手動更新',
    troubleBtn: 'トラブルシューティング',
    closeGuide: 'メイン画面に戻る',

    // Non-Samsung hardware warning card texts
    notSamsungTitle: 'サポートされていない端末',
    notSamsungDesc: '当アプリはサムスン（Samsung）スマートフォン専用です',
    notSamsungBody: 'この分析ツールは、サムスン製デバイス独自の低レベルバッテリーレジスタ（`mSavedBatteryAsoc` および `mSavedBatteryUsage` など）を読み取って、正確な健康状態と充電サイクル数を出力します。他社製スマホには該当ハードウェアレジスタが存在しないため、分析を行うことができません。',
    notSamsungDetected: '検出されたデバイス情報：',
    notSamsungBrand: 'メーカー',
    notSamsungModel: 'モデル',
    notSamsungAction: '現在の端末を取り外し、USBケーブルでサムスン（Samsung）スマートフォンを接続してください。'
  },

  // ==========================================================================
  // 5. Korean (ko)
  // ==========================================================================
  'ko': {
    title: '삼성 배터리 수명 측정기',
    subtitle: '삼성 기기 배터리 수명 상태 및 충전 사이클 분석 도구',
    searching: '연결된 삼성 휴대폰을 탐색하는 중...',
    noDevice: '기기가 감지되지 않았습니다. USB를 통해 휴대폰을 연결해 주세요.',
    unauthorized: '기기 권한이 없습니다. 휴대폰 화면에서 "USB 디버깅 허용"을 터치해 주세요.',
    reading: '배터리 데이터를 가져오는 중입니다. 잠시만 기다려 주세요...',
    connected: '기기 연결 완료',
    
    // Core dashboard statistics
    health: '배터리 수명',
    cycles: '충전 사이클 횟수',
    currentLevel: '현재 배터리 잔량',
    status: '충전 상태',
    
    // Device details specifications
    temp: '배터리 온도',
    voltage: '배터리 전압',
    powerSource: '전원 공급원',
    modelCode: '휴대폰 모델',
    osVersion: 'Android 버전',
    healthStatus: '배터리 상태 평가',
    chargerType: '충전기 종류',
    maxCurrent: '최대 충전 전류',
    firstUse: '최초 사용일',
    firstUseSub: '배터리 최초 활성화 시간',
    
    // Battery state enumerations
    charging: '충전 중',
    discharging: '방전 중',
    full: '충전 완료',
    notCharging: '충전 중이 아님',
    unknown: '알 수 없음',
    
    // Charger connection sources
    ac: 'AC 전원 충전기',
    usb: '컴퓨터 USB 포트',
    wireless: '무선 충전기',
    battery: '배터리 (충전 안 함)',
    
    // Health evaluation rating descriptions
    excellent: '최상 (95% - 100%)',
    good: '양호 (85% - 95%)',
    normal: '보통 (80% - 85%)',
    service: '점검 필요 (< 80%)',
    heavyWear: '심각한 노화 (교체 권장)',
    
    // USB Debugging setup guide steps
    guideTitle: 'USB 디버깅을 활성화하는 방법은?',
    step1Title: '1. 개발자 옵션 켜기',
    step1Desc: '휴대폰 "설정" ➔ "휴대폰 정보" ➔ "소프트웨어 정보"로 이동합니다. "빌드 번호"를 7번 연속으로 누르면 개발자 모드가 활성화됩니다.',
    step2Title: '2. USB 디버깅 활성화',
    step2Desc: '다시 "설정" 첫 화면으로 돌아가 맨 아래의 "개발자 옵션"을 누릅니다. "USB 디버깅" 항목을 찾아 활성화(ON)합니다.',
    step3Title: '3. 컴퓨터 연결 및 허용',
    step3Desc: 'USB 케이블로 휴대폰과 컴퓨터를 연결합니다. 휴대폰 화면에 "USB 디버깅을 허용하시겠습니까?" 팝업이 뜨면 "이 컴퓨터에서 항상 허용"을 체크하고 "허용"을 터치합니다.',
    
    // Action trigger controls
    refresh: '수동 새로고침',
    troubleBtn: '연결 오류 해결 방법',
    closeGuide: '메인 화면으로',

    // Non-Samsung hardware warning card texts
    notSamsungTitle: '지원하지 않는 휴대폰 브랜드',
    notSamsungDesc: '본 앱은 삼성 (Samsung) 스마트폰 전용으로 설계되었습니다',
    notSamsungBody: '이 분석 도구는 정확한 배터리 수명 및 충전 사이클 보고서를 제공하기 위해 삼성 기기 고유의 하위 배터리 레지스터 데이터(`mSavedBatteryAsoc` 및 `mSavedBatteryUsage`)를 읽어야 합니다. 타사 휴대폰에는 해당 하드웨어 레지스터가 없으므로 분석을 진행할 수 없습니다.',
    notSamsungDetected: '감지된 기기 정보:',
    notSamsungBrand: '제조사',
    notSamsungModel: '모델명',
    notSamsungAction: '현재 기기를 분리한 후 USB 케이블을 통해 삼성 (Samsung) 스마트폰을 연결해 주세요.'
  }
};
