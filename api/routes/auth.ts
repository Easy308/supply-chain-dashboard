import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../database/connection.js';
import { authMiddleware, generateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: '请填写所有必填字段' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: '密码至少需要6个字符' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: '该邮箱已被注册' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    ).run(username, email, passwordHash);

    const userId = result.lastInsertRowid as number;

    const defaultExpenseCategories = [
      { name: '餐饮', icon: '🍜' },
      { name: '交通', icon: '🚗' },
      { name: '购物', icon: '🛒' },
      { name: '娱乐', icon: '🎮' },
      { name: '居住', icon: '🏠' },
      { name: '医疗', icon: '💊' },
      { name: '教育', icon: '📚' },
      { name: '通讯', icon: '📱' },
      { name: '其他', icon: '📌' },
    ];

    const defaultIncomeCategories = [
      { name: '工资', icon: '💰' },
      { name: '奖金', icon: '🎁' },
      { name: '投资', icon: '📈' },
      { name: '兼职', icon: '💼' },
      { name: '其他', icon: '📌' },
    ];

    const insertCategory = db.prepare(
      'INSERT INTO categories (user_id, name, icon, type) VALUES (?, ?, ?, ?)'
    );

    defaultExpenseCategories.forEach(cat => {
      insertCategory.run(userId, cat.name, cat.icon, 'expense');
    });

    defaultIncomeCategories.forEach(cat => {
      insertCategory.run(userId, cat.name, cat.icon, 'income');
    });

    const token = generateToken(userId, username, email);

    res.json({
      success: true,
      token,
      user: { id: userId, username, email },
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: '请填写邮箱和密码' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      return res.status(401).json({ success: false, message: '邮箱或密码错误' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: '邮箱或密码错误' });
    }

    const token = generateToken(user.id, user.username, user.email);

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (user) {
    res.json({
      success: true,
      user,
    });
  } else {
    res.status(401).json({ success: false, message: '未授权' });
  }
});

export default router;
