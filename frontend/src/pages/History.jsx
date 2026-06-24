import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { History as HistoryIcon, Search, FileText, Calendar } from 'lucide-react';

export default function History() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'today', '7days', 'all'

  useEffect(() => {
    fetchBills();
  }, [dateFilter]);

  async function fetchBills() {
    setLoading(true);
    let query = supabase.from('bills').select('*').order('created_at', { ascending: false });

    if (dateFilter !== 'all') {
      const date = new Date();
      if (dateFilter === 'today') {
        date.setHours(0, 0, 0, 0);
      } else if (dateFilter === '7days') {
        date.setDate(date.getDate() - 7);
      }
      query = query.gte('created_at', date.toISOString());
    }

    const { data } = await query;
    setBills(data || []);
    setLoading(false);
  }

  const filteredBills = bills.filter(b => 
    b.bill_number?.toLowerCase().includes(search.toLowerCase()) || 
    b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.vehicle_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <HistoryIcon className="w-8 h-8 text-primary" />
        <h2 className="text-3xl font-black text-white tracking-tight">Transactions</h2>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by bill number, customer name, or vehicle number..." 
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <select 
            className="w-full appearance-none bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors cursor-pointer"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/40 text-gray-400 text-sm border-b border-white/10">
                <tr>
                  <th className="p-4 font-semibold uppercase tracking-wider">Bill No & Date</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Customer Details</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-right">Totals</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBills.map(bill => (
                  <tr key={bill.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <p className="font-bold text-white group-hover:text-primary transition-colors">{bill.bill_number}</p>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono">{new Date(bill.created_at).toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-300">{bill.customer_name || 'Walk-in Customer'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {bill.customer_phone} {bill.vehicle_number ? `• Veh: ${bill.vehicle_number}` : ''}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-black text-green-400 text-lg">₹{bill.grand_total}</p>
                      <p className="text-[10px] uppercase font-bold text-gray-500 mt-0.5">Tax: ₹{bill.gst_amount}</p>
                    </td>
                    <td className="p-4 text-center">
                      <button className="text-gray-400 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-2 text-sm font-bold">
                        <FileText className="w-4 h-4" /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredBills.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-gray-500 font-medium">No transactions found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
