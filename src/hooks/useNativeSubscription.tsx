import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases, CustomerInfo, PurchasesOffering } from '@revenuecat/purchases-capacitor';
import { useSupabaseAuth } from './useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useNativeSubscription = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOffering[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    initializePurchases();
  }, [user]);

  const initializePurchases = async () => {
    if (!Capacitor.isNativePlatform() || !user) return;

    try {
      // Initialize RevenueCat with your API keys
      const apiKey = Capacitor.getPlatform() === 'ios' 
        ? 'appl_YOUR_IOS_API_KEY' // Replace with your actual iOS API key
        : 'goog_YOUR_ANDROID_API_KEY'; // Replace with your actual Android API key

      await Purchases.configure({
        apiKey,
        appUserID: user.id,
      });

      // Get current customer info
      const { customerInfo: info } = await Purchases.getCustomerInfo();
      setCustomerInfo(info);

      // Get available offerings
      const currentOfferings = await Purchases.getOfferings();
      if (currentOfferings.current) {
        setOfferings([currentOfferings.current]);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing purchases:', error);
    }
  };

  const purchaseSubscription = async (packageId: string) => {
    if (!isInitialized) {
      toast.error('Purchases not initialized');
      return false;
    }

    setIsLoading(true);
    try {
      const offering = offerings[0];
      const packageToPurchase = offering?.availablePackages.find(
        pkg => pkg.identifier === packageId
      );

      if (!packageToPurchase) {
        toast.error('Package not found');
        return false;
      }

      const { customerInfo } = await Purchases.purchasePackage({
        aPackage: packageToPurchase,
      });

      if (customerInfo.entitlements.active['premium']) {
        // Sync with backend
        await syncNativeSubscription(customerInfo);
        toast.success('Successfully subscribed to Premium!');
        return true;
      }

      return false;
    } catch (error: any) {
      if (error.userCancelled) {
        toast.info('Purchase cancelled');
      } else {
        toast.error('Purchase failed');
        console.error('Purchase error:', error);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    if (!isInitialized) return;

    setIsLoading(true);
    try {
      const { customerInfo: restoredInfo } = await Purchases.restorePurchases();
      setCustomerInfo(restoredInfo);
      
      if (restoredInfo.entitlements.active['premium']) {
        await syncNativeSubscription(restoredInfo);
        toast.success('Premium subscription restored!');
      }
    } catch (error) {
      toast.error('Failed to restore purchases');
      console.error('Restore error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncNativeSubscription = async (customerInfo: CustomerInfo) => {
    if (!user) return;

    try {
      const premiumEntitlement = customerInfo.entitlements.active['premium'];
      const isActive = !!premiumEntitlement;
      
      await supabase.functions.invoke('sync-native-subscription', {
        body: {
          user_id: user.id,
          is_premium: isActive,
          platform: Capacitor.getPlatform(),
          original_transaction_id: premiumEntitlement?.originalPurchaseDate,
          expires_date: premiumEntitlement?.expirationDate,
        }
      });
    } catch (error) {
      console.error('Error syncing subscription:', error);
    }
  };

  const isPremium = () => {
    return customerInfo?.entitlements.active['premium'] !== undefined;
  };

  return {
    isNativePlatform: Capacitor.isNativePlatform(),
    isInitialized,
    offerings,
    customerInfo,
    isLoading,
    isPremium: isPremium(),
    purchaseSubscription,
    restorePurchases,
  };
};