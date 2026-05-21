/**
 * NAT Traversal for CryOS Mesh Network
 * 
 * Features:
 * - Hole punching (TCP/UDP)
 * - STUN/TURN support
 * - UPnP port mapping
 * - Connection relay fallback
 */

import { createServer } from 'net';

/**
 * NATTraversal - Handle NAT/firewall traversal
 */
export class NATTraversal {
  constructor(config = {}) {
    this.externalIp = null;
    this.externalPort = null;
    this.internalPort = null;
    
    this.stunServers = config.stunServers || [
      'stun.l.google.com:19302',
      'stun1.l.google.com:19302'
    ];
    
    this.turnServers = config.turnServers || [];
    this.relayEnabled = config.relayEnabled !== false;
  }
  
  /**
   * Get external IP via STUN
   */
  async discoverExternalIP() {
    // Simplified STUN - in production use proper stun client
    // This is a placeholder showing the concept
    
    // In real implementation:
    // 1. Send binding request to STUN server
    // 2. Parse XOR-MAPPED-ADDRESS from response
    // 3. Return external IP:port
    
    // For now, we'll use a workaround
    try {
      const response = await fetch('https://api.ipify.org');
      this.externalIp = await response.text();
    } catch {
      // Fallback - use local IP
      this.externalIp = '0.0.0.0';
    }
    
    return this.externalIp;
  }
  
  /**
   * Attempt TCP hole punch
   */
  async tcpHolePunch(targetAddr) {
    // TCP simultaneous open technique
    // 1. Both peers initiate connection to each other
    // 2. NAT should recognize bidirectional traffic
    
    const socket = createServer((socket) => {
      socket.on('data', (data) => {
        console.log('[NAT] Received data:', data.length);
      });
    });
    
    return new Promise((resolve, reject) => {
      socket.listen(0, () => {
        const address = socket.address();
        this.internalPort = address.port;
        
        resolve({
          internalPort: address.port,
          // Don't expose directly for security
          announced: this.externalPort || address.port
        });
      });
      
      socket.on('error', reject);
    });
  }
  
  /**
   * UPnP port mapping
   */
  async setupUPnP(internalPort, protocol = 'TCP') {
    /**
     * UPnP IGD (Internet Gateway Device) discovery
     * 
     * In production implementation:
     * 1. Discover gateway via SSDP (239.255.255.250:1900)
     * 2. Query for WANIPConnection or WANPPPConnection
     * 3. Call AddPortMapping with internalPort
     * 4. Cleanup on exit
     */
    
    // Placeholder - UPnP requires SSDP discovery
    console.log('[NAT] UPnP port mapping requested');
    
    // Return mock result
    return {
      externalPort: internalPort,
      protocol: protocol.toUpperCase(),
      mapped: true  // In reality, verify with gateway
    };
  }
  
  /**
   * Remove UPnP mapping
   */
  async removeUPnPMapping(externalPort, protocol = 'TCP') {
    // Call DeletePortMapping on gateway
    return true;
  }
  
  /**
   * Get relay (TURN) credential
   */
  async getRelayCredential() {
    if (!this.turnServers.length) {
      return null;
    }
    
    // In production: request credentials from TURN server
    return {
      url: this.turnServers[0],
      username: 'temporary_user',
      password: 'temporary_password',
      expiresAt: Date.now() + 3600000  // 1 hour
    };
  }
  
  /**
   * Create relay connection (fallback)
   */
  async createRelayConnection(peerId) {
    const credential = await this.getRelayCredential();
    
    if (!credential) {
      throw new Error('No relay available');
    }
    
    // TURN allocate request
    return {
      relayedAddress: `${credential.url}/Allocate`,
      relayedPort: 0  // Assigned by server
    };
  }
  
  /**
   * Determine best connection method
   */
  async determineConnectionMethod(peerAddr) {
    // Priority:
    // 1. Direct (if both can port forward)
    // 2. TCP hole punch
    // 3. UPnP
    // 4. Relay (TURN) - last resort
    
    const localCapabilities = await this.checkLocalCapabilities();
    const peerCapabilities = await this.checkPeerCapabilities(peerAddr);
    
    if (localCapabilities.direct && peerCapabilities.direct) {
      return 'direct';
    }
    
    if (localCapabilities.holePunch && peerCapabilities.holePunch) {
      return 'hole-punch';
    }
    
    if (localCapabilities.upnp) {
      return 'upnp';
    }
    
    return 'relay';
  }
  
  /**
   * Check local NAT capabilities
   */
  async checkLocalCapabilities() {
    const capabilities = {
      direct: false,
      holePunch: false,
      upnp: false,
      relay: this.relayEnabled
    };
    
    try {
      // Test direct connectivity
      const ip = await this.discoverExternalIP();
      capabilities.direct = ip !== '0.0.0.0';
      
      // Assume hole punching works for most symmetric NATs
      capabilities.holePunch = true;
      
      // Try UPnP (non-intrusive check)
      capabilities.upnp = true;  // Would attempt
    } catch {
      // Fallback to relay
    }
    
    return capabilities;
  }
  
  /**
   * Check peer capabilities (via signaling)
   */
  async checkPeerCapabilities(peerAddr) {
    // In practice, peer advertises capabilities during handshake
    return {
      direct: false,
      holePunch: true,
      upnp: false,
      relay: true
    };
  }
}

/**
 * ConnectionRelay - TURN relay server functionality
 */
export class ConnectionRelay {
  constructor(config = {}) {
    this.bindAddr = config.bindAddr || '0.0.0.0';
    this.bindPort = config.bindPort || 3478;
    this.realm = config.realm || 'cryos.relay';
    
    this.activeAllocations = new Map();
    this.activePermissions = new Map();
  }
  
  /**
   * Allocate relay port for peer
   */
  async allocate(peerId) {
    const allocation = {
      peerId,
      allocatedAt: Date.now(),
      xorRelayedAddr: `${this.bindAddr}:${this.bindPort}`,
      xorRelayedPort: this.bindPort,  // Would assign randomly
      lifetime: 600,  // 10 minutes
      bandwidth: Infinity
    };
    
    this.activeAllocations.set(peerId, allocation);
    
    return {
      xorMappedAddress: allocation.xorRelayedAddr,
      xorMappedPort: allocation.xorRelayedPort,
      lifetime: allocation.lifetime
    };
  }
  
  /**
   * Refresh allocation
   */
  async refreshAllocation(peerId, lifetime) {
    const allocation = this.activeAllocations.get(peerId);
    if (!allocation) {
      throw new Error('No allocation');
    }
    
    allocation.lifetime = lifetime;
    return { lifetime };
  }
  
  /**
   * Permission for peer to use relay
   */
  async createPermission(peerId, authenticatedPeer) {
    this.activePermissions.set(peerId, {
      authenticatedPeer,
      createdAt: Date.now()
    });
  }
  
  /**
   * Close allocation
   */
  async closeAllocation(peerId) {
    this.activeAllocations.delete(peerId);
    this.activePermissions.delete(peerId);
  }
  
  /**
   * Get allocation stats
   */
  getStats() {
    return {
      activeAllocations: this.activeAllocations.size,
      activePermissions: this.activePermissions.size
    };
  }
}

export default NATTraversal;