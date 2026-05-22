'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, Shield, Zap, Globe, Users, 
  ChevronRight, Download, Wallet, MessageSquare,
  ArrowRight, Github, Twitter, Menu, X, ChevronDown
} from 'lucide-react';

// Navigation
const navLinks = [
  { name: 'Download', href: '/downloads' },
  { name: 'Developers', href: '/docs' },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/info' },
  { name: 'Contact', href: '/contact' },
];

// Features with status
const features = [
  {
    icon: Shield,
    title: 'Secure by Design',
    description: 'Zero-knowledge security architecture with hardware-backed key management',
    status: 'ready',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed with native blockchain integration',
    status: 'ready',
  },
  {
    icon: Globe,
    title: 'Cross-Chain',
    description: 'Seamlessly connect to Ethereum, Polygon, BSC, and more',
    status: 'ready',
  },
  {
    icon: Users,
    title: 'Community Owned',
    description: 'DAO-governed with transparent tokenomics',
    status: 'ready',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Full-featured mobile app with biometric security',
    status: 'dev',
  },
  {
    icon: Wallet,
    title: 'Multi-Vault',
    description: 'Organize assets across multiple vaults and accounts',
    status: 'planned',
  },
];

// Roadmap phases
const roadmapPhases = [
  {
    phase: 'Phase 1',
    title: 'Foundation',
    period: 'Q1-Q2 2026',
    items: ['Token Launch', 'Mobile Alpha', 'Core Wallet'],
    status: 'current',
  },
  {
    phase: 'Phase 2',
    title: 'Chain',
    period: 'Q3-Q4 2026',
    items: ['Native Chain', 'Validator Set', 'DeFi Integration'],
    status: 'upcoming',
  },
  {
    phase: 'Phase 3',
    title: 'Network',
    period: 'Q1-Q2 2027',
    items: ['P2P Sync', 'Mesh Networking', 'Offline Mode'],
    status: 'planned',
  },
  {
    phase: 'Phase 4',
    title: 'Desktop',
    period: 'Q3-Q4 2027',
    items: ['ISO Download', 'Window Manager', 'Android Apps'],
    status: 'planned',
  },
];

// FAQ data
const faqItems = [
  {
    question: 'What is CryOS?',
    answer: 'CryOS is the first Web3-native operating system built from the ground up for decentralized finance. It provides a secure, fast, and unified interface for managing all your crypto assets across multiple chains.',
  },
  {
    question: 'How is my security ensured?',
    answer: 'We use zero-knowledge security architecture with hardware-backed key management. Your private keys never leave your device, and all transactions require biometric or PIN verification.',
  },
  {
    question: 'Which blockchains are supported?',
    answer: 'Currently we support Ethereum, Polygon, Binance Smart Chain, and more. Phase 2 will introduce our native chain for even better integration.',
  },
  {
    question: 'Is there a token?',
    answer: 'Yes, CRX is our native governance token with a max supply of 21 million. It powers the DAO and provides fee discounts for protocol usage.',
  },
];

