const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
  secret: 'hongge-industrial-belt-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Directories
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) {
  const hash = bcrypt.hashSync('admin123', 10);
  fs.writeFileSync(USERS_FILE, JSON.stringify([
    { id: 1, username: 'admin', password: hash, role: 'admin', status: 'active', createdAt: new Date().toISOString(), lastLoginAt: null }
  ], null, 2));
}

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = Buffer.from(file.originalname, 'latin1').toString('utf8').replace(ext, '');
    const safeName = base.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_');
    cb(null, Date.now() + '_' + safeName + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|bmp|webp|svg|pdf|doc|docx|xls|xlsx|csv|ppt|pptx|txt|zip|rar|7z)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

function getUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  res.status(401).json({ error: '请先登录' });
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') return next();
  res.status(403).json({ error: '需要管理员权限' });
}

// ===== Auth routes =====
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  if (user.status === 'disabled') {
    return res.status(403).json({ error: '账号已被管理员禁用，请联系主账号' });
  }
  user.lastLoginAt = new Date().toISOString();
  if (user.pendingReset) delete user.pendingReset;
  saveUsers(users);
  req.session.user = { id: user.id, username: user.username, role: user.role };
  res.json({ success: true, user: req.session.user });
});

// Forgot password — submit a reset request that admin will see in account list
app.post('/api/forgot-password', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: '请输入用户名' });
  const users = getUsers();
  const user = users.find(u => u.username === username);
  if (user && user.role !== 'admin') {
    user.pendingReset = new Date().toISOString();
    saveUsers(users);
  }
  // Always return success to avoid leaking which usernames exist
  res.json({ success: true, message: '已通知管理员，请联系主账号 admin 重置密码' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.json({ user: null });
  }
});

// ===== User management routes =====

// Create sub-account (admin only)
app.post('/api/users/create', requireAuth, requireAdmin, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: '用户名和密码（至少6位）不能为空' });
  }
  const users = getUsers();
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: '用户名已存在' });
  }
  const hash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: Math.max(...users.map(u => u.id)) + 1,
    username,
    password: hash,
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLoginAt: null
  };
  users.push(newUser);
  saveUsers(users);
  res.json({ success: true, user: { id: newUser.id, username: newUser.username, role: newUser.role } });
});

// List all users (admin sees status/lastLogin/pendingReset; user sees only self)
app.get('/api/users', requireAuth, (req, res) => {
  const users = getUsers();
  const currentUser = req.session.user;
  if (currentUser.role === 'admin') {
    res.json({
      users: users.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        status: u.status || 'active',
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt || null,
        pendingReset: u.pendingReset || null
      }))
    });
  } else {
    const self = users.find(u => u.id === currentUser.id);
    res.json({
      users: self ? [{
        id: self.id, username: self.username, role: self.role,
        status: self.status || 'active', createdAt: self.createdAt,
        lastLoginAt: self.lastLoginAt || null
      }] : []
    });
  }
});

// Toggle account status (admin only)
app.post('/api/users/toggle-status', requireAuth, requireAdmin, (req, res) => {
  const { userId } = req.body;
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  if (user.role === 'admin') return res.status(400).json({ error: '不能禁用主账号' });
  user.status = user.status === 'disabled' ? 'active' : 'disabled';
  saveUsers(users);
  res.json({ success: true, status: user.status });
});

// Delete sub-account (admin only)
app.delete('/api/users/:id', requireAuth, requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return res.status(404).json({ error: '用户不存在' });
  if (users[idx].role === 'admin') return res.status(400).json({ error: '不能删除主账号' });
  users.splice(idx, 1);
  saveUsers(users);
  res.json({ success: true });
});

// Change own password
app.post('/api/users/change-password', requireAuth, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: '新密码至少6位' });
  }
  const users = getUsers();
  const user = users.find(u => u.id === req.session.user.id);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  if (!bcrypt.compareSync(oldPassword, user.password)) {
    return res.status(400).json({ error: '原密码错误' });
  }
  user.password = bcrypt.hashSync(newPassword, 10);
  saveUsers(users);
  res.json({ success: true });
});

// Admin reset any user's password (no old password needed)
app.post('/api/users/reset-password', requireAuth, requireAdmin, (req, res) => {
  const { userId, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: '新密码至少6位' });
  }
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  user.password = bcrypt.hashSync(newPassword, 10);
  if (user.pendingReset) delete user.pendingReset;
  saveUsers(users);
  res.json({ success: true });
});

