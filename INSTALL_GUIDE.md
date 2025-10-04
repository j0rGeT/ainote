# AI Note - 安装指南

## 🚀 快速开始

### 1. 安装基础依赖

```bash
# 使用国内镜像加速（推荐）
npm install --registry https://registry.npmmirror.com

# 或使用默认源
npm install
```

### 2. 启动应用

```bash
# Web版本开发模式
npm run dev

# 访问 http://localhost:5173
```

### 3. 构建生产版本

```bash
# 构建Web版本
npm run build

# 预览生产版本
npm run preview
```

## 🖥️ 添加桌面端支持（可选）

如果您需要桌面应用，运行：

```bash
./add-electron.sh
```

然后就可以使用：

```bash
# 桌面端开发模式
npm run electron-dev

# 构建桌面应用
npm run electron-build
```

## 🛠️ 故障排除

### npm install 卡住或失败

**方案1: 使用国内镜像**
```bash
npm install --registry https://registry.npmmirror.com
```

**方案2: 清理缓存重新安装**
```bash
# 清理缓存和依赖
rm -rf node_modules package-lock.json
npm cache clean --force

# 重新安装
npm install --registry https://registry.npmmirror.com
```

**方案3: 使用yarn**
```bash
# 安装yarn
npm install -g yarn

# 使用yarn安装
yarn install
```

**方案4: 手动处理网络问题**
```bash
# 设置npm代理（如果需要）
npm config set registry https://registry.npmmirror.com
npm config set electron_mirror https://registry.npmmirror.com/electron/

# 安装
npm install
```

### 端口占用问题

如果5173端口被占用：

```bash
# 查看占用进程
lsof -i :5173

# 终止进程（替换PID）
kill -9 <PID>

# 或使用其他端口
npm run dev -- --port 3000
```

### TypeScript编译错误

```bash
# 检查TypeScript版本
npx tsc --version

# 重新构建
npm run build
```

### 权限问题

```bash
# macOS/Linux 给予执行权限
chmod +x generate-icons.sh
chmod +x add-electron.sh
```

## 📱 移动端使用

### PWA安装

1. 在手机浏览器访问应用网址
2. 选择"添加到主屏幕"
3. 应用将像原生app一样运行

### 手势支持

- **左右滑动**: 切换标签页
- **下滑**: 返回上级页面
- **触摸优化**: 44px最小触摸目标

## 🌐 部署到生产环境

### 静态网站托管

```bash
# 构建
npm run build

# 上传dist/文件夹到以下平台之一：
# - Netlify
# - Vercel  
# - GitHub Pages
# - 阿里云OSS
# - 腾讯云COS
```

### Docker部署

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# 构建镜像
docker build -t ainote .

# 运行容器  
docker run -p 80:80 ainote
```

### 服务器部署

```bash
# 1. 在服务器上克隆代码
git clone <your-repo>
cd ainote

# 2. 安装依赖
npm install --registry https://registry.npmmirror.com

# 3. 构建
npm run build

# 4. 使用nginx等服务器托管dist/目录
```

## 🔧 开发环境配置

### VSCode 推荐插件

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss", 
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint"
  ]
}
```

### 环境变量

创建 `.env.local`:

```env
# OpenAI API配置（可选）
VITE_OPENAI_API_BASE_URL=https://api.openai.com
VITE_DEFAULT_MODEL=gpt-3.5-turbo

# 应用配置
VITE_APP_NAME=AI Note
VITE_APP_VERSION=1.0.0
```

## 📋 系统要求

### 开发环境

- **Node.js**: 16.0.0+
- **npm**: 8.0.0+ 或 **yarn**: 1.22.0+
- **操作系统**: macOS / Windows / Linux

### 运行环境

- **浏览器**: Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
- **移动端**: iOS 14+, Android 8+
- **桌面端**: macOS 10.14+, Windows 10+, Linux (Ubuntu 18.04+)

## 💡 使用提示

1. **首次使用**: 在AI问答页面配置OpenAI API Key
2. **数据备份**: 使用桌面端的导出功能定期备份
3. **性能优化**: 清理浏览器缓存可解决加载问题  
4. **跨设备同步**: 通过导出/导入功能在不同设备间同步数据

## 📞 获取帮助

如果遇到问题：

1. 查看本安装指南
2. 阅读 ELECTRON_SETUP.md（桌面端问题）
3. 检查浏览器控制台错误信息
4. 确认网络连接和防火墙设置

祝您使用愉快！🎉