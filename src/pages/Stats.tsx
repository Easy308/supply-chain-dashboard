import { useState, useEffect } from 'react';
import { useNavigate } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { statsApi } from '../services/api';

export default function Stats() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [byCategory, setByCategory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryData, trendData] = await Promise.all([
        statsApi.getSummary(),
        statsApi.getTrend(),
      ]);
      setSummary(summaryData);
      setTrend(trendData.trend);
      setByCategory(trendData.byCategory);
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
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const maxTrend = Math.max(...trend.map(t => Math.max(t.income, t.expense)), 1);

  const categoryColors: Record<string, string> = {
    '餐饮': 'bg-orange-500',
    '交通': 'bg-blue-500',
    '购物': 'bg-pink-500',
    '娱乐': 'bg-purple-500',
    '居住': 'bg-indigo-500',
    '医疗': 'bg-red-500',
    '教育': 'bg-cyan-500',
    '通讯': 'bg-teal-500',
    '其他': 'bg-gray-500',
    '工资': 'bg-emerald-600',
    '奖金': 'bg-amber-500',
    '投资': 'bg-blue-600',
    '兼职': 'bg-violet-500',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">
            {currentMonth} 统计
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-gray-500">总收入</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600">
              {formatMoney(summary?.income || 0)}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-5 h-5 text-rose-600" />
              <span className="text-sm text-gray-500">总支出</span>
            </div>
            <div className="text-2xl font-bold font-mono text-rose-600">
              {formatMoney(summary?.expense || 0)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-bold text-gray-900 mb-4">收支趋势</h2>
          
          {trend.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>暂无数据</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trend.slice(-14).map((day, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{day.date.slice(5)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${(day.income / maxTrend) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-emerald-600 font-mono w-16 text-right">
                        {day.income.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <TrendingDown className="w-3 h-3 text-rose-500" />
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${(day.expense / maxTrend) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-rose-600 font-mono w-16 text-right">
                        {day.expense.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-600">收入</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-xs text-gray-600">支出</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-bold text-gray-900 mb-4">支出分类</h2>
          
          {byCategory.filter(c => c.type === 'expense').length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>暂无数据</p>
            </div>
          ) : (
            <div className="space-y-4">
              {byCategory.filter(c => c.type === 'expense').map((cat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                    <span className="text-sm text-gray-500">
                      {formatMoney(cat.total)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${categoryColors[cat.category] || 'bg-gray-500'}`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-bold text-gray-900 mb-4">收入分类</h2>
          
          {byCategory.filter(c => c.type === 'income').length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>暂无数据</p>
            </div>
          ) : (
            <div className="space-y-4">
              {byCategory.filter(c => c.type === 'income').map((cat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                    <span className="text-sm text-gray-500">
                      {formatMoney(cat.total)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${cat.percentage || 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