// Stats
const stats = [
  { value: '21M', label: 'Max Supply' },
  { value: '6', label: 'Chains' },
  { value: '0', label: 'Fees*' },
  { value: '∞', label: 'Potential' },
];

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Scroll listener for sticky navigation
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${isScrolled ? 'glass py-3' : 'py-5'}`}>
        <div className="container">
          <nav className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[--ice-blue] to-[--cryo-glow]" />
              <span className="text-xl font-bold gradient-text">CryOS</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href}
                  className="text-sm text-[--glacial]/80 hover:text-[--ice-blue] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="btn btn-ghost text-sm">
                Connect Wallet
              </Link>
              <Link href="/downloads" className="btn btn-primary text-sm">
                <Download size={16} className="mr-2" />
                Download
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-[--glacial]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </nav>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[--surface-light]/30 bg-[--deep-frost]"
            >
              <div className="container py-4 space-y-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name}
                    href={link.href}
                    className="block text-lg text-[--glacial]/80 hover:text-[--ice-blue] py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-4 space-y-3 border-t border-[--surface-light]/30">
                  <Link href="/login" className="btn btn-ghost w-full justify-center">
                    Connect Wallet
                  </Link>
                  <Link href="/downloads" className="btn btn-primary w-full justify-center">
                    <Download size={16} className="mr-2" />
                    Download
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,212,255,0.05)] to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[rgba(0,212,255,0.03)] blur-3xl" />

        <div className="container relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[--surface] border border-[--ice-blue]/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-[--cryo-glow] animate-pulse" />
              <span className="text-sm text-[--glacial]/80">Now in Alpha</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Financial<br />
              <span className="gradient-text">Sovereignty</span>
              <br />in Your Pocket
            </h1>

            <p className="text-xl text-[--glacial]/70 mb-10 max-w-xl mx-auto">
              The first Web3-native operating system. Built from the ground up 
              for decentralized finance. Your keys, your crypto, your rules.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/downloads" className="btn btn-primary text-lg px-8 py-4">
                Get Started
                <ArrowRight size={20} className="ml-2" />
              </Link>
              <Link href="/docs" className="btn btn-secondary text-lg px-8 py-4">
                Read Documentation
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-b border-[--surface-light]/50">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-[--glacial]/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built Different
            </h2>
            <p className="text-[--glacial]/60 max-w-md mx-auto">
              Every layer designed for the decentralized future
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[--ice-blue]/20 to-[--cryo-glow]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon size={24} className="text-[--ice-blue]" />
                  </div>
                  <span className={`badge badge-${feature.status}`}>
                    {feature.status === 'ready' ? 'Ready' : feature.status === 'dev' ? 'In Dev' : 'Planned'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-[--glacial]/60">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="py-20 bg-[--surface]/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Your Entire Crypto Life,<br />
                <span className="gradient-text">One Interface</span>
              </h2>
              <p className="text-[--glacial]/60 mb-8">
                Manage wallets, swap tokens, explore dapps, and track your portfolio - 
                all from one beautiful interface. No fragmentation, no friction.
              </p>
              
              <div className="space-y-4">
                {[
                  'Multi-chain wallet',
                  'Built-in DEX',
                  'NFT gallery',
                  'DeFi dashboard',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[--cryo-glow]/20 flex items-center justify-center">
                      <ChevronRight size={12} className="text-[--cryo-glow]" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Phone mockup placeholder */}
              <div className="w-[280px] h-[580px] mx-auto rounded-[3rem] border-4 border-[--surface-light] bg-[--deep-frost] overflow-hidden shadow-2xl">
                <div className="h-full p-4 flex flex-col">
                  {/* Mock content */}
                  <div className="text-xs text-[--glacial]/40 text-center mt-8">
                    CryOS Mobile
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="py-20 bg-[--surface]/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Roadmap
            </h2>
            <p className="text-[--glacial]/60 max-w-md mx-auto">
              Our journey to financial sovereignty
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmapPhases.map((phase, i) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`card ${phase.status === 'current' ? 'border-[--ice-blue]/50 animate-glow-pulse' : ''}`}
              >
                <div className="text-sm text-[--ice-blue] mb-2">{phase.phase}</div>
                <h3 className="text-xl font-bold mb-1">{phase.title}</h3>
                <div className="text-sm text-[--glacial]/50 mb-4">{phase.period}</div>
                <ul className="space-y-2">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[--glacial]/70">
                      <ChevronRight size={14} className="text-[--cryo-glow]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-[--glacial]/60 max-w-md mx-auto">
              Common questions about CryOS
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {faqItems.map((faq, i) => (
              <div key={faq.question} className="card">
                <button
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold pr-4">{faq.question}</span>
                  <ChevronDown 
                    size={20} 
                    className={`text-[--glacial]/50 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} 
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 text-[--glacial]/60 text-sm"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-xl mx-auto text-center card">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-[--glacial]/60 mb-6">
              Get the latest on releases, features, and community updates
            </p>
            <form className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input flex-1"
              />
              <button type="submit" className="btn btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[--surface-light]/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[--ice-blue] to-[--cryo-glow]" />
                <span className="text-xl font-bold">CryOS</span>
              </Link>
              <p className="text-sm text-[--glacial]/50">
                Financial sovereignty in your pocket
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm text-[--glacial]/60">
                <Link href="/downloads" className="block hover:text-[--ice-blue]">Download</Link>
                <Link href="/docs" className="block hover:text-[--ice-blue]">Documentation</Link>
                <Link href="/blog" className="block hover:text-[--ice-blue]">Blog</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <div className="space-y-2 text-sm text-[--glacial]/60">
                <a href="#" className="flex items-center gap-2 hover:text-[--ice-blue]">
                  <Github size={16} /> GitHub
                </a>
                <a href="#" className="flex items-center gap-2 hover:text-[--ice-blue]">
                  <Twitter size={16} /> Twitter
                </a>
                <a href="#" className="flex items-center gap-2 hover:text-[--ice-blue]">
                  <span>Discord</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm text-[--glacial]/60">
                <Link href="#" className="block hover:text-[--ice-blue]">Privacy Policy</Link>
                <Link href="#" className="block hover:text-[--ice-blue]">Terms of Service</Link>
                <Link href="/contact" className="block hover:text-[--ice-blue]">Contact</Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[--surface-light]/30 text-center text-sm text-[--glacial]/40">
            © 2026 CryOS Foundation. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}