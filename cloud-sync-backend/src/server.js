const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const OSS = require("ali-oss");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const ossClient = new OSS({
  region: requiredEnv("ALIYUN_OSS_REGION"),
  bucket: requiredEnv("ALIYUN_OSS_BUCKET"),
  accessKeyId: requiredEnv("ALIYUN_ACCESS_KEY_ID"),
  accessKeySecret: requiredEnv("ALIYUN_ACCESS_KEY_SECRET")
});

let authUsers = [];
try {
  authUsers = JSON.parse(process.env.AUTH_USERS_JSON || "[]");
  if (!Array.isArray(authUsers)) authUsers = [];
} catch (e) {
  authUsers = [];
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function userObject(email) {
  const e = normalizeEmail(email);
  return authUsers.find((u) => normalizeEmail(u.email) === e) || null;
}

function makeToken(user) {
  return jwt.sign(
    {
      sub: normalizeEmail(user.email),
      email: normalizeEmail(user.email),
      name: user.name || user.email
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return res.status(401).json({ error: "missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "invalid token" });
  }
}

function stateObjectKey(email) {
  // 每个用户一个对象文件
  return `best2do/state/${normalizeEmail(email)}.json`;
}

async function getStateFromOss(email) {
  const key = stateObjectKey(email);
  try {
    const result = await ossClient.get(key);
    const raw = result.content.toString("utf-8");
    return JSON.parse(raw);
  } catch (e) {
    // OSS 404: 返回空结构
    return {
      todos: [],
      projects: [],
      reviews: [],
      knowhow: [],
      settings: { model: "qwen3.6-plus", role: "产品经理" },
      scheduleArchives: [],
      dailyReports: []
    };
  }
}

async function putStateToOss(email, payload) {
  const key = stateObjectKey(email);
  const body = JSON.stringify(payload);
  await ossClient.put(key, Buffer.from(body), {
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "best2do-cloud-sync" });
});

app.post("/auth/login", (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  const user = userObject(email);
  if (!user || String(user.password || "") !== password) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const token = makeToken(user);
  return res.json({
    token,
    user: {
      email: normalizeEmail(user.email),
      name: user.name || user.email
    }
  });
});

app.get("/sync", authMiddleware, async (req, res) => {
  try {
    const state = await getStateFromOss(req.user.email);
    return res.json(state);
  } catch (e) {
    return res.status(500).json({ error: "failed to load state", detail: e.message });
  }
});

app.post("/sync", authMiddleware, async (req, res) => {
  const payload = req.body || {};
  const result = {
    todos: Array.isArray(payload.todos) ? payload.todos : [],
    projects: Array.isArray(payload.projects) ? payload.projects : [],
    reviews: Array.isArray(payload.reviews) ? payload.reviews : [],
    knowhow: Array.isArray(payload.knowhow) ? payload.knowhow : [],
    settings: payload.settings || { model: "qwen3.6-plus", role: "产品经理" },
    scheduleArchives: Array.isArray(payload.scheduleArchives) ? payload.scheduleArchives : [],
    dailyReports: Array.isArray(payload.dailyReports) ? payload.dailyReports : [],
    updatedAt: new Date().toISOString()
  };

  try {
    await putStateToOss(req.user.email, result);
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: "failed to save state", detail: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`best2do cloud sync backend running at :${PORT}`);
});
