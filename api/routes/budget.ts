import { Router, Response } from 'express';
import db from '../database/connection.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const { month } = req.query;
    const userId = req.userId!;
    const currentMonth = (month as string) || new Date().toISOString().slice(0, 7);

    const budget = db.prepare(
      'SELECT * FROM budgets WHERE user_id = ? AND month = ?'
    ).get(userId, currentMonth) as { id: number; user_id: number; month: string; amount: number } | undefined;

    res.json({
      success: true,
      budget: budget || { month: currentMonth, amount: 0 },
    });
  } catch (error) {
    console.error('获取预算错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.put('/', (req: AuthRequest, res: Response) => {
  try {
    const { month, amount } = req.body;
    const userId = req.userId!;
    const currentMonth = month || new Date().toISOString().slice(0, 7);

    if (amount < 0) {
      return res.status(400).json({ success: false, message: '预算必须为非负数' });
    }

    const existing = db.prepare(
      'SELECT * FROM budgets WHERE user_id = ? AND month = ?'
    ).get(userId, currentMonth);

    if (existing) {
      db.prepare(
        'UPDATE budgets SET amount = ? WHERE user_id = ? AND month = ?'
      ).run(amount, userId, currentMonth);
    } else {
      db.prepare(
        'INSERT INTO budgets (user_id, month, amount) VALUES (?, ?, ?)'
      ).run(userId, currentMonth, amount);
    }

    const budget = db.prepare(
      'SELECT * FROM budgets WHERE user_id = ? AND month = ?'
    ).get(userId, currentMonth);

    res.json({
      success: true,
      budget,
    });
  } catch (error) {
    console.error('设置预算错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
