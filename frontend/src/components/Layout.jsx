import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Disc } from 'lucide-react';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg-dark text-text-main overflow-hidden print:block print:h-auto print:overflow-visible relative">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#121212]/90 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-4 print:hidden">
        <h1 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
          <Disc className="h-6 w-6 text-primary animate-spin" style={{ animationDuration: '4s' }} />
          TyreManager
        </h1>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-white/5 rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 overflow-y-auto no-scrollbar relative pt-16 md:pt-0 print:ml-0 print:pt-0 print:overflow-visible">
        <div className="p-4 md:p-8 pb-20 min-h-screen print:p-0 print:m-0 print:min-h-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
