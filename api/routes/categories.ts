import { Router, Response } from 'express';
import db from '../database/connection.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    const userId = req.userId!;

    let query = 'SELECT * FROM categories WHERE user_id = ?';
    const params: any[] = [userId];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY type, name';

    const categories = db.prepare(query).all(...params);

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
