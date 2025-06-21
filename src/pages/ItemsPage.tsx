
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemsList from '@/components/items/ItemsList';

const ItemsPage = () => {
  const navigate = useNavigate();

  const handleItemSelect = (itemId: string) => {
    navigate(`/items/${itemId}`);
  };

  return <ItemsList onItemSelect={handleItemSelect} />;
};

export default ItemsPage;
