# AI Note - 智能笔记应用

一个功能完整的跨平台 AI 笔记应用，支持 Web、桌面端（Mac/Windows/Linux）和移动端，具备笔记记录、AI 问答和知识库管理功能。

## 功能特点

### 1. AI 大模型问答功能
- 支持与 AI 进行实时对话
- 可配置 OpenAI API Key
- 聊天记录本地存储
- 支持多轮对话

### 2. 笔记记录功能
- 创建和编辑笔记
- 支持标签管理
- 全文搜索功能
- 按标签筛选
- 自动生成标签

### 3. 知识库系统
- 笔记自动转换为知识库条目
- AI 自动生成摘要
- 知识检索和浏览
- 关联源笔记

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **日期处理**: date-fns
- **存储**: 浏览器本地存储
- **AI 服务**: OpenAI API

## 平台支持

### 🌐 Web 版本
- 支持所有现代浏览器
- 响应式设计，适配桌面和移动设备
- PWA 支持，可添加到主屏幕

### 🖥️ 桌面版本（Electron）
- **macOS**: 支持 Intel 和 Apple Silicon (.dmg/.zip)
- **Windows**: Windows 10/11 (.exe安装包/便携版)
- **Linux**: Ubuntu/Fedora/其他发行版 (.AppImage/.deb/.rpm)

### 📱 移动版本
- iOS Safari（PWA）
- Android Chrome（PWA）
- 触摸友好的界面
- 手势导航支持

## 安装和运行

### 开发环境

#### 1. 安装依赖
```bash
npm install
```

#### 2. 启动开发服务器
```bash
npm run dev
```

#### 3. 设置Electron桌面端
```bash
npm run setup-electron  # 首次设置
npm run electron-dev     # 启动桌面端开发
```

### 生产构建

#### Web 版本
```bash
npm run build-web
```

#### 桌面版本
```bash
# 自动构建当前平台
npm run build-desktop

# 构建特定平台
npm run electron-build-mac     # macOS
npm run electron-build-win     # Windows
npm run electron-build-linux   # Linux

# 构建所有平台
node scripts/build-desktop.js --all
```

## 使用说明

### 1. 配置 AI 服务
1. 点击 "AI 问答" 标签页
2. 点击设置按钮（⚙️）
3. 输入您的 OpenAI API Key
4. API Key 将安全存储在本地

### 2. 创建笔记
1. 点击 "笔记" 标签页
2. 点击 "新建" 按钮
3. 输入标题和内容
4. 添加标签（可选）
5. 点击 "保存"

### 3. 查看知识库
1. 点击 "知识库" 标签页
2. 浏览自动生成的知识条目
3. 使用搜索和标签筛选功能
4. 点击条目查看详细信息

### 4. 移动端使用
1. **PWA 安装**: 在浏览器中访问应用，点击"添加到主屏幕"
2. **手势导航**: 
   - 左右滑动切换标签页
   - 下滑返回上级页面
3. **触摸优化**: 所有按钮都针对触摸进行了优化

### 5. 桌面端功能（Electron）
1. **键盘快捷键**:
   - `Cmd/Ctrl + N`: 新建笔记
   - `Cmd/Ctrl + S`: 保存笔记
   - `Cmd/Ctrl + 1/2/3`: 切换标签页
   - `Cmd/Ctrl + E`: 导出数据
   - `Cmd/Ctrl + I`: 导入数据
2. **原生菜单栏**: 完整的跨平台菜单支持
3. **文件系统**: 原生文件对话框，支持导入导出
4. **系统集成**: 任务栏图标，系统通知
5. **跨平台**: 一次构建，多平台分发

> 📋 详细的Electron设置和使用指南请查看 [ELECTRON_SETUP.md](./ELECTRON_SETUP.md)

## 项目结构

```
src/
├── components/          # React 组件
│   ├── Chat.tsx        # AI 问答组件
│   ├── NoteEditor.tsx  # 笔记编辑器
│   ├── NoteList.tsx    # 笔记列表
│   └── KnowledgeBase.tsx # 知识库组件
├── services/           # 业务逻辑服务
│   ├── ai.ts           # AI 服务
│   ├── storage.ts      # 存储服务
│   └── knowledgeConverter.ts # 知识转换服务
├── hooks/              # React Hooks
│   └── useLocalStorage.ts
├── types/              # TypeScript 类型定义
│   └── index.ts
└── utils/              # 工具函数
```

## 数据存储

所有数据都存储在浏览器的 localStorage 中，包括：
- 笔记数据
- 知识库条目
- 聊天记录
- API 配置

## 注意事项

1. **API Key 安全**: API Key 仅存储在本地浏览器中，不会发送到任何服务器
2. **数据备份**: 建议定期备份重要笔记，数据仅存储在本地
3. **网络要求**: AI 功能需要网络连接和有效的 OpenAI API Key
4. **浏览器兼容性**: 支持现代浏览器（Chrome、Firefox、Safari、Edge）

## 开发

### 代码规范
```bash
npm run lint
```

### 类型检查
```bash
npm run build  # 构建时会进行类型检查
```

## 许可证

MIT License