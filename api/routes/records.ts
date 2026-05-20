import { Router, Response } from 'express';
import db from '../database/connection.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const { month, type, category, search, page = '1', limit = '50' } = req.query;
    const userId = req.userId!;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = 'SELECT * FROM records WHERE user_id = ?';
    const params: any[] = [userId];

    if (month) {
      query += ' AND strftime("%Y-%m", record_date) = ?';
      params.push(month);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND note LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY record_date DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), offset);

    const records = db.prepare(query).all(...params);

    const countQuery = 'SELECT COUNT(*) as total FROM records WHERE user_id = ?' + 
      (month ? ' AND strftime("%Y-%m", record_date) = ?' : '') +
      (type ? ' AND type = ?' : '') +
      (category ? ' AND category = ?' : '') +
      (search ? ' AND note LIKE ?' : '');

    const countParams: any[] = [userId];
    if (month) countParams.push(month);
    if (type) countParams.push(type);
    if (category) countParams.push(category);
    if (search) countParams.push(`%${search}%`);

    const { total } = db.prepare(countQuery).get(...countParams) as { total: number };

    res.json({
      success: true,
      records,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
  } catch (error) {
    console.error('获取记录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const { type, amount, category, note, date } = req.body;
    const userId = req.userId!;

    if (!type || !amount || !category || !date) {
      return res.status(400).json({ success: false, message: '请填写所有必填字段' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: '金额必须为正数' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ success: false, message: '类型必须是 income 或 expense' });
    }

    const result = db.prepare(
      'INSERT INTO records (user_id, type, amount, category, note, record_date) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId, type, amount, category, note || '', date);

    const record = db.prepare('SELECT * FROM records WHERE id = ?').get(result.lastInsertRowid);

    res.json({
      success: true,
      record,
    });
  } catch (error) {
    console.error('创建记录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { type, amount, category, note, date } = req.body;
    const userId = req.userId!;

    const existing = db.prepare('SELECT * FROM records WHERE id = ? AND user_id = ?').get(id, userId);
    if (!existing) {
      return res.status(404).json({ success: false, message: '记录不存在' });
    }

    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ success: false, message: '金额必须为正数' });
    }

    db.prepare(
      'UPDATE records SET type = COALESCE(?, type), amount = COALESCE(?, amount), category = COALESCE(?, category), note = COALESCE(?, note), record_date = COALESCE(?, record_date) WHERE id = ? AND user_id = ?'
    ).run(type, amount, category, note, date, id, userId);

    const record = db.prepare('SELECT * FROM records WHERE id = ?').get(id);

    res.json({
      success: true,
      record,
    });
  } catch (error) {
    console.error('更新记录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const existing = db.prepare('SELECT * FROM records WHERE id = ? AND user_id = ?').get(id, userId);
    if (!existing) {
      return res.status(404).json({ success: false, message: '记录不存在' });
    }

    db.prepare('DELETE FROM records WHERE id = ? AND user_id = ?').run(id, userId);

    res.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除记录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
