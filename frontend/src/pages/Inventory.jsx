import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, Search, Edit, Trash2, Package, Tag, Settings } from 'lucide-react';

const CATEGORIES = ['All', 'Tyres', 'Tubes', 'Alloys', 'Batteries', 'Accessories', 'Other'];
const TYPES = ['Tubeless', 'Tube-type', 'Radial', 'Bias', 'Standard', '-'];

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', brand: '', size: '', type: 'Tubeless', 
    category: 'Tyres', sku: '', purchase_price: 0, 
    selling_price: 0, stock_qty: 0, low_stock_threshold: 5, hsn_code: ''
  });

  useEffect(() => {
    fetchProducts();
    
    const channel = null; // Removed Realtime temporarily
    return () => {};
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data || []);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/products/${editingId}`, { ...formData });
    } else {
      await api.post('/products', { ...formData });
    }
    setShowModal(false);
    setEditingId(null);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await api.delete(`/products/${id}`);
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku?.toLowerCase().includes(search.toLowerCase()) ||
                          p.size?.toLowerCase().includes(search.toLowerCase()) ||
                          p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-text-main flex items-center gap-3">
            <Package className="text-primary w-8 h-8" />
            Inventory Manager
          </h2>
          <p className="text-text-muted mt-1">Manage your tyres, tubes, and other shop items.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '', brand: '', size: '', type: 'Tubeless', category: activeCategory !== 'All' ? activeCategory : 'Tyres', sku: '', purchase_price: 0, selling_price: 0, stock_qty: 0, low_stock_threshold: 5, hsn_code: '' });
            setEditingId(null);
            setShowModal(true);
          }}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> Add New Item
        </button>
      </div>

      {/* Controls: Search and Tabs */}
      <div className="bg-bg-card p-4 rounded-xl border border-gray-800 space-y-4 shadow-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name, SKU, brand, or size... (e.g. 145/80 R12)" 
            className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 pt-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'bg-[#121212] text-gray-400 border border-gray-800 hover:border-gray-600 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="bg-bg-card rounded-xl border border-gray-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading inventory...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#121212] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
              <tr>
                <th className="p-4 font-semibold">Product Details</th>
                <th className="p-4 font-semibold">Size & Specs</th>
                <th className="p-4 font-semibold text-right">Pricing</th>
                <th className="p-4 font-semibold text-right">Stock Level</th>
                <th className="p-4 font-semibold text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">No products found matching your criteria.</td>
                </tr>
              ) : filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-[#1a1a1a] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#121212] border border-gray-800 flex items-center justify-center flex-shrink-0">
                        {p.category === 'Tyres' ? <div className="w-6 h-6 border-4 border-gray-500 rounded-full"></div> : 
                         p.category === 'Tubes' ? <div className="w-6 h-6 border-2 border-gray-500 rounded-full border-dashed"></div> : 
                         <Package className="w-5 h-5 text-gray-500" />}
                      </div>
                      <div>
                        <p className="font-bold text-white text-base">{p.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-medium">{p.category}</span>
                          <span className="text-xs text-gray-500 font-mono">SKU: {p.sku || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {p.size && <span className="inline-flex items-center gap-1 font-bold text-blue-400"><Settings className="w-3 h-3"/> {p.size}</span>}
                      <span className="text-sm text-gray-300 font-medium">{p.brand || 'No Brand'}</span>
                      <span className="text-xs text-gray-500">{p.type}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <p className="text-base font-bold text-green-400">₹{p.selling_price}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Buy: ₹{p.purchase_price}</p>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex px-3 py-1 text-sm font-extrabold rounded-md shadow-sm ${
                        p.stock_qty <= 0 ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        p.stock_qty <= p.low_stock_threshold ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                        'bg-green-500/10 text-green-500 border border-green-500/20'
                      }`}>
                        {p.stock_qty} Units
                      </span>
                      {p.stock_qty <= p.low_stock_threshold && p.stock_qty > 0 && (
                        <span className="text-[10px] text-yellow-500 uppercase font-bold tracking-wider">Low Stock</span>
                      )}
                      {p.stock_qty <= 0 && (
                        <span className="text-[10px] text-red-500 uppercase font-bold tracking-wider">Out of Stock</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setFormData(p); setEditingId(p.id); setShowModal(true); }}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                        title="Edit Item"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-bg-dark border border-gray-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden">
            <div className="bg-bg-card border-b border-gray-800 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Tag className="text-primary w-5 h-5"/>
                {editingId ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Product Classification */}
              <div className="bg-[#121212] p-4 rounded-xl border border-gray-800">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Classification</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Category <span className="text-red-500">*</span></label>
                    <select className="w-full bg-bg-card border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none" 
                            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Brand</label>
                    <input placeholder="e.g. MRF, CEAT" className="w-full bg-bg-card border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none" 
                           value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Type/Spec</label>
                    <select className="w-full bg-bg-card border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none" 
                            value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Core Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Product Name <span className="text-red-500">*</span></label>
                  <input required placeholder="e.g. Zapper Kurve F" className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-lg focus:border-primary focus:outline-none" 
                         value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Size (Crucial for Tyres/Tubes)</label>
                  <input placeholder="e.g. 145/80 R12 or 90/90-12" className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-blue-400 font-bold focus:border-blue-500 focus:outline-none" 
                         value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">SKU / Barcode</label>
                  <input placeholder="Stock Keeping Unit" className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none" 
                         value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Buy Price (₹)</label>
                  <input type="number" required min="0" className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none" 
                         value={formData.purchase_price} onChange={e => setFormData({...formData, purchase_price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Sell Price (₹) <span className="text-red-500">*</span></label>
                  <input type="number" required min="0" className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-green-400 font-bold focus:border-green-500 focus:outline-none" 
                         value={formData.selling_price} onChange={e => setFormData({...formData, selling_price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Current Stock</label>
                  <input type="number" required min="0" className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none" 
                         value={formData.stock_qty} onChange={e => setFormData({...formData, stock_qty: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Low Alert At</label>
                  <input type="number" required min="0" className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-yellow-400 focus:border-yellow-500 focus:outline-none" 
                         value={formData.low_stock_threshold} onChange={e => setFormData({...formData, low_stock_threshold: e.target.value})} />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} 
                        className="px-6 py-2.5 text-gray-400 hover:text-white font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" 
                        className="bg-primary hover:bg-primary-dark text-white px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all">
                  {editingId ? 'Save Changes' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
