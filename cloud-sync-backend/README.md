# Best2do Cloud Sync Backend（阿里云版）

这是给前端 `best2do-demo.html` 使用的云同步后端模板。

接口已与前端对齐：

- `POST /auth/login`
- `GET /sync`
- `POST /sync`

数据存储在阿里云 OSS，每个用户一个 JSON 文件。

---

## 1. 本地启动（先验证）

```bash
cd cloud-sync-backend
npm install
cp .env.example .env
```

编辑 `.env`：

- `JWT_SECRET`
- OSS 4项：`ALIYUN_OSS_REGION` / `ALIYUN_OSS_BUCKET` / `ALIYUN_ACCESS_KEY_ID` / `ALIYUN_ACCESS_KEY_SECRET`
- `AUTH_USERS_JSON`（登录白名单）

示例：

```env
AUTH_USERS_JSON=[{"email":"you@example.com","password":"123456","name":"zhen"}]
```

启动：

```bash
npm start
```

健康检查：

```bash
curl http://localhost:3000/health
```

---

## 2. 前端如何配置

在 Best2do 页面 `设置` 中填写：

- 云端 API 地址：`http://localhost:3000`（本地验证）
- 勾选“启用云端同步”
- 云端账号：`you@example.com`
- 云端密码：`123456`

点击：

1. `登录云端`
2. `上传本地到云端`（首迁移）
3. 另一设备 `从云端拉取`

---

## 3. 部署到阿里云函数计算（HTTP）

你可以用“自定义运行时”部署本服务，核心是暴露一个公网 HTTP 地址。

部署要点：

1. 运行环境：Node.js 18+
2. 启动命令：`npm start`
3. 函数端口：`3000`
4. 环境变量：按 `.env.example` 全部配置
5. 打开公网访问（函数 URL 或 API 网关绑定）

部署后，把公网地址填到前端的“云端 API 地址”。

---

## 4. 安全建议（上线前）

当前模板是“最小可用”：

- `AUTH_USERS_JSON` 使用明文密码，仅适合 MVP/小范围内测
- 建议尽快升级：
  - 密码哈希（bcrypt）
  - 账号表放数据库（RDS/PolarDB/MongoDB）
  - 登录限流、防暴破
  - 更细粒度 CORS 白名单

