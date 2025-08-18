import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, TestTube } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';
import QRPackManager from '@/components/admin/QRPackManager';
import QRCodeManager from '@/components/admin/QRCodeManager';
import { QRAssignmentTest } from '@/components/admin/QRAssignmentTest';

const AdminQrPage = () => {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <QrCode className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">QR Code Management Portal</h1>
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generate">Generate QR Codes</TabsTrigger>
            <TabsTrigger value="packs">Manage Packs</TabsTrigger>
            <TabsTrigger value="all-codes">All QR Codes</TabsTrigger>
            <TabsTrigger value="test">Test QR Assignment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-6">
            <QRCodeGenerator />
          </TabsContent>
          
          <TabsContent value="packs" className="space-y-6">
            <QRPackManager />
          </TabsContent>
          
          <TabsContent value="all-codes" className="space-y-6">
            <QRCodeManager />
          </TabsContent>
          
          <TabsContent value="test" className="space-y-6">
            <div className="bg-card text-card-foreground rounded-lg border p-6">
              <div className="flex items-center gap-2 mb-4">
                <TestTube className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">QR Assignment Testing</h2>
              </div>
              <QRAssignmentTest />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminQrPage;