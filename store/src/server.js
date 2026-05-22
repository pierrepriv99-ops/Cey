/**
 * CryOS App Store Server
 * Manages app listings, versions, and download analytics
 */

import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { compare, satisfies } from 'semver';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store (would use SQLite in production)
interface AppListing {
  id: string;
  name: string;
  description: string;
  developer: string;
  category: string;
  icon: string;
  screenshots: string[];
  currentVersion: string;
  versions: AppVersion[];
  downloads: number;
  rating: number;
  createdAt: number;
  updatedAt: number;
}

interface AppVersion {
  version: string;
  minOsVersion: string;
  releaseNotes: string;
  downloadUrl: string;
  checksum: string;
  size: number;
  releasedAt: number;
}

// Analytics
interface DownloadStats {
  appId: string;
  version: string;
  totalDownloads: number;
  dailyDownloads: Record<string, number>;
  countries: Record<string, number>;
  osVersions: Record<string, number>;
}

const apps: Map<string, AppListing> = new Map();
const stats: Map<string, DownloadStats> = new Map();

// Initialize with sample apps
const sampleApps: AppListing[] = [
  {
    id: 'cryos-launcher',
    name: 'CryOS Launcher',
    description: 'Official CryOS home screen and app launcher',
    developer: 'CryOS Team',
    category: 'utility',
    icon: '/icons/launcher.png',
    screenshots: [],
    currentVersion: '1.0.0',
    versions: [
      {
        version: '1.0.0',
        minOsVersion: '0.1.0',
        releaseNotes: 'Initial release',
        downloadUrl: '/downloads/cryos-launcher-v1.0.0.apk',
        checksum: 'sha256:abc123',
        size: 45000000,
        releasedAt: Date.now() - 86400000 * 30,
      },
    ],
    downloads: 15000,
    rating: 4.8,
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'cryos-vault',
    name: 'CryoVault',
    description: 'Secure enclave storage for private keys and sensitive data',
    developer: 'CryOS Team',
    category: 'security',
    icon: '/icons/vault.png',
    screenshots: [],
    currentVersion: '1.2.0',
    versions: [
      {
        version: '1.2.0',
        minOsVersion: '0.1.0',
        releaseNotes: 'Added biometric unlock support',
        downloadUrl: '/downloads/cryos-vault-v1.2.0.apk',
        checksum: 'sha256:def456',
        size: 12000000,
        releasedAt: Date.now() - 86400000 * 10,
      },
    ],
    downloads: 8500,
    rating: 4.9,
    createdAt: Date.now() - 86400000 * 90,
    updatedAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'cryos-wallet',
    name: 'CryoWallet',
    description: 'Multi-chain crypto wallet with hardware ledger support',
    developer: 'CryOS Team',
    category: 'finance',
    icon: '/icons/wallet.png',
    screenshots: [],
    currentVersion: '2.0.0',
    versions: [
      {
        version: '2.0.0',
        minOsVersion: '0.2.0',
        releaseNotes: 'Added Bitcoin and Solana support',
        downloadUrl: '/downloads/cryos-wallet-v2.0.0.apk',
        checksum: 'sha256:ghi789',
        size: 28000000,
        releasedAt: Date.now() - 86400000 * 3,
      },
    ],
    downloads: 25000,
    rating: 4.7,
    createdAt: Date.now() - 86400000 * 120,
    updatedAt: Date.now() - 86400000 * 3,
  },
];

sample-apps.forEach((app) => apps.set(app.id, app));

// Routes

// GET /apps - List all apps
app.get('/api/apps', (req, res) => {
  const { category, search, limit = 20, offset = 0 } = req.query;
  
  let result = Array.from(apps.values());
  
  if (category) {
    result = result.filter((app) => app.category === category);
  }
  
  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q)
    );
  }
  
  const total = result.length;
  result = result.slice(Number(offset), Number(offset) + Number(limit));
  
  res.json({
    apps: result,
    total,
    limit: Number(limit),
    offset: Number(offset),
  });
});

// GET /apps/:id - Get app details
app.get('/api/apps/:id', (req, res) => {
  const app = apps.get(req.params.id);
  if (!app) {
    return res.status(404).json({ error: 'App not found' });
  }
  res.json(app);
});

// POST /apps - Register new app
app.post('/api/apps', (req, res) => {
  const { name, description, developer, category, icon } = req.body;
  
  if (!name || !developer || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const id = name.toLowerCase().replace(/\s+/g, '-');
  
  if (apps.has(id)) {
    return res.status(409).json({ error: 'App already exists' });
  }
  
  const newApp: AppListing = {
    id,
    name,
    description,
    developer,
    category,
    icon: icon || '',
    screenshots: [],
    currentVersion: '0.1.0',
    versions: [],
    downloads: 0,
    rating: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  apps.set(id, newApp);
  res.status(201).json(newApp);
});

// GET /apps/:id/versions - Get app versions
app.get('/api/apps/:id/versions', (req, res) => {
  const app = apps.get(req.params.id);
  if (!app) {
    return res.status(404).json({ error: 'App not found' });
  }
  res.json(app.versions);
});

// GET /apps/:id/versions/:version - Get specific version
app.get('/api/apps/:id/versions/:version', (req, res) => {
  const app = apps.get(req.params.id);
  if (!app) {
    return res.status(404).json({ error: 'App not found' });
  }
  
  const version = app.versions.find((v) => v.version === req.params.version);
  if (!version) {
    return res.status(404).json({ error: 'Version not found' });
  }
  
  res.json(version);
});

// POST /apps/:id/versions - Publish new version
app.post('/api/apps/:id/versions', (req, res) => {
  const app = apps.get(req.params.id);
  if (!app) {
    return res.status(404).json({ error: 'App not found' });
  }
  
  const { version, releaseNotes, downloadUrl, checksum, size, minOsVersion } = req.body;
  
  if (!version || !downloadUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Check version is newer
  if (app.versions.some((v) => compare(v.version, version) >= 0)) {
    return res.status(400).json({ error: 'Version must be greater than existing' });
  }
  
  const newVersion: AppVersion = {
    version,
    minOsVersion: minOsVersion || '0.1.0',
    releaseNotes: releaseNotes || '',
    downloadUrl,
    checksum: checksum || '',
    size: size || 0,
    releasedAt: Date.now(),
  };
  
  app.versions.push(newVersion);
  app.currentVersion = version;
  app.updatedAt = Date.now();
  
  res.status(201).json(newVersion);
});

// POST /apps/:id/download - Record download
app.post('/api/apps/:id/download', (req, res) => {
  const app = apps.get(req.params.id);
  if (!app) {
    return res.status(404).json({ error: 'App not found' });
  }
  
  const { version, osVersion, country } = req.body;
  app.downloads++;
  
  // Update stats
  const today = new Date().toISOString().split('T')[0];
  let appStats = stats.get(app.id);
  if (!appStats) {
    appStats = {
      appId: app.id,
      version: version || app.currentVersion,
      totalDownloads: 0,
      dailyDownloads: {},
      countries: {},
      osVersions: {},
    };
    stats.set(app.id, appStats);
  }
  
  appStats.totalDownloads++;
  appStats.dailyDownloads[today] = (appStats.dailyDownloads[today] || 0) + 1;
  if (country) {
    appStats.countries[country] = (appStats.countries[country] || 0) + 1;
  }
  if (osVersion) {
    appStats.osVersions[osVersion] = (appStats.osVersions[osVersion] || 0) + 1;
  }
  
  res.json({ success: true, downloads: app.downloads });
});

// GET /stats - Get analytics (admin)
app.get('/api/stats', (req, res) => {
  res.json({
    totalApps: apps.size,
    totalDownloads: Array.from(apps.values()).reduce((sum, app) => sum + app.downloads, 0),
    apps: Array.from(stats.values()),
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`CryOS App Store running on port ${PORT}`);
});

export default app;