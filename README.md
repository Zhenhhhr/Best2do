# Best2do — 单页演示

`index.html` 与 `best2do-demo.html` 内容相同，皮卡丘图标已 **Base64 内嵌**，无需单独图片文件即可部署。

## 云端同步（阿里云后端）

前端已支持云端同步模式（保留本地存储作为兜底）。

后端模板见：`cloud-sync-backend/`（Node + OSS 持久化，可部署到阿里云函数计算）。

在设置页填写：

- 云端 API 地址（例如 API 网关/函数计算域名）
- 启用云端同步
- 云端邮箱/密码

并可点击：

- 登录云端
- 从云端拉取
- 上传本地到云端

### 后端接口约定

前端默认调用以下接口（同一 baseUrl）：

1. `POST /auth/login`
   - request: `{ "email": "...", "password": "..." }`
   - response: `{ "token": "jwt-or-session-token", "user": { "email": "..." } }`

2. `GET /sync`
   - header: `Authorization: Bearer <token>`
   - response:
     ```json
     {
       "todos": [],
       "projects": [],
       "reviews": [],
       "knowhow": [],
       "settings": { "model": "qwen3.6-plus", "role": "产品经理" },
       "scheduleArchives": [],
       "dailyReports": []
     }
     ```

3. `POST /sync`
   - header: `Authorization: Bearer <token>`
   - body: 与 `GET /sync` 返回结构一致

> 建议：后端以 `userId` 做数据隔离，token 建议 JWT；不要把阿里云 AccessKey 暴露在前端。

## GitHub Pages 发布

> GitHub Pages 对外是 **HTTPS** 链接。

1. 新建 GitHub 仓库（例如 `best2do`）
2. 推送代码：

```bash
cd /path/to/Best2do
git add index.html best2do-demo.html README.md .nojekyll
git commit -m "Add cloud sync frontend and pages files"
git branch -M main
git remote add origin https://github.com/<你的用户名>/best2do.git
git push -u origin main
```

3. 仓库 → **Settings** → **Pages**：
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/(root)`

4. 生成访问地址：

`https://<你的用户名>.github.io/best2do/`

## 本地预览

```bash
python3 -m http.server 8765
```

浏览器访问：<http://localhost:8765/index.html>
