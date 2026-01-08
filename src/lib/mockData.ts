// Mock data store for the application

export interface MockUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: 'admin' | 'collector' | 'resident';
  isApproved: boolean;
}

export interface MockBooking {
  id: string;
  userId: string;
  collectorId: string | null;
  locationAddress: string;
  locationLat: number;
  locationLng: number;
  serviceType?: 'sewage' | 'garbage';
  serviceDetails?: any;
  notes: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  requestedAt: string;
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface MockReport {
  id: string;
  userId: string;
  collectorId: string | null;
  locationAddress: string;
  locationLat: number;
  locationLng: number;
  description: string;
  photoUrl: string | null;
  status: 'pending' | 'assigned' | 'in_progress' | 'cleared';
  reportedAt: string;
  assignedAt: string | null;
  startedAt: string | null;
  clearedAt: string | null;
}

export interface MockCollector {
  id: string;
  userId: string;
  vehicleNumber: string;
  vehicleType: string;
  isAvailable: boolean;
  currentLat: number | null;
  currentLng: number | null;
  lastLocationUpdate: string | null;
}

// Mock users
export const mockUsers: MockUser[] = [
  {
    id: 'admin-1',
    email: 'admin@smartwaste.com',
    password: 'admin123',
    fullName: 'Admin User',
    phone: '+220 123 0000',
    role: 'admin',
    isApproved: true,
  },
  {
    id: 'collector-1',
    email: 'collector1@smartwaste.com',
    password: 'collector123',
    fullName: 'John Collector',
    phone: '+220 123 1111',
    role: 'collector',
    isApproved: true,
  },
  {
    id: 'collector-2',
    email: 'collector2@smartwaste.com',
    password: 'collector123',
    fullName: 'Jane Collector',
    phone: '+220 123 2222',
    role: 'collector',
    isApproved: true,
  },
  {
    id: 'resident-1',
    email: 'resident1@example.com',
    password: 'resident123',
    fullName: 'Alice Resident',
    phone: '+220 123 3333',
    role: 'resident',
    isApproved: true,
  },
  {
    id: 'resident-2',
    email: 'resident2@example.com',
    password: 'resident123',
    fullName: 'Bob Resident',
    phone: '+220 123 4444',
    role: 'resident',
    isApproved: true,
  },
];

// Mock collectors
export const mockCollectors: MockCollector[] = [
  {
    id: 'col-1',
    userId: 'collector-1',
    vehicleNumber: 'GW-1234',
    vehicleType: 'Truck',
    isAvailable: true,
    currentLat: 13.4549,
    currentLng: -16.5790,
    lastLocationUpdate: new Date().toISOString(),
  },
  {
    id: 'col-2',
    userId: 'collector-2',
    vehicleNumber: 'GW-5678',
    vehicleType: 'Van',
    isAvailable: false,
    currentLat: 13.4649,
    currentLng: -16.5690,
    lastLocationUpdate: new Date(Date.now() - 300000).toISOString(),
  },
];

// Mock bookings
export const mockBookings: MockBooking[] = [
  {
    id: 'book-1',
    userId: 'resident-1',
    collectorId: 'col-1',
    locationAddress: '123 Main St, Banjul',
    locationLat: 13.4549,
    locationLng: -16.5790,
    serviceType: 'garbage',
    serviceDetails: { items: 'Large items' },
    notes: 'Large items need collection',
    status: 'in_progress',
    requestedAt: new Date(Date.now() - 86400000).toISOString(),
    assignedAt: new Date(Date.now() - 43200000).toISOString(),
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: null,
  },
  {
    id: 'book-2',
    userId: 'resident-1',
    collectorId: null,
    locationAddress: '456 Park Ave, Serrekunda',
    locationLat: 13.4349,
    locationLng: -16.6790,
    serviceType: 'garbage',
    serviceDetails: { bags: 2 },
    notes: 'Regular waste collection',
    status: 'pending',
    requestedAt: new Date(Date.now() - 7200000).toISOString(),
    assignedAt: null,
    startedAt: null,
    completedAt: null,
  },
];

// Mock reports
export const mockReports: MockReport[] = [
  {
    id: 'report-1',
    userId: 'resident-1',
    collectorId: 'col-2',
    locationAddress: '789 Beach Rd, Bakau',
    locationLat: 13.4749,
    locationLng: -16.6890,
    description: 'Illegal dumping near the beach',
    photoUrl: null,
    status: 'assigned',
    reportedAt: new Date(Date.now() - 172800000).toISOString(),
    assignedAt: new Date(Date.now() - 86400000).toISOString(),
    startedAt: null,
    clearedAt: null,
  },
  {
    id: 'report-2',
    userId: 'resident-1',
    collectorId: null,
    locationAddress: '321 Market St, Brikama',
    locationLat: 13.2749,
    locationLng: -16.6490,
    description: 'Overflowing waste bin',
    photoUrl: null,
    status: 'pending',
    reportedAt: new Date(Date.now() - 43200000).toISOString(),
    assignedAt: null,
    startedAt: null,
    clearedAt: null,
  },
];

// Local storage keys
const STORAGE_KEYS = {
  USERS: 'smartwaste_users',
  BOOKINGS: 'smartwaste_bookings',
  REPORTS: 'smartwaste_reports',
  COLLECTORS: 'smartwaste_collectors',
  CURRENT_USER: 'smartwaste_current_user',
};

// Initialize mock data in localStorage
export const initializeMockData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(mockBookings));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(mockReports));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COLLECTORS)) {
    localStorage.setItem(STORAGE_KEYS.COLLECTORS, JSON.stringify(mockCollectors));
  }
};

// Helper functions to get/set data
export const getMockUsers = (): MockUser[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : mockUsers;
};

export const setMockUsers = (users: MockUser[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getMockBookings = (): MockBooking[] => {
  const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  return data ? JSON.parse(data) : mockBookings;
};

export const setMockBookings = (bookings: MockBooking[]) => {
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
};

export const getMockReports = (): MockReport[] => {
  const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
  return data ? JSON.parse(data) : mockReports;
};

export const setMockReports = (reports: MockReport[]) => {
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
};

export const getMockCollectors = (): MockCollector[] => {
  const data = localStorage.getItem(STORAGE_KEYS.COLLECTORS);
  return data ? JSON.parse(data) : mockCollectors;
};

export const setMockCollectors = (collectors: MockCollector[]) => {
  localStorage.setItem(STORAGE_KEYS.COLLECTORS, JSON.stringify(collectors));
};

export const getCurrentUser = (): MockUser | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: MockUser | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};
