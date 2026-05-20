import { Router, Response } from 'express';
import db from '../database/connection.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/summary', (req: AuthRequest, res: Response) => {
  try {
    const { month } = req.query;
    const userId = req.userId!;
    const currentMonth = (month as string) || new Date().toISOString().slice(0, 7);

    const incomeResult = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM records 
      WHERE user_id = ? AND type = 'income' AND strftime("%Y-%m", record_date) = ?
    `).get(userId, currentMonth) as { total: number };

    const expenseResult = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM records 
      WHERE user_id = ? AND type = 'expense' AND strftime("%Y-%m", record_date) = ?
    `).get(userId, currentMonth) as { total: number };

    const budgetResult = db.prepare(`
      SELECT amount 
      FROM budgets 
      WHERE user_id = ? AND month = ?
    `).get(userId, currentMonth) as { amount: number } | undefined;

    const income = incomeResult.total;
    const expense = expenseResult.total;
    const balance = income - expense;
    const budget = budgetResult?.amount || 0;
    const budgetUsed = budget > 0 ? Math.round((expense / budget) * 100) : 0;

    res.json({
      success: true,
      month: currentMonth,
      income,
      expense,
      balance,
      budget,
      budgetUsed,
    });
  } catch (error) {
    console.error('获取汇总错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.get('/trend', (req: AuthRequest, res: Response) => {
  try {
    const { month } = req.query;
    const userId = req.userId!;
    const currentMonth = (month as string) || new Date().toISOString().slice(0, 7);

    const dailyData = db.prepare(`
      SELECT 
        record_date as date,
        type,
        SUM(amount) as total
      FROM records 
      WHERE user_id = ? AND strftime("%Y-%m", record_date) = ?
      GROUP BY record_date, type
      ORDER BY record_date ASC
    `).all(userId, currentMonth) as { date: string; type: string; total: number }[];

    const trendMap = new Map<string, { income: number; expense: number }>();
    
    dailyData.forEach(row => {
      if (!trendMap.has(row.date)) {
        trendMap.set(row.date, { income: 0, expense: 0 });
      }
      const data = trendMap.get(row.date)!;
      if (row.type === 'income') {
        data.income = row.total;
      } else {
        data.expense = row.total;
      }
    });

    const trend = Array.from(trendMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));

    const byCategory = db.prepare(`
      SELECT 
        category,
        type,
        SUM(amount) as total
      FROM records 
      WHERE user_id = ? AND strftime("%Y-%m", record_date) = ?
      GROUP BY category, type
      ORDER BY total DESC
    `).all(userId, currentMonth) as { category: string; type: string; total: number }[];

    const expenseTotal = byCategory.filter(c => c.type === 'expense').reduce((sum, c) => sum + c.total, 0);

    const categoryWithPercentage = byCategory.map(c => ({
      category: c.category,
      type: c.type,
      total: c.total,
      percentage: c.type === 'expense' && expenseTotal > 0 ? Math.round((c.total / expenseTotal) * 100) : 0,
    }));

    res.json({
      success: true,
      trend,
      byCategory: categoryWithPercentage,
    });
  } catch (error) {
    console.error('获取趋势错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
