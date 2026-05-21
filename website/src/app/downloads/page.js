'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Smartphone, Monitor, Cpu, FileDown, 
  CheckCircle, ExternalLink, Shield, Layers
} from 'lucide-react';

const releases = [
  {
    version: '0.1.0-alpha',
    date: 'May 2026',
    type: 'Alpha',
    platforms: [
      { 
        name: 'Android', 
        icon: Smartphone,
        size: '~45MB',
        url: '#',
        status: 'Available',
      },
      { 
        name: 'Desktop', 
        icon: Monitor,
        size: '~120MB',
        url: '#',
        status: 'Coming Soon',
      },
      { 
        name: 'Linux', 
        icon: Cpu,
        size: '~95MB',
        url: '#',
        status: 'Coming Soon',
      },
    ],
  },
];

const sdkPackages = [
  { name: '@cryos/sdk', version: '0.1.0', size: '~250KB' },
  { name: '@cryos/mobile', version: '0.1.0', size: '~500KB' },
  { name: '@cryos/network', version: '0.1.0', size: '~1.2MB' },
  { name: '@cryos/mind', version: '0.1.0', size: '~150KB' },
];

export default function DownloadsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState('android');

  return (
    <div className="min-h-screen pt-20">
      <div className="container py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Download</span> CryOS
          </h1>
          <p className="text-[--glacial]/60 max-w-md mx-auto">
            Get the latest releases for your device
          </p>
        </div>

        {/* Platform selector */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setSelectedPlatform('android')}
            className={`btn ${selectedPlatform === 'android' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Smartphone size={18} className="mr-2" />
            Android
          </button>
          <button
            onClick={() => setSelectedPlatform('desktop')}
            className={`btn ${selectedPlatform === 'desktop' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Monitor size={18} className="mr-2" />
            Desktop
          </button>
          <button
            onClick={() => setSelectedPlatform('linux')}
            className={`btn ${selectedPlatform === 'linux' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Cpu size={18} className="mr-2" />
            Linux
          </button>
        </div>

        {/* Releases */}
        {releases.map((release) => (
          <div key={release.version} className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Version {release.version}</h2>
                <p className="text-[--glacial]/50">{release.date}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[--ice-blue]/20 text-[--ice-blue] text-sm">
                {release.type}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {release.platforms.map((platform) => (
                <div key={platform.name} className="card">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[--surface-light] flex items-center justify-center">
                      <platform.icon size={24} className="text-[--ice-blue]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{platform.name}</h3>
                      <p className="text-sm text-[--glacial]/50">{platform.size}</p>
                    </div>
                  </div>

                  <button className="btn btn-primary w-full">
                    <FileDown size={18} className="mr-2" />
                    {platform.status === 'Available' ? 'Download' : platform.status}
                  </button>

                  {platform.status === 'Available' && (
                    <div className="mt-4 pt-4 border-t border-[--surface-light]/30">
                      <div className="flex items-center gap-2 text-sm text-[--glacial]/50">
                        <Shield size={14} className="text-[--cryo-glow]" />
                        <span>SHA-256 verified</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* SDK Packages */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">SDK Packages</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sdkPackages.map((pkg) => (
              <div key={pkg.name} className="card">
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={16} className="text-[--ice-blue]" />
                  <span className="font-mono text-sm">{pkg.name}</span>
                </div>
                <p className="text-sm text-[--glacial]/50 mb-3">v{pkg.version} • {pkg.size}</p>
                <button className="btn btn-secondary w-full text-sm">
                  View Docs
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Installation */}
        <div className="card max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4">Command Line Installation</h3>
          <pre className="bg-[--deep-frost] p-4 rounded-lg overflow-x-auto">
            <code className="text-sm font-mono">
              <span className="text-[--ice-blue]"># npm</span>
              <br />
              npm install -g cryos-cli
              <br /><br />
              <span className="text-[--ice-blue]"># or yarn</span>
              <br />
              yarn global add cryos-cli
              <br /><br />
              <span className="text-[--ice-blue]"># Initialize</span>
              <br />
              cryos init my-app
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}