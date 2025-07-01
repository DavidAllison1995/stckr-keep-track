export { default as FridgeIcon } from './FridgeIcon';
export { default as OvenIcon } from './OvenIcon';
export { default as WasherIcon } from './WasherIcon';
export { default as DryerIcon } from './DryerIcon';
export { default as TvIcon } from './TvIcon';
export { default as LampIcon } from './LampIcon';
export { default as BoilerIcon } from './BoilerIcon';
export { default as BikeIcon } from './BikeIcon';
export { default as CarIcon } from './CarIcon';
export { default as VacuumIcon } from './VacuumIcon';
export { default as LaptopIcon } from './LaptopIcon';
export { default as PhoneIcon } from './PhoneIcon';
export { default as ToolIcon } from './ToolIcon';
export { default as SofaIcon } from './SofaIcon';
export { default as BedIcon } from './BedIcon';
export { default as TableIcon } from './TableIcon';
export { default as ChairIcon } from './ChairIcon';
export { default as PlantIcon } from './PlantIcon';
export { default as BookIcon } from './BookIcon';
export { default as ToolboxIcon } from './ToolboxIcon';
export { default as BoxIcon } from './BoxIcon';

// Export new emoji-style icons
export { default as DrillIcon } from './DrillIcon';
export { default as ScrewdriverIcon } from './ScrewdriverIcon';
export { default as WrenchIcon } from './WrenchIcon';
export { default as LadderIcon } from './LadderIcon';
export { default as HoseIcon } from './HoseIcon';
export { default as LawnMowerIcon } from './LawnMowerIcon';
export { default as MicrowaveIcon } from './MicrowaveIcon';
export { default as KettleIcon } from './KettleIcon';
export { default as AirConditionerIcon } from './AirConditionerIcon';
export { default as MotorbikeIcon } from './MotorbikeIcon';
export { default as ScooterIcon } from './ScooterIcon';
export { default as CaravanIcon } from './CaravanIcon';
export { default as OfficeChairIcon } from './OfficeChairIcon';
export { default as BookshelfIcon } from './BookshelfIcon';
export { default as ToiletIcon } from './ToiletIcon';
export { default as ShowerIcon } from './ShowerIcon';
export { default as SinkIcon } from './SinkIcon';
export { default as WaterHeaterIcon } from './WaterHeaterIcon';
export { default as DesktopIcon } from './DesktopIcon';
export { default as MonitorIcon } from './MonitorIcon';
export { default as PrinterIcon } from './PrinterIcon';
export { default as RouterIcon } from './RouterIcon';
export { default as DocumentFolderIcon } from './DocumentFolderIcon';
export { default as IdCardIcon } from './IdCardIcon';
export { default as CertificateIcon } from './CertificateIcon';
export { default as ReceiptIcon } from './ReceiptIcon';
export { default as PassportIcon } from './PassportIcon';
export { default as StorageBoxIcon } from './StorageBoxIcon';
export { default as FileCabinetIcon } from './FileCabinetIcon';

// Import all the new emoji-style icons
import DrillIcon from './DrillIcon';
import ScrewdriverIcon from './ScrewdriverIcon';
import WrenchIcon from './WrenchIcon';
import LadderIcon from './LadderIcon';
import HoseIcon from './HoseIcon';
import LawnMowerIcon from './LawnMowerIcon';
import MicrowaveIcon from './MicrowaveIcon';
import KettleIcon from './KettleIcon';
import AirConditionerIcon from './AirConditionerIcon';
import MotorbikeIcon from './MotorbikeIcon';
import ScooterIcon from './ScooterIcon';
import CaravanIcon from './CaravanIcon';
import OfficeChairIcon from './OfficeChairIcon';
import BookshelfIcon from './BookshelfIcon';
import ToiletIcon from './ToiletIcon';
import ShowerIcon from './ShowerIcon';
import SinkIcon from './SinkIcon';
import WaterHeaterIcon from './WaterHeaterIcon';
import DesktopIcon from './DesktopIcon';
import MonitorIcon from './MonitorIcon';
import PrinterIcon from './PrinterIcon';
import RouterIcon from './RouterIcon';
import DocumentFolderIcon from './DocumentFolderIcon';
import IdCardIcon from './IdCardIcon';
import CertificateIcon from './CertificateIcon';
import ReceiptIcon from './ReceiptIcon';
import PassportIcon from './PassportIcon';
import StorageBoxIcon from './StorageBoxIcon';
import FileCabinetIcon from './FileCabinetIcon';

