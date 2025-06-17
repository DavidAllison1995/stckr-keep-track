
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const QRScanner = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
        <p className="text-gray-600">Scan QR codes to quickly access your items</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">QR Scanner</h3>
            <p className="text-gray-600 mb-6">Camera functionality will be available when deployed</p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Open Camera
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">How it works:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Scan any QR code sticker</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Assign it to one of your items</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Quick access to item details anytime</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;
