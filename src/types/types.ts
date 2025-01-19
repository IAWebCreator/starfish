import { ComponentType } from 'react';
import { ButtonProps } from '@mui/material';

export interface FeatureCard {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export interface FeatureCardProps {
  feature: FeatureCard;
  onClick: () => void;
  onGetStarted: () => void;
  StyledButton: ComponentType<ButtonProps>;
}

export interface WalletError {
  code: number;
  message: string;
}

export interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
  send?: (method: string, params: Array<any>) => Promise<any>;
  sendAsync?: (request: { method: string; params?: Array<any> }, callback: (error: any, response: any) => void) => void;
  enable?: () => Promise<string[]>;
} 