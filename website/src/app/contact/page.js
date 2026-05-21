'use client';

import { useState } from 'react';
import { Mail, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

const contactReasons = [
  'General Inquiry',
  'Technical Support',
  'Partnership',
  'Security Issue',
  'Press/Media',
  'Other',
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    reason: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container">
          <div className="max-w-md mx-auto card text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[--cryo-glow]/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-[--cryo-glow]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
            <p className="text-[--glacial]/60 mb-6">
              We'll get back to you as soon as possible
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="btn btn-secondary"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-center">Contact Us</h1>
          <p className="text-[--glacial]/60 text-center mb-8">
            Questions? We'd love to hear from you
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Reason</label>
              <select
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="input"
                required
              >
                <option value="">Select a reason</option>
                {contactReasons.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input min-h-[150px]"
                placeholder="Tell us how we can help..."
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              <Mail size={18} className="mr-2" />
              Send Message
            </button>
          </form>

          <div className="mt-12 pt-12 border-t border-[--surface-light]/30">
            <h3 className="font-semibold mb-4">Other Ways to Reach Us</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <a href="#" className="card flex items-center gap-3 hover:border-[--ice-blue]">
                <MessageSquare size={20} className="text-[--ice-blue]" />
                <span className="text-sm">Discord Community</span>
              </a>
              <a href="mailto:support@cryos.io" className="card flex items-center gap-3 hover:border-[--ice-blue]">
                <Mail size={20} className="text-[--ice-blue]" />
                <span className="text-sm">support@cryos.io</span>
              </a>
              <a href="#" className="card flex items-center gap-3 hover:border-[--ice-blue]">
                <AlertCircle size={20} className="text-[--ice-blue]" />
                <span className="text-sm">Security Report</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}