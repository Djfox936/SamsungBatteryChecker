/**
 * Samsung Battery Checker - Electron Main Process Controller
 * 
 * Author: Djfox936
 * 
 * Manages the Electron desktop application lifecycle and secure IPC communications:
 * 1. Initializes browser windows with simple design frameless properties (hiddenInset traffic lights for macOS)
 * 2. Dynamically locates the embedded ADB binary for both development and packaged production environments
 * 3. Automatically resolves file execute permissions (chmod +x / 0o755) for ADB on macOS (Darwin)
 * 4. Proxies shell commands securely over context-isolated IPC channels to interact with the device
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');

let mainWindow;

// Determine if the application is running in a development or production bundle environment
const isDev = !app.isPackaged;

/**
 * Resolves the absolute path of the bundled adb binary depending on platform and environment.
 * @returns {string} Fully qualified path to the adb executable
 */
function getAdbPath() {
  let baseAdbPath;
  if (isDev) {
    // Development mode: locate inside root project subdirectory adbtools
    baseAdbPath = path.join(__dirname, 'adbtools');
  } else {
    // Production mode: locate inside process resources directory path
    baseAdbPath = path.join(process.resourcesPath, 'adbtools');
  }

  // Handle macOS Platform requirements
  if (process.platform === 'darwin') {
    const adbPath = path.join(baseAdbPath, 'macos', 'adb');
    // Ensure executable permissions: packaged resource files can lose execution flags; restore here dynamically
    try {
      if (fs.existsSync(adbPath)) {
        fs.chmodSync(adbPath, 0o755);
      }
    } catch (err) {
      console.error('Failed to apply execution flags (chmod) to macOS ADB:', err);
    }
    return adbPath;
  } 
  // Handle Windows Platform requirements
  else if (process.platform === 'win32') {
    return path.join(baseAdbPath, 'windows', 'adb.exe');
  } 
  // Standard fallback mapping
  else {
    return 'adb';
  }
}

// Instantiate fully qualified adb executable path
const adbBinaryPath = getAdbPath();
console.log('Resolved executable adb binary path:', adbBinaryPath);

/**
 * Creates and initializes the browser window with simple design styling properties.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 860,
    height: 700,
    minWidth: 800,
    minHeight: 620,
    // Enable hiddenInset titleBar configuration on macOS for high-end embedded traffic control buttons styling
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: true,
    show: false, // Prevent white startup flicker by delaying display
    backgroundColor: '#f1f3f6', // Match background color with base gray
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Inject secure preload script
      contextIsolation: true,                     // Strict context isolation
      nodeIntegration: false,                    // Disable direct access to node environments
      sandbox: true                              // Enable sandboxed renderer environment
    }
  });

  // Open external links in default system browser instead of Electron app
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      event.preventDefault();
      require('electron').shell.openExternal(url);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      require('electron').shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Load structural layout
  mainWindow.loadFile('index.html');

  // Trigger window display once content rendering is ready to prevent flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ==========================================================================
// Application Lifecycle Event Listeners
// ==========================================================================
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Respect typical macOS application UX conventions (keep app running in dock)
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Low-level asynchronous ADB process wrapper.
 * @param {Array<string>} args - Command-line arguments array passed to adb shell (e.g. ['devices'])
 * @returns {Promise<string>} stdout output string from adb
 */
function runAdb(args) {
  return new Promise((resolve, reject) => {
    execFile(adbBinaryPath, args, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// ==========================================================================
// Secure IPC Communication Channels
// ==========================================================================

// Channel 1: Resolve client operating system regional language settings
ipcMain.handle('get-system-locale', () => {
  return app.getLocale();
});

// Channel 2: Enumerate active adb node endpoints and parse authorization states
ipcMain.handle('get-devices', async () => {
  try {
    const rawDevices = await runAdb(['devices']);
    const lines = rawDevices.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const devices = [];
    
    // Ignore first stdout header line: "List of devices attached"
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(/\s+/);
      if (parts.length >= 2) {
        devices.push({
          id: parts[0],
          status: parts[1] // 'device' (authorized/ready) or 'unauthorized'
        });
      }
    }
    return devices;
  } catch (err) {
    console.error('Error fetching ADB device endpoints:', err);
    return [];
  }
});

// Channel 3: Fetch unique device hardware signature information to evaluate restrictions
ipcMain.handle('get-device-info', async (event, deviceId) => {
  try {
    // Run unified fetch commands in single shell to reduce processes startup costs and avoid sockets closures
    const rawInfo = await runAdb([
      '-s', deviceId,
      'shell',
      'getprop ro.product.brand; getprop ro.product.model; getprop ro.product.manufacturer; getprop ro.build.version.sdk; getprop ro.build.version.release'
    ]);
    
    const lines = rawInfo.split(/\r?\n/).map(line => line.trim());
    
    if (lines.length >= 5) {
      return {
        brand: lines[0].toLowerCase(),
        model: lines[1],
        manufacturer: lines[2].toLowerCase(),
        sdk: lines[3],
        androidVersion: lines[4]
      };
    }
    
    console.error('Unexpected hardware telemetry configuration output:', rawInfo);
    return null;
  } catch (err) {
    console.error(`Failed to locate telemetry for device: ${deviceId}`, err);
    return null;
  }
});

// Channel 4: Execute dumpsys battery logs query to pull detailed metrics
ipcMain.handle('get-battery-stats', async (event, deviceId) => {
  try {
    const stats = await runAdb(['-s', deviceId, 'shell', 'dumpsys', 'battery']);
    return stats;
  } catch (err) {
    console.error(`Failed to locate battery specifications for device: ${deviceId}`, err);
    throw err;
  }
});