// ===== Register route (self-registration) =====
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: '用户名和密码（至少6位）不能为空' });
  }
  const users = getUsers();
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: '用户名已存在' });
  }
  const hash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: Math.max(...users.map(u => u.id)) + 1,
    username,
    password: hash,
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  req.session.user = { id: newUser.id, username: newUser.username, role: newUser.role };
  res.json({ success: true, user: req.session.user });
});

// ===== File upload routes =====
app.post('/api/upload', requireAuth, upload.array('files', 20), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: '没有选择文件' });
  }
  const fileInfos = req.files.map(f => ({
    name: Buffer.from(f.originalname, 'latin1').toString('utf8'),
    storedName: f.filename,
    size: f.size,
    url: '/uploads/' + f.filename,
    uploadedBy: req.session.user.username,
    uploadedAt: new Date().toISOString()
  }));

  // Append to file registry
  const registryPath = path.join(DATA_DIR, 'files.json');
  let registry = [];
  if (fs.existsSync(registryPath)) {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  }
  registry.push(...fileInfos);
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

  res.json({ success: true, files: fileInfos });
});

app.get('/api/files', requireAuth, (req, res) => {
  const registryPath = path.join(DATA_DIR, 'files.json');
  if (!fs.existsSync(registryPath)) return res.json({ files: [] });
  const files = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  res.json({ files });
});

app.delete('/api/files/:storedName', requireAuth, (req, res) => {
  if (/[\/\\]|\.\./.test(req.params.storedName)) {
    return res.status(400).json({ error: '非法文件名' });
  }
  const registryPath = path.join(DATA_DIR, 'files.json');
  if (!fs.existsSync(registryPath)) return res.status(404).json({ error: '文件不存在' });
  let registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  const idx = registry.findIndex(f => f.storedName === req.params.storedName);
  if (idx === -1) return res.status(404).json({ error: '文件不存在' });

  // Only admin or uploader can delete
  const file = registry[idx];
  if (req.session.user.role !== 'admin' && file.uploadedBy !== req.session.user.username) {
    return res.status(403).json({ error: '无权删除此文件' });
  }

  // Delete physical file
  const filePath = path.join(UPLOADS_DIR, file.storedName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  registry.splice(idx, 1);
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  res.json({ success: true });
});

// ===== Data routes =====
app.get('/api/industrial-belts', requireAuth, (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'industrial-belts.json'), 'utf-8'));
  res.json(data);
});

app.get('/api/search', requireAuth, (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ results: [] });
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'industrial-belts.json'), 'utf-8'));
  const keyword = q.toLowerCase();
  const results = [];
  for (const province of data.provinces) {
    for (const belt of province.belts) {
      // Match belt name, category, location, county, tags
      let match = belt.name.toLowerCase().includes(keyword) ||
        belt.category.toLowerCase().includes(keyword) ||
        belt.location.toLowerCase().includes(keyword) ||
        (belt.county && belt.county.toLowerCase().includes(keyword)) ||
        (belt.tags && belt.tags.some(t => t.toLowerCase().includes(keyword)));

      // Match supplier names, mainCategory, qualification
      let matchedSuppliers = [];
      if (belt.topSuppliers) {
        matchedSuppliers = belt.topSuppliers.filter(s =>
          s.name.toLowerCase().includes(keyword) ||
          (s.mainCategory && s.mainCategory.toLowerCase().includes(keyword)) ||
          (s.qualification && s.qualification.toLowerCase().includes(keyword)) ||
          (s.partners && s.partners.some(p => p.toLowerCase().includes(keyword)))
        );
      }

      if (match || matchedSuppliers.length > 0) {
        const entry = { province: province.name, provinceCode: province.code, ...belt };
        // If searched by supplier, highlight matched suppliers by putting them first
        if (matchedSuppliers.length > 0 && !match) {
          const otherSuppliers = belt.topSuppliers.filter(s => !matchedSuppliers.includes(s));
          entry.topSuppliers = [...matchedSuppliers, ...otherSuppliers];
          entry._matchedSupplierCount = matchedSuppliers.length;
        }
        results.push(entry);
      }
    }
  }
  res.json({ results, total: results.length });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  ✦ 产业带看板运行中: http://localhost:${PORT}`);
  console.log(`  ✦ 默认账号: admin / admin123\n`);
});
