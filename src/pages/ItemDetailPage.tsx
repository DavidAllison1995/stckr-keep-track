
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import ItemDetail from '@/components/items/ItemDetail';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ProtectedLayout from '@/components/layouts/ProtectedLayout';

const ItemDetailPage = () => {
  console.log('ItemDetailPage rendering');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useSupabaseAuth();
  
  console.log('ItemDetailPage - ID from params:', id);
  console.log('ItemDetailPage - Search params:', searchParams.toString());
  
  const { getItemById } = useSupabaseItems();
  const item = id ? getItemById(id) : null;
  const defaultTab = searchParams.get('tab') || 'details';
  const highlightTaskId = searchParams.get('highlight') || undefined;

  console.log('ItemDetailPage - Item found:', item?.name, 'Default tab:', defaultTab, 'Highlight task:', highlightTaskId);

  const handleClose = () => {
    navigate('/items');
  };

  if (!item) {
    console.log('ItemDetailPage - No item found, showing not found message');
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="px-4 pt-4 pb-20">
          <div className="bg-gray-900 rounded-t-3xl shadow-xl border border-gray-800 min-h-screen">
            <div className="p-6 pb-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4 text-white">Item not found</h1>
                <button 
                  onClick={() => navigate('/items')}
                  className="text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                >
                  ← Back to Items
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('ItemDetailPage - Rendering ItemDetail component');

  // Check if user is authenticated, if not use public view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="px-4 pt-4 pb-20">
          <div className="bg-gray-900 rounded-t-3xl shadow-xl border border-gray-800 min-h-screen">
            <div className="p-6 pb-8">
              {item ? (
                <ItemDetail 
                  item={item} 
                  onClose={handleClose}
                  defaultTab={defaultTab}
                  highlightTaskId={highlightTaskId}
                />
              ) : (
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4 text-white">Item not found</h1>
                  <button 
                    onClick={() => navigate('/')}
                    className="text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                  >
                    ← Back to Home
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <ProtectedLayout>
        <ItemDetail 
          item={item} 
          onClose={handleClose}
          defaultTab={defaultTab}
          highlightTaskId={highlightTaskId}
        />
      </ProtectedLayout>
    </ProtectedRoute>
  );
};

export default ItemDetailPage;
