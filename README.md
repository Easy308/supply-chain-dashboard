# 产业带智能看板

> 全国产业带供应链智能看板 · 31 省 · 84 条产业带 · 211 家详细供应商 · 28 个品类

基于 Node.js + Express + ECharts，深色科幻 UI，支持多账号、文件上传、地图交互、模糊搜索、外部企业平台联动。

## 快速开始

### 前置要求

- Node.js **18+**（https://nodejs.org/）

### Windows

双击 `启动.bat` → 浏览器打开 http://localhost:8080

### Linux / macOS

```bash
chmod +x start.sh
./start.sh
```

或手动：

```bash
npm install --omit=dev
node server.js
```

### Docker

```bash
docker build -t industrial-belt-dashboard .
docker run -d -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  --name ibd \
  industrial-belt-dashboard
```

### 默认账号

- 用户名：`admin`
- 密码：`admin123`
- **首次登录请立即修改密码**

## 部署到云服务器

### pm2 守护进程（推荐）

```bash
npm install -g pm2
pm2 start server.js --name industrial-belt
pm2 save
pm2 startup    # Linux 开机自启
```

### Nginx 反向代理 + HTTPS

```nginx
server {
    listen 80;
    server_name your-domain.com;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `8080` | 服务监听端口 |

## 功能清单

### 核心功能
- 中国地图交互（ECharts，散点 + 涟漪，悬停 / 点击进入详情）
- 模糊搜索：产品 / 品类 / 地区 / 县级 / 供应商名称 / 资质 / 合作品牌
- 外部企业平台联动：天眼查 / 企查查 / 爱企查 / 1688 / 中国制造网 / 百度 / 百度信用
- 搜索标签按 localStorage 频率动态排序，高频高亮
- 品类导航侧边栏（20 个品类），分页详情（每页 5 个产业带）
- 供应商详情面板：注册资本 / 实缴 / 资质 / 人数 / 营业额 / 联系方式 / 官网 / 合作品牌

### 账号系统
- 主账号 / 子账号双角色，session 管理
- 主账号可创建 / 禁用 / 删除子账号、重置任意密码
- 子账号可自助修改自身密码、忘记密码可发起重置请求
- 首次启动自动生成 `admin` / `admin123`

### 文件管理
- 多文件上传（图片 / 表格 / 文档 / PDF / 压缩包，单文件 ≤ 50MB）
- 主账号或上传者可删除
- 文件清单存储于 `data/files.json`

## 目录结构

```
.
├── server.js                  # Express 主服务
├── package.json
├── 启动.bat                   # Windows 一键启动
├── start.sh                   # Linux/Mac 启动脚本
├── Dockerfile                 # Docker 镜像构建
├── data/
│   ├── industrial-belts.json  # 211 家供应商数据（已纳入版本控制）
│   ├── users.json             # 账号数据（gitignore）
│   └── files.json             # 上传文件清单（gitignore，运行时生成）
├── public/                    # 前端静态资源
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js
│   └── data/china.json        # 中国地图 GeoJSON 本地缓存（582KB）
├── uploads/                   # 用户上传文件（gitignore）
└── expand-data.js             # 供应商数据扩充脚本
```

## 数据扩充

新增供应商：编辑 `data/industrial-belts.json`，按现有 JSON 结构追加，前端刷新即生效（无需重启服务）。

或运行 `node expand-data.js` 复用扩充脚本（按需修改）。

## 技术栈

- **后端**：Node.js 18+ · Express 5 · express-session · bcryptjs · multer
- **前端**：原生 HTML / CSS / JS · ECharts 5.4.3（CDN）· 中国地图 GeoJSON（本地）
- **部署**：pm2 / Docker / 任意 Node.js 云主机

## License

私有项目，仅供深圳弘歌电子有限公司内部使用。
