
import { UserRole } from "./types";

export const APP_NAME = "RCRS System";
export const LOGO_URL = "https://cdn-icons-png.flaticon.com/512/3067/3067252.png";

export const MOCK_USERS = [
  { 
    id: 'u1', 
    username: 'admin', 
    password: 'admin123',
    name: 'System Admin', 
    role: UserRole.ADMIN, 
    permissions: ['dashboard', 'tickets', 'printing', 'sales', 'inventory', 'attendance', 'reports', 'users', 'collectibles', 'expenses'] 
  },
  { 
    id: 'u2', 
    username: 'staff1', 
    password: 'password123',
    name: 'John Doe', 
    role: UserRole.STAFF, 
    permissions: ['dashboard', 'tickets', 'attendance'] 
  },
  { 
    id: 'u3', 
    username: 'staff2', 
    password: 'password123',
    name: 'Jane Smith', 
    role: UserRole.STAFF, 
    permissions: ['dashboard', 'printing', 'sales', 'attendance'] 
  },
];

export const TARPAULIN_SIZES = ['2x3', '3x4', '4x5', '4x6', '5x6', 'Custom'];
export const TSHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const PAPER_TYPES = ['Bond Paper', 'Photo Paper', 'Cardstock', 'Sticker Paper'];

export const STORAGE_KEYS = {
  USERS: 'nextech_users',
  PRODUCTS: 'nextech_products',
  TICKETS: 'nextech_tickets',
  PRINT_ORDERS: 'nextech_print_orders',
  ATTENDANCE: 'nextech_attendance',
  SALES: 'nextech_sales',
  CURRENT_USER: 'nextech_current_user',
  EXPENSES: 'nextech_expenses'
};
