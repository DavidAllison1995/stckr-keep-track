
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';

const QRRedirectPage = () => {
  const { codeId } = useParams<{ codeId: string }>();
  const navigate = useNavigate();
  const { items } = useSupabaseItems();
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!codeId) {
      navigate('/');
      return;
    }

    // If still loading auth state, wait
    if (isLoading) {
      return;
    }

    // If user is not authenticated, redirect to auth with the code
    if (!isAuthenticated) {
      navigate(`/auth?redirect=/${encodeURIComponent(codeId)}`);
      return;
    }

    // Check if this QR code is already assigned to an item
    const existingItem = items.find(item => item.qr_code_id === codeId);
    
    if (existingItem) {
      // Navigate to the existing item
      navigate(`/items/${existingItem.id}`);
      toast({
        title: "Item Found",
        description: `QR code is assigned to "${existingItem.name}"`,
      });
    } else {
      // QR code not assigned, go to scanner to handle assignment
      navigate('/scanner', { state: { scannedCode: codeId } });
    }
  }, [codeId, items, navigate, toast, isAuthenticated, isLoading]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <span className="ml-3">
        {isLoading ? 'Loading...' : 'Processing QR code...'}
      </span>
    </div>
  );
};

export default QRRedirectPage;
