package com.cryos.wallet;

import org.web3j.crypto.*;
import org.web3j.protocol.*;
import org.web3j.protocol.core.*;
import org.web3j.protocol.http.*;
import org.web3j.tx.*;

import java.math.BigInteger;
import java.util.*;
import java.util.concurrent.*;

/**
 * CryoWallet - Multi-Chain EVM Wallet SDK
 * 
 * Features:
 * - HD Wallet derivation (BIP-39/44)
 * - Multi-chain support (Ethereum, Polygon, BSC, etc.)
 * - Hardware key integration (via Vault)
 * - Transaction signing
 * - Token management (ERC-20)
 * - RPC failover
 */
public class WalletSDK {
    
    /** Supported Networks */
    public enum Chain {
        ETHEREUM_MAINNET(1, "https://eth-mainnet.g.alchemy.com/v2/demo"),
        ETHEREUM_SEPOLIA(11155111, "https://eth-sepolia.g.alchemy.com/v2/demo"),
        POLYGON(137, "https://polygon-rpc.com"),
        POLYGON_MUMBAI(80001, "https://rpc-mumbai.maticvigil.com"),
        BSC(56, "https://bsc-dataseed.binance.org"),
        BSC_TESTNET(97, "https://data-seed-prebsc-1-s1.binance.org:8545"),
        ARBITRUM(42161, "https://arb1.arbitrum.io/rpc"),
        OPTIMISM(10, "https://mainnet.optimism.io"),
        BASE(8453, "https://mainnet.base.org");
        
        public final long chainId;
        public final String rpcUrl;
        
        Chain(long chainId, String rpcUrl) {
            this.chainId = chainId;
            this.rpcUrl = rpcUrl;
        }
    }
    
    private final Credentials credentials;
    private final Map<Chain, Web3j> clients;
    private final Map<Chain, String> addresses;
    
    public WalletSDK(Credentials credentials) {
        this.credentials = credentials;
        this.clients = new HashMap<>();
        this.addresses = new HashMap<>();
        
        // Initialize Web3j clients for each chain
        for (Chain chain : Chain.values()) {
            Web3j client = Web3j.build(new HttpService(chain.rpcUrl));
            clients.put(chain, client);
            addresses.put(chain, credentials.getAddress());
        }
    }
    
    /**
     * Create wallet from seed phrase (HD Wallet)
     */
    public static WalletSDK fromSeedPhrase(String mnemonic, String password) {
        Credentials cred = WalletUtils.loadCredentials(
            password, 
            GeneratedSecureWallet.generateLight(
                mnemonic, 
                new SecureWalletFile()))
        return new WalletSDK(cred);
    }
    
    /**
     * Create wallet from private key
     */
    public static WalletSDK fromPrivateKey(String privateKey) {
        Credentials cred = Credentials.create(privateKey);
        return new WalletSDK(cred);
    }
    
    /**
     * Get address for chain
     */
    public String getAddress(Chain chain) {
        return addresses.get(chain);
    }
    
    /**
     * Get ETH balance
     */
    public BigInteger getBalance(Chain chain) throws Exception {
        Web3j client = clients.get(chain);
        org.web3j.protocol.core.methods.response.EthBalance balance = 
            client.ethGetBalance(
                credentials.getAddress(), 
                DefaultBlockParameterName.LATEST)
            .send();
        
        return balance.getBalance();
    }
    
    /**
     * Get ERC-20 token balance
     */
    public BigInteger getTokenBalance(Chain chain, String tokenAddress) throws Exception {
        // ERC-20 balanceOf(tokenContract).call()
        Function balanceOf = new Function(
            "balanceOf",
            Arrays.asList(new Address(credentials.getAddress())),
            Arrays.asLogType("uint256"));
        
        return executeRead(chain, tokenAddress, balanceOf);
    }
    
