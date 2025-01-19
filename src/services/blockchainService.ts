import { ethers } from 'ethers';
import { BLOCKCHAIN_CONFIG } from '../config/blockchain';

export class BlockchainService {
  private provider: ethers.BrowserProvider;
  private readonly POLLING_INTERVAL = 1000; // 1 second
  private readonly MAX_ATTEMPTS = 30; // Maximum number of attempts to check transaction
  
  constructor() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to use this feature.');
    }
    this.provider = new ethers.BrowserProvider(window.ethereum);
  }

  async sendAgentCreationTransaction(signer: ethers.Signer, amount: string): Promise<ethers.TransactionResponse> {
    try {
      const transaction = {
        to: BLOCKCHAIN_CONFIG.ADDRESSES.AGENT_RECEIVER,
        value: ethers.parseEther(amount),
        gasLimit: ethers.getBigInt('100000')
      };

      const tx = await signer.sendTransaction(transaction);
      return tx;
    } catch (error: any) {
      console.error('Transaction error:', error);
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction was rejected by user');
      }
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds to complete the transaction');
      }
      throw new Error('Failed to send transaction. Please try again.');
    }
  }

  async waitForTransaction(tx: ethers.TransactionResponse): Promise<ethers.TransactionReceipt> {
    try {
      // First attempt to use the built-in wait
      try {
        const receipt = await tx.wait(1);
        if (receipt && receipt.status === 1) {
          return receipt;
        }
      } catch (error) {
        console.log("Initial wait failed, starting manual polling...");
      }

      // If the built-in wait fails, fall back to manual polling
      return await this.pollTransactionReceipt(tx.hash);
    } catch (error: any) {
      console.error('Wait for transaction error:', error);
      throw new Error('Failed to confirm transaction. Please check your wallet for status.');
    }
  }

  private async pollTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt> {
    let attempts = 0;

    while (attempts < this.MAX_ATTEMPTS) {
      try {
        const receipt = await this.provider.getTransactionReceipt(txHash);
        
        if (receipt) {
          if (receipt.status === 0) {
            throw new Error('Transaction failed on the blockchain');
          }
          return receipt;
        }
        
        // If no receipt, wait and try again
        await new Promise(resolve => setTimeout(resolve, this.POLLING_INTERVAL));
        attempts++;
        
      } catch (error: any) {
        if (error.message.includes('failed on the blockchain')) {
          throw error;
        }
        // For other errors, continue polling
        console.log(`Attempt ${attempts + 1} failed, retrying...`);
      }
    }

    throw new Error('Transaction confirmation timed out. Please check the transaction status in your wallet.');
  }

  async requestAccount(): Promise<string> {
    try {
      const accounts = await this.provider.send('eth_requestAccounts', []);
      return accounts[0];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkNetwork(): Promise<boolean> {
    try {
      const network = await this.provider.getNetwork();
      return network.chainId === BigInt(BLOCKCHAIN_CONFIG.NETWORKS.sepolia.chainId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSigner(): Promise<ethers.Signer> {
    try {
      return await this.provider.getSigner();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.code === 'ACTION_REJECTED') {
      return new Error('Transaction was rejected by user');
    }
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return new Error('Insufficient funds to complete the transaction');
    }
    if (error.message.includes('network')) {
      return new Error(`Please connect to ${BLOCKCHAIN_CONFIG.NETWORKS.sepolia.name}`);
    }
    return error;
  }
}

export const blockchainService = new BlockchainService(); 