import { useState } from 'react';
import { useSubscription } from './useSubscription';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';

export const useSubscriptionLimits = () => {
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    reason?: 'items' | 'documents' | 'tasks';
  }>({ isOpen: false });
  
  const { usageLimits, isLoading } = useSubscription();

  const checkItemLimit = (): boolean => {
    if (isLoading || !usageLimits) return false;
    
    if (!usageLimits.canAddItem) {
      setUpgradeModal({ isOpen: true, reason: 'items' });
      return false;
    }
    return true;
  };

  const checkDocumentLimit = async (itemId: string): Promise<boolean> => {
    if (isLoading || !usageLimits) return false;
    
    const canAdd = await usageLimits.canAddDocument(itemId);
    if (!canAdd) {
      setUpgradeModal({ isOpen: true, reason: 'documents' });
      return false;
    }
    return true;
  };

  const checkTaskLimit = async (itemId: string): Promise<boolean> => {
    if (isLoading || !usageLimits) return false;
    
    const canAdd = await usageLimits.canAddTask(itemId);
    if (!canAdd) {
      setUpgradeModal({ isOpen: true, reason: 'tasks' });
      return false;
    }
    return true;
  };

  const closeUpgradeModal = () => {
    setUpgradeModal({ isOpen: false });
  };

  const UpgradeModalComponent = () => (
    <UpgradeModal
      isOpen={upgradeModal.isOpen}
      onClose={closeUpgradeModal}
      reason={upgradeModal.reason}
    />
  );

  return {
    checkItemLimit,
    checkDocumentLimit,
    checkTaskLimit,
    UpgradeModalComponent,
    usageLimits,
    isLoading,
  };
};