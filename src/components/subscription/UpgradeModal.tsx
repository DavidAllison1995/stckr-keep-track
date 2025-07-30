import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Heart, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'items' | 'documents' | 'tasks';
}

export const UpgradeModal = ({ isOpen, onClose, reason }: UpgradeModalProps) => {
  const { toast } = useToast();

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: {}
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        onClose();
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: 'Error',
        description: 'Failed to start upgrade process. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getReasonText = () => {
    switch (reason) {
      case 'items':
        return "You've reached your limit of 3 items on the free plan.";
      case 'documents':
        return "You've reached your limit of 1 document per item on the free plan.";
      case 'tasks':
        return "You've reached your limit of 2 active tasks per item on the free plan.";
      default:
        return "You've reached the limits of the free plan.";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            You're almost there!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center space-y-3">
            <p className="text-muted-foreground">
              {getReasonText()}
            </p>
            
            <p className="text-sm text-muted-foreground">
              We're a small independent team building Stckr to help people stay on top of life's important stuff — and we're so glad you're here.
            </p>
            
            <p className="font-medium">
              Want to unlock unlimited items, tasks, and uploads? Upgrade to Stckr Premium and support the future of the app 
              <Heart className="inline w-4 h-4 ml-1 text-purple-500" />
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">Unlimited item tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">Unlimited tasks & documents</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">Helps support future improvements</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleUpgrade} 
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium"
              size="lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade for £2.49/month
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Keep using free plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};