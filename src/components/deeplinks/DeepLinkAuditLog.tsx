
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw, Plus, TestTube } from 'lucide-react';

const DeepLinkAuditLog = () => {
  // Mock audit log data
  const auditLogs = [
    {
      id: '1',
      timestamp: new Date('2025-06-19T14:30:00Z'),
      action: 'Token Created',
      itemName: 'Living Room TV',
      token: 'B12F4',
      status: 'success',
      details: 'New QR code generated for item'
    },
    {
      id: '2',
      timestamp: new Date('2025-06-19T13:15:00Z'),
      action: 'Deep Link Test',
      itemName: 'Kitchen Fridge',
      token: 'BA56C',
      status: 'success',
      details: 'Universal link and custom scheme both working'
    },
    {
      id: '3',
      timestamp: new Date('2025-06-19T12:45:00Z'),
      action: 'Token Regenerated',
      itemName: 'Washing Machine',
      token: 'B789D',
      status: 'success',
      details: 'Token rotated due to security policy'
    },
    {
      id: '4',
      timestamp: new Date('2025-06-19T11:20:00Z'),
      action: 'Deep Link Test',
      itemName: 'Office Chair',
      token: 'B234E',
      status: 'failed',
      details: 'Missing apple-app-site-association file'
    },
    {
      id: '5',
      timestamp: new Date('2025-06-19T10:00:00Z'),
      action: 'AASA Updated',
      itemName: null,
      token: null,
      status: 'success',
      details: 'Apple App Site Association file uploaded to CDN'
    }
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Token Created':
        return <Plus className="w-4 h-4" />;
      case 'Token Regenerated':
        return <RotateCcw className="w-4 h-4" />;
      case 'Deep Link Test':
        return <TestTube className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Token</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-sm">
                {log.timestamp.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getActionIcon(log.action)}
                  <span className="text-sm font-medium">{log.action}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {log.itemName || '-'}
              </TableCell>
              <TableCell>
                {log.token ? (
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {log.token}
                  </code>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <Badge variant={log.status === 'success' ? "default" : "destructive"}>
                  {log.status === 'success' ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Success
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Failed
                    </>
                  )}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {log.details}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DeepLinkAuditLog;
