import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap, Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const PremiumPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: 'premium-monthly' }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
            Upgrade to Stckr Premium
          </h1>
          <p className="text-xl text-muted-foreground">
            More control, less clutter — and you're helping us grow
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                The free version is perfect for getting started. But if you're managing more than a few items — or just want to support a growing indie tool — upgrading to Premium unlocks everything.
              </p>

              <div className="space-y-4">
                <p className="font-semibold text-lg mb-4">
                  For just £2.49/month, you'll get:
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium">Unlimited items</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium">Unlimited active maintenance tasks</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium">Unlimited document uploads</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium">Priority access to new features</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-center text-muted-foreground">
                  No pressure — but your support helps us keep building, fixing, and improving 
                  <Heart className="inline w-4 h-4 ml-1 text-yellow-500" />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button 
            onClick={handleUpgrade}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-8 py-3 text-lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Go Premium – £2.49/month
          </Button>
        </div>
      </div>
    </div>
  );
};