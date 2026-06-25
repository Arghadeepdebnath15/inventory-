import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { History as HistoryIcon, Search, FileText, Calendar, X, Printer, Download } from 'lucide-react';
import PrintInvoice from '../components/PrintInvoice';

export default function History() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'today', '7days', 'all'
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    fetchBills();
  }, [dateFilter]);

  async function fetchBills() {
    setLoading(true);
    try {
      const { data } = await api.get('/bills', {
        params: { dateFilter }
      });
      setBills(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
                      <button onClick={() => setSelectedBill(bill)} className="text-gray-400 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-2 text-sm font-bold">
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

      {/* Invoice Preview Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center overflow-y-auto pt-10 pb-20 px-4">
          <div className="w-full max-w-4xl flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black text-white">Invoice Preview</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => window.print()}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
              >
                <Printer className="w-5 h-5" /> Print / Save as PDF
              </button>
              <button 
                onClick={() => setSelectedBill(null)}
                className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="w-full max-w-[210mm] overflow-hidden rounded-xl">
            <PrintInvoice 
              previewMode={true}
              billData={selectedBill}
              items={selectedBill.bill_items || []}
              subtotal={selectedBill.subtotal || 0}
              discountAmount={selectedBill.discount_value || 0}
              gstAmount={selectedBill.gst_amount || 0}
              grandTotal={selectedBill.grand_total || 0}
              settings={{}}
              billNumber={selectedBill.bill_number}
            />
          </div>
          
          {/* We also need an invisible version for the actual print command */}
          <PrintInvoice 
            previewMode={false}
            billData={selectedBill}
            items={selectedBill.bill_items || []}
            subtotal={selectedBill.subtotal || 0}
            discountAmount={selectedBill.discount_value || 0}
            gstAmount={selectedBill.gst_amount || 0}
            grandTotal={selectedBill.grand_total || 0}
            settings={{}}
            billNumber={selectedBill.bill_number}
          />
        </div>
      )}
    </div>
  );
}
