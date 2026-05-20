import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowRight, PiggyBank } from 'lucide-react';
import { statsApi, recordsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<{
    income: number;
    expense: number;
    balance: number;
    budget: number;
    budgetUsed: number;
  } | null>(null);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryData, recordsData] = await Promise.all([
        statsApi.getSummary(),
        recordsApi.getAll({ limit: 5 }),
      ]);
      setSummary(summaryData);
      setRecentRecords(recordsData.records);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const currentMonth = new Date().toISOString().slice(0, 7);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          你好, {user?.username} 👋
        </h1>
        <p className="text-gray-500">
          {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-emerald-100">本月收入</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold font-mono">
            {formatMoney(summary?.income || 0)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-rose-100">本月支出</span>
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold font-mono">
            {formatMoney(summary?.expense || 0)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">本月余额</div>
              <div className={`text-2xl font-bold font-mono ${(summary?.balance || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatMoney(summary?.balance || 0)}
              </div>
            </div>
          </div>
        </div>

        {summary?.budget && summary.budget > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <PiggyBank className="w-4 h-4" />
                预算使用
              </span>
              <span className="font-medium">
                {summary.budgetUsed}% / {formatMoney(summary.budget)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  summary.budgetUsed >= 100
                    ? 'bg-rose-500'
                    : summary.budgetUsed >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(summary.budgetUsed, 100)}%` }}
              />
            </div>
            {summary.budgetUsed >= 100 && (
              <p className="text-rose-600 text-sm font-medium">
                ⚠️ 已超出预算 {(summary.expense - summary.budget).toFixed(2)} 元
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">近期交易</h2>
          <Link
            to="/records"
            className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-700"
          >
            查看全部
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>暂无记录</p>
            <Link
              to="/add"
              className="inline-flex items-center gap-2 mt-4 text-indigo-600 font-medium"
            >
              记一笔
              <Plus className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    record.type === 'income'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-rose-100 text-rose-600'
                  }`}>
                    {record.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{record.category}</div>
                    <div className="text-sm text-gray-500">{record.note || '无备注'}</div>
                  </div>
                </div>
                <div className={`font-mono font-medium ${
                  record.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {record.type === 'income' ? '+' : '-'}{formatMoney(record.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link
        to="/add"
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-all hover:scale-110"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
