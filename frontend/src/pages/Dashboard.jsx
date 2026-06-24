import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PackageSearch, AlertTriangle, IndianRupee, Receipt, TrendingUp, ChevronRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    todayRevenue: 0,
    billsToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentBills, setRecentBills] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const { data: products } = await supabase.from('products').select('*');
      const totalProducts = products?.length || 0;
      const lowStock = products?.filter(p => p.stock_qty <= p.low_stock_threshold) || [];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: bills } = await supabase
        .from('bills')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      const todayRevenue = bills?.reduce((sum, bill) => sum + Number(bill.grand_total), 0) || 0;
      const billsToday = bills?.length || 0;

      const { data: recent } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalProducts,
        lowStock: lowStock.length,
        todayRevenue,
        billsToday
      });
      setLowStockItems(lowStock.slice(0, 5));
      setRecentBills(recent || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-4 border-4 border-orange-500/30 rounded-full border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-bg-card to-transparent p-6 rounded-2xl border-l-4 border-primary shadow-lg relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="z-10">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">Overview</h2>
          <p className="text-gray-400 mt-1 font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Here's what's happening in your shop today.
          </p>
        </div>
        <Link to="/billing" className="z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 text-white">
          <Receipt className="w-5 h-5" /> Quick Bill
        </Link>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon={PackageSearch} 
          gradient="from-blue-500/20 to-cyan-500/5" 
          iconColor="text-blue-400" 
          borderColor="group-hover:border-blue-500/50"
        />
        <StatCard 
          title="Low Stock Items" 
          value={stats.lowStock} 
          icon={AlertTriangle} 
          gradient="from-red-500/20 to-orange-500/5" 
          iconColor="text-red-400"
          borderColor="group-hover:border-red-500/50"
          alert={stats.lowStock > 0}
        />
        <StatCard 
          title="Today's Revenue" 
          value={`₹${stats.todayRevenue.toFixed(2)}`} 
          icon={IndianRupee} 
          gradient="from-green-500/20 to-emerald-500/5" 
          iconColor="text-green-400"
          borderColor="group-hover:border-green-500/50"
        />
        <StatCard 
          title="Bills Today" 
          value={stats.billsToday} 
          icon={TrendingUp} 
          gradient="from-purple-500/20 to-pink-500/5" 
          iconColor="text-purple-400"
          borderColor="group-hover:border-purple-500/50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bills (Spans 2 columns) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-7 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Receipt className="w-5 h-5 text-primary" />
              Recent Transactions
            </h3>
            <Link to="/history" className="text-sm font-semibold text-primary hover:text-white flex items-center transition-colors">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="relative z-10">
            {recentBills.length === 0 ? (
              <div className="text-center py-12 bg-black/20 rounded-xl border border-white/5">
                <p className="text-gray-500 font-medium">No transactions yet today.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBills.map(bill => (
                  <div key={bill.id} className="flex items-center justify-between p-4 bg-black/40 hover:bg-black/60 rounded-xl border border-white/5 transition-all hover:scale-[1.01]">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/20 p-2.5 rounded-lg text-primary">
                        <IndianRupee className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-base">{bill.customer_name || 'Walk-in Customer'}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{bill.bill_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-green-400 text-lg">₹{bill.grand_total}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(bill.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-panel rounded-2xl p-7 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-colors duration-700"></div>
          
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Stock Alerts
          </h3>
          
          <div className="relative z-10 h-full">
            {lowStockItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-10 bg-black/20 rounded-xl border border-white/5 text-center px-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-3">
                  <PackageSearch className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-green-400 font-bold text-sm">Inventory Healthy</p>
                <p className="text-xs text-gray-500 mt-1">No items are running low.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {lowStockItems.map(item => (
                  <li key={item.id} className="flex justify-between items-center bg-black/40 hover:bg-black/60 p-3.5 rounded-xl border border-white/5 transition-all">
                    <div>
                      <p className="font-bold text-white text-sm">{item.name}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">{item.brand}</span>
                        {item.size && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">{item.size}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-black rounded-lg ${item.stock_qty <= 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20'}`}>
                        {item.stock_qty} left
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {stats.lowStock > 5 && (
              <Link to="/inventory" className="block text-center text-xs text-gray-400 hover:text-white mt-4 font-bold transition-colors">
                + {stats.lowStock - 5} more items low on stock
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, gradient, iconColor, borderColor, alert }) {
  return (
    <div className={`group glass-panel rounded-2xl p-6 border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${borderColor} relative overflow-hidden ${alert ? 'animate-glow' : ''}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`}></div>
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">{title}</p>
          <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 shadow-inner group-hover:scale-110 transition-transform ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 text-white/5 transform group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-24 h-24" />
      </div>
    </div>
  );
}
