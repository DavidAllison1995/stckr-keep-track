
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ConnectedAccounts } from '@/types/settings';

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

  useEffect(() => {
    const savedAccounts = localStorage.getItem('connectedAccounts');
    if (savedAccounts) {
      try {
        setAccounts(JSON.parse(savedAccounts));
      } catch (error) {
        console.error('Failed to parse connected accounts:', error);
      }
    }
  }, []);

  const handleToggleAccount = async (provider: 'google' | 'apple', connect: boolean) => {
    setIsLoading(true);
    
    try {
      // Simulate OAuth flow or disconnection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedAccounts = { ...accounts, [provider]: connect };
      setAccounts(updatedAccounts);
      localStorage.setItem('connectedAccounts', JSON.stringify(updatedAccounts));
      
      toast({
        title: 'Success',
        description: `${provider} account ${connect ? 'connected' : 'disconnected'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${connect ? 'connect' : 'disconnect'} ${provider} account`,
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
