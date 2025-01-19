export const BLOCKCHAIN_CONFIG = {
  // Network configurations
  NETWORKS: {
    sepolia: {
      httpProvider: 'https://red-quaint-butterfly.ethereum-sepolia.quiknode.pro/666f160d9f060ae302da62e82d6bf1c4243277f2',
      wssProvider: 'wss://red-quaint-butterfly.ethereum-sepolia.quiknode.pro/666f160d9f060ae302da62e82d6bf1c4243277f2',
      name: 'Sepolia Testnet',
      chainId: 11155111,
    },
    // Add mainnet configuration here when needed
    // mainnet: {
    //   httpProvider: 'MAINNET_HTTP_PROVIDER',
    //   wssProvider: 'MAINNET_WSS_PROVIDER',
    //   name: 'Ethereum Mainnet',
    //   chainId: 1,
    // }
  },
  
  // Contract addresses
  ADDRESSES: {
    AGENT_RECEIVER: '0x004836e8823AFb4969Be8C0EA52dAA49C5F1AEAd',
  },

  // Transaction defaults
  TRANSACTION: {
    AGENT_CREATION_COST: {
      '4': '0.0025',  // 4 hours
      '12': '0.006',  // 12 hours
      '24': '0.01',   // 24 hours
    },
  }
}; 