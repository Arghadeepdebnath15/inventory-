import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Receipt } from 'lucide-react';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Extra Info for Registration
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        // Register the user
        const { data, error } = await signUp(email, password);
        if (error) throw error;
        
        // Ensure the user was actually created
        if (data?.user) {
          // Add the extra info into the settings table for this user
          await supabase.from('settings').insert([{
            user_id: data.user.id,
            shop_name: shopName,
            owner_name: ownerName,
            phone: phone,
            email: email
          }]);
          
          // If Supabase auto-logs in, the AuthContext will update and redirect automatically.
          // Otherwise, we show a message if email confirmation is required.
          if (!data.session) {
            alert('Registration successful! Please check your email to confirm your account.');
            setIsLogin(true);
          }
        }
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-bg-card p-8 rounded-xl border border-gray-800 w-full max-w-md shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <Receipt className="h-12 w-12 text-primary mb-4" />
          <h1 className="text-2xl font-bold text-white">TyreShop Manager</h1>
          <p className="text-text-muted mt-2 text-sm text-center">
            {isLogin ? 'Sign in to access your shop data.' : 'Create an account to set up your shop.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Shop Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Owner Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-colors mt-6"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-primary hover:text-white underline transition-colors"
          >
            {isLogin ? 'Register here' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
