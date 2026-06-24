import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex h-screen bg-bg-dark text-text-main overflow-hidden print:block print:h-auto print:overflow-visible">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto no-scrollbar relative print:ml-0 print:overflow-visible">
        <div className="p-8 pb-20 min-h-screen print:p-0 print:m-0 print:min-h-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
