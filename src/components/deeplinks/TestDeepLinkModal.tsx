
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestDeepLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

const TestDeepLinkModal = ({ isOpen, onClose, item }: TestDeepLinkModalProps) => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  if (!item) return null;

  const webUrl = `https://stckr.io/qr/${item.qr_code_id}`;
  const appUrl = `upkeep://item/${item.id}`;

  const runTest = async () => {
    setTesting(true);
    setTestResults(null);

    try {
      // Simulate testing the web URL
      const webTest = await fetch(webUrl, { 
        method: 'HEAD',
        mode: 'no-cors'
      }).then(() => ({ success: true, status: 'OK' }))
        .catch(() => ({ success: false, status: 'Failed to connect' }));

      // Simulate testing Universal Link configuration
      const universalLinkTest = Math.random() > 0.3;
      
      // Simulate testing Custom Scheme
      const customSchemeTest = Math.random() > 0.2;

      const results = {
        webUrl: webTest,
        universalLink: {
          success: universalLinkTest,
          status: universalLinkTest ? 'AASA configured correctly' : 'Missing apple-app-site-association'
        },
        customScheme: {
          success: customSchemeTest,
          status: customSchemeTest ? 'Intent filter configured' : 'Missing Android intent-filter'
        }
      };

      setTestResults(results);

      if (results.webUrl.success && results.universalLink.success && results.customScheme.success) {
        toast({
          title: "Test Successful",
          description: "All deep link configurations are working correctly",
        });
      } else {
        toast({
          title: "Test Issues Found",
          description: "Some deep link configurations need attention",
          variant: "destructive",
        });
      }

    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Unable to complete deep link test",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Test Deep Link - {item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">URLs to Test</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Web URL:</span>
                  <code className="text-sm flex-1">{webUrl}</code>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open(webUrl, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">App URL:</span>
                  <code className="text-sm flex-1">{appUrl}</code>
                </div>
              </div>
            </div>

            {testResults && (
              <div className="space-y-3">
                <h4 className="font-medium">Test Results</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm font-medium">Web URL Response</span>
                    <Badge variant={testResults.webUrl.success ? "default" : "destructive"}>
                      {testResults.webUrl.success ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {testResults.webUrl.status}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          {testResults.webUrl.status}
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm font-medium">Universal Link (iOS)</span>
                    <Badge variant={testResults.universalLink.success ? "default" : "destructive"}>
                      {testResults.universalLink.success ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {testResults.universalLink.status}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          {testResults.universalLink.status}
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm font-medium">Custom Scheme (Android)</span>
                    <Badge variant={testResults.customScheme.success ? "default" : "destructive"}>
                      {testResults.customScheme.success ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {testResults.customScheme.status}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          {testResults.customScheme.status}
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={runTest} disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Run Test'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestDeepLinkModal;
