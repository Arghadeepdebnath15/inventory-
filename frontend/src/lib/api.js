import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  async fetchWithAuth(endpoint, options = {}) {
    // 1. Get the current user's session token from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      throw new Error('Not authenticated');
    }
    
    const token = session.access_token;
    
    // 2. Setup standard headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };
    
    // 3. Make the request to our custom Render backend
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    // 4. Handle response
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error?.message || json.error || 'API Error');
    }
    return { data: json };
  },

  get(endpoint) {
    return this.fetchWithAuth(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.fetchWithAuth(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },

  put(endpoint, body) {
    return this.fetchWithAuth(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  },

  delete(endpoint) {
    return this.fetchWithAuth(endpoint, { method: 'DELETE' });
  }
};
