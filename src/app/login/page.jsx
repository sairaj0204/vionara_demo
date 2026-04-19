'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'login', email, password }),
      });

      const data = await res.json();

      if (data.success) {
        const params = new URLSearchParams({
          purpose: 'login',
          identifier: data.identifier || email,
          channel: 'email',
          cooldown: String(data.resendAvailableIn || 30),
        });

        router.push(`/auth/verify?${params.toString()}`);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-semibold text-center mb-6">Sign In</h2>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded text-sm text-center">{error}</div>}

        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full border rounded-lg px-4 py-2 outline-none focus:border-yellow-600"
            placeholder="you@email.com"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Password</label>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full border rounded-lg px-4 py-2 outline-none focus:border-yellow-600"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-black text-white py-3 rounded-lg mt-4 hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Sending OTP...' : 'Continue to Verification'}
        </button>
      </form>
    </div>
  );
}
