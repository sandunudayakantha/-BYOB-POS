import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useBranchesUseCase } from '@/app/domain/branches/use-branches.use-case';

const BranchContext = createContext(null);

export const BranchProvider = ({ children }) => {
  const { user } = useAuth();
  const isEligible = Boolean(user && user.role !== 'CUSTOMER');
  const { branches, isLoading: loading, refetch: fetchBranches } = useBranchesUseCase({ enabled: isEligible });
  const [activeBranch, setActiveBranch] = useState(null);

  useEffect(() => {
    if (branches && branches.length > 0) {
      const savedBranchId = localStorage.getItem('activeBranchId');
      const matched = branches.find(b => String(b._id || b.id) === String(savedBranchId));
      const defaultBranch = matched || branches.find(b => b.isMain) || branches[0];
      setActiveBranch(defaultBranch);
      if (defaultBranch) {
        localStorage.setItem('activeBranchId', String(defaultBranch._id || defaultBranch.id));
      }
    } else if (!loading) {
      setActiveBranch(null);
    }
  }, [branches, loading]);

  const switchBranch = (branch) => {
    setActiveBranch(branch);
    if (branch) {
      localStorage.setItem('activeBranchId', String(branch._id || branch.id));
    }
  };

  return (
    <BranchContext.Provider value={{ branches, activeBranch, switchBranch, fetchBranches, loading }}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};
