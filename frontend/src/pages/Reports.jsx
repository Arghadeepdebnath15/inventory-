import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, IndianRupee, Package, ChevronDown } from 'lucide-react';

export default function Reports() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days'); // '7days', '30days', 'all'

  useEffect(() => {
    fetchBills();
  }, [timeRange]);

  async function fetchBills() {
    setLoading(true);
    try {
      const { data } = await api.get('/bills');
      setBills(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  // Aggregate Data for Chart
  const aggregateByDate = () => {
    const agg = {};
    bills.forEach(bill => {
      // Create a local date string (YYYY-MM-DD)
      const dateObj = new Date(bill.created_at);
      const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      
      if (!agg[date]) agg[date] = 0;
      agg[date] += Number(bill.grand_total);
    });

    return Object.keys(agg).map(date => ({
      date,
      revenue: agg[date]
    }));
  };

  const chartData = aggregateByDate();
  const totalRevenue = bills.reduce((sum, b) => sum + Number(b.grand_total), 0);
  const totalBills = bills.length;
  const avgOrderValue = totalBills > 0 ? (totalRevenue / totalBills) : 0;

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

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center glass-panel p-6 rounded-2xl border-l-4 border-primary">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <TrendingUp className="text-primary w-8 h-8" /> Revenue Reports
          </h2>
          <p className="text-gray-400 mt-1">Analytics and financial overview of your shop.</p>
        </div>
        
        <div className="relative">
          <select 
            value={timeRange} 
            onChange={e => setTimeRange(e.target.value)}
            className="appearance-none bg-black/40 border border-white/10 text-white pl-4 pr-10 py-2.5 rounded-xl font-bold focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors"></div>
          <div className="bg-green-500/20 p-4 rounded-xl text-green-400 border border-green-500/10">
            <IndianRupee className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-bold uppercase">Total Revenue</p>
            <p className="text-3xl font-black text-white">₹{totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
          <div className="bg-blue-500/20 p-4 rounded-xl text-blue-400 border border-blue-500/10">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-bold uppercase">Total Bills</p>
            <p className="text-3xl font-black text-white">{totalBills}</p>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
          <div className="bg-purple-500/20 p-4 rounded-xl text-purple-400 border border-purple-500/10">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-bold uppercase">Avg Order Value</p>
            <p className="text-3xl font-black text-white">₹{avgOrderValue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
        <h3 className="text-xl font-bold text-white mb-6 relative z-10">Revenue Trend</h3>
        
        <div className="h-[400px] w-full relative z-10">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 font-medium">No revenue data for this period.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af" 
                  tick={{fill: '#9ca3af', fontSize: 12}} 
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  tick={{fill: '#9ca3af', fontSize: 12}} 
                  tickFormatter={(val) => `₹${val}`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#f97316' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#f97316" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#121212' }} 
                  activeDot={{ r: 8, fill: '#ea580c', stroke: 'rgba(249,115,22,0.3)', strokeWidth: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
