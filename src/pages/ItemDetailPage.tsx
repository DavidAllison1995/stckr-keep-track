
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import ItemDetail from '@/components/items/ItemDetail';

const ItemDetailPage = () => {
  console.log('ItemDetailPage rendering');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  console.log('About to call useSupabaseItems');
  const { getItemById } = useSupabaseItems();
  console.log('useSupabaseItems call successful');

  const item = id ? getItemById(id) : null;
  const defaultTab = searchParams.get('tab') || 'details';
  const highlightTaskId = searchParams.get('highlight') || undefined;

  const handleClose = () => {
    navigate('/items');
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="px-4 pt-4 pb-20">
          <div className="bg-white rounded-t-3xl shadow-lg min-h-screen">
            <div className="p-6 pb-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Item not found</h1>
                <button 
                  onClick={() => navigate('/items')}
                  className="text-blue-600 hover:underline"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="px-4 pt-4 pb-20">
        <div className="bg-white rounded-t-3xl shadow-lg min-h-screen">
          <div className="p-6 pb-8">
            <ItemDetail 
              item={item} 
              onClose={handleClose}
              defaultTab={defaultTab}
              highlightTaskId={highlightTaskId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;
