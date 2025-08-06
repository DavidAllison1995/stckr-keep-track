import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { checkAndRequestCameraPermissions, testCameraAvailability } from '@/utils/cameraPermissions';
import { Camera as CameraIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const CameraDebugger = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    clearResults();

    // Platform check
    const platform = Capacitor.getPlatform();
    const isNative = Capacitor.isNativePlatform();
    
    addResult({
      test: 'Platform Detection',
      status: 'success',
      message: `Platform: ${platform}, Native: ${isNative}`,
      details: { platform, isNative }
    });

    if (!isNative) {
      addResult({
        test: 'Camera Support',
        status: 'warning',
        message: 'Running on web platform - native camera features not available'
      });
      setIsRunning(false);
      return;
    }

    // Check if Camera plugin is available
    try {
      const capabilities = await Camera.checkPermissions();
      addResult({
        test: 'Camera Plugin',
        status: 'success',
        message: 'Camera plugin is available',
        details: capabilities
      });
    } catch (error) {
      addResult({
        test: 'Camera Plugin',
        status: 'error',
        message: 'Camera plugin not available',
        details: error
      });
      setIsRunning(false);
      return;
    }

    // Test permission handling
    try {
      const permissionResult = await checkAndRequestCameraPermissions();
      addResult({
        test: 'Permission Check',
        status: permissionResult.granted ? 'success' : 'error',
        message: permissionResult.message || (permissionResult.granted ? 'Permissions granted' : 'Permissions denied'),
        details: permissionResult
      });
    } catch (error) {
      addResult({
        test: 'Permission Check',
        status: 'error',
        message: 'Permission check failed',
        details: error
      });
    }

    // Test camera availability
    try {
      const availabilityResult = await testCameraAvailability();
      addResult({
        test: 'Camera Availability',
        status: availabilityResult.granted ? 'success' : 'error',
        message: availabilityResult.message || 'Camera availability test completed',
        details: availabilityResult
      });
    } catch (error) {
      addResult({
        test: 'Camera Availability',
        status: 'error',
        message: 'Camera availability test failed',
        details: error
      });
    }

    // Test actual camera access (minimal test)
    try {
      const testResult = await Camera.getPhoto({
        quality: 50,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: false,
        // Use prompt to avoid actually opening camera
        promptLabelHeader: 'Test Camera Access',
        promptLabelCancel: 'Cancel Test',
        promptLabelPhoto: 'Skip Test',
        promptLabelPicture: 'Test Camera'
      });
      
      addResult({
        test: 'Camera Access Test',
        status: 'success',
        message: 'Camera access successful',
        details: { hasImage: !!testResult.webPath }
      });
    } catch (error: any) {
      // User cancellation is expected for this test
      if (error.message && (error.message.includes('cancelled') || error.message.includes('canceled'))) {
        addResult({
          test: 'Camera Access Test',
          status: 'success',
          message: 'Camera prompt shown successfully (user cancelled test)'
        });
      } else {
        addResult({
          test: 'Camera Access Test',
          status: 'error',
          message: 'Camera access failed',
          details: error
        });
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CameraIcon className="w-5 h-5" />
            Camera Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runDiagnostics} disabled={isRunning}>
              {isRunning ? 'Running Diagnostics...' : 'Run Camera Diagnostics'}
            </Button>
            <Button onClick={clearResults} variant="outline" disabled={isRunning || results.length === 0}>
              Clear Results
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Diagnostic Results:</h3>
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.test}</span>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">Show details</summary>
                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraDebugger;