import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const DataManagement = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  const { logout } = useSupabaseAuth();

  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get all user data from localStorage
      const userData = {
        user: JSON.parse(localStorage.getItem('user') || '{}'),
        items: JSON.parse(localStorage.getItem('items') || '[]'),
        maintenanceTasks: JSON.parse(localStorage.getItem('maintenanceTasks') || '[]'),
        settings: JSON.parse(localStorage.getItem('userSettings') || '{}'),
        connectedAccounts: JSON.parse(localStorage.getItem('connectedAccounts') || '{}'),
        exportDate: new Date().toISOString(),
      };
      
      // Create and download file
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `home-maintenance-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Complete',
        description: 'Your data has been downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export your data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetData = async () => {
    setIsResetting(true);
    
    try {
      // Simulate data reset
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear all data except user login
      const user = localStorage.getItem('user');
      localStorage.clear();
      if (user) {
        localStorage.setItem('user', user);
      }
      
      toast({
        title: 'Data Reset Complete',
        description: 'All app data has been cleared',
      });
      
      setIsResetDialogOpen(false);
      
      // Refresh the page to reset state
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Reset Failed',
        description: 'Failed to reset app data',
        variant: 'destructive',
      });
      setIsResetting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">Export Your Data</div>
              <div className="text-sm text-gray-600">
                Download all your items, tasks, and settings
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div>
              <div className="font-medium text-red-900">Reset App Data</div>
              <div className="text-sm text-red-600">
                Clear all items, tasks, and settings (keeps login)
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsResetDialogOpen(true)}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Reset App Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will permanently delete all your items, maintenance tasks, and settings. 
              Your account will remain active but all data will be lost.
            </p>
            <p className="text-sm font-medium">
              This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsResetDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleResetData}
                disabled={isResetting}
                className="flex-1"
              >
                {isResetting ? 'Resetting...' : 'Reset Data'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataManagement;
