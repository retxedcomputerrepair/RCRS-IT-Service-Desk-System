
import { STORAGE_KEYS, MOCK_USERS } from "../constants";
import { User, Product, ServiceTicket, PrintOrder, AttendanceRecord, SaleRecord, UserRole, PaymentStatus, ServicePart } from "../types";

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize Data
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    // Seed some products
    const initialProducts: Product[] = [
      { id: 'p1', name: 'DDR4 RAM 8GB', category: 'Desktop Part', price: 45, stock: 10, description: 'Kingston Fury' },
      { id: 'p2', name: '500GB SSD NVMe', category: 'Laptop Part', price: 60, stock: 5, description: 'Samsung 970 Evo' },
      { id: 'p3', name: 'USB Cable Printer', category: 'Accessory', price: 5, stock: 50 },
    ];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
  }
};

initializeData();

// Generic Getters/Setters
const getItems = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setItems = <T>(key: string, items: T[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

// --- Auth ---
export const login = async (username: string, password: string): Promise<User | null> => {
  await delay(500);
  const users = getItems<User>(STORAGE_KEYS.USERS);
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    // Return user without password for session state
    const { password: _, ...safeUser } = user;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
    return safeUser as User;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = (): User | null => {
  const u = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return u ? JSON.parse(u) : null;
};

// --- User Management ---
export const getUsers = async (): Promise<User[]> => {
  await delay(200);
  return getItems<User>(STORAGE_KEYS.USERS);
};

export const saveUser = async (user: User): Promise<void> => {
  await delay(200);
  const users = getItems<User>(STORAGE_KEYS.USERS);
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    // Check if username exists for new user
    if (users.find(u => u.username === user.username)) {
      throw new Error("Username already exists");
    }
    users.push(user);
  }
  setItems(STORAGE_KEYS.USERS, users);
};

export const deleteUser = async (id: string): Promise<void> => {
  await delay(200);
  const users = getItems<User>(STORAGE_KEYS.USERS);
  const userToDelete = users.find(u => u.id === id);
  
  if (userToDelete?.role === UserRole.ADMIN && users.filter(u => u.role === UserRole.ADMIN).length <= 1) {
    throw new Error("Cannot delete the last Admin user");
  }
  
  setItems(STORAGE_KEYS.USERS, users.filter(u => u.id !== id));
};


// --- Products ---
export const getProducts = async (): Promise<Product[]> => {
  await delay(200);
  return getItems<Product>(STORAGE_KEYS.PRODUCTS);
};

export const saveProduct = async (product: Product): Promise<void> => {
  await delay(200);
  const products = getItems<Product>(STORAGE_KEYS.PRODUCTS);
  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  setItems(STORAGE_KEYS.PRODUCTS, products);
};

export const deleteProduct = async (id: string): Promise<void> => {
    const products = getItems<Product>(STORAGE_KEYS.PRODUCTS);
    setItems(STORAGE_KEYS.PRODUCTS, products.filter(p => p.id !== id));
}

// --- Tickets ---
export const getTickets = async (): Promise<ServiceTicket[]> => {
  await delay(200);
  return getItems<ServiceTicket>(STORAGE_KEYS.TICKETS);
};

export const saveTicket = async (ticket: ServiceTicket, isNewPartAdded: boolean = false, addedPart?: ServicePart): Promise<void> => {
  await delay(200);
  const tickets = getItems<ServiceTicket>(STORAGE_KEYS.TICKETS);
  const index = tickets.findIndex(t => t.id === ticket.id);
  
  if (index >= 0) {
    tickets[index] = ticket;
  } else {
    tickets.push(ticket);
  }
  setItems(STORAGE_KEYS.TICKETS, tickets);

  // Handle Inventory Deduction
  if (isNewPartAdded && addedPart) {
      const products = getItems<Product>(STORAGE_KEYS.PRODUCTS);
      const prodIndex = products.findIndex(p => p.id === addedPart.productId);
      if (prodIndex >= 0) {
          products[prodIndex].stock -= addedPart.quantity;
          setItems(STORAGE_KEYS.PRODUCTS, products);
      }
  }
};

// --- Print Orders ---
export const getPrintOrders = async (): Promise<PrintOrder[]> => {
  await delay(200);
  return getItems<PrintOrder>(STORAGE_KEYS.PRINT_ORDERS);
};

export const savePrintOrder = async (order: PrintOrder): Promise<void> => {
  await delay(200);
  const orders = getItems<PrintOrder>(STORAGE_KEYS.PRINT_ORDERS);
  const index = orders.findIndex(o => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders.push(order);
  }
  setItems(STORAGE_KEYS.PRINT_ORDERS, orders);
};

// --- Attendance ---
export const clockIn = async (userId: string, userName: string): Promise<void> => {
  const records = getItems<AttendanceRecord>(STORAGE_KEYS.ATTENDANCE);
  const today = new Date().toISOString().split('T')[0];
  
  // Check if already clocked in today
  const existing = records.find(r => r.userId === userId && r.date === today);
  if (existing) throw new Error("Already clocked in today");

  const newRecord: AttendanceRecord = {
    id: Date.now().toString(),
    userId,
    userName,
    date: today,
    timeIn: Date.now()
  };
  records.push(newRecord);
  setItems(STORAGE_KEYS.ATTENDANCE, records);
};

export const clockOut = async (userId: string): Promise<void> => {
  const records = getItems<AttendanceRecord>(STORAGE_KEYS.ATTENDANCE);
  const today = new Date().toISOString().split('T')[0];
  const index = records.findIndex(r => r.userId === userId && r.date === today);
  
  if (index === -1) throw new Error("No clock-in record found for today");
  if (records[index].timeOut) throw new Error("Already clocked out");

  records[index].timeOut = Date.now();
  setItems(STORAGE_KEYS.ATTENDANCE, records);
};

export const getAttendance = async (): Promise<AttendanceRecord[]> => {
    return getItems<AttendanceRecord>(STORAGE_KEYS.ATTENDANCE);
}

// --- Sales ---
export const recordSale = async (sale: SaleRecord): Promise<void> => {
  const sales = getItems<SaleRecord>(STORAGE_KEYS.SALES);
  sales.push(sale);
  setItems(STORAGE_KEYS.SALES, sales);

  // Update Stock
  const products = getItems<Product>(STORAGE_KEYS.PRODUCTS);
  sale.items.forEach(item => {
    const pIndex = products.findIndex(p => p.id === item.productId);
    if (pIndex >= 0) {
      products[pIndex].stock -= item.quantity;
    }
  });
  setItems(STORAGE_KEYS.PRODUCTS, products);
};

export const getSales = async (): Promise<SaleRecord[]> => {
    return getItems<SaleRecord>(STORAGE_KEYS.SALES);
}

// --- Customers ---
export const getCustomers = async (): Promise<{name: string, contact?: string}[]> => {
  const tickets = await getTickets();
  const printOrders = await getPrintOrders();
  const sales = await getSales();
  
  const customerMap = new Map<string, {name: string, contact?: string}>();

  // Aggregate from Tickets
  tickets.forEach(t => {
    if (t.customerName) {
      const existing = customerMap.get(t.customerName);
      if (!existing || (!existing.contact && t.customerContact)) {
        customerMap.set(t.customerName, { name: t.customerName, contact: t.customerContact });
      }
    }
  });

  // Aggregate from Print Orders
  printOrders.forEach(p => {
    if (p.customerName && !customerMap.has(p.customerName)) {
      customerMap.set(p.customerName, { name: p.customerName });
    }
  });

  // Aggregate from Sales (Credit)
  sales.forEach(s => {
    if (s.customerName && !customerMap.has(s.customerName)) {
      customerMap.set(s.customerName, { name: s.customerName });
    }
  });

  return Array.from(customerMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

// --- Collectibles Management ---
export const updatePaymentStatus = async (
  id: string, 
  type: 'ticket' | 'print' | 'sale', 
  status: PaymentStatus
): Promise<void> => {
  await delay(200);

  if (type === 'ticket') {
    const items = getItems<ServiceTicket>(STORAGE_KEYS.TICKETS);
    const index = items.findIndex(i => i.id === id);
    if (index >= 0) {
      items[index].paymentStatus = status;
      // Also update updatedAt so it shows as recent revenue if paid today
      if (status === 'Paid') items[index].updatedAt = Date.now();
      setItems(STORAGE_KEYS.TICKETS, items);
    }
  } else if (type === 'print') {
    const items = getItems<PrintOrder>(STORAGE_KEYS.PRINT_ORDERS);
    const index = items.findIndex(i => i.id === id);
    if (index >= 0) {
      items[index].paymentStatus = status;
      if (status === 'Paid') items[index].completedAt = Date.now();
      setItems(STORAGE_KEYS.PRINT_ORDERS, items);
    }
  } else if (type === 'sale') {
    const items = getItems<SaleRecord>(STORAGE_KEYS.SALES);
    const index = items.findIndex(i => i.id === id);
    if (index >= 0) {
      items[index].paymentStatus = status;
      if (status === 'Paid') items[index].date = Date.now();
      setItems(STORAGE_KEYS.SALES, items);
    }
  }
};
