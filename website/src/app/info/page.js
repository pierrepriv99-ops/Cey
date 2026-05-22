'use client';

import { Shield, Globe, Users, Zap, Award } from 'lucide-react';

const team = [
  {
    name: 'CryOS Foundation',
    role: 'Core Team',
    bio: 'Building financial sovereignty for everyone.',
  },
];

const values = [
  {
    icon: Shield,
    title: 'Security First',
    description: 'Zero-knowledge architecture keeps your assets yours.',
  },
  {
    icon: Globe,
    title: ' Decentralization',
    description: 'Own your identity, keys, and data.',
  },
  {
    icon: Users,
    title: 'Community Led',
    description: 'Governance by the people, for the people.',
  },
  {
    icon: Zap,
    title: 'Speed & Privacy',
    description: 'Fast transactions with complete privacy.',
  },
  {
    icon: Award,
    title: 'Open Source',
    description: 'Transparent, auditable, and free.',
  },
];

export default function InfoPage() {
  return (
    <div className="min-h-screen pt-20">
      <div className="container">
        {/* Hero */}
        <section className="py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">About CryOS</h1>
          <p className="text-xl text-[--glacial]/60 max-w-2xl mx-auto">
            Building the future of financial sovereignty
          </p>
        </section>

        {/* Mission */}
        <section className="py-12 card max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-[--glacial]/80 leading-relaxed">
            CryOS is a Web3-native operating system that puts financial sovereignty directly in your pocket. 
            We believe your keys, your identity, and your assets should never leave your control. Built on open 
            protocols with zero-knowledge cryptography, CryOS delivers the security of cold storage with the UX of hot wallets.
          </p>
        </section>

        {/* Values */}
        <section className="py-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card text-center p-6">
                <Icon size={32} className="mx-auto mb-4 text-[--ice-blue]" />
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-[--glacial]/60">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="py-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Team</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {team.map(({ name, role, bio }) => (
              <div key={name} className="card p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[--ice-blue]/20 flex items-center justify-center mx-auto mb-4">
                  <Users size={24} className="text-[--ice-blue]" />
                </div>
                <h3 className="font-semibold">{name}</h3>
                <p className="text-sm text-[--ice-blue] mb-2">{role}</p>
                <p className="text-sm text-[--glacial]/60">{bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Press */}
        <section className="py-12 card max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Press & Media</h2>
          <p className="text-[--glacial]/80 mb-4">
            For press inquiries, please contact us through the contact form.
          </p>
          <a href="/contact" className="btn btn-primary">
            Contact Us
          </a>
        </section>
      </div>
    </div>
  );
}