/**
 * CryOS Futures - Feature Discovery and Roadmap Service
 * Tracks planned features and community voting
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Feature proposal interface
interface FeatureProposal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ' Proposed' | 'Under Review' | 'Planned' | 'In Progress' | 'Completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  votes: number;
  targetPhase: string;
  proposedAt: number;
  estimatedEffort?: string;
}

// Initial roadmap/features
const features: Map<string, FeatureProposal> = new Map();

const roadmapFeatures: FeatureProposal[] = [
  {
    id: 'multi-chain-wallet',
    title: 'Multi-Chain Wallet Support',
    description: 'Support for Ethereum, Bitcoin, Solana, and other chains beyond EVM',
    category: 'Finance',
    status: 'In Progress',
    priority: 'high',
    votes: 1250,
    targetPhase: 'Phase 1',
    proposedAt: Date.now() - 86400000 * 30,
    estimatedEffort: '6-8 weeks',
  },
  {
    id: 'hardware-ledger',
    title: 'Hardware Ledger Integration',
    description: 'Cold storage support via Ledger devices',
    category: 'Security',
    status: 'Planned',
    priority: 'high',
    votes: 890,
    targetPhase: 'Phase 1',
    proposedAt: Date.now() - 86400000 * 45,
    estimatedEffort: '4-6 weeks',
  },
  {
    id: 'p2p-mesh',
    title: 'P2P Mesh Networking',
    description: ' decentralized peer-to-peer communication layer',
    category: 'Network',
    status: 'Proposed',
    priority: 'critical',
    votes: 720,
    targetPhase: 'Phase 2',
    proposedAt: Date.now() - 86400000 * 15,
    estimatedEffort: '12-16 weeks',
  },
  {
    id: 'dao-governance',
    title: 'DAO Governance System',
    description: 'On-chain voting and proposal system for protocol decisions',
    category: 'Governance',
    status: 'Planned',
    priority: 'medium',
    votes: 650,
    targetPhase: 'Phase 3',
    proposedAt: Date.now() - 86400000 * 60,
    estimatedEffort: '8-10 weeks',
  },
  {
    id: 'desktop-app',
    title: 'Desktop Application',
    description: 'CryOS Station desktop experience with window manager',
    category: 'Desktop',
    status: 'Proposed',
    priority: 'medium',
    votes: 580,
    targetPhase: 'Phase 4',
    proposedAt: Date.now() - 86400000 * 20,
    estimatedEffort: '14-18 weeks',
  },
  {
    id: 'ai-shell',
    title: 'AI Shell (Cryo Mind)',
    description: 'On-device AI assistant with natural language commands',
    category: 'AI',
    status: 'Proposed',
    priority: 'medium',
    votes: 520,
    targetPhase: 'Phase 5',
    proposedAt: Date.now() - 86400000 * 10,
    estimatedEffort: '10-12 weeks',
  },
  {
    id: 'nfc-payments',
    title: 'NFC Payments',
    description: 'Contactless payment via NFC',
    category: 'Finance',
    status: 'Under Review',
    priority: 'low',
    votes: 380,
    targetPhase: 'Future',
    proposedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'esim-provisioning',
    title: 'eSIM Provisioning',
    description: 'Built-in carrier eSIM support',
    category: 'Mobile',
    status: 'Under Review',
    priority: 'low',
    votes: 290,
    targetPhase: 'Future',
    proposedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'extension-api',
    title: 'Third-Party Extensions',
    description: 'Plugin system for third-party extensions',
    category: 'Platform',
    status: 'Proposed',
    priority: 'medium',
    votes: 450,
    targetPhase: 'Phase 2',
    proposedAt: Date.now() - 86400000 * 25,
    estimatedEffort: '6-8 weeks',
  },
];

roadmapFeatures.forEach((feature) => features.set(feature.id, feature));

// Votes tracking (in production, would use blockchain or database)
const userVotes: Map<string, Set<string>> = new Map();

// Routes

// GET /features - List all feature proposals
app.get('/api/features', (req, res) => {
  const { status, category, sort = 'votes', limit = 20, offset = 0 } = req.query;
  
  let result = Array.from(features.values());
  
  if (status) {
    result = result.filter((f) => f.status === status);
  }
  
  if (category) {
    result = result.filter((f) => f.category === category);
  }
  
  // Sort
  if (sort === 'votes') {
    result.sort((a, b) => b.votes - a.votes);
  } else if (sort === 'date') {
    result.sort((a, b) => b.proposedAt - a.proposedAt);
  } else if (sort === 'priority') {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
  
  const total = result.length;
  result = result.slice(Number(offset), Number(offset) + Number(limit));
  
  res.json({
    features: result,
    total,
    limit: Number(limit),
    offset: Number(offset),
  });
});

// GET /features/:id - Get feature details
app.get('/api/features/:id', (req, res) => {
  const feature = features.get(req.params.id);
  if (!feature) {
    return res.status(404).json({ error: 'Feature not found' });
  }
  res.json(feature);
});

// POST /features - Propose new feature
app.post('/api/features', (req, res) => {
  const { title, description, category, targetPhase, estimatedEffort } = req.body;
  
  if (!title || !description || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  if (features.has(id)) {
    return res.status(409).json({ error: 'Feature already proposed' });
  }
  
  const newFeature: FeatureProposal = {
    id,
    title,
    description,
    category,
    status: 'Proposed',
    priority: 'medium',
    votes: 1, // Creator auto-votes
    targetPhase: targetPhase || 'Future',
    proposedAt: Date.now(),
    estimatedEffort,
  };
  
  features.set(id, newFeature);
  res.status(201).json(newFeature);
});

// POST /features/:id/vote - Vote for a feature
app.post('/api/features/:id/vote', (req, res) => {
  const { userId } = req.body;
  const feature = features.get(req.params.id);
  
  if (!feature) {
    return res.status(404).json({ error: 'Feature not found' });
  }
  
  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }
  
  // Check if already voted
  let userVoteSet = userVotes.get(userId);
  if (!userVoteSet) {
    userVoteSet = new Set();
    userVotes.set(userId, userVoteSet);
  }
  
  if (userVoteSet.has(req.params.id)) {
    // Remove vote (toggle off)
    userVoteSet.delete(req.params.id);
    feature.votes--;
    res.json({ voted: false, votes: feature.votes });
  } else {
    // Add vote
    userVoteSet.add(req.params.id);
    feature.votes++;
    res.json({ voted: true, votes: feature.votes });
  }
});

// GET /categories - Get available categories
app.get('/api/categories', (req, res) => {
  const categories = new Set(Array.from(features.values()).map((f) => f.category));
  res.json(Array.from(categories).sort());
});

// GET /timeline - Get development timeline
app.get('/api/timeline', (req, res) => {
  const phases = [
    { name: 'Phase 0', title: 'Foundation', quarter: 'Q3 2026', status: 'Completed' },
    { name: 'Phase 1', title: 'Mobile Alpha', quarter: 'Q4 2026', status: 'In Progress' },
    { name: 'Phase 2', title: 'Chain Layer', quarter: 'Q1 2027', status: 'Planned' },
    { name: 'Phase 3', title: 'Network Layer', quarter: 'Q2 2027', status: 'Planned' },
    { name: 'Phase 4', title: 'Desktop', quarter: 'Q3 2027', status: 'Planned' },
    { name: 'Phase 5', title: 'AI Layer', quarter: 'Q4 2027', status: 'Planned' },
    { name: 'Phase 6', title: 'Maturity', quarter: '2028+', status: 'Planned' },
  ];
  
  res.json(phases);
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`CryOS Futures API running on port ${PORT}`);
});

export default app;