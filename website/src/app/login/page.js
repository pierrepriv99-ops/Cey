'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wallet, Github, Mail, KeyRound, ArrowLeft } from 'lucide-react';

const loginMethods = [
  { 
    id: 'wallet', 
    name: 'Wallet Connect', 
    icon: Wallet,
    description: 'Connect with MetaMask, Rainbow, Coinbase',
  },
  { 
    id: 'github', 
    name: 'GitHub', 
    icon: Github,
    description: 'Sign in with GitHub OAuth',
  },
  { 
    id: 'email', 
    name: 'Email', 
    icon: Mail,
    description: 'Magic link or password',
  },
];

export default function LoginPage() {
  const [method, setMethod] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/dashboard';
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container">
        <div className="max-w-md mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[--glacial]/50 hover:text-[--ice-blue] mb-8"
          >
            <ArrowLeft size={18} />
            Back to home
          </Link>

          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-[--glacial]/60 mb-8">Sign in to your CryOS account</p>

          {!method ? (
            <div className="space-y-4">
              {loginMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className="w-full card flex items-center gap-4 hover:border-[--ice-blue]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[--surface-light] flex items-center justify-center">
                    <m.icon size={24} className="text-[--ice-blue]" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-sm text-[--glacial]/50">{m.description}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <button
                type="button"
                onClick={() => setMethod(null)}
                className="text-sm text-[--glacial]/50 hover:text-[--ice-blue] mb-4"
              >
                ← Change login method
              </button>

              {method === 'wallet' && (
                <div className="card text-center py-8">
                  <Wallet size={48} className="mx-auto mb-4 text-[--ice-blue]" />
                  <p className="mb-4">Opening wallet connect...</p>
                  <button type="button" className="btn btn-secondary">
                    Click to connect wallet
                  </button>
                </div>
              )}

              {method === 'email' && (
                <>
                  <div>
                    <label className="block text-sm mb-2">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary w-full"
                  >
                    {loading ? 'Sending...' : 'Send Magic Link'}
                  </button>
                </>
              )}

              {method === 'github' && (
                <button type="button" className="btn btn-secondary w-full">
                  <Github size={18} className="mr-2" />
                  Continue with GitHub
                </button>
              )}
            </form>
          )}

          <p className="text-center text-sm text-[--glacial]/40 mt-8">
            By signing in, you agree to our{' '}
            <Link href="#" className="text-[--ice-blue]">Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" className="text-[--ice-blue]">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}