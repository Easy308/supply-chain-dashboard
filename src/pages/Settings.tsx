import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, PiggyBank, User, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { budgetApi, recordsApi } from '../services/api';

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [budget, setBudget] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    loadBudget();
  }, []);

  const loadBudget = async () => {
    try {
      const data = await budgetApi.get();
      setBudget(data.budget.amount.toString());
    } catch (error) {
      console.error('加载预算失败:', error);
    }
  };

  const handleSaveBudget = async () => {
    setSaving(true);
    try {
      const amount = parseFloat(budget) || 0;
      await budgetApi.set(currentMonth, amount);
      alert('预算设置成功!');
    } catch (error) {
      alert('设置失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await recordsApi.getAll({ limit: 1000 });
      const csv = [
        ['日期', '类型', '分类', '金额', '备注'].join(','),
        ...data.records.map((r: any) =>
          [r.record_date, r.type === 'income' ? '收入' : '支出', r.category, r.amount, `"${r.note || ''}"`].join(',')
        ),
      ].join('\n');

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `账目记录_${currentMonth}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗?')) {
      logout();
      navigate('/login');
    }
  };

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
          <h1 className="text-lg font-bold text-gray-900">设置</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{user?.username}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">月度预算</h3>
              <p className="text-sm text-gray-500">{currentMonth}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                设置本月预算 (元)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="输入预算金额"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <button
              onClick={handleSaveBudget}
              disabled={saving}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存预算'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">导出数据</h3>
              <p className="text-sm text-gray-500">导出为 CSV 格式</p>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {exporting ? '导出中...' : '导出账目记录'}
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          退出登录
        </button>
      </div>
    </div>
  );
}
