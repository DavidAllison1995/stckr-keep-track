
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

// Import the components for internal use
import FridgeIcon from './FridgeIcon';
import OvenIcon from './OvenIcon';
import WasherIcon from './WasherIcon';
import DryerIcon from './DryerIcon';
import TvIcon from './TvIcon';
import LampIcon from './LampIcon';
import BoilerIcon from './BoilerIcon';
import BikeIcon from './BikeIcon';
import CarIcon from './CarIcon';
import VacuumIcon from './VacuumIcon';
import LaptopIcon from './LaptopIcon';
import PhoneIcon from './PhoneIcon';
import ToolIcon from './ToolIcon';
import SofaIcon from './SofaIcon';
import BedIcon from './BedIcon';
import TableIcon from './TableIcon';
import ChairIcon from './ChairIcon';
import PlantIcon from './PlantIcon';
import BookIcon from './BookIcon';
import ToolboxIcon from './ToolboxIcon';
import BoxIcon from './BoxIcon';

export interface IconData {
  id: string;
  name: string;
  component: React.ComponentType<{ className?: string }>;
  category: string;
}

export const iconRegistry: IconData[] = [
  { id: 'fridge', name: 'Refrigerator', component: FridgeIcon, category: 'Kitchen' },
  { id: 'oven', name: 'Oven', component: OvenIcon, category: 'Kitchen' },
  { id: 'washer', name: 'Washing Machine', component: WasherIcon, category: 'Laundry' },
  { id: 'dryer', name: 'Dryer', component: DryerIcon, category: 'Laundry' },
  { id: 'tv', name: 'Television', component: TvIcon, category: 'Electronics' },
  { id: 'lamp', name: 'Lamp', component: LampIcon, category: 'Lighting' },
  { id: 'boiler', name: 'Boiler', component: BoilerIcon, category: 'HVAC' },
  { id: 'bike', name: 'Bicycle', component: BikeIcon, category: 'Vehicle' },
  { id: 'car', name: 'Car', component: CarIcon, category: 'Vehicle' },
  { id: 'vacuum', name: 'Vacuum Cleaner', component: VacuumIcon, category: 'Cleaning' },
  { id: 'laptop', name: 'Laptop', component: LaptopIcon, category: 'Electronics' },
  { id: 'phone', name: 'Phone', component: PhoneIcon, category: 'Electronics' },
  { id: 'tool', name: 'Tool', component: ToolIcon, category: 'Tools' },
  { id: 'sofa', name: 'Sofa', component: SofaIcon, category: 'Furniture' },
  { id: 'bed', name: 'Bed', component: BedIcon, category: 'Furniture' },
  { id: 'table', name: 'Table', component: TableIcon, category: 'Furniture' },
  { id: 'chair', name: 'Chair', component: ChairIcon, category: 'Furniture' },
  { id: 'plant', name: 'Plant', component: PlantIcon, category: 'Decoration' },
  { id: 'book', name: 'Book', component: BookIcon, category: 'Entertainment' },
  { id: 'toolbox', name: 'Toolbox', component: ToolboxIcon, category: 'Tools' },
  { id: 'box', name: 'Generic Item', component: BoxIcon, category: 'Other' },
];

export const getIconById = (iconId: string) => {
  return iconRegistry.find(icon => icon.id === iconId);
};

export const getIconComponent = (iconId: string) => {
  const icon = getIconById(iconId);
  return icon ? icon.component : BoxIcon;
};
