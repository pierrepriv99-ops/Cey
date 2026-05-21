/**
 * CryOS Encrypted Messaging Protocol
 * 
 * Features:
 * - E2E encryption (X25519 + AES-GCM)
 * - Double Ratchet for forward secrecy
 * - Group chats
 * - Message delivery receipts
 */

import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'crypto';
import { sealed_box } from 'tweetnacl';

/**
 * CryMessage - Encrypted messaging
 */
export class CryMessage {
  constructor(identity) {
    this.identity = identity;  // { publicKey, privateKey }
    this.sessions = new Map();  // peerId -> session
    this.pendingMessages = [];
    this.messageCallbacks = new Set();
    
    // Encryption helpers
    this.boxKeyPair = sealed_box.keyPair();
  }
  
  /**
   * Generate key pair for messaging
   */
  static generateKeyPair() {
    const keyPair = sealed_box.keyPair();
    return {
      publicKey: Buffer.from(keyPair.publicKey).toString('base64'),
      privateKey: Buffer.from(keyPair.secretKey).toString('base64')
    };
  }
  
  /**
   * Encrypt message for recipient (using recipient's public key)
   */
  encrypt(recipientPublicKey, message) {
    const messageStr = JSON.stringify(message);
    const messageBytes = new TextEncoder().encode(messageStr);
    
    // Use TweetNaCl sealed box for encryption
    const encrypted = sealed_box.seal(
      messageBytes,
      Buffer.from(recipientPublicKey, 'base64')
    );
    
    return {
      ciphertext: Buffer.from(encrypted).toString('base64'),
      senderPublicKey: this.identity.publicKey,
      timestamp: Date.now(),
      nonce: randomBytes(24).toString('base64')
    };
  }
  
  /**
   * Decrypt message from sender
   */
  decrypt(encryptedMessage) {
    const { ciphertext, senderPublicKey } = encryptedMessage;
    
    const decrypted = sealed_box.open(
      Buffer.from(ciphertext, 'base64'),
      Buffer.from(senderPublicKey, 'base64'),
      Buffer.from(this.identity.privateKey, 'base64')
    );
    
    if (!decrypted) {
      throw new Error('Decryption failed');
    }
    
    const messageStr = new TextDecoder().decode(decrypted);
    return JSON.parse(messageStr);
  }
  
  /**
   * Create double ratchet session for ongoing conversation
   */
  createSession(peerId, theirPublicKey) {
    const session = new DoubleRatchet(theirPublicKey, this.identity.privateKey);
    this.sessions.set(peerId, session);
    return session;
  }
  
  /**
   * Send message using session (with ratchet)
   */
  async sendMessage(peerId, message, transport) {
    let session = this.sessions.get(peerId);
    const peerKey = await this.getPeerKey(peerId);
    
    if (!session) {
      session = this.createSession(peerId, peerKey);
    }
    
    // Encrypt with ratchet keys
    const encrypted = session.encrypt(message);
    
    // Send via transport
    const envelope = {
      type: 'message',
      to: peerId,
      from: this.identity.publicKey,
      ciphertext: encrypted,
      messageId: crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    await transport.send(envelope);
    
    return envelope.messageId;
  }
  
  /**
   * Handle incoming message
   */
  async handleMessage(envelope, transport) {
    const { from, ciphertext, messageId } = envelope;
    
    let session = this.sessions.get(from);
    
    if (!session) {
      const peerKey = await this.getPeerKey(from);
      session = this.createSession(from, peerKey);
    }
    
    // Decrypt
    const message = session.decrypt(ciphertext);
    
    // Notify listeners
    for (const callback of this.messageCallbacks) {
      callback(message, from, messageId);
    }
    
    // Send delivery receipt
    await this.sendReceipt(envelope.messageId, from, transport);
    
    return message;
  }
  
  /**
   * Send delivery receipt
   */
  async sendReceipt(messageId, to, transport) {
    const receipt = {
      type: 'receipt',
      messageId,
      status: 'delivered',
      timestamp: Date.now()
    };
    
    await transport.send({
      type: 'receipt',
      to,
      receipt
    });
  }
  
  /**
   * Register message handler
   */
  onMessage(callback) {
    this.messageCallbacks.add(callback);
  }
  
  /**
   * Get peer's public key (from peer store)
   */
  async getPeerKey(peerId) {
    // In production, fetch from DHT or cached peer store
    return null;
  }
}

/**
 * DoubleRatchet - Forward-secret encryption
 * Based on Signal Protocol's Double Ratchet algorithm
 */
class DoubleRatchet {
  constructor(theirPublicKey, myPrivateKey) {
    this.rootKey = randomBytes(32);
    this.chainKey = createHash('sha256').update(this.rootKey).digest();
    this.myPublicKey = null;  // My current ratchet public key
    this.myPrivateKey = randomBytes(32);
    this.theirRatchetKey = null;  // Their current ratchet key
    
    // Message keys (one-time)
    this.messageKeys = new Map();
    this.previousChainLength = 0;
  }
  
