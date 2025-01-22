import { supabase } from '../config/supabase';
import { blockchainService } from './blockchainService';
import { ethers } from 'ethers';

export const webGeneratorService = {
  async uploadLogo(file: File, address: string): Promise<string> {
    try {
      // Create a unique file name using address and timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${address}_${Date.now()}.${fileExt}`;
      
      // Upload file to Supabase storage with public access
      const { error } = await supabase.storage
        .from('logos_web_generator')
        .upload(fileName, file, {
          upsert: true,
          cacheControl: '3600',
          contentType: file.type
        });

      if (error) throw error;

      // Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('logos_web_generator')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  },

  async processWebsiteGeneration(signer: ethers.Signer): Promise<string> {
    try {
      // Send transaction with 0.01 ETH
      const tx = await blockchainService.sendAgentCreationTransaction(
        signer,
        '0.01'
      );

      // Wait for transaction confirmation
      const receipt = await blockchainService.waitForTransaction(tx);
      
      return receipt.hash;
    } catch (error) {
      console.error('Blockchain transaction error:', error);
      throw error;
    }
  },

  // Add this new utility function
  normalizeUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;
    
    // Clean the URL
    let cleanUrl = url.trim()
      .replace(/\/+$/, '') // Remove trailing slashes
      .replace(/^(?!https?:\/\/)/, 'https://') // Add https:// if missing
      .toLowerCase();

    // Handle X/Twitter URL normalization
    if (cleanUrl.includes('x.com/')) {
      cleanUrl = cleanUrl.replace('x.com/', 'twitter.com/');
    }

    return cleanUrl;
  },

  // Update the saveWebData method
  async saveWebData(data: {
    wallet_address: string;
    token_name: string;
    token_ticker: string;
    token_description: string;
    token_contract_number: string;
    twitter_url?: string;
    telegram_url?: string;
    youtube_url?: string;
    tiktok_url?: string;
    logo_url: string;
    transaction_id: string;
  }) {
    try {
      // Normalize all social media URLs
      const normalizedData = {
        ...data,
        twitter_url: this.normalizeUrl(data.twitter_url),
        telegram_url: this.normalizeUrl(data.telegram_url),
        youtube_url: this.normalizeUrl(data.youtube_url),
        tiktok_url: this.normalizeUrl(data.tiktok_url),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('web_basic_data')
        .insert([normalizedData]);

      if (error) {
        console.error('Detailed error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error saving web data:', error);
      throw error;
    }
  }
}; 