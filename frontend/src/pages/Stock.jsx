import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PackagePlus, Search } from 'lucide-react';

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

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('name');
    setProducts(data || []);
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
        <PackagePlus className="w-8 h-8 text-primary" />
        <h2 className="text-3xl font-bold text-text-main">Stock Entry</h2>
      </div>

      <div className="bg-bg-card rounded-xl border border-gray-800 p-6 space-y-6">
        
        {/* Step 1: Select Product */}
        <div className="space-y-3 relative z-20">
          <label className="text-sm font-medium text-gray-400">1. Select Product</label>
          {!selectedProduct ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                autoFocus
                placeholder="Search product by name or SKU..." 
                className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                value={search} onChange={e => setSearch(e.target.value)} 
              />
              {filteredProducts.length > 0 && (
                <div className="absolute w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                  {filteredProducts.map(p => (
                    <div key={p.id} onClick={() => { setSelectedProduct(p); setSearch(''); }} 
                         className="p-4 hover:bg-gray-700 cursor-pointer flex justify-between items-center border-b border-gray-700/50 last:border-0">
                      <div>
                        <p className="font-medium text-white">{p.name}</p>
                        <p className="text-xs text-gray-400">SKU: {p.sku} | Brand: {p.brand}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Current Stock: <span className={p.stock_qty <= p.low_stock_threshold ? 'text-red-400' : 'text-green-400'}>{p.stock_qty}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#121212] border border-primary/50 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedProduct.name}</h3>
                <p className="text-sm text-gray-400">SKU: {selectedProduct.sku} | Current Stock: {selectedProduct.stock_qty}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-sm text-gray-400 hover:text-white underline">
                Change Product
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Update Data */}
        <form onSubmit={handleStockUpdate} className={`space-y-6 transition-opacity duration-300 ${!selectedProduct ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">2. Quantity to Add</label>
              <input type="number" min="1" required
                     className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white text-xl font-bold focus:border-primary focus:outline-none" 
                     value={entryData.add_qty || ''} onChange={e => setEntryData({...entryData, add_qty: e.target.value})} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Reason</label>
              <select className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                      value={entryData.reason} onChange={e => setEntryData({...entryData, reason: e.target.value})}>
                <option value="received">New Stock Received</option>
                <option value="returned">Customer Return</option>
                <option value="found">Inventory Adjustment (Found)</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Supplier Note / Invoice Number (Optional)</label>
            <input type="text"
                   className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" 
                   value={entryData.note} onChange={e => setEntryData({...entryData, note: e.target.value})} 
                   placeholder="e.g. Received from Supplier XYZ, Inv #9982" />
          </div>

          {selectedProduct && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex justify-between items-center text-primary">
              <span className="font-medium">New Stock Quantity will be:</span>
              <span className="text-2xl font-bold">{selectedProduct.stock_qty + Number(entryData.add_qty || 0)}</span>
            </div>
          )}

          <div className="pt-4 border-t border-gray-800">
            <button type="submit" disabled={loading || !selectedProduct} 
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition-colors flex justify-center items-center gap-2">
              {loading ? 'Updating...' : 'Confirm Stock Update'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
