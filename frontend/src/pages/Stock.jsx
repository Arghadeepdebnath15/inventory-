import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PackagePlus, Search, History, ArrowRight } from 'lucide-react';

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [entryData, setEntryData] = useState({
    add_qty: 0,
    reason: 'received',
    note: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchRecentLogs();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('name');
    setProducts(data || []);
  }

  async function fetchRecentLogs() {
    // Fetch logs with joined product name (assuming we join by product_id)
    const { data } = await supabase
      .from('stock_log')
      .select('*, products(name, brand)')
      .order('created_at', { ascending: false })
      .limit(5);
    setRecentLogs(data || []);
  }

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    if (!selectedProduct || entryData.add_qty <= 0) return;
    
    setLoading(true);
    try {
      const newStock = selectedProduct.stock_qty + Number(entryData.add_qty);
      
      // Update product table
      await supabase.from('products').update({ stock_qty: newStock }).eq('id', selectedProduct.id);
      
      // Insert log
      await supabase.from('stock_log').insert([{
        product_id: selectedProduct.id,
        change_qty: Number(entryData.add_qty),
        reason: entryData.reason,
        note: entryData.note
      }]);

      alert('Stock updated successfully!');
      
      // Reset form
      setSelectedProduct(null);
      setEntryData({ add_qty: 0, reason: 'received', note: '' });
      setSearch('');
      fetchProducts();
      fetchRecentLogs();
      
    } catch (err) {
      console.error(err);
      alert('Error updating stock');
    }
    setLoading(false);
  };

  const filteredProducts = search.length > 0 
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <PackagePlus className="w-8 h-8 text-primary" />
        <h2 className="text-3xl font-black text-white tracking-tight">Stock Entry</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Entry Form */}
        <div className="glass-panel rounded-2xl border border-white/5 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-700"></div>
          
          <div className="space-y-8 relative z-10">
            {/* Step 1: Select Product */}
            <div className="space-y-3 relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">1. Select Product</label>
              {!selectedProduct ? (
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                  <input 
                    autoFocus
                    placeholder="Search product by name or SKU..." 
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-primary focus:outline-none transition-colors font-medium shadow-inner" 
                    value={search} onChange={e => setSearch(e.target.value)} 
                  />
                  {filteredProducts.length > 0 && (
                    <div className="absolute w-full mt-2 bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50">
                      {filteredProducts.map(p => (
                        <div key={p.id} onClick={() => { setSelectedProduct(p); setSearch(''); }} 
                             className="p-4 hover:bg-[#2a2a2a] cursor-pointer flex justify-between items-center border-b border-gray-800 last:border-0 transition-colors">
                          <div>
                            <p className="font-bold text-white text-base">{p.name}</p>
                            <p className="text-xs text-gray-400 mt-1">SKU: {p.sku || '-'} | Brand: {p.brand}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Current</p>
                            <span className={`inline-block px-2 py-1 text-xs font-bold rounded-lg ${p.stock_qty <= p.low_stock_threshold ? 'bg-red-500 text-white' : 'bg-green-500/20 text-green-400 border border-green-500/20'}`}>
                              {p.stock_qty}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex justify-between items-center shadow-inner">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedProduct.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">SKU: {selectedProduct.sku} • Current Stock: <span className="font-bold text-white">{selectedProduct.stock_qty}</span></p>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="text-xs font-bold uppercase tracking-wider text-primary hover:text-white px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-all">
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Update Data */}
            <form onSubmit={handleStockUpdate} className={`space-y-6 transition-opacity duration-300 ${!selectedProduct ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">2. Quantity to Add</label>
                  <input type="number" min="1" required
                         className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-primary text-2xl font-black focus:border-primary focus:outline-none transition-colors text-center" 
                         value={entryData.add_qty || ''} onChange={e => setEntryData({...entryData, add_qty: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</label>
                  <select className="w-full h-[60px] bg-black/40 border border-white/10 rounded-xl px-4 text-white focus:border-primary focus:outline-none transition-colors cursor-pointer"
                          value={entryData.reason} onChange={e => setEntryData({...entryData, reason: e.target.value})}>
                    <option value="received">New Stock Received</option>
                    <option value="returned">Customer Return</option>
                    <option value="found">Inventory Adjustment</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Supplier Note / Invoice Number</label>
                <input type="text"
                       className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary focus:outline-none transition-colors" 
                       value={entryData.note} onChange={e => setEntryData({...entryData, note: e.target.value})} 
                       placeholder="e.g. Received from Supplier XYZ, Inv #9982" />
              </div>

              {selectedProduct && entryData.add_qty > 0 && (
                <div className="flex items-center justify-center gap-4 py-4 text-center">
                  <div className="bg-black/40 border border-white/5 rounded-xl px-6 py-3">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Current</p>
                    <p className="text-2xl font-black text-gray-300">{selectedProduct.stock_qty}</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-primary animate-pulse" />
                  <div className="bg-primary/10 border border-primary/20 rounded-xl px-6 py-3 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">New Total</p>
                    <p className="text-3xl font-black text-primary">{selectedProduct.stock_qty + Number(entryData.add_qty)}</p>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading || !selectedProduct} 
                      className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary-dark hover:to-orange-600 text-white font-black text-lg py-4 rounded-xl disabled:opacity-50 disabled:grayscale transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20">
                {loading ? 'PROCESSING...' : 'CONFIRM STOCK UPDATE'}
              </button>
            </form>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="glass-panel rounded-2xl border border-white/5 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-700"></div>
          
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
            <History className="w-5 h-5 text-blue-400" />
            Recent Stock Entries
          </h3>

          <div className="relative z-10">
            {recentLogs.length === 0 ? (
              <div className="bg-black/20 border border-white/5 rounded-xl p-8 text-center">
                <p className="text-gray-500 font-medium">No recent stock logs.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLogs.map(log => (
                  <div key={log.id} className="bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 flex justify-between items-center transition-all hover:scale-[1.01]">
                    <div>
                      <p className="font-bold text-white text-sm">{log.products?.name || 'Unknown Product'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {log.reason === 'sale' ? 'Sale' : log.reason === 'received' ? 'Received' : log.reason}
                        {log.note && ` • ${log.note}`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <span className={`inline-flex px-2 py-1 text-sm font-black rounded-lg ${log.change_qty > 0 ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                        {log.change_qty > 0 ? '+' : ''}{log.change_qty}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-1 font-mono">{new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
