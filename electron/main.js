const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

// Enable live reload for Electron in development
if (isDev) {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
  } catch (e) {
    console.log('electron-reload not available, skipping live reload');
  }
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false,
    icon: getAppIcon()
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on window
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Create menu
  createMenu();
}

function getAppIcon() {
  const iconPath = path.join(__dirname, '..', 'build');
  
  if (process.platform === 'darwin') {
    return path.join(iconPath, 'icon.icns');
  } else if (process.platform === 'win32') {
    return path.join(iconPath, 'icon.ico');
  } else {
    return path.join(iconPath, 'icon.png');
  }
}

function createMenu() {
  const template = [
    // macOS app menu
    ...(process.platform === 'darwin' ? [{
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { 
          label: '偏好设置',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),

    // File menu
    {
      label: '文件',
      submenu: [
        {
          label: '新建笔记',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-note');
          }
        },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('save-note');
          }
        },
        { type: 'separator' },
        {
          label: '导出数据',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            exportData();
          }
        },
        {
          label: '导入数据',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            importData();
          }
        },
        { type: 'separator' },
        ...(process.platform !== 'darwin' ? [
          { role: 'quit' }
        ] : [])
      ]
    },

    // Edit menu
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectall', label: '全选' },
        { type: 'separator' },
        {
          label: '查找',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            mainWindow.webContents.send('find');
          }
        }
      ]
    },

    // View menu
    {
      label: '查看',
      submenu: [
        {
          label: '笔记',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            mainWindow.webContents.send('switch-tab', 'notes');
          }
        },
        {
          label: '知识库',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            mainWindow.webContents.send('switch-tab', 'knowledge');
          }
        },
        {
          label: 'AI 问答',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            mainWindow.webContents.send('switch-tab', 'chat');
          }
        },
        { type: 'separator' },
        { role: 'reload', label: '重新加载' },
        { role: 'forceReload', label: '强制重新加载' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '实际大小' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '切换全屏' }
      ]
    },

    // Window menu
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'close', label: '关闭' },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' },
          { role: 'front', label: '前置全部窗口' }
        ] : [])
      ]
    },

    // Help menu
    {
      label: '帮助',
      submenu: [
        {
          label: '关于 AI Note',
          click: () => {
            showAboutDialog();
          }
        },
        {
          label: '检查更新',
          click: () => {
            shell.openExternal('https://github.com/your-repo/releases');
          }
        },
        { type: 'separator' },
        {
          label: '反馈问题',
          click: () => {
            shell.openExternal('https://github.com/your-repo/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function showAboutDialog() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '关于 AI Note',
    message: `AI Note v${app.getVersion()}`,
    detail: '智能笔记应用 - 记录想法，构建知识\n\n使用 Electron 和 React 构建',
    buttons: ['确定'],
    icon: getAppIcon()
  });
}

async function exportData() {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: '导出数据',
      defaultPath: `ai-note-backup-${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON 文件', extensions: ['json'] },
        { name: '所有文件', extensions: ['*'] }
      ],
      properties: ['createDirectory']
    });

    if (!result.canceled && result.filePath) {
      mainWindow.webContents.send('export-data', result.filePath);
    }
  } catch (error) {
    console.error('Export error:', error);
    dialog.showErrorBox('导出失败', '无法保存文件，请重试。');
  }
}

async function importData() {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: '导入数据',
      filters: [
        { name: 'JSON 文件', extensions: ['json'] },
        { name: '所有文件', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      mainWindow.webContents.send('import-data', result.filePaths[0]);
    }
  } catch (error) {
    console.error('Import error:', error);
    dialog.showErrorBox('导入失败', '无法读取文件，请检查文件格式。');
  }
}

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationURL) => {
    navigationEvent.preventDefault();
    shell.openExternal(navigationURL);
  });
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('write-file', async (event, filePath, data) => {
  try {
    fs.writeFileSync(filePath, data, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle protocol for deep linking (optional)
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('ainote', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('ainote');
}

// Handle deep link on macOS
app.on('open-url', (event, url) => {
  dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`);
});