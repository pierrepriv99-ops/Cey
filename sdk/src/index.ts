/**
 * CryOS SDK - TypeScript/JavaScript SDK for building on CryOS
 * 
 * Features:
 * - CryoWallet integration
 * - CryoStore client
 * - DID authentication
 * - Token (CRX) utilities
 */

import { ethers, Contract, Wallet, providers } from 'ethers';

// =============================================================================
// Types
// =============================================================================

export interface CryOSConfig {
  network: 'mainnet' | 'sepolia';
  crxTokenAddress: string;
  cryoStoreAddress: string;
  rpcUrl?: string;
}

export interface AppDetails {
  id: string;
  name: string;
  developer: string;
  price: bigint;
  category: string;
  downloads: number;
  rating: number;
}

export interface WalletInfo {
  address: string;
  balance: bigint;
  chainId: number;
}

// =============================================================================
// SDK Core
// =============================================================================

/**
 * Main CryOS SDK class
 */
export class CryOSSDK {
  private provider: providers.JsonRpcProvider;
  private wallet: Wallet | null = null;
  private config: CryOSConfig;
  
  // Contract instances
  private crxToken: Contract | null = null;
  private cryoStore: Contract | null = null;
  
  constructor(config: CryOSConfig) {
    this.config = config;
    this.provider = new providers.JsonRpcProvider(
      config.rpcUrl || (config.network === 'mainnet' 
        ? 'https://eth-mainnet.g.alchemy.com/v2/demo'
        : 'https://eth-sepolia.g.alchemy.com/v2/demo')
    );
  }
  
  /**
   * Initialize SDK with wallet (requires private key)
   */
  async connect(privateKey: string): Promise<void> {
    this.wallet = new Wallet(privateKey, this.provider);
    
    // Initialize contract instances
    this.crxToken = new Contract(
      this.config.crxTokenAddress,
      CRX_ABI,
      this.wallet
    );
    
    this.cryoStore = new Contract(
      this.config.cryoStoreAddress,
      CRYO_STORE_ABI,
      this.wallet
    );
  }
  
  /**
   * Get wallet info
   */
  async getWalletInfo(): Promise<WalletInfo> {
    if (!this.wallet) throw new Error('Not connected');
    
    const balance = await this.provider.getBalance(this.wallet.address);
    const network = await this.provider.getNetwork();
    
    return {
      address: this.wallet.address,
      balance,
      chainId: Number(network.chainId)
    };
  }
  
  /**
   * Get CRX token balance
   */
  async getCRXBalance(address?: string): Promise<bigint> {
    if (!this.crxToken) throw new Error('Token not initialized');
    const addr = address || this.wallet?.address;
    if (!addr) throw new Error('No address');
    
    return await this.crxToken.balanceOf(addr);
  }
  
  /**
   * Transfer CRX tokens
   */
  async transferCRX(to: string, amount: bigint): Promise<ethers.TransactionResponse> {
    if (!this.crxToken) throw new Error('Token not initialized');
    
    return await this.crxToken.transfer(to, amount);
  }
  
  /**
   * Approve CRX for spending (for store purchases)
   */
  async approveCRX(spender: string, amount: bigint): Promise<ethers.TransactionResponse> {
    if (!this.crxToken) throw new Error('Token not initialized');
    
    return await this.crxToken.approve(spender, amount);
  }
  
  /**
   * Get app details from store
   */
  async getApp(appId: string): Promise<AppDetails> {
    if (!this.cryoStore) throw new Error('Store not initialized');
    
    const app = await this.cryoStore.apps(appId);
    
    return {
      id: appId,
      name: app.name,
      developer: app.developer,
      price: app.price,
      category: app.category,
      downloads: Number(app.totalDownloads),
      rating: Number(app.ratingCount) > 0 
        ? Number(app.ratingSum) / Number(app.ratingCount) 
        : 0
    };
  }
  
  /**
   * Purchase/download app from store
   */
  async downloadApp(appId: string): Promise<ethers.TransactionResponse> {
    if (!this.cryoStore) throw new Error('Store not initialized');
    
    return await this.cryoStore.download(appId);
  }
  
  /**
   * Rate an app
   */
  async rateApp(appId: string, rating: number): Promise<ethers.TransactionResponse> {
    if (!this.cryoStore) throw new Error('Store not initialized');
    if (rating < 1 || rating > 5) throw new Error('Rating 1-5');
    
    return await this.cryoStore.rateApp(appId, rating);
  }
  
  /**
   * Get provider instance
   */
  getProvider(): providers.JsonRpcProvider {
    return this.provider;
  }
}

// =============================================================================
// DID Authentication
// =============================================================================

/**
 * CryOS DID (Decentralized Identity) utilities
 */
export class CryOSDID {
  private wallet: Wallet;
  
  constructor(wallet: Wallet) {
    this.wallet = wallet;
  }
  
  /**
   * Generate DID for wallet address
   * Format: did:cryos:<checksum-address>
   */
  static generateDID(address: string): string {
    // Ensure proper Checksum address
    const checksumAddress = ethers.getAddress(address);
    return `did:cryos:${checksumAddress}`;
  }
  
  /**
   * Sign message for authentication
   */
  async signAuthMessage(nonce: string): Promise<string> {
    const message = `Login to CryOS\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;
    return await this.wallet.signMessage(message);
  }
  
  /**
   * Verify signed auth message
   */
  static verifyAuthMessage(
    message: string, 
    signature: string,
    address: string
  ): boolean {
    try {
      const recovered = ethers.verifyMessage(message, signature);
      return recovered.toLowerCase() === address.toLowerCase();
    } catch {
      return false;
    }
  }
}

// =============================================================================
// ABI Constants (minimal for SDK)
// =============================================================================

const CRX_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];

const CRYO_STORE_ABI = [
  "function apps(bytes32 appId) view returns (tuple(string name, string metadataURI, address developer, uint256 price, bytes32 category, bool isPublished, uint256 totalDownloads, uint256 ratingSum, uint256 ratingCount))",
  "function download(bytes32 appId)",
  "function rateApp(bytes32 appId, uint8 rating)"
];

// =============================================================================
// Exports
// =============================================================================

export default CryOSSDK;
export { CryOSSDK, CryOSDID };
export type { CryOSConfig, AppDetails, WalletInfo };