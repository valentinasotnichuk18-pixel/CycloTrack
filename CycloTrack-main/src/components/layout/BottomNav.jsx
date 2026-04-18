import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Pill, FileText, Home, Settings } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Головна' },
  { path: '/mood', icon: Activity, label: 'Настрій' },
  { path: '/medications', icon: Pill, label: 'Ліки' },
  { path: '/prescriptions', icon: FileText, label: 'Рецепти' },
  { path: '/settings', icon: Settings, label: 'Налаштування' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabPress = (path, isActive) => {
    if (isActive) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Reset to root of the tab if in a sub-route
      if (location.pathname !== path) {
        navigate(path, { replace: true });
      }
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-[9999]" style={{paddingBottom: 'env(safe-area-inset-bottom, 8px)'}}>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              onClick={() => handleTabPress(path, isActive)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[64px] ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/10' : ''}`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
