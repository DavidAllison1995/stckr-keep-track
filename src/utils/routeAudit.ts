
// Route Audit and Mapping for Supabase Integration
// This file documents all routes and their current status

export interface RouteMapping {
  path: string;
  component: string;
  status: 'working' | 'needs_fix' | 'broken';
  dataSource: 'supabase' | 'local' | 'none';
  notes?: string;
}

export const routeAudit: RouteMapping[] = [
  {
    path: '/',
    component: 'Index',
    status: 'working',
    dataSource: 'none',
    notes: 'Home page - redirects to dashboard or shows welcome'
  },
  {
    path: '/auth',
    component: 'AuthPage',
    status: 'working',
    dataSource: 'supabase',
    notes: 'Authentication page using Supabase Auth'
  },
  {
    path: '/dashboard',
    component: 'Dashboard',
    status: 'working',
    dataSource: 'supabase',
    notes: 'Dashboard showing overview of items and tasks'
  },
  {
    path: '/items',
    component: 'ItemsPage',
    status: 'working',
    dataSource: 'supabase',
    notes: 'Items list using useSupabaseItems hook'
  },
  {
    path: '/items/:id',
    component: 'ItemDetailPage',
    status: 'working',
    dataSource: 'supabase',
    notes: 'Item detail with maintenance tasks using useSupabaseItems and useSupabaseMaintenance'
  },
  {
    path: '/calendar',
    component: 'MaintenancePage',
    status: 'working',
    dataSource: 'supabase',
    notes: 'Maintenance calendar using useSupabaseMaintenance'
  },
  {
    path: '/maintenance-tasks',
    component: 'MaintenanceTasksPage',
    status: 'working',
    dataSource: 'supabase',
    notes: 'Maintenance tasks list - now properly using Supabase hooks'
  },
  {
    path: '/tasks',
    component: 'TasksPage',
    status: 'working',
    dataSource: 'supabase',
    notes: 'General tasks page'
  },
  {
    path: '/profile',
    component: 'ProfilePage',
    status: 'working',
    dataSource: 'supabase',
    notes: 'User profile using Supabase Auth'
  },
  {
    path: '/settings',
    component: 'SettingsPage',
    status: 'working',
    dataSource: 'supabase',
    notes: 'Settings page'
  },
  {
    path: '/scanner',
    component: 'ScannerPage',
    status: 'working',
    dataSource: 'none',
    notes: 'QR code scanner'
  }
];

export const dataHookAudit = {
  items: {
    hook: 'useSupabaseItems',
    methods: ['getItemById', 'addItem', 'updateItem', 'deleteItem'],
    status: 'fully_implemented',
    table: 'items'
  },
  maintenance: {
    hook: 'useSupabaseMaintenance', 
    methods: ['getTaskById', 'addTask', 'updateTask', 'deleteTask', 'markTaskComplete'],
    status: 'fully_implemented',
    table: 'maintenance_tasks'
  },
  auth: {
    hook: 'useSupabaseAuth',
    methods: ['signIn', 'signUp', 'signOut', 'user', 'session'],
    status: 'fully_implemented',
    table: 'auth.users'
  }
};

export const navigationLinksAudit = [
  {
    component: 'NavBar',
    links: [
      { path: '/', label: 'Home', status: 'working' },
      { path: '/items', label: 'Items', status: 'working' },
      { path: '/calendar', label: 'Calendar', status: 'working' },
      { path: '/scanner', label: 'Scan', status: 'working' },
      { path: '/profile', label: 'Profile', status: 'working' }
    ]
  }
];

export function generateRouteReport() {
  const total = routeAudit.length;
  const working = routeAudit.filter(r => r.status === 'working').length;
  const needsFix = routeAudit.filter(r => r.status === 'needs_fix').length;
  const broken = routeAudit.filter(r => r.status === 'broken').length;

  return {
    total,
    working,
    needsFix,
    broken,
    percentage: Math.round((working / total) * 100)
  };
}
