require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize a generic Supabase client (used as a factory for authenticated clients)
const supabaseUrl = process.env.SUPABASE_URL || 'https://voeijpbfqyxonvvrokfk.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_kzYxa6kdn1QkS3yjS42G6Q_XeaZ6mVx';

// Middleware to create an authenticated Supabase client for each request
const withAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  // Create a fresh client instance with the user's JWT
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authHeader } }
  });
  
  req.supabase = supabase;
  
  // Extract user_id from the token payload (simplistic, just for our manual inserts)
  try {
    const token = authHeader.replace('Bearer ', '');
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    req.user_id = payload.sub;
  } catch (e) {
    req.user_id = null;
  }

  next();
};

// --- PRODUCTS API ---
app.get('/api/products', withAuth, async (req, res) => {
  const { data, error } = await req.supabase.from('products').select('*');
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post('/api/products', withAuth, async (req, res) => {
  const { data, error } = await req.supabase.from('products').insert([req.body]).select();
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.put('/api/products/:id', withAuth, async (req, res) => {
  const { data, error } = await req.supabase.from('products').update(req.body).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.delete('/api/products/:id', withAuth, async (req, res) => {
  const { data, error } = await req.supabase.from('products').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error });
  res.json({ success: true });
});

// --- BILLS API ---
app.get('/api/bills', withAuth, async (req, res) => {
  const { data, error } = await req.supabase
    .from('bills')
    .select(`*, bill_items(*)`)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post('/api/bills', withAuth, async (req, res) => {
  const { billData, items } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ error: 'No items' });
  
  const bill_id = uuidv4();
  const userId = req.user_id;
  
  try {
    // 1. Insert Bill
    const { error: billError } = await req.supabase.from('bills').insert([{
      id: bill_id,
      user_id: userId,
      ...billData
    }]);
    if (billError) throw billError;

    // 2. Insert Items and Update Stock
    for (const item of items) {
      await req.supabase.from('bill_items').insert([{
        bill_id,
        user_id: userId,
        product_id: item.product_id,
        product_name: item.product_name,
        hsn_code: item.hsn_code,
        quantity: item.quantity,
        unit_price: item.unit_price,
        gst_rate: billData.gst_rate,
        line_total: item.quantity * item.unit_price
      }]);

      // Deduct stock
      const { data: prod } = await req.supabase.from('products').select('stock_qty').eq('id', item.product_id).single();
      const newStock = (prod?.stock_qty || 0) - item.quantity;
      await req.supabase.from('products').update({ stock_qty: newStock }).eq('id', item.product_id);
      
      // Add log
      await req.supabase.from('stock_log').insert([{
        user_id: userId,
        product_id: item.product_id,
        change_qty: -item.quantity,
        reason: 'sale',
        note: `Bill: ${billData.bill_number}`
      }]);
    }
    
    res.json({ success: true, bill_id });
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});

// --- SETTINGS API ---
app.get('/api/settings', withAuth, async (req, res) => {
  const { data, error } = await req.supabase.from('settings').select('*').single();
  if (error) return res.status(500).json({ error });
  res.json(data || {});
});

// --- DASHBOARD API ---
app.get('/api/dashboard', withAuth, async (req, res) => {
  try {
    // We run parallel queries just like the frontend did
    const [billsRes, productsRes] = await Promise.all([
      req.supabase.from('bills').select('*'),
      req.supabase.from('products').select('*')
    ]);
    
    res.json({
      bills: billsRes.data || [],
      products: productsRes.data || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- STOCK LOGS API ---
app.get('/api/stock-logs', withAuth, async (req, res) => {
  const { data, error } = await req.supabase
    .from('stock_log')
    .select(`*, products(name)`)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post('/api/stock-logs', withAuth, async (req, res) => {
  const { error } = await req.supabase.from('stock_log').insert([{
    user_id: req.user_id,
    ...req.body
  }]);
  if (error) return res.status(500).json({ error });
  res.json({ success: true });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Custom Render Backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
