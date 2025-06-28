
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink,
  Copy,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const WebhookDiagnostics = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const webhookUrl = 'https://cudftlquaydissmvqjmv.supabase.co/functions/v1/stripe-webhook';
  
  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: 'Copied!',
      description: 'Webhook URL copied to clipboard',
    });
  };

  const testWebhook = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 TESTING WEBHOOK ENDPOINT via Supabase...');
      
      // Test the webhook by invoking it through Supabase functions
      // This simulates a basic webhook call to check if the function responds
      const { data, error } = await supabase.functions.invoke('stripe-webhook', {
        body: {
          type: 'test_event',
          data: {
            object: {
              id: 'test_session_123',
              payment_status: 'paid',
              metadata: {
                user_id: 'test_user',
                user_email: 'test@example.com',
                items: JSON.stringify([])
              }
            }
          }
        }
      });
      
      console.log('📡 WEBHOOK TEST RESPONSE:', { data, error });
      
      if (error) {
        console.error('❌ WEBHOOK TEST ERROR:', error);
        toast({
          title: 'Webhook Test Failed',
          description: `Error: ${error.message}`,
          variant: 'destructive',
        });
      } else {
        console.log('✅ WEBHOOK TEST SUCCESS:', data);
        toast({
          title: 'Webhook Endpoint Active ✅',
          description: 'The webhook endpoint is responding correctly',
        });
      }
    } catch (error) {
      console.error('❌ WEBHOOK TEST EXCEPTION:', error);
      toast({
        title: 'Webhook Test Failed',
        description: 'Failed to test webhook endpoint',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Stripe Webhook Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Step 1:</strong> Configure your Stripe webhook to point to the URL below
            </AlertDescription>
          </Alert>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Webhook URL:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={copyWebhookUrl}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            </div>
            <code className="text-sm break-all bg-white p-2 rounded border">
              {webhookUrl}
            </code>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Step 2:</strong> In your Stripe dashboard, ensure the webhook listens for: <Badge variant="outline">checkout.session.completed</Badge>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Step 3:</strong> Make sure you've added your <code>STRIPE_WEBHOOK_SECRET</code> to the Supabase Edge Function secrets
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-4">
            <Button
              onClick={testWebhook}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Test Webhook
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open('https://dashboard.stripe.com/webhooks', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Stripe Dashboard
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Webhook Configuration Checklist:</h4>
            <ul className="text-sm space-y-1">
              <li>✅ Endpoint URL: {webhookUrl}</li>
              <li>✅ Event: checkout.session.completed</li>
              <li>✅ HTTP Method: POST</li>
              <li>✅ Content-Type: application/json</li>
              <li>✅ Webhook Secret: Added to Supabase secrets</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Troubleshooting Tips:</h4>
            <ul className="text-sm space-y-1">
              <li>• Check that your webhook URL exactly matches the one above</li>
              <li>• Ensure "checkout.session.completed" event is selected</li>
              <li>• Verify your webhook signing secret is correctly added to Supabase</li>
              <li>• Check the Stripe webhook logs for delivery attempts</li>
              <li>• Test with a real order to see if webhook triggers properly</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookDiagnostics;