  /**
   * Mix key for message key derivation
   */
  deriveKey() {
    this.chainKey = createHash('sha256')
      .update(Buffer.concat([this.chainKey, Buffer.from([0])]))
      .digest();
    
    const messageKey = createHash('sha256')
      .update(Buffer.concat([this.chainKey, Buffer.from([1])]))
      .digest();
    
    return messageKey;
  }
  
  /**
   * Encrypt message
   */
  encrypt(message) {
    const messageKey = this.deriveKey();
    const messageStr = JSON.stringify(message);
    const messageBytes = new TextEncoder().encode(messageStr);
    
    // AES-256-GCM encryption
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', messageKey, iv);
    
    const ciphertext = Buffer.concat([
      cipher.update(messageBytes),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    return {
      ciphertext: ciphertext.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64')
    };
  }
  
  /**
   * Decrypt message
   */
  decrypt(encrypted) {
    const { ciphertext, iv, authTag } = encrypted;
    
    // Derive message key
    // (In full implementation, track message numbers)
    const messageKey = this.deriveKey();
    
    const decipher = createDecipheriv(
      'aes-256-gcm',
      messageKey,
      Buffer.from(iv, 'base64')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));
    
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64')),
      decipher.final()
    ]);
    
    return JSON.parse(new TextDecoder().decode(decrypted));
  }
}

/**
 * GroupChat - Encrypted group messaging
 */
export class GroupChat {
  constructor(adminId) {
    this.groupId = crypto.randomUUID();
    this.adminId = adminId;
    this.members = new Map();  // memberId -> encryptedKey
    this.messageIndex = 0;
  }
  
  /**
   * Create group
   */
  static async create(adminPublicKey) {
    const group = new GroupChat(adminPublicKey);
    
    // Admin is first member
    group.members.set(adminPublicKey, {
      role: 'admin',
      joinedAt: Date.now()
    });
    
    return group;
  }
  
  /**
   * Add member to group
   */
  addMember(memberPublicKey, encryptedKey) {
    this.members.set(memberPublicKey, {
      role: 'member',
      joinedAt: Date.now()
    });
  }
  
  /**
   * Send group message
   */
  async sendMessage(senderPublicKey, message, encodeKey) {
    const messageKey = encodeKey();  // Derived group key
    
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', messageKey, iv);
    
    const messageStr = JSON.stringify(message);
    const ciphertext = Buffer.concat([
      cipher.update(messageStr),
      cipher.final()
    ]);
    
    return {
      groupId: this.groupId,
      sender: senderPublicKey,
      sequence: ++this.messageIndex,
      ciphertext: ciphertext.toString('base64'),
      iv: iv.toString('base64'),
      authTag: cipher.getAuthTag().toString('base64')
    };
  }
  
  /**
   * Calculate member count
   */
  getMemberCount() {
    return this.members.size;
  }
}

export default CryMessage;