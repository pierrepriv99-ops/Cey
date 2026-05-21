package com.cryos.vault;

import android.content.Context;
import android.security.KeyChain;
import android.security.KeyChainAliasBinding;

import javax.crypto.*;
import java.io.*;
import java.security.*;
import java.security.cert.*;
import java.util.*;

/**
 * CryoVault - Secure Key Management
 * 
 * Hardware-backed keystore using:
 * - ARM TrustZone TEE
 * - Android Keystore (hardware-backed)
 * - StrongBox (if available)
 * 
 * Features:
 * - Key generation in TEE
 * - Secure enclave storage
 * - Biometric-gated access
 * - QR key import/export
 */
public class KeyStoreService {
    
    private static final String ALIAS_CRYPTO_KEY = "cryos_master_key";
    private static final String ANDROID_KEYSTORE = "AndroidKeyStore";
    private static final String PROVIDER = "AndroidKeyStore";
    
    private final Context context;
    private final KeyStore keyStore;
    
    public KeyStoreService(Context context) throws Exception {
        this.context = context;
        this.keyStore = KeyStore.getInstance(ANDROID_KEYSTORE);
        keyStore.load(null);
    }
    
    /**
     * Generate master encryption key in hardware security module
     */
    public void generateMasterKey() throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_EC, PROVIDER);
        
        keyGen.initialize(new KeyGenParameterSpec.Builder(
            ALIAS_CRYPTO_KEY,
            KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
            .setAlgorithmParameterSpec(new ECGenParameterSpec("secp256r1"))
            .setDigests(KeyProperties.DIGEST_SHA256, KeyProperties.DIGEST_SHA384)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setUserAuthenticationRequired(true, 0, false)  // Require biometric
            .setUserAuthenticationParameters(0, 
                KeyProperties.AUTH_BIOMETRIC_STRONG)
            .setRandomDeviceEnforced(true)  // Hardware RNG
            .build());
        
        keyGen.generateKeyPair();
    }
    
    /**
     * Get or create session key for wallet transactions
     */
    public PrivateKey getSessionKey(String purpose) throws Exception {
        String alias = "cryos_session_" + purpose;
        
        if (!keyStore.containsAlias(alias)) {
            generateSessionKey(alias, purpose);
        }
        
        return (PrivateKey) keyStore.getKey(alias, null);
    }
    
    private void generateSessionKey(String alias, String purpose) throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_EC, PROVIDER);
        
        int validitySeconds = purpose.equals("signing") ? 300 : 60;
        
        keyGen.initialize(new KeyGenParameterSpec.Builder(alias,
            KeyProperties.PURPOSE_SIGN | KeyProperties.PURPOSE_VERIFY)
            .setAlgorithmParameterSpec(new ECGenParameterSpec("secp256r1"))
            .setDigests(KeyProperties.DIGEST_SHA256)
            .setUserAuthenticationRequired(true, validitySeconds, false)
            .setUserAuthenticationParameters(validitySeconds,
                KeyProperties.AUTH_BIOMETRIC_STRONG)
            .build());
        
        keyGen.generateKeyPair();
    }
    
    /**
     * Sign transaction hash with hardware key
     */
    public byte[] sign(byte[] dataHash, String purpose) throws Exception {
        PrivateKey key = getSessionKey(purpose);
        
        Signature signer = Signature.getInstance(
            "SHA256withECDSA", PROVIDER);
        signer.initSign(key);
        signer.update(dataHash);
        return signer.sign();
    }
    
    /**
     * Verify signature
     */
    public boolean verify(byte[] dataHash, byte[] signature, PublicKey publicKey) {
        try {
            Signature verifier = Signature.getInstance("SHA256withECDSA");
            verifier.initVerify(publicKey);
            verifier.update(dataHash);
            return verifier.verify(signature);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Encrypt data for storage
     */
    public byte[] encrypt(byte[] plaintext) throws Exception {
        PublicKey publicKey = getPublicKey(ALIAS_CRYPTO_KEY);
        
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, publicKey);
        
        byte[] iv = cipher.getIV();
        byte[] ciphertext = cipher.doFinal(plaintext);
        
        // Prepend IV to ciphertext
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.write(iv);
        baos.write(ciphertext);
        return baos.toByteArray();
    }
    
    /**
     * Decrypt stored data
     */
    public byte[] decrypt(byte[] encrypted) throws Exception {
        PrivateKey privateKey = (PrivateKey) keyStore.getKey(ALIAS_CRYPTO_KEY, null);
        
        ByteArrayInputStream bais = new ByteArrayInputStream(encrypted);
        byte[] iv = new byte[12];
        bais.read(iv);
        byte[] ciphertext = bais.readAllBytes();
        
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec spec = new GCMParameterSpec(128, iv);
        cipher.init(Cipher.DECRYPT_MODE, privateKey, spec);
        
        return cipher.doFinal(ciphertext);
    }
    
    /**
     * Export public key for QR code sharing
     */
    public String exportPublicKey(String purpose) throws Exception {
        PublicKey key = getPublicKey(purpose);
        byte[] encoded = key.getEncoded();
        return Base64.getEncoder().encodeToString(encoded);
    }
    
    /**
     * Import public key from QR scan
     */
    public void importPublicKey(String encoded, String purpose) {
        // Store in preferences for verification
    }
    
    private PublicKey getPublicKey(String alias) throws Exception {
        Certificate cert = keyStore.getCertificate(alias);
        return cert.getPublicKey();
    }
    
    /**
     * Check if device supports hardware security
     */
    public static boolean isHardwareBacked(Context context) {
        return KeyChain.isBoundKeyAlgorithm("EC");
    }
}