export interface IconData {
  id: string;
  name: string;
  component: React.ComponentType<{ className?: string }>;
  category: string;
  tags: string[];
}

export const iconRegistry: IconData[] = [
  // Tools & Equipment
  { id: 'drill', name: 'Drill', component: DrillIcon, category: 'Tools & Equipment', tags: ['drill', 'power tool', 'construction'] },
  { id: 'screwdriver', name: 'Screwdriver', component: ScrewdriverIcon, category: 'Tools & Equipment', tags: ['screwdriver', 'tool', 'manual'] },
  { id: 'wrench', name: 'Wrench', component: WrenchIcon, category: 'Tools & Equipment', tags: ['wrench', 'spanner', 'tool'] },
  { id: 'tool', name: 'General Tool', component: ToolIcon, category: 'Tools & Equipment', tags: ['tool', 'general', 'maintenance'] },
  { id: 'toolbox', name: 'Toolbox', component: ToolboxIcon, category: 'Tools & Equipment', tags: ['toolbox', 'storage', 'tools'] },
  { id: 'ladder', name: 'Ladder', component: LadderIcon, category: 'Tools & Equipment', tags: ['ladder', 'height', 'construction'] },
  { id: 'hose', name: 'Garden Hose', component: HoseIcon, category: 'Tools & Equipment', tags: ['hose', 'garden', 'water'] },
  { id: 'lawnmower', name: 'Lawn Mower', component: LawnMowerIcon, category: 'Tools & Equipment', tags: ['mower', 'garden', 'grass'] },
  
  // Kitchen Appliances
  { id: 'fridge', name: 'Refrigerator', component: FridgeIcon, category: 'Kitchen', tags: ['fridge', 'refrigerator', 'kitchen'] },
  { id: 'oven', name: 'Oven', component: OvenIcon, category: 'Kitchen', tags: ['oven', 'cooking', 'kitchen'] },
  { id: 'microwave', name: 'Microwave', component: MicrowaveIcon, category: 'Kitchen', tags: ['microwave', 'cooking', 'kitchen'] },
  { id: 'kettle', name: 'Kettle', component: KettleIcon, category: 'Kitchen', tags: ['kettle', 'tea', 'coffee', 'kitchen'] },
  
  // Home Appliances
  { id: 'washer', name: 'Washing Machine', component: WasherIcon, category: 'Laundry', tags: ['washing machine', 'laundry', 'clothes'] },
  { id: 'dryer', name: 'Dryer', component: DryerIcon, category: 'Laundry', tags: ['dryer', 'laundry', 'clothes'] },
  { id: 'vacuum', name: 'Vacuum Cleaner', component: VacuumIcon, category: 'Cleaning', tags: ['vacuum', 'cleaning', 'hoover'] },
  { id: 'airconditioner', name: 'Air Conditioner', component: AirConditionerIcon, category: 'HVAC', tags: ['air conditioner', 'cooling', 'hvac'] },
  { id: 'boiler', name: 'Boiler', component: BoilerIcon, category: 'HVAC', tags: ['boiler', 'heating', 'hvac'] },
  
  // Vehicles
  { id: 'car', name: 'Car', component: CarIcon, category: 'Vehicle', tags: ['car', 'automobile', 'vehicle'] },
  { id: 'motorbike', name: 'Motorbike', component: MotorbikeIcon, category: 'Vehicle', tags: ['motorbike', 'motorcycle', 'bike'] },
  { id: 'bike', name: 'Bicycle', component: BikeIcon, category: 'Vehicle', tags: ['bicycle', 'bike', 'cycling'] },
  { id: 'scooter', name: 'Electric Scooter', component: ScooterIcon, category: 'Vehicle', tags: ['scooter', 'electric', 'transport'] },
  { id: 'caravan', name: 'Caravan', component: CaravanIcon, category: 'Vehicle', tags: ['caravan', 'trailer', 'camping'] },
  
  // Furniture
  { id: 'sofa', name: 'Sofa', component: SofaIcon, category: 'Furniture', tags: ['sofa', 'couch', 'seating'] },
  { id: 'bed', name: 'Bed', component: BedIcon, category: 'Furniture', tags: ['bed', 'bedroom', 'sleep'] },
  { id: 'table', name: 'Table', component: TableIcon, category: 'Furniture', tags: ['table', 'dining', 'furniture'] },
  { id: 'chair', name: 'Chair', component: ChairIcon, category: 'Furniture', tags: ['chair', 'seating', 'furniture'] },
  { id: 'officechair', name: 'Office Chair', component: OfficeChairIcon, category: 'Furniture', tags: ['office chair', 'desk chair', 'office'] },
  { id: 'bookshelf', name: 'Bookshelf', component: BookshelfIcon, category: 'Furniture', tags: ['bookshelf', 'books', 'storage'] },
  
  // Bathroom & Plumbing
  { id: 'toilet', name: 'Toilet', component: ToiletIcon, category: 'Bathroom', tags: ['toilet', 'bathroom', 'plumbing'] },
  { id: 'shower', name: 'Shower', component: ShowerIcon, category: 'Bathroom', tags: ['shower', 'bathroom', 'plumbing'] },
  { id: 'sink', name: 'Sink', component: SinkIcon, category: 'Bathroom', tags: ['sink', 'basin', 'plumbing'] },
  { id: 'waterheater', name: 'Water Heater', component: WaterHeaterIcon, category: 'Bathroom', tags: ['water heater', 'boiler', 'plumbing'] },
  
  // Electronics & Tech
  { id: 'tv', name: 'Television', component: TvIcon, category: 'Electronics', tags: ['tv', 'television', 'entertainment'] },
  { id: 'laptop', name: 'Laptop', component: LaptopIcon, category: 'Electronics', tags: ['laptop', 'computer', 'technology'] },
  { id: 'desktop', name: 'Desktop Computer', component: DesktopIcon, category: 'Electronics', tags: ['desktop', 'computer', 'pc'] },
  { id: 'monitor', name: 'Monitor', component: MonitorIcon, category: 'Electronics', tags: ['monitor', 'screen', 'display'] },
  { id: 'phone', name: 'Phone', component: PhoneIcon, category: 'Electronics', tags: ['phone', 'mobile', 'smartphone'] },
  { id: 'printer', name: 'Printer', component: PrinterIcon, category: 'Electronics', tags: ['printer', 'office', 'printing'] },
  { id: 'router', name: 'WiFi Router', component: RouterIcon, category: 'Electronics', tags: ['router', 'wifi', 'internet'] },
  
  // Lighting
  { id: 'lamp', name: 'Lamp', component: LampIcon, category: 'Lighting', tags: ['lamp', 'lighting', 'light'] },
  
  // Documents
  { id: 'folder', name: 'Document Folder', component: DocumentFolderIcon, category: 'Documents', tags: ['folder', 'documents', 'papers'] },
  { id: 'idcard', name: 'ID Card', component: IdCardIcon, category: 'Documents', tags: ['id card', 'identity', 'card'] },
  { id: 'certificate', name: 'Certificate', component: CertificateIcon, category: 'Documents', tags: ['certificate', 'award', 'document'] },
  { id: 'receipt', name: 'Receipt', component: ReceiptIcon, category: 'Documents', tags: ['receipt', 'bill', 'payment'] },
  { id: 'passport', name: 'Passport', component: PassportIcon, category: 'Documents', tags: ['passport', 'travel', 'identity'] },
  { id: 'book', name: 'Book', component: BookIcon, category: 'Documents', tags: ['book', 'reading', 'literature'] },
  
  // Storage & Misc
  { id: 'box', name: 'Cardboard Box', component: BoxIcon, category: 'Storage', tags: ['box', 'cardboard', 'storage', 'default'] },
  { id: 'storagebox', name: 'Storage Box', component: StorageBoxIcon, category: 'Storage', tags: ['storage box', 'container', 'organiser'] },
  { id: 'filecabinet', name: 'File Cabinet', component: FileCabinetIcon, category: 'Storage', tags: ['file cabinet', 'office', 'filing'] },
  { id: 'plant', name: 'Plant', component: PlantIcon, category: 'Decoration', tags: ['plant', 'decoration', 'garden'] },
];

export const getIconById = (iconId: string) => {
  return iconRegistry.find(icon => icon.id === iconId);
};

export const getIconComponent = (iconId: string) => {
  const icon = getIconById(iconId);
  return icon ? icon.component : BoxIcon;
};

export const getIconsByCategory = (category: string) => {
  return iconRegistry.filter(icon => icon.category === category);
};

export const searchIcons = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return iconRegistry.filter(icon => 
    icon.name.toLowerCase().includes(lowercaseQuery) ||
    icon.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getAllCategories = () => {
  return [...new Set(iconRegistry.map(icon => icon.category))].sort();
};
