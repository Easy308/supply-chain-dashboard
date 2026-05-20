import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Monitor, Check, ChevronRight } from 'lucide-react';

export default function InstallApp() {
  const navigate = useNavigate();
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  useState(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 rotate-180" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">安装应用</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
            <span className="text-5xl text-white">¥</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">记账工具</h2>
            <p className="text-gray-500">轻松管理你的财务</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">手机安装</h3>
                <p className="text-sm text-gray-500">添加到主屏幕</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <p>用手机浏览器打开此网页</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <p>点击浏览器底部的"分享"按钮</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <p>向下滚动，找到"添加到主屏幕"选项</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                <p>点击"添加"，应用图标就会出现在桌面</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Monitor className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">电脑安装</h3>
                <p className="text-sm text-gray-500">安装为桌面应用</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <p>用 Chrome、Edge 或 Firefox 浏览器打开</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <p>点击地址栏右侧的安装图标</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <p>按照提示完成安装</p>
              </div>
            </div>
          </div>

          {deferredPrompt && !installed && (
            <button
              onClick={handleInstall}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-5 h-5" />
              一键安装到桌面
            </button>
          )}

          {installed && (
            <div className="bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-3">
              <Check className="w-5 h-5" />
              <span className="font-medium">安装成功！可在桌面找到应用</span>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>安装后即可像原生应用一样使用</p>
          <p>支持离线访问，数据实时同步</p>
        </div>
      </div>
    </div>
  );
}
