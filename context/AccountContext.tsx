import React, { createContext, useContext, useState } from 'react';

export interface Account {
  id: string;
  name: string;
  platform: string;
  avatar?: string;
}

export interface BrandGroup {
  id: string;
  name: string;
  accounts: string[]; // Array of account IDs
}

interface AccountContextType {
  accounts: Account[];
  brandGroups: BrandGroup[];
  addGroup: (group: BrandGroup) => void;
  updateGroup: (groupId: string, updates: Partial<BrandGroup>) => void;
  deleteGroup: (groupId: string) => void;
  toggleAccountInGroup: (groupId: string, accountId: string) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

// Mock data for testing
const mockAccounts: Account[] = [
  { id: '1', name: 'Business Instagram', platform: 'instagram', avatar: 'https://example.com/avatar1.jpg' },
  { id: '2', name: 'Company Twitter', platform: 'twitter', avatar: 'https://example.com/avatar2.jpg' },
  { id: '3', name: 'Marketing Facebook', platform: 'facebook', avatar: 'https://example.com/avatar3.jpg' },
];

const mockGroups: BrandGroup[] = [
  { id: 'group-1', name: 'Marketing Team', accounts: ['1', '2'] },
  { id: 'group-2', name: 'Sales Team', accounts: ['2', '3'] },
];

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [accounts] = useState<Account[]>(mockAccounts);
  const [brandGroups, setBrandGroups] = useState<BrandGroup[]>(mockGroups);

  const addGroup = (group: BrandGroup) => {
    setBrandGroups(prev => [...prev, group]);
  };

  const updateGroup = (groupId: string, updates: Partial<BrandGroup>) => {
    setBrandGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, ...updates } : group
    ));
  };

  const deleteGroup = (groupId: string) => {
    setBrandGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const toggleAccountInGroup = (groupId: string, accountId: string) => {
    setBrandGroups(prev => prev.map(group => {
      if (group.id !== groupId) return group;
      
      const accountIndex = group.accounts.indexOf(accountId);
      if (accountIndex === -1) {
        return { ...group, accounts: [...group.accounts, accountId] };
      } else {
        return { ...group, accounts: group.accounts.filter(id => id !== accountId) };
      }
    }));
  };

  return (
    <AccountContext.Provider value={{
      accounts,
      brandGroups,
      addGroup,
      updateGroup,
      deleteGroup,
      toggleAccountInGroup,
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