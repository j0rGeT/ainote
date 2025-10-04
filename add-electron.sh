#!/bin/bash

echo "🚀 添加 Electron 支持到 AI Note 应用"
echo "================================="

# 检查是否已经安装了基础依赖
if [ ! -d "node_modules" ]; then
    echo "❌ 请先运行 npm install 安装基础依赖"
    exit 1
fi

echo "📦 正在安装 Electron 依赖..."

# 使用淘宝镜像安装Electron相关依赖
npm install --save-dev \
    electron@latest \
    electron-builder@latest \
    concurrently@latest \
    wait-on@latest \
    --registry https://registry.npmmirror.com

if [ $? -eq 0 ]; then
    echo "✅ Electron 依赖安装成功！"
    
    # 更新 package.json 添加 Electron 脚本
    echo "⚙️  正在更新 package.json 脚本..."
    
    # 创建临时的完整 package.json
    cat > package-full.json << 'EOF'
{
  "name": "ainote",
  "version": "1.0.0",
  "description": "AI-powered note-taking application with knowledge base",
  "main": "electron/main.js",
  "homepage": "./",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "build-icons": "./generate-icons.sh",
    "build-web": "npm run build",
    "setup-electron": "node scripts/setup-electron.js",
    "build-desktop": "node scripts/build-desktop.js",
    "electron": "electron .",
    "electron-dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron-build": "npm run build && electron-builder",
    "electron-build-mac": "npm run build && electron-builder --mac",
    "electron-build-win": "npm run build && electron-builder --win",
    "electron-build-linux": "npm run build && electron-builder --linux",
    "electron-build-all": "npm run build && electron-builder --mac --win --linux"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1",
    "date-fns": "^2.29.3",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@types/uuid": "^9.0.2",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "concurrently": "^8.2.0",
    "electron": "^37.4.0",
    "electron-builder": "^24.6.3",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.5",
    "wait-on": "^7.0.1"
  },
  "build": {
    "appId": "com.ainote.app",
    "productName": "AI Note",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "node_modules/**/*",
      "!node_modules/.cache/**/*"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        },
        {
          "target": "zip",
          "arch": ["x64", "arm64"]
        }
      ],
      "icon": "build/icon.icns"
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        },
        {
          "target": "portable",
          "arch": ["x64", "ia32"]
        }
      ],
      "icon": "build/icon.ico"
    },
    "linux": {
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        },
        {
          "target": "deb",
          "arch": ["x64"]
        },
        {
          "target": "rpm",
          "arch": ["x64"]
        }
      ],
      "icon": "build/icon.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
EOF

    # 替换原有的 package.json
    mv package-full.json package.json
    
    echo "✅ package.json 更新完成！"
    echo ""
    echo "🎉 Electron 设置完成！"
    echo ""
    echo "📋 现在可以使用以下命令："
    echo "  npm run electron-dev      # 开发模式"
    echo "  npm run electron-build    # 构建桌面应用"
    echo ""
    echo "📖 详细说明请查看 ELECTRON_SETUP.md"
    
else
    echo "❌ Electron 依赖安装失败"
    echo "请检查网络连接或尝试手动安装："
    echo "  npm install --save-dev electron electron-builder concurrently wait-on"
    exit 1
fi