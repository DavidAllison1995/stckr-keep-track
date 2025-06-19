
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, TestTube, RotateCcw, ExternalLink } from 'lucide-react';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useToast } from '@/hooks/use-toast';
import TestDeepLinkModal from './TestDeepLinkModal';
import RegenerateTokenModal from './RegenerateTokenModal';

const DeepLinksTable = () => {
  const { items, isLoading } = useSupabaseItems();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState(null);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [regenModalOpen, setRegenModalOpen] = useState(false);

  const qrItems = items.filter(item => item.qr_code_id);

  const getShortCode = (qrCodeId: string) => {
    return `B${qrCodeId.slice(-4).toUpperCase()}`;
  };

  const getWebUrl = (qrCodeId: string) => {
    return `https://stckr.io/qr/${qrCodeId}`;
  };

  const getAppUrl = (itemId: string) => {
    return `upkeep://item/${itemId}`;
  };

  const handleTest = (item: any) => {
    setSelectedItem(item);
    setTestModalOpen(true);
  };

  const handleRegenerate = (item: any) => {
    setSelectedItem(item);
    setRegenModalOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading deep links...</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>QR Code Token</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Web URL</TableHead>
              <TableHead>App URL</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Last Tested</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {qrItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No QR codes found. Create your first deep link to get started.
                </TableCell>
              </TableRow>
            ) : (
              qrItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">
                    {getShortCode(item.qr_code_id)}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 truncate max-w-[200px]">
                        {getWebUrl(item.qr_code_id)}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(getWebUrl(item.qr_code_id), '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 font-mono">
                      {getAppUrl(item.id)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={Math.random() > 0.3 ? "default" : "destructive"}>
                      {Math.random() > 0.3 ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(item.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(item)}
                      >
                        <TestTube className="w-3 h-3 mr-1" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerate(item)}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Regen
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TestDeepLinkModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        item={selectedItem}
      />

      <RegenerateTokenModal
        isOpen={regenModalOpen}
        onClose={() => setRegenModalOpen(false)}
        item={selectedItem}
      />
    </>
  );
};

export default DeepLinksTable;
