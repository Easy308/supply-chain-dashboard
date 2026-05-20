import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, BarChart3, List, Settings } from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ComponentType<any>;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/stats', icon: BarChart3, label: '统计' },
  { path: '/add', icon: Plus, label: '记账', isMain: true },
  { path: '/records', icon: List, label: '账目' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center justify-center w-14 h-14 -mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                <Icon className="w-6 h-6 text-white" />
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-16 space-y-1 ${
                isActive ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-2' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
