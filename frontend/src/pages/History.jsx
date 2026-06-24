import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { History as HistoryIcon, Search, FileText } from 'lucide-react';

export default function History() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  async function fetchBills() {
    setLoading(true);
    const { data } = await supabase
      .from('bills')
      .select('*')
      .order('created_at', { ascending: false });
    
    setBills(data || []);
    setLoading(false);
  }

  const filteredBills = bills.filter(b => 
    b.bill_number?.toLowerCase().includes(search.toLowerCase()) || 
    b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.vehicle_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
        <HistoryIcon className="w-8 h-8 text-primary" />
        <h2 className="text-3xl font-bold text-text-main">Bill History</h2>
      </div>

      <div className="bg-bg-card p-4 rounded-xl border border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by bill number, customer name, or vehicle number..." 
            className="w-full bg-[#121212] border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white focus:border-primary focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-bg-card rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading bills...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#121212] text-text-muted text-sm border-b border-gray-800">
              <tr>
                <th className="p-4 font-medium">Bill No & Date</th>
                <th className="p-4 font-medium">Customer Details</th>
                <th className="p-4 font-medium text-right">Totals</th>
                <th className="p-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredBills.map(bill => (
                <tr key={bill.id} className="hover:bg-[#121212]/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white">{bill.bill_number}</p>
                    <p className="text-sm text-text-muted">{new Date(bill.created_at).toLocaleString()}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium">{bill.customer_name || 'Walk-in Customer'}</p>
                    <p className="text-xs text-text-muted">{bill.customer_phone} {bill.vehicle_number ? `• Veh: ${bill.vehicle_number}` : ''}</p>
                  </td>
                  <td className="p-4 text-right">
                    <p className="font-bold text-green-400">₹{bill.grand_total}</p>
                    <p className="text-xs text-text-muted">Tax: ₹{bill.gst_amount}</p>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1 text-sm">
                      <FileText className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-text-muted">No bills found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
