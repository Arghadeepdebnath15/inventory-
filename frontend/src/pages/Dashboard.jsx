import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { PackageSearch, AlertTriangle, IndianRupee, Receipt, TrendingUp, ChevronRight, Activity, Award } from 'lucide-react';
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
  const [topItems, setTopItems] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const { data: products } = await supabase.from('products').select('*');
      const totalProducts = products?.length || 0;
      const lowStock = products?.filter(p => p.stock_qty <= p.low_stock_threshold) || [];
      
      // Strict local timezone start of day
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const { data: bills } = await supabase
        .from('bills')
        .select('*')
        .gte('created_at', startOfDay.toISOString())
        .order('created_at', { ascending: false });

      const todayRevenue = bills?.reduce((sum, bill) => sum + Number(bill.grand_total), 0) || 0;
      const billsToday = bills?.length || 0;

      const { data: recent } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch top selling items from bill_items
      const { data: billItems } = await supabase.from('bill_items').select('product_name, quantity, line_total');
      const salesMap = {};
      if (billItems) {
        billItems.forEach(item => {
          if (!salesMap[item.product_name]) salesMap[item.product_name] = { qty: 0, revenue: 0 };
          salesMap[item.product_name].qty += item.quantity;
          salesMap[item.product_name].revenue += Number(item.line_total);
        });
      }
      const sortedTopItems = Object.keys(salesMap).map(name => ({
        name,
        qty: salesMap[name].qty,
        revenue: salesMap[name].revenue
      })).sort((a, b) => b.qty - a.qty).slice(0, 5);

      setStats({
        totalProducts,
        lowStock: lowStock.length,
        totalProducts: products.length,
        lowStock: lowStockItems.length,
        todayRevenue: revToday,
        billsToday: billToday
      });

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
        
        {/* Top Selling Items */}
        <div className="glass-panel rounded-2xl p-7 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors duration-700"></div>
          
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
            <Award className="w-5 h-5 text-orange-400" />
            Top Selling Items
          </h3>
          
          <div className="relative z-10 h-full">
            {topItems.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center bg-black/20 rounded-xl border border-white/5 text-center px-4">
                <p className="text-gray-500 text-sm">No sales data yet.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {topItems.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-3.5 rounded-xl border border-white/5 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-orange-500 font-black text-lg w-4">#{idx+1}</span>
                      <div>
                        <p className="font-bold text-white text-sm">{item.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{item.qty} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-green-400 text-sm">₹{item.revenue.toFixed(0)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Bills */}
        <div className="glass-panel rounded-2xl p-7 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Receipt className="w-5 h-5 text-primary" />
              Recent Bills
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
                  <div key={bill.id} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all hover:scale-[1.01]">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/20 p-2.5 rounded-lg text-primary">
                        <IndianRupee className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-base">{bill.customer_name || 'Walk-in'}</p>
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
              <div className="h-[200px] flex flex-col items-center justify-center bg-black/20 rounded-xl border border-white/5 text-center px-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-3">
                  <PackageSearch className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-green-400 font-bold text-sm">Inventory Healthy</p>
                <p className="text-xs text-gray-500 mt-1">No items are running low.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {lowStockItems.map(item => (
                  <li key={item.id} className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-3.5 rounded-xl border border-white/5 transition-all">
                    <div>
                      <p className="font-bold text-white text-sm">{item.name}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">{item.brand}</span>
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
