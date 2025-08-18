import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAdminQR } from '@/hooks/useAdminQR';

const QRCodeManager = () => {
  const { codes, isLoading, deleteCode, deleteAllCodes } = useAdminQR();
  const [deletingCodes, setDeletingCodes] = useState<Set<string>>(new Set());
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleDeleteCode = async (codeId: string) => {
    setDeletingCodes(prev => new Set(prev).add(codeId));
    await deleteCode(codeId);
    setDeletingCodes(prev => {
      const newSet = new Set(prev);
      newSet.delete(codeId);
      return newSet;
    });
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    await deleteAllCodes();
    setIsDeletingAll(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">Loading QR codes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>All QR Codes ({codes.length})</CardTitle>
          {codes.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isDeletingAll}
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeletingAll ? 'Deleting All...' : 'Delete All QR Codes'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Delete All QR Codes
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete all {codes.length} QR codes? This action cannot be undone.
                    <br /><br />
                    This will also delete:
                    <ul className="mt-2 list-disc list-inside text-sm">
                      <li>All user claims associated with these codes</li>
                      <li>All scan history records</li>
                      <li>All generated QR code images</li>
                    </ul>
                    <br />
                    <strong>This action is permanent and cannot be reversed.</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAll}
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={isDeletingAll}
                  >
                    {isDeletingAll ? 'Deleting...' : 'Delete All QR Codes'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {codes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No QR codes found. Generate some codes to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border border-border p-3 text-left">Code ID</th>
                  <th className="border border-border p-3 text-left">Pack</th>
                  <th className="border border-border p-3 text-left">Status</th>
                  <th className="border border-border p-3 text-left">Deep Link</th>
                  <th className="border border-border p-3 text-left">Created</th>
                  <th className="border border-border p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-muted/20">
                    <td className="border border-border p-3 font-mono text-sm">
                      {code.code}
                    </td>
                    <td className="border border-border p-3">
                      {code.pack ? (
                        <Badge variant="secondary">{code.pack.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">No pack</span>
                      )}
                    </td>
                    <td className="border border-border p-3">
                      <Badge variant={code.is_active ? "default" : "secondary"}>
                        {code.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="border border-border p-3">
                      <a
                        href={`https://stckr.io/qr/${code.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline text-sm"
                      >
                        stckr.io/qr/{code.code}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="border border-border p-3 text-sm text-muted-foreground">
                      {new Date(code.created_at).toLocaleDateString()}
                    </td>
                    <td className="border border-border p-3 text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deletingCodes.has(code.id)}
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete QR Code</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete QR code "{code.code}"? 
                              This will also remove all user assignments and scan history.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCode(code.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeManager;