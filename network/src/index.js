/**
 * CryOS P2P Mesh Network
 * 
 * Features:
 * - Peer discovery (Kademlia DHT)
 * - Encrypted transport (Noise)
 * - PubSub for messaging
 * - NAT traversal
 * - Offline-first data sync
 */

import { createLibp2p } from 'libp2p';
import { noise } from 'libp2p-noise';
import { yamux } from 'libp2p-yamux';
import { gossipsub } from 'libp2p-gossipsub';
import { kadDHT } from 'libp2p-kad-dht';
import { identify } from '@libp2p/identify';
import { multiaddr } from 'multiaddr';

/**
 * CryMesh - P2P Mesh Network Node
 */
export class CryMesh {
  constructor(config = {}) {
    this.config = {
      bootstrapNodes: config.bootstrapNodes || [],
      announceAddr: config.announceAddr,
      listenPorts: config.listenPorts || [0],  // Random ports
      maxPeers: config.maxPeers || 50,
      ...config
    };
    
    this.node = null;
    this.peerId = null;
    this.connectedPeers = new Map();
    this.messageHandlers = new Map();
  }
  
  /**
   * Start the mesh network node
   */
  async start() {
    const bootstraps = this.config.bootstrapNodes.map(a => multiaddr(a));
    
    this.node = await createLibp2p({
      addresses: {
        listen: this.config.listenPorts.map(p => `/tcp/${p}`),
        announce: this.config.announceAddr 
          ? [this.config.announceAddr] 
          : []
      },
      transports: [],
      connectionEncryption: [() => noise()],
      streamMuxers: [yamux()],
      services: {
        // Kademlia DHT for peer discovery
        dht: kadDHT({
          refreshPeersInterval: 30000,
          networkPrefix: 'cryos',  // CryOS-specific network
        }),
        // PubSub for messaging
        pubsub: gossipsub({
          scoreThresholds: {
            graylistThreshold: -100,
            acceptPXThreshold: 100,
            opsegThreshold: 200
          }
        })
      },
      // Limits
      connectionManager: {
        maxConnections: this.config.maxPeers,
        minConnections: 5
      }
    });
    
    this.peerId = this.node.peerId.toString();
    
    // Event handlers
    this.node.addEventListener('peer:update', (evt) => {
      this.handlePeerUpdate(evt);
    });
    
    this.node.addEventListener('connection:open', (evt) => {
      this.handleConnectionOpen(evt);
    });
    
    this.node.addEventListener('connection:close', (evt) => {
      this.handleConnectionClose(evt);
    });
    
    // Subscribe to CryOS topics
    await this.joinTopics();
    
    console.log(`[CryMesh] Started: ${this.peerId.substring(0, 16)}...`);
    
    // Bootstrap to existing nodes
    if (bootstraps.length > 0) {
      await this.bootstrap(bootstraps);
    }
    
    return this;
  }
  
  /**
   * Stop the mesh network
   */
  async stop() {
    if (this.node) {
      await this.node.stop();
      console.log('[CryMesh] Stopped');
    }
  }
  
  /**
   * Connect to bootstrap nodes
   */
  async bootstrap(bootstraps) {
    console.log('[CryMesh] Bootstrapping...');
    
    for (const addr of bootstraps) {
      try {
        await this.node.dial(addr);
        console.log(`[CryMesh] Connected to bootstrap: ${addr}`);
      } catch (err) {
        console.warn(`[CryMesh] Bootstrap failed: ${addr}`);
      }
    }
  }
  
  /**
   * Join default topics
   */
  async joinTopics() {
    const topics = [
      'cryos/network',     // Heartbeat/presence
      'cryos/discovery',  // App discovery
      'cryos/messages',  // Direct messages
      'cryos/offline'    // Offline sync
    ];
    
    for (const topic of topics) {
      await this.node.services.pubsub.subscribe(topic);
      console.log(`[CryMesh] Joined: ${topic}`);
    }
  }
  
  /**
   * Handle peer connection events
   */
  handlePeerUpdate(evt) {
    const peerId = evt.detail.peerId.toString();
    console.log(`[CryMesh] Peer update: ${peerId.substring(0, 8)}...`);
  }
  
  handleConnectionOpen(evt) {
    const conn = evt.detail;
    const peerId = conn.remotePeer.toString();
    this.connectedPeers.set(peerId, conn);
    console.log(`[CryMesh] Connected: ${peerId.substring(0, 8)}... (Total: ${this.connectedPeers.size})`);
  }
  
  handleConnectionClose(evt) {
    const conn = evt.detail;
    const peerId = conn.remotePeer.toString();
    this.connectedPeers.delete(peerId);
    console.log(`[CryMesh] Disconnected: ${peerId.substring(0, 8)}...`);
  }
  
