import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PackageSearch, PackagePlus, Receipt, History, Users, BarChart3, Settings, LogOut, Disc } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Inventory', path: '/inventory', icon: PackageSearch },
  { name: 'Bill', path: '/billing', icon: Receipt },
  { name: 'Transactions', path: '/history', icon: History },
  { name: 'Suppliers', path: '/suppliers', icon: Users },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const { signOut, user } = useAuth();

  return (
    <aside className="w-64 glass border-r border-white/5 h-screen flex flex-col no-print fixed shadow-2xl z-50">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3 relative z-10 tracking-tight">
          <div className="relative">
            <Disc className="h-8 w-8 text-primary animate-spin" style={{ animationDuration: '4s' }} />
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full"></div>
          </div>
          TyreManager
        </h1>
        <div className="mt-4 flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center font-bold text-white shadow-lg shadow-primary/30">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Admin</span>
            <span className="text-sm font-medium text-gray-300 truncate">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group ${
                isActive
                  ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-white shadow-lg shadow-primary/10 border border-primary/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full shadow-[0_0_10px_#f97316]"></div>}
                <item.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'text-primary scale-110' : 'group-hover:scale-110 group-hover:text-gray-300'}`} />
                <span className="relative z-10">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
