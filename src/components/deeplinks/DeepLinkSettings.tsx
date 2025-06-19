
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Download, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DeepLinkSettings = () => {
  const [settings, setSettings] = useState({
    universalLinkDomain: 'stckr.io',
    customScheme: 'upkeep',
    tokenTTL: '6', // months
    autoRotate: false
  });
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Deep link settings have been updated successfully",
    });
  };

  const downloadAASA = () => {
    const aasa = {
      applinks: {
        apps: [],
        details: [
          {
            appID: "TEAMID.com.yourapp.upkeep",
            paths: ["/qr/*"]
          }
        ]
      }
    };

    const blob = new Blob([JSON.stringify(aasa, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apple-app-site-association';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAssetLinks = () => {
    const assetLinks = [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.yourapp.upkeep",
          sha256_cert_fingerprints: ["XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX"]
        }
      }
    ];

    const blob = new Blob([JSON.stringify(assetLinks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assetlinks.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Domain Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Universal Link Domain</Label>
            <Input
              id="domain"
              value={settings.universalLinkDomain}
              onChange={(e) => setSettings({ ...settings, universalLinkDomain: e.target.value })}
              placeholder="stckr.io"
            />
            <p className="text-sm text-gray-600">
              The domain where your QR codes will redirect (e.g., stckr.io)
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadAASA}>
              <Download className="w-4 h-4 mr-2" />
              Download AASA
            </Button>
            <Button variant="outline" onClick={downloadAssetLinks}>
              <Download className="w-4 h-4 mr-2" />
              Download AssetLinks
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Scheme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scheme">iOS URL Scheme</Label>
            <Input
              id="scheme"
              value={settings.customScheme}
              onChange={(e) => setSettings({ ...settings, customScheme: e.target.value })}
              placeholder="upkeep"
            />
            <p className="text-sm text-gray-600">
              Custom URL scheme for your app (e.g., upkeep://item/123)
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Android Intent Filter</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
{`<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="${settings.customScheme}" />
</intent-filter>`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>TTL & Rotation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ttl">Token Expiry</Label>
            <Select
              value={settings.tokenTTL}
              onValueChange={(value) => setSettings({ ...settings, tokenTTL: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="never">Never expire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Bulk Actions</h4>
            <div className="flex gap-2">
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate All Tokens
              </Button>
              <Button variant="outline">
                Bulk Disable Links
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default DeepLinkSettings;