  /**
   * Get peers by topic
   */
  async getTopicPeers(topic) {
    const peers = await this.node.services.pubsub.getTopicSubscribers(topic);
    return peers;
  }
  
  /**
   * Publish message to topic
   */
  async publish(topic, message) {
    const data = JSON.stringify(message);
    await this.node.services.pubsub.publish(topic, new TextEncoder().encode(data));
  }
  
  /**
   * Subscribe to topic messages
   */
  subscribe(topic, handler) {
    this.messageHandlers.set(topic, handler);
    
    this.node.services.pubsub.addEventListener('message', (evt) => {
      const topic = evt.detail.topic;
      const message = evt.detail.message;
      
      if (topic === topic) {
        const decoded = new TextDecoder().decode(message.data);
        const data = JSON.parse(decoded);
        
        const handler = this.messageHandlers.get(topic);
        if (handler) {
          handler(data, message.from);
        }
      }
    });
  }
  
  /**
   * Open encrypted P2P stream to peer
   */
  async openStream(peerId, protocol = '/cryos/chat/1.0.0') {
    const stream = await this.node.dialProtocol(peerId, protocol);
    return stream;
  }
  
  /**
   * Send direct message to peer
   */
  async sendMessage(peerId, message) {
    const stream = await this.openStream(peerId);
    
    const data = JSON.stringify(message);
    await stream.sink(new TextEncoder().encode(data));
  }
  
  /**
   * Get list of connected peers
   */
  getConnectedPeers() {
    return Array.from(this.connectedPeers.keys());
  }
  
  /**
   * Get peer info
   */
  async getPeerInfo(peerId) {
    try {
      const peer = await this.node.peerStore.get(peerId);
      return peer;
    } catch {
      return null;
    }
  }
  
  /**
   * Ping peer (measure latency)
   */
  async ping(peerId) {
    try {
      const latency = await this.node.ping(peerId);
      return latency;
    } catch {
      return null;
    }
  }
  
  /**
   * Advertise presence on network
   */
  async advertise(topics = []) {
    const presence = {
      type: 'presence',
      peerId: this.peerId,
      topics,
      timestamp: Date.now(),
      version: '0.1.0'
    };
    
    await this.publish('cryos/network', presence);
  }
}

/**
 * MeshDiscovery - Find peers for app data
 */
export class MeshDiscovery {
  constructor(mesh) {
    this.mesh = mesh;
  }
  
  /**
   * Discover peers serving specific content
   */
  async findPeers(contentHash) {
    const query = {
      type: 'query',
      contentHash,
      peerId: this.mesh.peerId
    };
    
    await this.mesh.publish('cryos/discovery', query);
    
    // Collect responses
    const responses = [];
    const timeout = setTimeout(() => {}, 5000);
    
    return responses;
  }
  
  /**
   * Announce content availability
   */
  async announce(contentHash, ports) {
    const announcement = {
      type: 'announce',
      contentHash,
      ports,  // Available ports for data transfer
      peerId: this.mesh.peerId
    };
    
    await this.mesh.publish('cryos/discovery', announcement);
  }
}

/**
 * OfflineSync - Sync data when online
 */
export class OfflineSync {
  constructor(mesh) {
    this.mesh = mesh;
    this.pendingChanges = [];
  }
  
  /**
   * Queue change for sync
   */
  queueChange(operation) {
    this.pendingChanges.push({
      ...operation,
      timestamp: Date.now(),
      id: crypto.randomUUID()
    });
  }
  
  /**
   * Sync pending changes to network
   */
  async sync() {
    if (this.pendingChanges.length === 0) return;
    
    const batch = this.pendingChanges.splice(0, 100);
    
    for (const change of batch) {
      await this.mesh.publish('cryos/offline', change);
    }
    
    console.log(`[OfflineSync] Synced ${batch.length} changes`);
  }
  
  /**
   * Receive and apply changes
   */
  async handleChange(change, fromPeer) {
    // Check if already applied
    // Apply to local database
    console.log(`[OfflineSync] Applying change from ${fromPeer}`);
  }
}

// Default bootstrap nodes (placeholder)
const DEFAULT_BOOTSTRAP_NODES = [
  '/ip4/127.0.0.1/tcp/4001/p2p/QmBootstrapNode1',
  '/ip4/127.0.0.1/tcp/4002/p2p/QmBootstrapNode2'
];

export { CryMesh, MeshDiscovery, OfflineSync, DEFAULT_BOOTSTRAP_NODES };
export default CryMesh;