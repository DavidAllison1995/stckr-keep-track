
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings } from 'lucide-react';
import DeepLinksTable from '@/components/deeplinks/DeepLinksTable';
import DeepLinkSettings from '@/components/deeplinks/DeepLinkSettings';
import CreateDeepLinkModal from '@/components/deeplinks/CreateDeepLinkModal';
import DeepLinkAuditLog from '@/components/deeplinks/DeepLinkAuditLog';

const DeepLinksPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('links');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Deep Links Management</h1>
          <p className="text-gray-600 mt-1">
            Manage QR codes, test deep links, and configure universal link settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Deep Link
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="links">Deep Links</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Deep Links</CardTitle>
            </CardHeader>
            <CardContent>
              <DeepLinksTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <DeepLinkSettings />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <DeepLinkAuditLog />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateDeepLinkModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default DeepLinksPage;
