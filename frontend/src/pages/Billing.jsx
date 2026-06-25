import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Trash2, Plus, Minus, Search, User, Phone, Truck, Receipt, Tag, Percent, Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import PrintInvoice from '../components/PrintInvoice';

export default function Billing() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState(null);
  const [currentBillNumber, setCurrentBillNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  
  const [billData, setBillData] = useState({
    customer_name: '', customer_phone: '', vehicle_number: '',
    discount_type: 'flat', discount_value: '', gst_rate: 5,
    price_inclusive: false,
    delivery_note: '', payment_mode: 'Cash', reference_no: '', other_references: '',
    buyer_order_no: '', buyer_order_date: '', dispatch_doc_no: '', delivery_note_date: '',
    dispatched_through: '', destination: '', terms_of_delivery: '',
    shop_state: localStorage.getItem('shop_state') || 'Tripura', 
    shop_state_code: localStorage.getItem('shop_state_code') || '16',
    customer_state: 'Tripura', customer_state_code: '16'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchSettings();
    
    const channel = null; // Removed Realtime temporarily for Custom Backend compatibility

    return () => {};
  }, []);

  async function fetchSettings() {
    try {
      const { data } = await api.get('/settings');
      if (data) setSettings(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchProducts() {
    try {
      const { data } = await api.get('/products');
      setProducts(data || []);
    } catch (e) {
      console.error(e);
    }
  }

  const addItem = (product) => {
    if (product.stock_qty <= 0) {
      return alert('This item is currently out of stock!');
    }

    const existingIndex = items.findIndex(i => i.product_id === product.id);
    if (existingIndex >= 0) {
      if (items[existingIndex].quantity + 1 > product.stock_qty) {
        return alert(`Cannot exceed available stock (${product.stock_qty})`);
      }
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      setItems(newItems);
    } else {
      setItems([...items, { product_id: product.id, product_name: product.name, size: product.size, hsn_code: product.hsn_code, quantity: 1, unit_price: product.selling_price }]);
    }
    setSearch('');
  };

  const updateQuantity = (index, delta) => {
    const newItems = [...items];
    const item = newItems[index];
    const product = products.find(p => p.id === item.product_id);
    
    const newQty = item.quantity + delta;
    if (newQty <= 0) return removeItem(index);
    if (newQty > product.stock_qty) {
      return alert(`Cannot exceed available stock (${product.stock_qty})`);
    }
    
    newItems[index].quantity = newQty;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const discountVal = Number(billData.discount_value) || 0;
  const discountAmount = billData.discount_type === 'percent' 
    ? (subtotal * (discountVal / 100)) 
    : discountVal;
  const afterDiscount = subtotal - discountAmount;
  const gstAmount = afterDiscount * (billData.gst_rate / 100);
  const grandTotal = afterDiscount + gstAmount;

  const saveBill = async () => {
    if (items.length === 0) return alert('Please add at least one item to the bill.');
    setLoading(true);
    
    try {
      const bill_id = uuidv4();
      
      await api.post('/bills', {
        billData: {
          bill_number: currentBillNumber,
          customer_name: billData.customer_name,
          customer_phone: billData.customer_phone,
          vehicle_number: billData.vehicle_number,
          subtotal,
          discount_type: billData.discount_type,
          discount_value: discountVal,
          gst_rate: billData.gst_rate,
          gst_amount: gstAmount,
          grand_total: grandTotal,
          shop_state: billData.shop_state,
          shop_state_code: billData.shop_state_code,
          customer_state: billData.customer_state,
          customer_state_code: billData.customer_state_code,
          payment_mode: billData.payment_mode,
          destination: billData.destination,
          dispatched_through: billData.dispatched_through,
          delivery_note: billData.delivery_note,
          reference_no: billData.reference_no,
          buyer_order_no: billData.buyer_order_no,
          price_inclusive: billData.price_inclusive
        },
        items: items
      });

      alert('Invoice created! Preparing to print...');
      
      setTimeout(() => {
        window.print();
        localStorage.setItem('shop_state', billData.shop_state);
        localStorage.setItem('shop_state_code', billData.shop_state_code);
        setItems([]);
        setBillData(prev => ({ 
          ...prev, 
          customer_name: '', customer_phone: '', vehicle_number: '', discount_value: '', 
          delivery_note: '', buyer_order_no: '', buyer_order_date: '', dispatch_doc_no: '', 
          delivery_note_date: '', dispatched_through: '', destination: '', terms_of_delivery: '' 
        }));
        setCurrentBillNumber(`INV-${Date.now().toString().slice(-6)}`);
      }, 500);
      
    } catch (err) {
      console.error('Detailed Error:', err);
      alert('Error saving bill: ' + (err.message || JSON.stringify(err)));
    }
    setLoading(false);
  };

  const filteredProducts = search.length > 0
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()) || p.size?.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 no-print h-[calc(100vh-8rem)]">
        
        {/* Left Panel: Search & Cart */}
        <div className="flex-1 flex flex-col space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                Point of Sale
              </h2>
              <p className="text-primary font-mono mt-1 font-bold bg-primary/10 inline-block px-2 py-0.5 rounded">{currentBillNumber}</p>
            </div>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="relative z-20">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-orange-400 rounded-xl blur opacity-25 group-focus-within:opacity-100 transition duration-500"></div>
              <div className="relative flex items-center bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-4 shadow-2xl">
                <Search className="text-primary w-6 h-6 mr-3" />
                <input 
                  autoFocus
                  placeholder="Scan barcode or type product name, size..." 
                  className="w-full bg-transparent text-white text-lg focus:outline-none placeholder-gray-500 font-medium"
                  value={search} onChange={e => setSearch(e.target.value)} 
                />
              </div>
            </div>

            {/* Dropdown Results */}
            {search.length > 0 && (
              <div className="absolute w-full mt-2 bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto custom-scrollbar">
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No products found for "{search}"</div>
                ) : (
                  filteredProducts.map(p => (
                    <div key={p.id} onClick={() => addItem(p)} className="p-4 hover:bg-[#2a2a2a] cursor-pointer flex justify-between items-center border-b border-gray-800/50 transition-colors group">
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-base group-hover:text-primary transition-colors">{p.name}</span>
                        <div className="flex items-center gap-3 mt-1 text-sm">
                          {p.size && <span className="text-blue-400 font-bold bg-blue-400/10 px-1.5 py-0.5 rounded">{p.size}</span>}
                          <span className="text-gray-400">{p.brand}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-black text-lg">₹{p.selling_price}</span>
                        <p className={`text-xs font-bold mt-1 ${p.stock_qty <= 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {p.stock_qty > 0 ? `${p.stock_qty} in stock` : 'Out of Stock'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Cart Table */}
          <div className="flex-1 bg-[#161616] rounded-2xl border border-gray-800 flex flex-col shadow-inner overflow-hidden min-h-[300px]">
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-[#121212] sticky top-0 z-10 shadow-md">
                  <tr>
                    <th className="p-4 text-gray-400 font-semibold text-sm">Product Description</th>
                    <th className="p-4 text-gray-400 font-semibold text-sm text-center w-32">Quantity</th>
                    <th className="p-4 text-gray-400 font-semibold text-sm text-right w-24">Price</th>
                    <th className="p-4 text-gray-400 font-semibold text-sm text-right w-32">Total</th>
                    <th className="p-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {items.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-[#1e1e1e] transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-white">{item.product_name}</p>
                        {item.size && <p className="text-xs text-blue-400 font-bold mt-0.5">{item.size}</p>}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center bg-[#121212] rounded-lg border border-gray-700 p-1 w-max mx-auto">
                          <button onClick={() => updateQuantity(idx, -1)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(idx, 1)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right text-gray-300">₹{item.unit_price}</td>
                      <td className="p-4 text-right font-black text-primary text-lg">₹{item.quantity * item.unit_price}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => removeItem(idx)} className="text-gray-500 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5"/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-20 text-center flex flex-col items-center justify-center text-gray-600">
                        <Receipt className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">Cart is empty</p>
                        <p className="text-sm mt-1">Scan or search for a product to begin</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Panel: Customer & Summary */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          
          {/* Customer Details Card */}
          <div className="bg-[#1e1e1e] p-5 rounded-2xl border border-gray-800 shadow-xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Customer Info
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <input placeholder="Customer Name" className="peer w-full bg-transparent border-b-2 border-gray-700 py-2 pl-8 text-white focus:border-primary focus:outline-none transition-colors" 
                       value={billData.customer_name} onChange={e => setBillData({...billData, customer_name: e.target.value})} />
                <User className="absolute left-0 top-2.5 w-5 h-5 text-gray-500 peer-focus:text-primary transition-colors" />
              </div>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <input placeholder="Phone" className="peer w-full bg-transparent border-b-2 border-gray-700 py-2 pl-8 text-white focus:border-primary focus:outline-none transition-colors" 
                         value={billData.customer_phone} onChange={e => setBillData({...billData, customer_phone: e.target.value})} />
                  <Phone className="absolute left-0 top-2.5 w-5 h-5 text-gray-500 peer-focus:text-primary transition-colors" />
                </div>
                <div className="relative flex-1">
                  <input placeholder="Vehicle No" className="peer w-full bg-transparent border-b-2 border-gray-700 py-2 pl-8 text-white focus:border-primary focus:outline-none uppercase transition-colors" 
                         value={billData.vehicle_number} onChange={e => setBillData({...billData, vehicle_number: e.target.value})} />
                  <Truck className="absolute left-0 top-2.5 w-5 h-5 text-gray-500 peer-focus:text-primary transition-colors" />
                </div>
              </div>

              {/* Advanced Toggle */}
              <div className="pt-2">
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)} 
                  className="w-full flex items-center justify-between bg-[#121212] border border-gray-700 hover:border-gray-500 text-gray-400 px-4 py-2.5 rounded-xl transition-all font-medium text-sm"
                >
                  <span className="flex items-center gap-2"><Settings2 className="w-4 h-4"/> Advanced Invoice Details (Tally)</span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {showAdvanced && (
                  <div className="mt-3 p-4 bg-[#121212] border border-gray-700 rounded-xl grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2 text-primary font-bold border-b border-gray-700 pb-1 mb-1">Company Defaults</div>
                    <input placeholder="Shop State (e.g. Tripura)" className="bg-[#1a1a1a] border border-gray-700 rounded px-2 py-1.5 text-white focus:border-primary outline-none" value={billData.shop_state} onChange={e => setBillData({...billData, shop_state: e.target.value})} />
                    <input placeholder="Shop State Code (e.g. 16)" className="bg-[#1a1a1a] border border-gray-700 rounded px-2 py-1.5 text-white focus:border-primary outline-none" value={billData.shop_state_code} onChange={e => setBillData({...billData, shop_state_code: e.target.value})} />
                    
                    <div className="col-span-2 text-primary font-bold border-b border-gray-700 pb-1 mt-2 mb-1">Customer / Reference Details</div>
                    <input placeholder="Customer State" className="bg-[#1a1a1a] border border-gray-700 rounded px-2 py-1.5 text-white focus:border-primary outline-none" value={billData.customer_state} onChange={e => setBillData({...billData, customer_state: e.target.value})} />
                    <input placeholder="Customer State Code" className="bg-[#1a1a1a] border border-gray-700 rounded px-2 py-1.5 text-white focus:border-primary outline-none" value={billData.customer_state_code} onChange={e => setBillData({...billData, customer_state_code: e.target.value})} />
                    
                    <input placeholder="Mode of Payment" className="bg-[#1a1a1a] border border-gray-700 rounded px-2 py-1.5 text-white focus:border-primary outline-none" value={billData.payment_mode} onChange={e => setBillData({...billData, payment_mode: e.target.value})} />
                    <input placeholder="Destination" className="bg-[#1a1a1a] border border-gray-700 rounded px-2 py-1.5 text-white focus:border-primary outline-none" value={billData.destination} onChange={e => setBillData({...billData, destination: e.target.value})} />
                    <input placeholder="Dispatched Through" className="bg-[#1a1a1a] border border-gray-700 rounded px-2 py-1.5 text-white focus:border-primary outline-none" value={billData.dispatched_through} onChange={e => setBillData({...billData, dispatched_through: e.target.value})} />
                    <input placeholder="Delivery Note" className="bg-[#1a1a1a] border border-gray-700 rounded px-2 py-1.5 text-white focus:border-primary outline-none" value={billData.delivery_note} onChange={e => setBillData({...billData, delivery_note: e.target.value})} />
                    <input placeholder="Reference No." className="bg-[#1a1a1a] border border-gray-700 rounded px-2 py-1.5 text-white focus:border-primary outline-none" value={billData.reference_no} onChange={e => setBillData({...billData, reference_no: e.target.value})} />
                    <input placeholder="Buyer Order No." className="bg-[#1a1a1a] border border-gray-700 rounded px-2 py-1.5 text-white focus:border-primary outline-none" value={billData.buyer_order_no} onChange={e => setBillData({...billData, buyer_order_no: e.target.value})} />
                    
                    <div className="col-span-2 text-primary font-bold border-b border-gray-700 pb-1 mt-2 mb-1">Pricing Logic</div>
                    <label className="col-span-2 flex items-center gap-2 text-gray-300 cursor-pointer">
                      <input type="checkbox" className="accent-primary w-4 h-4" checked={billData.price_inclusive} onChange={e => setBillData({...billData, price_inclusive: e.target.checked})} />
                      Prices are inclusive of Tax (GST)
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Summary Card */}
          <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 flex-1 shadow-xl flex flex-col">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Payment Summary
            </h3>
            
            <div className="space-y-4 text-sm font-medium flex-1">
              <div className="flex justify-between items-center text-gray-300">
                <span>Subtotal ({items.reduce((s,i) => s + i.quantity, 0)} items)</span>
                <span className="text-white text-base">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="bg-[#121212] p-3 rounded-xl border border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-400 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5"/> Discount</label>
                  <div className="flex bg-[#1e1e1e] rounded-lg p-0.5 border border-gray-700">
                    <button className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${billData.discount_type === 'flat' ? 'bg-gray-700 text-white' : 'text-gray-400'}`} onClick={() => setBillData({...billData, discount_type: 'flat'})}>₹</button>
                    <button className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${billData.discount_type === 'percent' ? 'bg-gray-700 text-white' : 'text-gray-400'}`} onClick={() => setBillData({...billData, discount_type: 'percent'})}>%</button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <input type="number" placeholder="0.00" value={billData.discount_value} onChange={e => setBillData({...billData, discount_value: e.target.value})}
                         className="bg-transparent border-b border-gray-700 w-24 text-white focus:border-primary focus:outline-none" />
                  <span className="text-green-400 font-bold">- ₹{discountAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <label className="text-gray-400 flex items-center gap-1.5"><Percent className="w-3.5 h-3.5"/> GST Rate</label>
                <select value={billData.gst_rate} onChange={e => setBillData({...billData, gst_rate: Number(e.target.value)})}
                        className="bg-[#121212] border border-gray-700 rounded-lg px-3 py-1.5 text-white focus:border-primary focus:outline-none text-right appearance-none font-bold">
                  <option value="0">0%</option><option value="5">5%</option><option value="12">12%</option>
                  <option value="18">18%</option><option value="28">28%</option>
                </select>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-xs">GST Amount</span>
                <span className="text-white">+ ₹{gstAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="block text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Grand Total</span>
                  <span className="text-xs text-primary font-bold">INCLUSIVE OF ALL TAXES</span>
                </div>
                <span className="text-4xl font-black text-white">₹{grandTotal.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={saveBill} disabled={loading || items.length === 0} 
                className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary-dark hover:to-orange-600 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale transition-all transform hover:scale-[1.02] active:scale-95"
              >
                {loading ? 'PROCESSING...' : 'COMPLETE & PRINT BILL'}
              </button>
            </div>
          </div>
          
        </div>
      </div>

      <PrintInvoice 
        billData={billData} 
        items={items} 
        subtotal={subtotal} 
        discountAmount={discountAmount} 
        gstAmount={gstAmount} 
        grandTotal={grandTotal} 
        settings={settings}
        billNumber={currentBillNumber}
      />
    </>
  );
}
