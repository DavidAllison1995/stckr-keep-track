import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: {
    max_items: number;
    max_documents_per_item: number;
    max_active_tasks_per_item: number;
  };
}

export interface UserSubscription {
  plan_name: string;
  features: {
    max_items: number;
    max_documents_per_item: number;
    max_active_tasks_per_item: number;
  };
  status: string;
  current_period_end: string | null;
}

export interface UsageLimits {
  canAddItem: boolean;
  canAddDocument: (itemId: string) => Promise<boolean>;
  canAddTask: (itemId: string) => Promise<boolean>;
  itemsCount: number;
  maxItems: number;
  isPremium: boolean;
}

export const useSubscription = () => {
  const { user } = useSupabaseAuth();

  // Fetch user's current subscription
  const { data: subscription, isLoading: subscriptionLoading, refetch: refetchSubscription } = useQuery({
    queryKey: ['user-subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase.rpc('get_user_subscription', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error fetching subscription:', error);
        throw error;
      }

      return data?.[0] as UserSubscription || null;
    },
    enabled: !!user,
  });

  // Fetch all available plans
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      return data.map(plan => ({
        ...plan,
        features: plan.features as any
      })) as SubscriptionPlan[];
    },
  });

  // Check usage limits
  const { data: usageLimits, refetch: refetchUsage } = useQuery({
    queryKey: ['usage-limits', user?.id, subscription?.plan_name],
    queryFn: async (): Promise<UsageLimits> => {
      if (!user || !subscription) {
        return {
          canAddItem: false,
          canAddDocument: async () => false,
          canAddTask: async () => false,
          itemsCount: 0,
          maxItems: 0,
          isPremium: false,
        };
      }

      const features = subscription.features;
      const isPremium = subscription.plan_name === 'Premium';

      // Get current items count
      const { count: itemsCount } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const canAddItem = isPremium || (itemsCount || 0) < features.max_items;

      const canAddDocument = async (itemId: string) => {
        if (isPremium) return true;
        
        const { data: item } = await supabase
          .from('items')
          .select('documents')
          .eq('id', itemId)
          .eq('user_id', user.id)
          .single();

        const documentsCount = Array.isArray(item?.documents) ? item.documents.length : 0;
        return documentsCount < features.max_documents_per_item;
      };

      const canAddTask = async (itemId: string) => {
        if (isPremium) return true;

        const { count: activeTasksCount } = await supabase
          .from('maintenance_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('item_id', itemId)
          .not('status', 'eq', 'completed');

        return (activeTasksCount || 0) < features.max_active_tasks_per_item;
      };

      return {
        canAddItem,
        canAddDocument,
        canAddTask,
        itemsCount: itemsCount || 0,
        maxItems: features.max_items,
        isPremium,
      };
    },
    enabled: !!user && !!subscription,
  });

  const isLoading = subscriptionLoading || plansLoading;

  return {
    subscription,
    plans,
    usageLimits,
    isLoading,
    refetchSubscription,
    refetchUsage,
    isPremium: subscription?.plan_name === 'Premium',
  };
};