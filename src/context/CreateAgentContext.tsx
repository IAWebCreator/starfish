import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useWallet } from './WalletContext';

interface CreateAgentState {
  name: string;
  description: string;
  instructions: string;
  selectedTraits: string[];
  customBotName: boolean;
  botToken: string;
  duration: string;
  telegramUsername: string;
  walletAddress: string;
}

interface CreateAgentContextType {
  formState: CreateAgentState;
  updateFormState: (updates: Partial<CreateAgentState>) => void;
  resetForm: () => void;
}

const initialState: CreateAgentState = {
  name: '',
  description: '',
  instructions: '',
  selectedTraits: [],
  customBotName: false,
  botToken: '',
  duration: '4',
  telegramUsername: '',
  walletAddress: '',
};

const CreateAgentContext = createContext<CreateAgentContextType | undefined>(undefined);

export function CreateAgentProvider({ children }: { children: ReactNode }) {
  const { address } = useWallet();
  const [formState, setFormState] = useState<CreateAgentState>({
    ...initialState,
    walletAddress: address || '',
  });

  // Update wallet address when it changes
  React.useEffect(() => {
    setFormState(prev => ({
      ...prev,
      walletAddress: address || '',
    }));
  }, [address]);

  const updateFormState = (updates: Partial<CreateAgentState>) => {
    setFormState(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const resetForm = () => {
    setFormState({
      ...initialState,
      walletAddress: address || '',
    });
  };

  return (
    <CreateAgentContext.Provider value={{ formState, updateFormState, resetForm }}>
      {children}
    </CreateAgentContext.Provider>
  );
}

export function useCreateAgent() {
  const context = useContext(CreateAgentContext);
  if (context === undefined) {
    throw new Error('useCreateAgent must be used within a CreateAgentProvider');
  }
  return context;
} 