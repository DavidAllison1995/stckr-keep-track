
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
      console.log('🧪 TESTING WEBHOOK ENDPOINT...');
      
      // Test if the webhook endpoint is reachable
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true }),
      });
      
      console.log('📡 WEBHOOK TEST RESPONSE:', response.status);
      
      if (response.status === 200 || response.status === 400) {
        toast({
          title: 'Webhook Endpoint Active ✅',
          description: 'The webhook endpoint is responding correctly',
        });
      } else {
        toast({
          title: 'Webhook Test Failed',
          description: `Unexpected response: ${response.status}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ WEBHOOK TEST ERROR:', error);
      toast({
        title: 'Webhook Test Failed',
        description: 'Failed to reach webhook endpoint',
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
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookDiagnostics;
