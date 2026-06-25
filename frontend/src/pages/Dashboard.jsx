import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { PackageSearch, AlertTriangle, IndianRupee, Receipt, TrendingUp, ChevronRight, Activity, Award, PlusCircle, BarChart3, TrendingDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    todayRevenue: 0,
    todayProfit: 0,
    billsToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentBills, setRecentBills] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // 1. Fetch data from Custom Backend API
      const { data: productsData } = await api.get('/products');
      const products = productsData || [];
      
      const { data: billsData } = await api.get('/bills');
      const bills = billsData || [];

      // 2. Process Products
      const lowStock = products.filter(p => p.stock_qty <= (p.low_stock_threshold || 5));
      
      // Strict local timezone start of day
      const now = new Date();
      const localTodayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      let revToday = 0;
      let billToday = 0;
      let profitToday = 0;

      // 3. Process Bills
      bills.forEach(bill => {
        const d = new Date(bill.created_at);
        const billTime = d.getTime();
        
        if (billTime >= localTodayStart) {
          revToday += Number(bill.grand_total || 0);
          billToday++;
          
          // Calculate profit (Revenue - Buy Price of items)
          if (bill.bill_items) {
            bill.bill_items.forEach(item => {
              // Find product to get buy price
              const prod = products.find(p => p.id === item.product_id);
              const buyPrice = prod ? Number(prod.purchase_price || 0) : 0;
              const cost = buyPrice * item.quantity;
              const rev = Number(item.line_total || 0);
              profitToday += (rev - cost);
            });
          }
        }
      });

      // 4. Generate Chart Data (Last 7 Days)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        last7Days.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          timestamp: date.getTime(),
          revenue: 0
        });
      }

      bills.forEach(bill => {
        const d = new Date(bill.created_at);
        const billStartOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        
        const dayObj = last7Days.find(day => day.timestamp === billStartOfDay);
        if (dayObj) {
          dayObj.revenue += Number(bill.grand_total || 0);
        }
      });

      setChartData(last7Days);

      // 5. Recent Transactions
      const sortedBills = [...bills].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRecentBills(sortedBills.slice(0, 5));

      // 6. Top Selling Items
      const itemCounts = {};
      bills.forEach(b => {
        if(b.bill_items) {
          b.bill_items.forEach(item => {
            if (!itemCounts[item.product_id]) {
              itemCounts[item.product_id] = { 
                name: item.product_name, 
                qty: 0, 
                revenue: 0 
              };
            }
            itemCounts[item.product_id].qty += item.quantity;
            itemCounts[item.product_id].revenue += Number(item.line_total || 0);
          });
        }
      });

      const sortedTopItems = Object.values(itemCounts)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      setTopItems(sortedTopItems);
      setLowStockItems(lowStock.slice(0, 5));

      setStats({
        totalProducts: products.length,
        lowStock: lowStock.length,
        todayRevenue: revToday,
        todayProfit: profitToday,
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
        </div>
      </div>
    );
  }

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-gray-800 p-3 rounded-lg shadow-xl">
          <p className="text-gray-400 text-xs mb-1 font-bold uppercase">{label}</p>
          <p className="text-green-400 font-black text-lg">₹{payload[0].value.toFixed(0)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button onClick={() => navigate('/billing')} className="flex-1 bg-gradient-to-r from-primary to-orange-500 hover:opacity-90 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-lg shadow-primary/20 hover:-translate-y-1">
          <Receipt className="w-6 h-6" /> Create New Bill
        </button>
        <button onClick={() => navigate('/inventory')} className="flex-1 bg-[#121212] border border-gray-800 hover:border-gray-600 hover:bg-[#1a1a1a] text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-xl hover:-translate-y-1">
          <PlusCircle className="w-6 h-6 text-blue-400" /> Add Product
        </button>
        <button onClick={() => navigate('/reports')} className="flex-1 bg-[#121212] border border-gray-800 hover:border-gray-600 hover:bg-[#1a1a1a] text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-xl hover:-translate-y-1">
          <BarChart3 className="w-6 h-6 text-purple-400" /> View Reports
        </button>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Today's Revenue" 
          value={`₹${stats.todayRevenue.toFixed(0)}`} 
          icon={IndianRupee} 
          gradient="from-green-500/20 to-emerald-500/5" 
          iconColor="text-green-400"
          borderColor="group-hover:border-green-500/50"
        />
        <StatCard 
          title="Est. Profit" 
          value={`₹${stats.todayProfit.toFixed(0)}`} 
          icon={TrendingUp} 
          gradient="from-blue-500/20 to-cyan-500/5" 
          iconColor="text-blue-400"
          borderColor="group-hover:border-blue-500/50"
        />
        <StatCard 
          title="Bills Today" 
          value={stats.billsToday} 
          icon={Receipt} 
          gradient="from-purple-500/20 to-pink-500/5" 
          iconColor="text-purple-400"
          borderColor="group-hover:border-purple-500/50"
        />
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon={PackageSearch} 
          gradient="from-orange-500/20 to-amber-500/5" 
          iconColor="text-orange-400" 
          borderColor="group-hover:border-orange-500/50"
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={stats.lowStock} 
          icon={AlertTriangle} 
          gradient="from-red-500/20 to-rose-500/5" 
          iconColor="text-red-400"
          borderColor="group-hover:border-red-500/50"
          alert={stats.lowStock > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 relative overflow-hidden group border border-gray-800 bg-[#121212]/80 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl transition-colors duration-700"></div>
          
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 relative z-10">
            <Activity className="w-5 h-5 text-primary" />
            Revenue Trend (Last 7 Days)
          </h3>
          
          <div className="relative z-10 h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#666" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group border border-gray-800 bg-[#121212]/80 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl transition-colors duration-700"></div>
          
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 relative z-10">
            <Award className="w-5 h-5 text-orange-400" />
            Top Selling Items
          </h3>
          
          <div className="relative z-10 h-full">
            {topItems.length === 0 ? (
              <div className="h-[250px] flex flex-col items-center justify-center bg-black/20 rounded-xl border border-white/5 text-center px-4">
                <p className="text-gray-500 text-sm">No sales data yet.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {topItems.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 transition-all">
                    <div className="flex items-center gap-3">
                      <span className={`font-black text-lg w-4 ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-700' : 'text-gray-600'}`}>#{idx+1}</span>
                      <div>
                        <p className="font-bold text-white text-sm">{item.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.qty} units sold</p>
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
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 relative overflow-hidden group border border-gray-800 bg-[#121212]/80 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl transition-colors duration-700"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <Receipt className="w-5 h-5 text-blue-400" />
              Recent Transactions
            </h3>
            <Link to="/history" className="text-sm font-semibold text-blue-400 hover:text-white flex items-center transition-colors">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="relative z-10">
            {recentBills.length === 0 ? (
              <div className="text-center py-12 bg-black/20 rounded-xl border border-white/5">
                <p className="text-gray-500 font-medium">No transactions yet today.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentBills.map(bill => (
                  <div key={bill.id} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all hover:-translate-y-0.5">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/10 p-2.5 rounded-lg text-blue-400">
                        <IndianRupee className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{bill.customer_name || 'Walk-in'}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{bill.bill_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-green-400 text-base">₹{bill.grand_total}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{new Date(bill.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group border border-gray-800 bg-[#121212]/80 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl transition-colors duration-700"></div>
          
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 relative z-10">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Stock Alerts
          </h3>
          
          <div className="relative z-10 h-full">
            {lowStockItems.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center bg-black/20 rounded-xl border border-white/5 text-center px-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                  <PackageSearch className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-green-400 font-bold text-sm">Inventory Healthy</p>
                <p className="text-[10px] text-gray-500 mt-1">No items are running low.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {lowStockItems.map(item => (
                  <li key={item.id} className="flex flex-col bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-white text-sm leading-tight">{item.name}</p>
                      <span className={`shrink-0 ml-2 inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-black rounded ${item.stock_qty <= 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20'}`}>
                        {item.stock_qty} left
                      </span>
                    </div>
                    <div className="flex justify-between items-center w-full">
                       <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">{item.brand || 'No Brand'}</span>
                       <span className="text-[10px] text-gray-500">Alert at: {item.low_stock_threshold}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {stats.lowStock > 5 && (
              <Link to="/inventory" className="block text-center text-xs text-blue-400 hover:text-white mt-4 font-bold transition-colors">
                View {stats.lowStock - 5} more low stock items →
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
    <div className={`group glass-panel rounded-2xl p-5 border border-gray-800 bg-[#121212]/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${borderColor} relative overflow-hidden ${alert ? 'animate-glow ring-1 ring-red-500/50' : ''}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/5 shadow-inner group-hover:scale-110 transition-transform ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight mb-1">{value}</h3>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
        </div>
      </div>
    </div>
  );
}
