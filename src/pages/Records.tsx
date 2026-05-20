import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Trash2, Edit2, X } from 'lucide-react';
import { recordsApi, categoriesApi } from '../services/api';

export default function Records() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadData();
    loadCategories();
  }, []);

  useEffect(() => {
    loadRecords();
  }, [searchTerm, filterType, filterCategory]);

  const loadData = async () => {
    await loadRecords();
    await loadCategories();
  };

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await recordsApi.getAll({
        search: searchTerm || undefined,
        type: filterType || undefined,
        category: filterCategory || undefined,
        limit: 100,
      });
      setRecords(data.records);
    } catch (error) {
      console.error('加载记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data.categories);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条记录吗?')) return;

    try {
      await recordsApi.delete(id);
      setRecords(records.filter(r => r.id !== id));
    } catch (error) {
      alert('删除失败，请重试');
    }
  };

  const handleEdit = (record: any) => {
    setEditingRecord({ ...record });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingRecord) return;

    try {
      const data = await recordsApi.update(editingRecord.id, {
        type: editingRecord.type,
        amount: editingRecord.amount,
        category: editingRecord.category,
        note: editingRecord.note,
      });
      setRecords(records.map(r => r.id === data.record.id ? data.record : r));
      setShowEditModal(false);
      setEditingRecord(null);
    } catch (error) {
      alert('更新失败，请重试');
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const groupedRecords = records.reduce((groups: Record<string, any[]>, record) => {
    const date = record.record_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {});

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
          <h1 className="text-lg font-bold text-gray-900">账目管理</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-md space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索备注..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none"
            >
              <option value="">全部类型</option>
              <option value="income">收入</option>
              <option value="expense">支出</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none"
            >
              <option value="">全部分类</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-gray-500">加载中...</div>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-md text-center">
            <p className="text-gray-500">暂无记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedRecords).map(([date, dayRecords]) => (
              <div key={date} className="space-y-2">
                <div className="text-sm font-medium text-gray-500 px-2">
                  {new Date(date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
                </div>
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  {dayRecords.map((record, index) => (
                    <div
                      key={record.id}
                      className={`flex items-center justify-between p-4 ${
                        index !== dayRecords.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                          record.type === 'income'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-rose-100 text-rose-600'
                        }`}>
                          {record.type === 'income' ? '↑' : '↓'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{record.category}</div>
                          <div className="text-sm text-gray-500 truncate">{record.note || '无备注'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`font-mono font-medium ${
                          record.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {record.type === 'income' ? '+' : '-'}{formatMoney(record.amount)}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEditModal && editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">编辑记录</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditingRecord({ ...editingRecord, type: 'expense' })}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  editingRecord.type === 'expense'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                支出
              </button>
              <button
                type="button"
                onClick={() => setEditingRecord({ ...editingRecord, type: 'income' })}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  editingRecord.type === 'income'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                收入
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">金额</label>
              <input
                type="number"
                value={editingRecord.amount}
                onChange={(e) => setEditingRecord({ ...editingRecord, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">分类</label>
              <select
                value={editingRecord.category}
                onChange={(e) => setEditingRecord({ ...editingRecord, category: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none"
              >
                {categories.filter(c => c.type === editingRecord.type).map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">备注</label>
              <textarea
                value={editingRecord.note || ''}
                onChange={(e) => setEditingRecord({ ...editingRecord, note: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none resize-none"
                rows={3}
              />
            </div>

            <button
              onClick={handleUpdate}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              保存修改
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
