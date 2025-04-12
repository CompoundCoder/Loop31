import React, { createContext, useContext, useState } from 'react';

export type SocialAccount = {
  id: string;
  type: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';
  username: string;
  profileImage?: string;
  isConnected: boolean;
};

export type BrandGroup = {
  id: string;
  name: string;
  accountIds: string[];
};

type AccountContextType = {
  accounts: SocialAccount[];
  brandGroups: BrandGroup[];
  addAccount: (account: SocialAccount) => void;
  removeAccount: (id: string) => void;
  addBrandGroup: (group: BrandGroup) => void;
  removeBrandGroup: (id: string) => void;
  updateBrandGroup: (id: string, group: Partial<BrandGroup>) => void;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    {
      id: '1',
      type: 'instagram',
      username: 'vinylwrapchicago',
      isConnected: true,
    },
    {
      id: '2',
      type: 'facebook',
      username: 'Vinyl Wrap Chicago',
      isConnected: true,
    },
    {
      id: '3',
      type: 'twitter',
      username: '@vinylwrapchi',
      isConnected: true,
    },
    {
      id: '4',
      type: 'linkedin',
      username: 'vinyl-wrap-chicago',
      isConnected: false,
    },
  ]);

  const [brandGroups, setBrandGroups] = useState<BrandGroup[]>([
    {
      id: '1',
      name: 'Main Brand',
      accountIds: ['1', '2', '3'],
    },
    {
      id: '2',
      name: 'Professional',
      accountIds: ['2', '4'],
    },
  ]);

  const addAccount = (account: SocialAccount) => {
    setAccounts(prev => [...prev, account]);
  };

  const removeAccount = (id: string) => {
    setAccounts(prev => prev.filter(account => account.id !== id));
    setBrandGroups(prev => 
      prev.map(group => ({
        ...group,
        accountIds: group.accountIds.filter(accountId => accountId !== id),
      }))
    );
  };

  const addBrandGroup = (group: BrandGroup) => {
    setBrandGroups(prev => [...prev, group]);
  };

  const removeBrandGroup = (id: string) => {
    setBrandGroups(prev => prev.filter(group => group.id !== id));
  };

  const updateBrandGroup = (id: string, updates: Partial<BrandGroup>) => {
    setBrandGroups(prev => 
      prev.map(group => 
        group.id === id ? { ...group, ...updates } : group
      )
    );
  };

  return (
    <AccountContext.Provider 
      value={{ 
        accounts, 
        brandGroups, 
        addAccount, 
        removeAccount,
        addBrandGroup,
        removeBrandGroup,
        updateBrandGroup,
      }}
    >
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