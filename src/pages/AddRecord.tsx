import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { recordsApi, categoriesApi } from '../services/api';

export default function AddRecord() {
  const navigate = useNavigate();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [type]);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll(type);
      setCategories(data.categories);
      if (data.categories.length > 0) {
        setCategory(data.categories[0].name);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('请输入有效金额');
      return;
    }

    if (!category) {
      alert('请选择分类');
      return;
    }

    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      await recordsApi.create({
        type,
        amount: parseFloat(amount),
        category,
        note,
        date: today,
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountInput = (value: string) => {
    if (value === '') {
      setAmount('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setAmount(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">记账</h1>
          <div className="w-10" />
        </div>
      </header>

      {showSuccess ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce">
            <Check className="w-10 h-10 text-white" />
          </div>
          <p className="text-xl font-bold text-gray-900">记账成功!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                支出
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  type === 'income'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                收入
              </button>
            </div>

            <div className="text-center mb-8">
              <div className="text-sm text-gray-500 mb-2">
                {type === 'expense' ? '支出金额' : '收入金额'}
              </div>
              <div className="flex items-center justify-center text-5xl font-bold font-mono">
                <span className={`text-3xl mr-2 ${type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ¥
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountInput(e.target.value)}
                  placeholder="0.00"
                  className="w-48 text-center bg-transparent outline-none placeholder-gray-300"
                  inputMode="decimal"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">选择分类</label>
                <div className="grid grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                        category === cat.name
                          ? type === 'expense'
                            ? 'bg-rose-100 border-2 border-rose-500'
                            : 'bg-emerald-100 border-2 border-emerald-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">备注 (可选)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="添加备注..."
                  className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all ${
              type === 'expense'
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </form>
      )}
    </div>
  );
}
