
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  TECHNICIAN = 'TECHNICIAN'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  permissions: string[]; // Array of view IDs allowed (e.g., ['tickets', 'sales'])
}

export interface Product {
  id: string;
  name: string;
  category: 'Desktop Part' | 'Laptop Part' | 'Printer Part' | 'Accessory' | 'Other';
  price: number;
  stock: number;
  description?: string;
}

export enum TicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  WAITING_FOR_PARTS = 'Waiting for Parts',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum DeviceType {
  LAPTOP = 'Laptop',
  DESKTOP = 'Desktop',
  CELLPHONE = 'Cellphone',
  PRINTER = 'Printer',
  OTHER = 'Other'
}

export type PaymentStatus = 'Paid' | 'Unpaid';
export type CustomerType = 'Individual' | 'Company' | 'LGU' | 'School';

export interface ServicePart {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface ServiceTask {
  id: string;
  description: string;
  isCompleted: boolean;
}

export interface ServiceLog {
  date: number;
  action: string;
  user: string;
}

export interface ServiceTicket {
  id: string;
  ticketNumber: string; // e.g. TKT-1001
  customerName: string;
  customerContact: string;
  customerType?: CustomerType;
  careOf?: string; // For companies/LGUs
  deviceType: DeviceType;
  deviceModel: string;
  issueDescription: string;
  diagnosis?: string;
  status: TicketStatus;
  
  laborCost: number; // Renamed from estimatedCost or used as base labor
  partsCost: number; // Auto-calculated
  
  assignedTo?: string; // User ID
  createdAt: number;
  updatedAt: number;
  notes: string[];
  paymentStatus?: PaymentStatus;
  
  // New Fields
  usedParts: ServicePart[];
  checklist: ServiceTask[];
  logs: ServiceLog[];
}

export enum PrintType {
  TARPAULIN = 'Tarpaulin',
  DOCUMENT = 'Document',
  PHOTO = 'Photo',
  TSHIRT = 'T-Shirt',
  MUG = 'Mug',
  STICKER = 'Sticker'
}

export interface PrintOrder {
  id: string;
  customerName: string;
  customerType?: CustomerType;
  printType: PrintType;
  quantity: number;
  priority: 'Standard' | 'Rush';
  details: {
    size?: string; // For Tarpaulin, T-Shirt
    dimensions?: string; // For Tarpaulin (e.g., 2x3)
    paperType?: string; // For Docs, Photos
    material?: string; // For Stickers
  };
  totalAmount: number;
  status: 'Pending' | 'Printing' | 'Done' | 'Delivered';
  createdAt: number;
  completedAt?: number;
  handledBy: string; // User ID
  paymentStatus?: PaymentStatus;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string; // ISO Date String YYYY-MM-DD
  timeIn: number; // Timestamp
  timeOut?: number; // Timestamp
}

export interface SaleRecord {
  id: string;
  date: number;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    priceAtSale: number;
  }[];
  discount?: number; // Total discount amount
  total: number;
  handledBy: string;
  customerName?: string; // Required for Credit
  customerType?: CustomerType;
  paymentStatus: PaymentStatus;
}
