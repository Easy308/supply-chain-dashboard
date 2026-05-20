import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import recordsRoutes from './routes/records.js';
import statsRoutes from './routes/stats.js';
import categoriesRoutes from './routes/categories.js';
import budgetRoutes from './routes/budget.js';
import { initDatabase } from './database/connection.js';

const app = express();

app.use(cors());
app.use(express.json());

initDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/budget', budgetRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '记账工具 API 运行中' });
});

export default app;
