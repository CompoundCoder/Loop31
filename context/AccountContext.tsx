import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Account {
  id: string;
  name: string;
  type: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';
  isConnected: boolean;
}

export interface BrandGroup {
  id: string;
  name: string;
  accounts: string[];
}

interface AccountContextType {
  accounts: Account[];
  brandGroups: BrandGroup[];
  addAccount: (account: Account) => void;
  removeAccount: (id: string) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  addGroup: (group: BrandGroup) => void;
  removeGroup: (id: string) => void;
  updateGroup: (id: string, updates: Partial<BrandGroup>) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

// Initial mock data
const initialAccounts: Account[] = [
  { id: '1', name: 'Nike Instagram', type: 'instagram', isConnected: true },
  { id: '2', name: 'Nike Twitter', type: 'twitter', isConnected: true },
  { id: '3', name: 'Adidas Instagram', type: 'instagram', isConnected: true },
  { id: '4', name: 'Adidas Twitter', type: 'twitter', isConnected: false },
];

const initialGroups: BrandGroup[] = [
  { id: 'g1', name: 'Nike', accounts: ['1', '2'] },
  { id: 'g2', name: 'Adidas', accounts: ['3', '4'] },
];

export function AccountProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [brandGroups, setBrandGroups] = useState<BrandGroup[]>(initialGroups);

  const addAccount = (account: Account) => {
    setAccounts(prev => [...prev, account]);
  };

  const removeAccount = (id: string) => {
    setAccounts(prev => prev.filter(account => account.id !== id));
    setBrandGroups(prev => 
      prev.map(group => ({
        ...group,
        accounts: group.accounts.filter(accountId => accountId !== id)
      }))
    );
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => 
      prev.map(account => 
        account.id === id ? { ...account, ...updates } : account
      )
    );
  };

  const addGroup = (group: BrandGroup) => {
    setBrandGroups(prev => [...prev, group]);
  };

  const removeGroup = (id: string) => {
    setBrandGroups(prev => prev.filter(group => group.id !== id));
  };

  const updateGroup = (id: string, updates: Partial<BrandGroup>) => {
    setBrandGroups(prev => 
      prev.map(group => 
        group.id === id ? { ...group, ...updates } : group
      )
    );
  };

  return (
    <AccountContext.Provider value={{
      accounts,
      brandGroups,
      addAccount,
      removeAccount,
      updateAccount,
      addGroup,
      removeGroup,
      updateGroup,
    }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
} 