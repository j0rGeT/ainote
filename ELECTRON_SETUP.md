# AI Note - Electron跨端设置指南

## 🚀 Electron跨端支持已完成配置

您的AI笔记应用现已完全支持Electron桌面端，可以在Mac、Windows和Linux上运行。

## 📁 Electron文件结构

```
ainote/
├── electron/
│   ├── main.js          # Electron主进程
│   └── preload.js       # 预加载脚本
├── build/               # 应用图标
│   ├── icon.png         # Linux图标
│   ├── icon.icns        # macOS图标
│   └── icon.ico         # Windows图标
├── scripts/
│   ├── setup-electron.js    # Electron设置脚本
│   └── build-desktop.js     # 桌面端构建脚本
└── package.json         # 包含所有Electron配置
```

## 🛠️ 设置步骤

### 1. 安装Electron依赖

由于网络问题，您需要手动安装Electron依赖：

```bash
# 清理现有的问题依赖
rm -rf node_modules/electron node_modules/.cache
rm -rf node_modules/boolean

# 重新安装所有依赖
npm install

# 或者手动安装Electron相关依赖
npm install --save-dev electron@latest electron-builder concurrently wait-on
```

### 2. 验证安装

运行设置脚本检查：

```bash
npm run setup-electron
```

## 🚀 使用方法

### 开发模式

```bash
# 方法1: 使用组合命令（推荐）
npm run electron-dev

# 方法2: 分别启动
npm run dev          # 终端1: 启动Web开发服务器
npm run electron     # 终端2: 启动Electron应用
```

### 生产构建

```bash
# 构建当前平台
npm run electron-build

# 构建特定平台
npm run electron-build-mac     # macOS
npm run electron-build-win     # Windows  
npm run electron-build-linux   # Linux

# 使用智能构建脚本
npm run build-desktop          # 自动检测平台
node scripts/build-desktop.js --all  # 构建所有平台
```

## 🖥️ 平台支持

### 🍎 macOS
- **输出格式**: .dmg安装包, .zip压缩包
- **架构支持**: Intel (x64) + Apple Silicon (arm64)
- **系统要求**: macOS 10.14+

### 🪟 Windows  
- **输出格式**: .exe安装程序, 便携版.exe
- **架构支持**: 64位 (x64), 32位 (ia32)
- **系统要求**: Windows 10/11

### 🐧 Linux
- **输出格式**: .AppImage, .deb, .rpm
- **架构支持**: 64位 (x64)
- **发行版**: Ubuntu, Debian, Fedora, RHEL等

## ✨ 桌面端特色功能

### 🎯 原生体验
- **原生菜单栏**: 完整的应用菜单支持
- **键盘快捷键**: Cmd/Ctrl+N新建, Cmd/Ctrl+S保存等
- **系统集成**: 任务栏图标, 系统通知
- **窗口管理**: 最小化, 最大化, 全屏支持

### 📂 文件操作
- **数据导出**: JSON格式备份数据
- **数据导入**: 从备份文件恢复数据
- **文件对话框**: 原生文件选择器
- **拖拽支持**: 拖拽文件到应用（可扩展）

### 🔒 安全特性
- **沙盒模式**: Context Isolation启用
- **节点集成**: 默认禁用，通过预加载脚本安全访问
- **外部链接**: 自动用系统浏览器打开
- **更新检查**: 内置更新检查机制

## 🎨 自定义配置

### 修改应用信息

编辑 `package.json` 的build配置：

```json
{
  "build": {
    "appId": "com.yourcompany.ainote",
    "productName": "您的应用名称",
    "directories": {
      "output": "dist-electron"
    }
  }
}
```

### 更换应用图标

替换 `build/` 目录下的图标文件：
- `icon.icns` - macOS图标 (512x512)
- `icon.ico` - Windows图标 (256x256)  
- `icon.png` - Linux图标 (512x512)

### 添加新功能

1. **主进程功能**: 编辑 `electron/main.js`
2. **预加载脚本**: 编辑 `electron/preload.js`
3. **渲染进程**: 在React组件中使用 `window.electronAPI`

## 🔧 故障排除

### Electron安装问题

```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install

# 或使用yarn
yarn install
```

### 构建失败

```bash
# 检查build目录和图标文件
ls -la build/

# 手动构建web应用
npm run build

# 然后构建桌面应用
./node_modules/.bin/electron-builder
```

### 开发模式问题

```bash
# 检查端口5173是否被占用
lsof -i :5173

# 手动启动各个进程
npm run dev &
sleep 5 && npm run electron
```

## 📦 发布分发

### 代码签名（生产环境）

**macOS**:
```bash
# 需要Apple Developer证书
export CSC_IDENTITY_AUTO_DISCOVERY=false
npm run electron-build-mac
```

**Windows**:
```bash  
# 需要代码签名证书
npm run electron-build-win
```

### 自动更新

应用已预配置支持自动更新，需要：
1. 设置更新服务器
2. 配置发布平台（GitHub Releases等）
3. 在main.js中启用update检查

## 🎉 完成！

您的AI笔记应用现已完全支持跨平台桌面使用：

- ✅ **Web版本**: 浏览器中使用
- ✅ **移动端**: PWA安装到手机
- ✅ **桌面端**: 原生应用体验

立即开始使用：`npm run electron-dev`