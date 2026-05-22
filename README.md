# Samsung Battery Checker

An elegant Electron-based desktop application designed to retrieve accurate battery health (State of Health - SOH) and charge cycle metrics exclusively from Samsung Galaxy devices, featuring a simple design.

一款專為三星 (Samsung Galaxy) 裝置打造的優雅 Electron 桌面應用程式，採用簡潔設計，能精準讀取底層電池健康度 (SOH) 與充電循環次數指標。

<img width="925" height="723" alt="截圖 2026-05-22 下午5 25 37" src="https://github.com/user-attachments/assets/f512dbe6-ab9d-4078-ba51-e337832cd210" />
---

## Language Selection / 語言選擇
- [English Version](#english-version)
- [繁體中文版本](#繁體中文版本)

---

# English Version

Samsung Battery Checker communicates directly with your connected Samsung Galaxy device using a secure Android Debug Bridge (ADB) pipe. By accessing low-level hardware registers (`mSavedBatteryAsoc` and `mSavedBatteryUsage`), this utility provides a reliable diagnostics dashboard styled in a simple design language.

## Key Features
- **Simple Design Aesthetics**: Responsive split-grid dashboard layout featuring smooth animations, soft gradients, and zero vertical scrollbars.
- **Deep Hardware Telemetry**: Instantly parses and displays:
  - Battery State of Health (SOH %)
  - Precise Charge Cycles Count (with a visual wear progression slider)
  - Real-time battery temperature (Celsius & Fahrenheit)
  - Voltage levels (mV & V)
  - Charging state, power source, and max charging current limits
  - OS version and SDK API levels
- **Up-to-Date Device Catalog (2024–2026)**: Comprehensive, built-in device model dictionary mapping carrier/regional codes (SM-XXXX) to human-readable product names (e.g., Galaxy S26 Ultra, S25+, Fold7, Flip6, Tab S10 Ultra, A56, A36).
- **Brand Lockout Security**: Automatically validates manufacturer specifications and safely blocks non-Samsung devices to prevent invalid registry queries.
- **Multi-Language Support**: Fully localized in 5 languages: Traditional Chinese (`zh-TW`), Simplified Chinese (`zh-CN`), English (`en`), Japanese (`ja`), and Korean (`ko`).
- **Secure Architecture**: Implements secure IPC contexts (`contextIsolation: true`, `sandbox: true`) strictly isolating node.js code from the user interface.

## How it Works
1. When you connect a device over USB, the application triggers a real-time heartbeat polling cycle.
2. It calls the embedded ADB executable via `execFile` inside a secure Electron main process.
3. It fetches hardware properties using `getprop` and battery registers using `dumpsys battery`.
4. It extracts `mSavedBatteryAsoc` (battery health SOH) and `mSavedBatteryUsage` (charge cycles) and populates the dashboard.

---

## Getting Started

### Prerequisites (For All Users)
1. **Enable USB Debugging** on your Samsung Galaxy device:
   - Go to **Settings ➔ About phone ➔ Software information**.
   - Tap **Build number** 7 times until developer options are enabled.
   - Go back to Settings, tap **Developer options**, and toggle **USB debugging** to **ON**.
2. Connect your phone to your computer via USB. Tap **Allow** when prompted on your phone screen with "Allow USB debugging?".

### Direct Download (For Regular Users)
If you just want to run the application, **you do not need to install Node.js or compile any code!** Simply download the pre-packaged standalone binaries directly from the [GitHub Releases](https://github.com/Djfox936/SamsungBatteryChecker/releases) page:
*   **macOS (Apple Silicon & Intel)**: Download `Samsung.Battery.Checker_[version].app`. Double-click to open.
*   **Windows 10/11**: Download `SamsungBattery.Checker_[version]_Windows_Portable.zip`. Double-click to run the installer and the app will launch instantly.

---

### Developer Local Setup
If you want to view, modify, or run the application in a development environment:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Djfox936/SamsungBatteryChecker.git
   cd SamsungBatteryChecker
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Launch the Application**:
   ```bash
   npm start
   ```

### Packaging from Source (macOS App & Windows EXE)
To compile and package the production desktop application installers yourself:
```bash
npm run pack
```
This executes `electron-builder` under the hood to compile standalone binaries:
- **For macOS**: Generates a standard installer disk image `.dmg` and standalone `.app` bundle inside the `dist/` directory.
- **For Windows**: Generates a highly-compatible NSIS installer `.exe` inside the `dist/` directory.

---

# 繁體中文版本

三星手機電池健康度檢查器藉由安全且隔離的 Android 偵錯橋 (ADB) 機制，直接與您的行動裝置通訊。透過讀取三星硬體特有的底層暫存器（如 `mSavedBatteryAsoc` 與 `mSavedBatteryUsage`），本軟體能提供極為精準的電池診斷報告，並採用了簡潔的視覺風格設計。

## 核心特色
- **簡潔設計**：精心調整的橫向雙欄儀表板佈局，具備流暢微動畫、高質感色彩漸層，且完全無需上下滾動，一眼收納所有數值。
- **底層硬體遙測**：即時解析並顯示以下關鍵數據：
  - 電池健康度 (SOH %)
  - 精確的充電循環次數（搭配視覺化磨損程度指示條）
  - 即時電池溫度（攝氏與華氏雙顯示）
  - 電池電壓值 (mV & V)
  - 充電狀態、電源來源與最大輸入電流限制
  - 系統 Android 版本與 SDK API 等級
- **最新裝置型號字典 (2024–2026)**：內建完善的裝置型號資料庫，可自動將各區域型號（如 SM-XXXX）精準轉換為產品名稱（涵蓋 Galaxy S26 Ultra, S25+, Fold7, Flip6, Tab S10 Ultra, A56, A36 等最新發表產品）。
- **硬體品牌驗證安全鎖**：自動過濾並驗證連線裝置，非三星手機將被安全阻斷並跳轉至警告頁面，避免呼叫無效暫存器導致程式崩潰。
- **五國語系支援**：完美支援繁體中文 (`zh-TW`)、簡體中文 (`zh-CN`)、英文 (`en`)、日文 (`ja`) 與韓文 (`ko`)。
- **高標準安全性架構**：遵循 Electron 最新安全規範，啟用嚴格的上下文隔離 (`contextIsolation`) 與沙盒模式 (`sandbox`)，阻絕前端 UI 存取 Node.js 環境限制與風險。

## 運作原理
1. 當您透過 USB 連接手機時，應用程式會以毫秒級速度啟動即時輪詢偵測。
2. Electron 主行程透過 `execFile` 執行隨附的安全 ADB 執行檔。
3. 藉由執行 `getprop` 與 `dumpsys battery` 取得硬體識別與電池暫存器內容。
4. 精確抓取 `mSavedBatteryAsoc`（健康度）及 `mSavedBatteryUsage`（循環次數）數據並將其渲染呈現在主儀表板中。

---

## 快速開始

### 事前準備（所有用戶適用）
1. **在您的三星手機上啟用 USB 偵錯**：
   - 開啟手機**「設定」➔「關於手機」➔「軟體資訊」**。
   - 連續點擊**「版本號碼」7 次**直到螢幕顯示已啟用開發者模式。
   - 返回設定主頁，進入最下方的**「開發者選項」**，找到**「USB 偵錯」**並將其開啟。
2. 使用 USB 傳輸線連接手機與電腦。當手機螢幕彈出「允許 USB 偵錯嗎？」提示時，勾選「永遠允許來自這台電腦的偵錯」並點擊**「允許」**。

### 快速下載安裝（一般用戶）
如果您只想使用本工具，**不需要安裝 Node.js 或執行任何終端機指令！**請直接前往本專案的 [GitHub Releases](https://github.com/Djfox936/SamsungBatteryChecker/releases) 頁面下載我們預先封裝好的獨立安裝檔：
*   **macOS 系統 (Apple Silicon 與 Intel 處理器)**：下載 `Samsung.Battery.Checker_[version].dmg`。雙擊打開即可使用。
*   **Windows 系統 (Windows 10/11)**：下載 `SamsungBattery.Checker_[version]_Windows_Portable.zip`。雙擊打開執行安裝程式即可自動啟動應用程式。

---

### 開發者本地環境建置
如果您想要深入研究原始碼、修改 UI 或在本地執行開發環境：

1. **複製專案**：
   ```bash
   git clone https://github.com/Djfox936/SamsungBatteryChecker.git
   cd SamsungBatteryChecker
   ```
2. **安裝依賴套件**：
   ```bash
   npm install
   ```
3. **啟動應用程式**：
   ```bash
   npm start
   ```

### 原始碼編譯與打包（macOS App / Windows EXE）
如果您想要從原始碼自行編譯並封裝成獨立的桌面安裝檔：
```bash
npm run pack
```
這會自動調用 `electron-builder` 在本地環境進行編譯與建置：
-   **macOS 平台**：編譯完成後，會於 `dist/` 目錄中輸出一個標準的 `.dmg` 光碟映像檔與獨立的 `.app` 應用程式包。
-   **Windows 平台**：編譯完成後，會於 `dist/` 目錄中輸出一個高度相容的 NSIS `.exe` 安裝引導程式。

---

## License
This project is licensed under the MIT License - see the LICENSE file for details.
本專案採用 MIT 授權條款，詳情請參閱專案目錄下的 LICENSE 檔案。

## Author
Designed & Developed by **[Djfox936](https://github.com/Djfox936)**.
