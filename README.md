# 腾讯校招求职平台

AI智能匹配的腾讯校园招聘求职平台，支持桌面端、Android、iOS多端适配。

## 技术栈

- **前端**: React 18 + Vite + Tailwind CSS + PWA
- **后端**: Express.js + sql.js (SQLite)
- **跨平台**: PWA方案，支持安装到桌面/手机主屏

## 快速启动

### Windows
```bash
# 双击启动
start.bat

# 或手动启动
cd server && npm install && node src/index.js
cd client && npm install && npm run dev
```

### macOS/Linux
```bash
chmod +x start.sh
./start.sh
```

## 访问地址

| 端 | 地址 | 说明 |
|---|---|---|
| 用户端 | http://localhost:5173 | 首页登录 |
| HR端 | http://localhost:5173/hr/login | HR管理后台 |
| 管理端 | http://localhost:5173/admin | 运营管理后台 |
| 后端API | http://localhost:3001/api/health | API健康检查 |

## 测试账号

| 角色 | 账号 | 密码 |
|---|---|---|
| 用户 | 13800001001 | 无需密码 |
| HR | chen.hr@tencent.com | 无需密码 |

## 功能模块

### 用户端
- ✅ 手机号登录
- ✅ 简历上传（拍照/文件）
- ✅ AI简历解析（OCR模拟）
- ✅ AI岗位智能匹配（学历30%+专业20%+技能30%+经历20%）
- ✅ S/A/B/C匹配等级标签
- ✅ 一键投递（高级简历推送HR，普通跳转官网）
- ✅ 求职进度看板（已投递/已获邀/已拒绝）
- ✅ 个人中心（简历管理/帮助中心）

### HR端
- ✅ 企业邮箱登录
- ✅ 工作台数据概览
- ✅ 高匹配候选人推送
- ✅ 候选人列表管理（筛选/搜索）
- ✅ 面试邀约发送（时间/地点/形式）
- ✅ 面试结果标记
- ✅ 已拒绝候选人池
- ✅ AI二次匹配回捞（跨岗位智能推荐）
- ✅ 回捞后再次邀约

### 管理端
- ✅ 岗位/用户/投递数据统计
- ✅ 匹配等级分布图
- ✅ 岗位CRUD管理
- ✅ 数据看板

## 跨平台适配

- **桌面端**: 响应式布局，管理端宽屏适配
- **Android**: PWA安装，底部Tab Bar导航
- **iOS**: Safe Area适配，iOS风格UI组件
- **状态栏**: 适配iOS刘海屏/灵动岛

## 项目结构

```
├── client/                 # 前端项目
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   │   ├── user/      # 用户端6个页面
│   │   │   ├── hr/        # HR端3个页面
│   │   │   └── admin/     # 管理端1个页面
│   │   ├── components/    # 公共组件
│   │   ├── hooks/         # 自定义Hook
│   │   ├── utils/         # API工具
│   │   └── styles/        # 全局样式
│   └── public/            # 静态资源
├── server/                # 后端项目
│   └── src/
│       ├── routes/        # API路由
│       ├── models/        # 数据库模型
│       └── utils/         # 匹配算法
└── prototypes/            # 高保真原型（参考）
```
