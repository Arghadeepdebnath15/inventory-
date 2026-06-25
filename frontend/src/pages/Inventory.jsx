import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, Search, Edit, Trash2, Package, Tag, Settings, Filter, ChevronDown, ChevronLeft, ChevronRight, Box, TrendingUp, IndianRupee } from 'lucide-react';

const CATEGORIES = ['All', 'Tyres', 'Tubes', 'Alloys', 'Batteries', 'Accessories', 'Other'];
const TYPES = ['Tubeless', 'Tube-type', 'Radial', 'Bias', 'Standard', '-'];

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [stats, setStats] = useState({
    totalItems: 0,
    inStock: 0,
    lowStock: 0,
    totalValue: 0
  });
  
  const [formData, setFormData] = useState({
    name: '', brand: '', size: '', type: 'Tubeless', 
    category: 'Tyres', sku: '', purchase_price: '', 
    selling_price: '', stock_qty: '', low_stock_threshold: '5', hsn_code: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      const items = data || [];
      setProducts(items);

      let inStock = 0;
      let lowStock = 0;
      let totalValue = 0;

      items.forEach(p => {
        const qty = Number(p.stock_qty || 0);
        inStock += qty;
        if (qty <= Number(p.low_stock_threshold || 5)) lowStock++;
        totalValue += qty * Number(p.purchase_price || 0);
      });

      setStats({
        totalItems: items.length,
        inStock,
        lowStock,
        totalValue
      });
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

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 text-gray-200" style={{ backgroundColor: '#0f111a', minHeight: '100%', padding: '1rem', borderRadius: '1rem' }}>
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Inventory Manager
          </h2>
          <p className="text-gray-400 mt-1 text-sm">Manage your tyres, tubes, and other shop items.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '', brand: '', size: '', type: 'Tubeless', category: activeCategory !== 'All' ? activeCategory : 'Tyres', sku: '', purchase_price: '', selling_price: '', stock_qty: '', low_stock_threshold: '5', hsn_code: '' });
            setEditingId(null);
            setShowModal(true);
          }}
          className="bg-[#ff6b00] hover:bg-[#e56000] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all"
        >
          <Plus className="w-5 h-5" /> Add New Item
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#161b22] border border-[#2a2f3d] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#4f46e5]/20">
            <Box className="w-6 h-6 text-[#818cf8]" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Items</p>
            <p className="text-2xl font-bold text-white leading-tight">{formatCurrency(stats.totalItems)}</p>
            <p className="text-[10px] text-gray-500">All inventory items</p>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-[#161b22] border border-[#2a2f3d] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#22c55e]/20">
            <Package className="w-6 h-6 text-[#4ade80]" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">In Stock</p>
            <p className="text-2xl font-bold text-white leading-tight">{formatCurrency(stats.inStock)}</p>
            <p className="text-[10px] text-gray-500">Total units available</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#161b22] border border-[#2a2f3d] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#eab308]/20">
            <TrendingUp className="w-6 h-6 text-[#fde047]" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Low Stock</p>
            <p className="text-2xl font-bold text-white leading-tight">{formatCurrency(stats.lowStock)}</p>
            <p className="text-[10px] text-gray-500">Items running low</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#161b22] border border-[#2a2f3d] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#3b82f6]/20">
            <IndianRupee className="w-6 h-6 text-[#60a5fa]" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Value</p>
            <p className="text-2xl font-bold text-white leading-tight">₹ {formatCurrency(stats.totalValue)}</p>
            <p className="text-[10px] text-gray-500">Inventory worth</p>
          </div>
        </div>
      </div>

      {/* Controls: Search and Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name, SKU, brand, or size... (e.g. 145/80 R12)" 
              className="w-full bg-[#161b22] border border-[#2a2f3d] rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:border-[#ff6b00] focus:outline-none transition-colors"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button className="flex items-center justify-center gap-2 bg-[#161b22] border border-[#2a2f3d] px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#202635] transition-colors whitespace-nowrap">
            <Filter className="w-4 h-4" /> Filters <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 pb-2 border-b border-[#1f2533]">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                activeCategory === cat 
                  ? 'bg-[#ff6b00] text-white border-[#ff6b00] shadow-[0_0_10px_rgba(255,107,0,0.3)]' 
                  : 'bg-transparent text-gray-400 border-[#2a2f3d] hover:border-gray-500 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Table */}
      <div className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading inventory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-[#1f2533]">
                <tr>
                  <th className="py-4 px-2 w-[35%]">Product Details</th>
                  <th className="py-4 px-2 w-[15%]">Size & Specs</th>
                  <th className="py-4 px-2 w-[15%]">Pricing</th>
                  <th className="py-4 px-2 w-[20%]">Stock Level</th>
                  <th className="py-4 px-2 text-center w-[15%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2533]">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-500">No products found matching your criteria.</td>
                  </tr>
                ) : paginatedProducts.map(p => {
                  const stockStatus = p.stock_qty <= 0 ? 'Out of Stock' : (p.stock_qty <= p.low_stock_threshold ? 'Low Stock' : 'High Stock');
                  const progressColor = p.stock_qty <= 0 ? 'bg-red-500' : (p.stock_qty <= p.low_stock_threshold ? 'bg-yellow-500' : 'bg-[#22c55e]');
                  const progressPercent = Math.min(100, Math.max(5, (p.stock_qty / (p.low_stock_threshold * 3)) * 100)); // Arbitrary scale for visual

                  return (
                    <tr key={p.id} className="hover:bg-[#161b22] transition-colors group">
                      
                      {/* Product Details */}
                      <td className="py-4 px-2 align-top">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-xl bg-[#1c212c] flex items-center justify-center flex-shrink-0 shadow-inner">
                            {/* Dummy Tyre Graphic */}
                            <div className="w-10 h-10 border-4 border-[#0f111a] rounded-full shadow-[inset_0_0_8px_rgba(0,0,0,0.5)] bg-[#2a2f3d] flex items-center justify-center">
                              <div className="w-4 h-4 rounded-full bg-[#0f111a]"></div>
                            </div>
                          </div>
                          <div className="pt-1">
                            <p className="font-bold text-white text-sm mb-1">{p.name}</p>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] text-[#ff6b00] bg-[#ff6b00]/10 px-2 py-0.5 rounded uppercase font-bold tracking-wider border border-[#ff6b00]/20">
                                {p.category}
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono">SKU: {p.sku || '-'}</span>
                            </div>
                            <p className="text-[10px] text-gray-600">Added on {new Date(p.created_at).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}</p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Size & Specs */}
                      <td className="py-4 px-2 align-top pt-5">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20 uppercase">
                            <Settings className="w-3 h-3"/> NEW
                          </span>
                          <span className="text-sm text-gray-300 font-medium">{p.brand || 'No Brand'}</span>
                          <span className="text-[11px] text-gray-500">{p.type}</span>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="py-4 px-2 align-top pt-5">
                        <p className="text-[15px] font-black text-[#22c55e]">₹{formatCurrency(p.selling_price)}</p>
                        <p className="text-[11px] text-gray-500 mt-1">Buy: ₹{formatCurrency(p.purchase_price)}</p>
                      </td>

                      {/* Stock Level */}
                      <td className="py-4 px-2 align-top pt-5">
                        <div className="flex flex-col items-start w-32">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded shadow-sm border mb-2 ${
                            p.stock_qty <= 0 ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            p.stock_qty <= p.low_stock_threshold ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                            'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20'
                          }`}>
                            {p.stock_qty} Units
                          </span>
                          
                          <div className="w-full h-1.5 bg-[#2a2f3d] rounded-full overflow-hidden mb-1">
                            <div className={`h-full ${progressColor}`} style={{ width: `${progressPercent}%` }}></div>
                          </div>
                          
                          <span className="text-[10px] text-gray-500">{stockStatus}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-2 align-top pt-5">
                        <div className="flex justify-center gap-3">
                          <button 
                            onClick={() => { setFormData(p); setEditingId(p.id); setShowModal(true); }}
                            className="w-9 h-9 flex items-center justify-center text-gray-400 bg-[#161b22] border border-[#2a2f3d] hover:text-white hover:border-gray-500 rounded-lg transition-colors shadow-sm"
                            title="Edit Item"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)}
                            className="w-9 h-9 flex items-center justify-center text-red-500 bg-[#161b22] border border-[#2a2f3d] hover:bg-red-500/10 hover:border-red-500/30 rounded-lg transition-colors shadow-sm"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination & Footer */}
      {!loading && (
        <div className="pt-4 mt-6 border-t border-[#1f2533]">
          
          <div className="flex justify-between items-center mb-16">
            <p className="text-[11px] text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#161b22] border border-[#2a2f3d] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Simple page numbers */}
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                // Basic logic to only show nearby pages
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold ${
                        currentPage === page
                          ? 'bg-[#ff6b00] text-white shadow-[0_0_10px_rgba(255,107,0,0.3)]'
                          : 'bg-[#161b22] border border-[#2a2f3d] text-gray-400 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="text-gray-600 text-xs">...</span>;
                }
                return null;
              })}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#161b22] border border-[#2a2f3d] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-600">
            <p>Built with <span className="text-red-500">❤️</span> for tyre shop owners</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#0f111a] border border-[#2a2f3d] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden">
            <div className="bg-[#161b22] border-b border-[#2a2f3d] px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Tag className="text-[#ff6b00] w-5 h-5"/>
                {editingId ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Product Classification */}
              <div className="bg-[#161b22] p-4 rounded-xl border border-[#2a2f3d]">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Classification</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Category <span className="text-red-500">*</span></label>
                    <select className="w-full bg-[#0f111a] border border-[#2a2f3d] rounded-lg px-3 py-2 text-white focus:border-[#ff6b00] focus:outline-none" 
                            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Brand</label>
                    <input placeholder="e.g. MRF, CEAT" className="w-full bg-[#0f111a] border border-[#2a2f3d] rounded-lg px-3 py-2 text-white focus:border-[#ff6b00] focus:outline-none" 
                           value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Type/Spec</label>
                    <select className="w-full bg-[#0f111a] border border-[#2a2f3d] rounded-lg px-3 py-2 text-white focus:border-[#ff6b00] focus:outline-none" 
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
                  <input required placeholder="e.g. Zapper Kurve F" className="w-full bg-[#161b22] border border-[#2a2f3d] rounded-lg px-3 py-2.5 text-white text-lg focus:border-[#ff6b00] focus:outline-none" 
                         value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Size (Crucial for Tyres/Tubes)</label>
                  <input placeholder="e.g. 145/80 R12 or 90/90-12" className="w-full bg-[#161b22] border border-[#2a2f3d] rounded-lg px-3 py-2 text-blue-400 font-bold focus:border-blue-500 focus:outline-none" 
                         value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">SKU / Barcode</label>
                  <input placeholder="Stock Keeping Unit" className="w-full bg-[#161b22] border border-[#2a2f3d] rounded-lg px-3 py-2 text-white focus:border-[#ff6b00] focus:outline-none" 
                         value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Buy Price (₹)</label>
                  <input type="number" required min="0" className="w-full bg-[#161b22] border border-[#2a2f3d] rounded-lg px-3 py-2 text-white focus:border-[#ff6b00] focus:outline-none" 
                         value={formData.purchase_price} onChange={e => setFormData({...formData, purchase_price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Sell Price (₹) <span className="text-red-500">*</span></label>
                  <input type="number" required min="0" className="w-full bg-[#161b22] border border-[#2a2f3d] rounded-lg px-3 py-2 text-[#22c55e] font-bold focus:border-[#22c55e] focus:outline-none" 
                         value={formData.selling_price} onChange={e => setFormData({...formData, selling_price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Current Stock</label>
                  <input type="number" required min="0" className="w-full bg-[#161b22] border border-[#2a2f3d] rounded-lg px-3 py-2 text-white focus:border-[#ff6b00] focus:outline-none" 
                         value={formData.stock_qty} onChange={e => setFormData({...formData, stock_qty: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Low Alert At</label>
                  <input type="number" required min="0" className="w-full bg-[#161b22] border border-[#2a2f3d] rounded-lg px-3 py-2 text-yellow-400 focus:border-yellow-500 focus:outline-none" 
                         value={formData.low_stock_threshold} onChange={e => setFormData({...formData, low_stock_threshold: e.target.value})} />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2f3d]">
                <button type="button" onClick={() => setShowModal(false)} 
                        className="px-6 py-2.5 text-gray-400 hover:text-white font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" 
                        className="bg-[#ff6b00] hover:bg-[#e56000] text-white px-8 py-2.5 rounded-lg font-bold shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all">
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
