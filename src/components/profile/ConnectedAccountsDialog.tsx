
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ConnectedAccounts } from '@/types/settings';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';

interface ConnectedAccountsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ConnectedAccountsDialog = ({ open, onOpenChange }: ConnectedAccountsDialogProps) => {
  const [accounts, setAccounts] = useState<ConnectedAccounts>({
    google: false,
    apple: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (user) {
      // Check which OAuth providers are linked to the user's account
      const identities = user.identities || [];
      const googleConnected = identities.some(identity => identity.provider === 'google');
      const appleConnected = identities.some(identity => identity.provider === 'apple');
      
      setAccounts({
        google: googleConnected,
        apple: appleConnected,
      });
    }
  }, [user]);

  const handleToggleAccount = async (provider: 'google' | 'apple', connect: boolean) => {
    setIsLoading(true);
    
    try {
      if (connect) {
        // Link OAuth provider
        const { error } = await supabase.auth.linkIdentity({
          provider: provider,
        });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: 'Success',
          description: `${provider} account connected successfully`,
        });
      } else {
        // Unlink OAuth provider
        const identity = user?.identities?.find(id => id.provider === provider);
        if (identity) {
          const { error } = await supabase.auth.unlinkIdentity(identity);
          
          if (error) {
            throw error;
          }
          
          toast({
            title: 'Success',
            description: `${provider} account disconnected successfully`,
          });
        }
      }
      
      // Update local state
      setAccounts(prev => ({ ...prev, [provider]: connect }));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${connect ? 'connect' : 'disconnect'} ${provider} account`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connected Accounts</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Google Account</Label>
              <p className="text-sm text-muted-foreground">
                Connect your Google account for easier sign-in
              </p>
            </div>
            <Switch
              checked={accounts.google || false}
              onCheckedChange={(checked) => handleToggleAccount('google', checked)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Apple Account</Label>
              <p className="text-sm text-muted-foreground">
                Connect your Apple ID for easier sign-in
              </p>
            </div>
            <Switch
              checked={accounts.apple || false}
              onCheckedChange={(checked) => handleToggleAccount('apple', checked)}
              disabled={isLoading}
            />
          </div>
          
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectedAccountsDialog;