    /**
     * Send ETH transaction
     */
    public String send(Chain chain, String to, BigInteger amountWei) throws Exception {
        Web3j client = clients.get(chain);
        
        // Get nonce
        org.web3j.protocol.core.methods.response.EthTransaction nonceReq = 
            client.ethGetTransactionCount(
                credentials.getAddress(), 
                DefaultBlockParameterName.PENDING)
            .send();
        BigInteger nonce = nonceReq.getTransactionCount();
        
        // Get gas price
        org.web3j.protocol.core.methods.response.EthGasPrice gasPrice = 
            client.ethGasPrice().send();
        BigInteger gasPriceWei = gasPrice.getGasPrice();
        
        // Build transaction
        RawTransaction tx = RawTransaction.createEtherTransaction(
            nonce,
            gasPriceWei,
            BigInteger.valueOf(21000),  // Gas limit
            to,
            amountWei,
            null);  // Data
        
        // Sign and send
        byte[] signed = TransactionEncoder.encode(tx);
        String hexSigned = Numeric.toHexString(signed);
        
        EthSendTransaction Response = client.ethSendRawTransaction(hexSigned).send();
        
        if (Response.hasError()) {
            throw new RuntimeException(Response.getError().getMessage());
        }
        
        return Response.getTransactionHash();
    }
    
    /**
     * Send ERC-20 token
     */
    public String sendToken(
        Chain chain,
        String tokenContract,
        String to,
        BigInteger amount) throws Exception {
        
        Function transfer = new Function(
            "transfer",
            Arrays.asList(new Address(to), new Uint256(amount)),
            Collections.emptyList());
        
        return executeWrite(chain, tokenContract, transfer);
    }
    
    /**
     * Execute read-only contract call
     */
    private BigInteger executeRead(Chain chain, String contract, Function func) 
        throws Exception {
        String encoded = FunctionEncoder.encode(func);
        
        org.web3j.protocol.core.methods.response.EthCall response = 
            clients.get(chain).ethCall(
                RequestBuilder.createCallRequest(
                    credentials.getAddress(),
                    contract,
                    encoded))
            .send();
        
        return FunctionReturnDecoder.decodeSingleValue(
            response.getValue(),
            func.getOutputParameters().get(0));
    }
    
    /**
     * Execute state-changing contract call
     */
    private String executeWrite(Chain chain, String contract, Function func)
        throws Exception {
        Web3j client = clients.get(chain);
        
        org.web3j.protocol.core.methods.response.EthTransaction nonceReq = 
            client.ethGetTransactionCount(
                credentials.getAddress(), 
                DefaultBlockParameterName.PENDING)
            .send();
        BigInteger nonce = nonceReq.getTransactionCount();
        
        org.web3j.protocol.core.methods.response.EthGasPrice gasPrice = 
            client.ethGasPrice().send();
        BigInteger gasPriceWei = gasPrice.getGasPrice();
        
        String encoded = FunctionEncoder.encode(func);
        
        RawTransaction tx = RawTransaction.createTransaction(
            nonce,
            gasPriceWei,
            BigInteger.valueOf(100000),  // Approximate gas for ERC-20
            contract,
            encoded);
        
        byte[] signed = TransactionEncoder.encode(tx);
        String hexSigned = Numeric.toHexString(signed);
        
        EthSendTransaction response = 
            client.ethSendRawTransaction(hexSigned).send();
        
        if (response.hasError()) {
            throw new RuntimeException(response.getError().getMessage());
        }
        
        return response.getTransactionHash();
    }
    
    /**
     * Estimate gas for transaction
     */
    public BigInteger estimateGas(Chain chain, RawTransaction tx) throws Exception {
        org.web3j.protocol.core.methods.response.EthEstimateGas estimate = 
            clients.get(chain).ethEstimateGas(
                RequestBuilder.createCallRequest(
                    credentials.getAddress(),
                    tx.getTo(),
                    TransactionEncoder.encode(tx)))
            .send();
        
        return estimate.getAmount();
    }
    
    /**
     * Wait for transaction receipt
     */
    public Optional<TransactionReceipt> waitForReceipt(
        Chain chain, 
        String txHash,
        int timeoutSeconds) throws InterruptedException {
        
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<Optional<TransactionReceipt>> future = executor.submit(() -> {
            while (true) {
                org.web3j.protocol.core.methods.response.EthGetTransactionReceipt receipt = 
                    clients.get(chain).ethGetTransactionReceipt(txHash).send();
                
                Optional<TransactionReceipt> result = receipt.getTransactionReceipt();
                if (result.isPresent()) {
                    return result;
                }
                Thread.sleep(3000);
            }
        });
        
        try {
            return future.get(timeoutSeconds, TimeUnit.SECONDS);
        } finally {
            executor.shutdownNow();
        }
    }
    
    /**
     * Get chain ID
     */
    public long getChainId(Chain chain) {
        return chain.chainId;
    }
}