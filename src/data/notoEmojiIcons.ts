
export interface NotoEmojiIconData {
  emoji: string;
  name: string;
  category: string;
  keywords: string[];
}

export const notoEmojiIcons: NotoEmojiIconData[] = [
  // Tools & Equipment
  { emoji: '🔧', name: 'Wrench', category: 'Tools & Equipment', keywords: ['wrench', 'tool', 'fix', 'repair', 'spanner'] },
  { emoji: '🔨', name: 'Hammer', category: 'Tools & Equipment', keywords: ['hammer', 'tool', 'build', 'construction'] },
  { emoji: '🪚', name: 'Saw', category: 'Tools & Equipment', keywords: ['saw', 'tool', 'cut', 'wood'] },
  { emoji: '🪛', name: 'Screwdriver', category: 'Tools & Equipment', keywords: ['screwdriver', 'tool', 'screw'] },
  { emoji: '⚒️', name: 'Hammer and Pick', category: 'Tools & Equipment', keywords: ['hammer', 'pick', 'tool', 'mining'] },
  { emoji: '🧰', name: 'Toolbox', category: 'Tools & Equipment', keywords: ['toolbox', 'tools', 'storage', 'repair'] },
  { emoji: '🪜', name: 'Ladder', category: 'Tools & Equipment', keywords: ['ladder', 'climb', 'height', 'construction'] },
  { emoji: '🪣', name: 'Bucket', category: 'Tools & Equipment', keywords: ['bucket', 'water', 'cleaning', 'container'] },

  // Kitchen & Appliances  
  { emoji: '🍳', name: 'Frying Pan', category: 'Kitchen', keywords: ['pan', 'cooking', 'kitchen', 'frying'] },
  { emoji: '🔥', name: 'Oven', category: 'Kitchen', keywords: ['oven', 'cooking', 'baking', 'kitchen', 'fire'] },
  { emoji: '❄️', name: 'Refrigerator', category: 'Kitchen', keywords: ['fridge', 'refrigerator', 'cold', 'kitchen', 'ice'] },
  { emoji: '☕', name: 'Coffee Maker', category: 'Kitchen', keywords: ['coffee', 'maker', 'kitchen', 'brewing'] },
  { emoji: '🫖', name: 'Kettle', category: 'Kitchen', keywords: ['kettle', 'tea', 'boiling', 'kitchen'] },
  { emoji: '🥄', name: 'Spoon', category: 'Kitchen', keywords: ['spoon', 'cutlery', 'kitchen', 'eating'] },
  { emoji: '🍽️', name: 'Plate', category: 'Kitchen', keywords: ['plate', 'dish', 'kitchen', 'eating'] },

  // Home Appliances
  { emoji: '👕', name: 'Washing Machine', category: 'Laundry', keywords: ['washing', 'machine', 'laundry', 'clothes', 'shirt'] },
  { emoji: '💨', name: 'Dryer', category: 'Laundry', keywords: ['dryer', 'laundry', 'clothes', 'air', 'wind'] },
  { emoji: '🧹', name: 'Vacuum Cleaner', category: 'Cleaning', keywords: ['vacuum', 'cleaning', 'broom', 'clean'] },
  { emoji: '🌡️', name: 'Air Conditioner', category: 'HVAC', keywords: ['ac', 'air', 'conditioning', 'cooling', 'temperature'] },
  { emoji: '🔥', name: 'Heater', category: 'HVAC', keywords: ['heater', 'heating', 'warm', 'fire'] },

  // Vehicles
  { emoji: '🚗', name: 'Car', category: 'Vehicle', keywords: ['car', 'auto', 'vehicle', 'drive'] },
  { emoji: '🏍️', name: 'Motorcycle', category: 'Vehicle', keywords: ['motorcycle', 'motorbike', 'bike', 'vehicle'] },
  { emoji: '🚲', name: 'Bicycle', category: 'Vehicle', keywords: ['bicycle', 'bike', 'cycling', 'pedal'] },
  { emoji: '🛴', name: 'Scooter', category: 'Vehicle', keywords: ['scooter', 'kick', 'electric', 'transport'] },
  { emoji: '🚐', name: 'Van', category: 'Vehicle', keywords: ['van', 'vehicle', 'minivan', 'family'] },
  { emoji: '🚚', name: 'Truck', category: 'Vehicle', keywords: ['truck', 'lorry', 'vehicle', 'transport'] },

  // Furniture
  { emoji: '🛋️', name: 'Sofa', category: 'Furniture', keywords: ['sofa', 'couch', 'furniture', 'seating'] },
  { emoji: '🛏️', name: 'Bed', category: 'Furniture', keywords: ['bed', 'bedroom', 'sleep', 'furniture'] },
  { emoji: '🪑', name: 'Chair', category: 'Furniture', keywords: ['chair', 'seat', 'furniture', 'sitting'] },
  { emoji: '🪞', name: 'Mirror', category: 'Furniture', keywords: ['mirror', 'reflection', 'furniture', 'glass'] },
  { emoji: '🚪', name: 'Door', category: 'Furniture', keywords: ['door', 'entrance', 'exit', 'furniture'] },

  // Electronics
  { emoji: '💻', name: 'Laptop', category: 'Electronics', keywords: ['laptop', 'computer', 'pc', 'technology'] },
  { emoji: '🖥️', name: 'Desktop Computer', category: 'Electronics', keywords: ['desktop', 'computer', 'monitor', 'pc'] },
  { emoji: '📱', name: 'Phone', category: 'Electronics', keywords: ['phone', 'mobile', 'smartphone', 'cell'] },
  { emoji: '📺', name: 'Television', category: 'Electronics', keywords: ['tv', 'television', 'entertainment', 'screen'] },
  { emoji: '🖨️', name: 'Printer', category: 'Electronics', keywords: ['printer', 'printing', 'office', 'paper'] },
  { emoji: '📻', name: 'Radio', category: 'Electronics', keywords: ['radio', 'music', 'audio', 'sound'] },
  { emoji: '🔌', name: 'Electric Plug', category: 'Electronics', keywords: ['plug', 'electric', 'power', 'outlet'] },

  // Bathroom & Plumbing
  { emoji: '🚽', name: 'Toilet', category: 'Bathroom', keywords: ['toilet', 'bathroom', 'wc', 'plumbing'] },
  { emoji: '🚿', name: 'Shower', category: 'Bathroom', keywords: ['shower', 'bathroom', 'water', 'bathing'] },
  { emoji: '🛁', name: 'Bathtub', category: 'Bathroom', keywords: ['bathtub', 'bath', 'bathroom', 'water'] },
  { emoji: '🚰', name: 'Water Tap', category: 'Bathroom', keywords: ['tap', 'faucet', 'water', 'sink'] },

  // Documents & Files
  { emoji: '📂', name: 'Folder', category: 'Documents', keywords: ['folder', 'file', 'documents', 'storage'] },
  { emoji: '📄', name: 'Document', category: 'Documents', keywords: ['document', 'paper', 'file', 'text'] },
  { emoji: '📋', name: 'Clipboard', category: 'Documents', keywords: ['clipboard', 'notes', 'list', 'document'] },
  { emoji: '🆔', name: 'ID Card', category: 'Documents', keywords: ['id', 'card', 'identity', 'document'] },
  { emoji: '📜', name: 'Certificate', category: 'Documents', keywords: ['certificate', 'scroll', 'document', 'award'] },
  { emoji: '🧾', name: 'Receipt', category: 'Documents', keywords: ['receipt', 'bill', 'payment', 'document'] },
  { emoji: '📖', name: 'Book', category: 'Documents', keywords: ['book', 'reading', 'literature', 'manual'] },

  // Storage & Organization
  { emoji: '📦', name: 'Package', category: 'Storage', keywords: ['box', 'package', 'storage', 'cardboard', 'default'] },
  { emoji: '🗃️', name: 'File Cabinet', category: 'Storage', keywords: ['cabinet', 'filing', 'storage', 'office'] },
  { emoji: '🗂️', name: 'File Dividers', category: 'Storage', keywords: ['dividers', 'filing', 'organization', 'storage'] },
  { emoji: '📚', name: 'Books', category: 'Storage', keywords: ['books', 'library', 'storage', 'knowledge'] },

  // Garden & Outdoor
  { emoji: '🌱', name: 'Plant', category: 'Garden', keywords: ['plant', 'garden', 'green', 'nature'] },
  { emoji: '🌳', name: 'Tree', category: 'Garden', keywords: ['tree', 'garden', 'nature', 'outdoor'] },
  { emoji: '🏡', name: 'House', category: 'Garden', keywords: ['house', 'home', 'building', 'property'] },

  // Lighting
  { emoji: '💡', name: 'Light Bulb', category: 'Lighting', keywords: ['light', 'bulb', 'lamp', 'illumination'] },
  { emoji: '🕯️', name: 'Candle', category: 'Lighting', keywords: ['candle', 'light', 'flame', 'wax'] },

  // Sports & Recreation
  { emoji: '⚽', name: 'Football', category: 'Sports', keywords: ['football', 'soccer', 'ball', 'sport'] },
  { emoji: '🏀', name: 'Basketball', category: 'Sports', keywords: ['basketball', 'ball', 'sport'] },
  { emoji: '🎾', name: 'Tennis', category: 'Sports', keywords: ['tennis', 'ball', 'sport'] },
  { emoji: '🏓', name: 'Ping Pong', category: 'Sports', keywords: ['ping pong', 'table tennis', 'paddle', 'sport'] },

  // Musical Instruments
  { emoji: '🎸', name: 'Guitar', category: 'Music', keywords: ['guitar', 'music', 'instrument', 'strings'] },
  { emoji: '🎹', name: 'Piano', category: 'Music', keywords: ['piano', 'keyboard', 'music', 'instrument'] },
  { emoji: '🥁', name: 'Drums', category: 'Music', keywords: ['drums', 'percussion', 'music', 'instrument'] },

  // Medical & Health
  { emoji: '💊', name: 'Pill', category: 'Medical', keywords: ['pill', 'medicine', 'medication', 'health'] },
  { emoji: '🩹', name: 'Bandage', category: 'Medical', keywords: ['bandage', 'first aid', 'medical', 'health'] },
  { emoji: '🩺', name: 'Stethoscope', category: 'Medical', keywords: ['stethoscope', 'medical', 'doctor', 'health'] },

  // Miscellaneous
  { emoji: '🔒', name: 'Lock', category: 'Security', keywords: ['lock', 'security', 'key', 'safe'] },
  { emoji: '🔑', name: 'Key', category: 'Security', keywords: ['key', 'unlock', 'security', 'access'] },
  { emoji: '⏰', name: 'Clock', category: 'Time', keywords: ['clock', 'time', 'alarm', 'schedule'] },
  { emoji: '📏', name: 'Ruler', category: 'Office', keywords: ['ruler', 'measure', 'office', 'tool'] },
  { emoji: '✂️', name: 'Scissors', category: 'Office', keywords: ['scissors', 'cut', 'office', 'tool'] },
];

export const getIconByEmoji = (emoji: string): NotoEmojiIconData | undefined => {
  return notoEmojiIcons.find(icon => icon.emoji === emoji);
};

export const searchIcons = (query: string): NotoEmojiIconData[] => {
  if (!query.trim()) return notoEmojiIcons.slice(0, 20); // Show first 20 by default
  
  const lowercaseQuery = query.toLowerCase();
  return notoEmojiIcons.filter(icon => 
    icon.name.toLowerCase().includes(lowercaseQuery) ||
    icon.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
  );
};

export const getDefaultIcon = (): NotoEmojiIconData => {
  return { emoji: '📦', name: 'Package', category: 'Storage', keywords: ['box', 'package', 'storage', 'default'] };
};

export const getCategorizedIcons = () => {
  const categories: { [key: string]: NotoEmojiIconData[] } = {};
  
  notoEmojiIcons.forEach(icon => {
    if (!categories[icon.category]) {
      categories[icon.category] = [];
    }
    categories[icon.category].push(icon);
  });
  
  return categories;
};
