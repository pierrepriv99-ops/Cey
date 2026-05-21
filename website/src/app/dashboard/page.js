'use client';

import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Activity, Settings, Copy,ExternalLink } from 'lucide-react';

const mockTransactions = [
  { type: 'receive', asset: 'CRX', amount: '100.00', from: '0x1234...abcd', time: '2h ago' },
  { type: 'send', asset: 'ETH', amount: '0.5', to: '0x5678...efgh', time: '5h ago' },
  { type: 'swap', asset: 'USDC', amount: '250.00', to: 'CRX', time: '1d ago' },
];

const mockAssets = [
  { symbol: 'CRX', name: 'CryOS Token', balance: '1250.00', value: '$1,250.00' },
  { symbol: 'ETH', name: 'Ethereum', balance: '0.85', value: '$2,550.00' },
  { symbol: 'USDC', name: 'USD Coin', balance: '500.00', value: '$500.00' },
];

export default function DashboardPage() {
  const [address, setAddress] = useState('0x742d35Cc6634C0532925a3b844Bc9e7595f...');
  const [totalValue, setTotalValue] = useState('$4,300.00');

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-[--glacial]/50">Welcome back!</p>
          </div>
          <button className="btn btn-ghost">
            <Settings size={18} />
          </button>
        </div>

        {/* Wallet Card */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet size={20} className="text-[--ice-blue]" />
              <span className="font-semibold">Main Wallet</span>
            </div>
            <span className="text-sm text-[--glacial]/50">Ethereum</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-[--glacial]/50 mb-1">Total Value</p>
              <p className="text-3xl font-bold gradient-text">{totalValue}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[--glacial]/50 mb-1">Address</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono">{address}</code>
                <button onClick={copyAddress} className="p-1 hover:text-[--ice-blue]">
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Assets */}
        <h2 className="text-lg font-semibold mb-4">Assets</h2>
        <div className="grid gap-4 mb-8">
          {mockAssets.map((asset) => (
            <div key={asset.symbol} className="card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[--surface-light] flex items-center justify-center font-bold">
                  {asset.symbol.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{asset.symbol}</div>
                  <div className="text-sm text-[--glacial]/50">{asset.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{asset.balance}</div>
                <div className="text-sm text-[--glacial]/50">{asset.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity */}
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-2">
          {mockTransactions.map((tx, i) => (
            <div key={i} className="card flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  tx.type === 'receive' ? 'bg-green-500/20 text-green-500' :
                  tx.type === 'send' ? 'bg-red-500/20 text-red-500' :
                  'bg-blue-500/20 text-blue-500'
                }`}>
                  {tx.type === 'receive' ? <ArrowDownRight size={16} /> :
                   tx.type === 'send' ? <ArrowUpRight size={16} /> :
                   <Activity size={16} />}
                </div>
                <div>
                  <div className="font-medium capitalize">{tx.type}</div>
                  <div className="text-sm text-[--glacial]/50">
                    {tx.type === 'receive' ? `From: ${tx.from}` : 
                     tx.type === 'send' ? `To: ${tx.to}` :
                     `To: ${tx.to}`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.asset}
                </div>
                <div className="text-sm text-[--glacial]/50">{tx.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}