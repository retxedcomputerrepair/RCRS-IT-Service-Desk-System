
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, UserRole, DeviceType, TicketStatus, PrintType, Product, 
  ServiceTicket, PrintOrder, AttendanceRecord, SaleRecord, PaymentStatus, CustomerType, ServicePart, ServiceTask, ExpenseRecord, ExpenseCategory 
} from './types';
import * as Storage from './services/storage';
import * as Gemini from './services/geminiService';
import { 
  APP_NAME, MOCK_USERS, TARPAULIN_SIZES, TSHIRT_SIZES, PAPER_TYPES, LOGO_URL
} from './constants';

// --- Icons (Inline SVGs to avoid dependencies) ---
const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Ticket: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>,
  Print: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
  Box: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Cart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Clock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Chart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Sparkles: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Trophy: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  Alert: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Collection: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
  Activity: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Trash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Scissors: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>,
  Dollar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

// --- Helper Components ---

const Button = ({ children, onClick, className = "", variant = "primary", disabled = false, ...props }: any) => {
  const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
  };
  return (
    <button className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "", onClick, style }: any) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`} onClick={onClick} style={style}>
    {children}
  </div>
);

const Badge = ({ children, color = "blue" }: any) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-800",
    purple: "bg-purple-100 text-purple-800",
    orange: "bg-orange-100 text-orange-800"
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[color] || colors.gray}`}>{children}</span>;
}

// Reusable Customer Input with Datalist & Typeahead Filter
const CustomerInput = ({ value, onChange, onSelectExisting, required = true }: { 
    value: string, 
    onChange: (val: string) => void,
    onSelectExisting?: (customer: {name: string, contact?: string}) => void,
    required?: boolean
}) => {
    const [customers, setCustomers] = useState<{name: string, contact?: string}[]>([]);
    const [suggestions, setSuggestions] = useState<{name: string, contact?: string}[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Load customers
    useEffect(() => {
        Storage.getCustomers().then(data => {
            setCustomers(data);
            setSuggestions(data.slice(0, 50)); // Initial list limit
        });
        
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filterByText = (text: string) => {
        if (!text) return customers.slice(0, 50);
        return customers.filter(c => c.name.toLowerCase().includes(text.toLowerCase())).slice(0, 50);
    };

    const filterByLetter = (letter: string) => {
        if (letter === 'ALL') return customers.slice(0, 50);
        return customers.filter(c => c.name.toUpperCase().startsWith(letter)).slice(0, 50);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(val);
        setSuggestions(filterByText(val));
        setShowSuggestions(true);
        setHighlightIndex(-1);
    };

    const handleFocus = () => {
        if (value) setSuggestions(filterByText(value));
        else setSuggestions(customers.slice(0, 50));
        setShowSuggestions(true);
    };

    const handleSelect = (customer: {name: string, contact?: string}) => {
        onChange(customer.name);
        if(onSelectExisting) onSelectExisting(customer);
        setShowSuggestions(false);
        setHighlightIndex(-1);
    };

    const handleLetterClick = (e: React.MouseEvent, letter: string) => {
        e.preventDefault(); 
        setSuggestions(filterByLetter(letter));
        if (listRef.current) listRef.current.scrollTop = 0;
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
                e.preventDefault();
                handleSelect(suggestions[highlightIndex]);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    // Scroll active item into view
    useEffect(() => {
        if (highlightIndex >= 0 && listRef.current) {
            const activeItem = listRef.current.children[highlightIndex] as HTMLElement;
            if (activeItem) {
                const listTop = listRef.current.scrollTop;
                const listHeight = listRef.current.clientHeight;
                const itemTop = activeItem.offsetTop;
                const itemHeight = activeItem.clientHeight;

                if (itemTop < listTop) {
                    listRef.current.scrollTop = itemTop;
                } else if (itemTop + itemHeight > listTop + listHeight) {
                    listRef.current.scrollTop = itemTop + itemHeight - listHeight;
                }
            }
        }
    }, [highlightIndex]);

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

    return (
        <div className="relative" ref={wrapperRef}>
            <input 
                className="w-full border p-2 rounded" 
                value={value} 
                onChange={handleChange}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                placeholder="Type name or select..."
                required={required}
                autoComplete="off"
            />
            {showSuggestions && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded shadow-lg max-h-60 flex flex-col">
                    {/* Alphabet Bar */}
                    <div 
                        className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b sticky top-0 z-20 text-[10px] justify-center select-none"
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <button 
                            className="px-1.5 py-0.5 rounded hover:bg-blue-200 bg-white border shadow-sm"
                            onClick={(e) => handleLetterClick(e, 'ALL')}
                        >ALL</button>
                        {alphabet.map(char => (
                             <button 
                                key={char}
                                className="px-1.5 py-0.5 rounded hover:bg-blue-200 bg-white border w-5 text-center shadow-sm"
                                onClick={(e) => handleLetterClick(e, char)}
                             >
                                {char}
                             </button>
                        ))}
                    </div>

                    <div className="overflow-y-auto max-h-48" ref={listRef}>
                        {suggestions.map((c, i) => (
                            <div 
                                key={i} 
                                className={`p-2 cursor-pointer border-b last:border-0 ${i === highlightIndex ? 'bg-blue-100' : 'hover:bg-blue-50'}`}
                                onClick={() => handleSelect(c)}
                            >
                                <p className="font-medium text-gray-800">{c.name}</p>
                                {c.contact && <p className="text-xs text-gray-500">{c.contact}</p>}
                            </div>
                        ))}
                        {suggestions.length === 0 && <div className="p-4 text-center text-gray-400 text-sm">No customers found</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

// Report Header
const ReportHeader = () => (
  <div className="text-center mb-6 border-b pb-4 hidden print:block">
    <div className="flex flex-col items-center justify-center mb-2">
       {LOGO_URL && <img src={LOGO_URL} alt="Logo" className="h-16 w-auto mb-2" />}
       <h1 className="text-2xl font-bold uppercase tracking-wide">Retxed Computer Repair and Services</h1>
    </div>
    <p className="text-sm text-gray-600 mt-1">Address: Del Carmen St. Baybay Carigara, Leyte</p>
    <p className="text-sm text-gray-600">Contact Number: 09995752331</p>
    <p className="text-sm text-gray-600">Email: retxedcomputerrepair@gmail.com | Fb: Retxed Computer Repair and Services</p>
  </div>
);

// --- Screens ---

const LoginScreen = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await Storage.login(username, password);
      if (user) onLogin(user);
      else setError('Invalid username or password');
    } catch (err) {
      setError('Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-2 text-slate-800">{APP_NAME}</h1>
        <p className="text-center text-gray-500 mb-6">Login to your account</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              className="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              className="w-full p-2 border border-gray-300 rounded-md"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
          <Button type="submit" className="w-full" disabled={!username || !password || loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
          <div className="text-xs text-center text-gray-400 mt-4">
            Default credentials: admin / admin123
          </div>
        </form>
      </Card>
    </div>
  );
};

const Expenses = ({ user }: { user: User }) => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'Daily' | 'Weekly' | 'Monthly'>('Monthly');
  const [formData, setFormData] = useState<Partial<ExpenseRecord>>({
    date: Date.now(),
    category: 'Bond Paper',
    quantity: 1,
    unitCost: 0
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const data = await Storage.getExpenses();
    setExpenses(data.sort((a,b) => b.date - a.date));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.itemName || !formData.category) return;

    const newExpense: ExpenseRecord = {
        id: Date.now().toString(),
        date: new Date(formData.date!).getTime(), // Use input date or current date
        itemName: formData.itemName,
        category: formData.category as ExpenseCategory,
        quantity: Number(formData.quantity) || 1,
        unitCost: Number(formData.unitCost) || 0,
        totalCost: (Number(formData.quantity) || 1) * (Number(formData.unitCost) || 0),
        supplier: formData.supplier || '',
        recordedBy: user.name
    };

    await Storage.saveExpense(newExpense);
    setFormData({ date: Date.now(), category: 'Bond Paper', quantity: 1, unitCost: 0 });
    setShowForm(false);
    loadExpenses();
  };

  const filteredExpenses = expenses.filter(exp => {
    const expenseDate = new Date(exp.date);
    const now = new Date();
    
    if (filter === 'Daily') {
        return expenseDate.toDateString() === now.toDateString();
    } else if (filter === 'Weekly') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return expenseDate >= oneWeekAgo;
    } else {
        // Monthly
        return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
    }
  });

  const totalExpense = filteredExpenses.reduce((sum, item) => sum + item.totalCost, 0);
  
  // Category Breakdown for Chart
  const categoryTotals: Record<string, number> = {};
  filteredExpenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.totalCost;
  });
  
  const sortedCategories = Object.entries(categoryTotals).sort((a,b) => b[1] - a[1]);
  const maxCatValue = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Expenses & Supplies</h2>
        <Button onClick={() => setShowForm(true)}>+ Add Expense</Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
         {['Daily', 'Weekly', 'Monthly'].map(f => (
             <button 
                key={f}
                onClick={() => setFilter(f as any)} 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === f ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
                 {f} Report
             </button>
         ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-red-50 border-red-200">
              <h3 className="text-sm font-bold text-red-800 uppercase">Total Expenses ({filter})</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">₱{totalExpense.toFixed(2)}</p>
          </Card>
          <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-sm font-bold text-blue-800 uppercase">Top Category</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{sortedCategories.length > 0 ? sortedCategories[0][0] : 'N/A'}</p>
              {sortedCategories.length > 0 && <p className="text-sm text-blue-700">₱{sortedCategories[0][1].toFixed(2)}</p>}
          </Card>
      </div>

      {/* Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
              <h3 className="font-bold text-gray-700 mb-4">Expense Breakdown</h3>
              <div className="space-y-4">
                  {sortedCategories.map(([cat, amount]) => (
                      <div key={cat}>
                          <div className="flex justify-between text-sm mb-1">
                              <span>{cat}</span>
                              <span className="font-medium">₱{amount.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${(amount / maxCatValue) * 100}%` }}
                              ></div>
                          </div>
                      </div>
                  ))}
                  {sortedCategories.length === 0 && <p className="text-gray-400 text-sm text-center">No data for this period.</p>}
              </div>
          </Card>
          
          <Card className="p-0 overflow-hidden lg:col-span-2">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {filteredExpenses.map(exp => (
                          <tr key={exp.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(exp.date).toLocaleDateString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-sm">{exp.itemName} <span className="text-gray-400 font-normal">x{exp.quantity}</span></td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge color="gray">{exp.category}</Badge></td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exp.supplier || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-700">₱{exp.totalCost.toFixed(2)}</td>
                          </tr>
                      ))}
                      {filteredExpenses.length === 0 && (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No expenses found for this period.</td></tr>
                      )}
                  </tbody>
              </table>
          </Card>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg p-6">
            <h3 className="text-xl font-bold mb-4">Add New Expense</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium mb-1">Item Name</label>
                  <input required className="w-full border p-2 rounded" value={formData.itemName || ''} onChange={e => setFormData({...formData, itemName: e.target.value})} placeholder="e.g. Epson 003 Black Ink" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as ExpenseCategory})}>
                          <option>Bond Paper</option>
                          <option>Ink</option>
                          <option>Tarpaulin Materials</option>
                          <option>Other Supplies</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input 
                        type="date" 
                        className="w-full border p-2 rounded" 
                        value={new Date(formData.date!).toISOString().split('T')[0]} 
                        onChange={e => setFormData({...formData, date: new Date(e.target.value).getTime()})} 
                       />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium mb-1">Quantity</label>
                      <input type="number" min="1" className="w-full border p-2 rounded" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                  </div>
                  <div>
                      <label className="block text-sm font-medium mb-1">Unit Cost (₱)</label>
                      <input type="number" min="0" className="w-full border p-2 rounded" value={formData.unitCost} onChange={e => setFormData({...formData, unitCost: Number(e.target.value)})} />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1">Supplier (Optional)</label>
                  <input className="w-full border p-2 rounded" value={formData.supplier || ''} onChange={e => setFormData({...formData, supplier: e.target.value})} placeholder="e.g. National Bookstore" />
              </div>

              <div className="pt-2 flex justify-between items-center border-t mt-4">
                  <p className="font-bold">Total: ₱{((Number(formData.quantity)||0) * (Number(formData.unitCost)||0)).toFixed(2)}</p>
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button type="submit">Save Expense</Button>
                  </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

// ... (Rest of Reports, Dashboard, Collectibles, ServiceDesk, PrintShop, Sales, Inventory, Attendance, UserManagement, Sidebar, App unchanged) ...
// NOTE: I am including the rest of the file content below to ensure full file replacement without losing data.

const Reports = ({ user }: { user: User }) => {
    const [activeTab, setActiveTab] = useState<'Daily' | 'Monthly' | 'Customer' | 'Financials'>('Daily');
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [techFilter, setTechFilter] = useState('');
    const [customerFilter, setCustomerFilter] = useState('');
    
    // Financial Filters
    const [financialPeriod, setFinancialPeriod] = useState<'Monthly' | 'Yearly'>('Monthly');
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

    const [salesData, setSalesData] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<ServiceTicket[]>([]);
    const [customerHistory, setCustomerHistory] = useState<any[]>([]);
    const [technicians, setTechnicians] = useState<User[]>([]);
    const [financialData, setFinancialData] = useState<{income: any[], expenses: any[], totalIncome: number, totalExpense: number}>({ income: [], expenses: [], totalIncome: 0, totalExpense: 0 });

    useEffect(() => {
        Storage.getUsers().then(users => setTechnicians(users));
    }, []);

    // Load Daily Sales
    useEffect(() => {
        const loadDaily = async () => {
            if (activeTab !== 'Daily') return;
            const start = new Date(dateFilter).setHours(0,0,0,0);
            const end = new Date(dateFilter).setHours(23,59,59,999);

            const tickets = await Storage.getTickets();
            const prints = await Storage.getPrintOrders();
            const pos = await Storage.getSales();

            const dailyItems = [
                ...tickets.filter(t => t.paymentStatus === 'Paid' && t.updatedAt >= start && t.updatedAt <= end)
                    .map(t => ({ type: 'Service', ref: t.ticketNumber, desc: `${t.deviceType} - ${t.issueDescription}`, amount: (t.laborCost + t.partsCost), user: t.assignedTo })),
                ...prints.filter(t => t.paymentStatus === 'Paid' && t.completedAt && t.completedAt >= start && t.completedAt <= end)
                    .map(p => ({ type: 'Print', ref: 'Print Job', desc: `${p.printType} x${p.quantity}`, amount: p.totalAmount, user: p.handledBy })),
                ...pos.filter(s => s.paymentStatus === 'Paid' && s.date >= start && s.date <= end)
                    .map(s => ({ type: 'Sale', ref: 'POS', desc: `${s.items.length} items`, amount: s.total, user: s.handledBy }))
            ];
            setSalesData(dailyItems);
        };
        loadDaily();
    }, [activeTab, dateFilter]);

    // Load Monthly Service Report
    useEffect(() => {
        const loadMonthly = async () => {
            if (activeTab !== 'Monthly') return;
            const tickets = await Storage.getTickets();
            
            const filtered = tickets.filter(t => {
                const d = new Date(t.updatedAt);
                const matchMonth = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` === monthFilter;
                const matchStatus = t.status === TicketStatus.COMPLETED;
                const matchTech = techFilter ? t.assignedTo === techFilter : true;
                return matchMonth && matchStatus && matchTech;
            });
            setMonthlyData(filtered);
        };
        loadMonthly();
    }, [activeTab, monthFilter, techFilter]);

    // Load Financials (Profit & Loss)
    useEffect(() => {
        const loadFinancials = async () => {
            if (activeTab !== 'Financials') return;
            const tickets = await Storage.getTickets();
            const prints = await Storage.getPrintOrders();
            const sales = await Storage.getSales();
            const expenses = await Storage.getExpenses();

            const [year, month] = monthFilter.split('-').map(Number);
            const selectedYear = parseInt(yearFilter);

            const isSamePeriod = (ts: number) => {
                const d = new Date(ts);
                if (financialPeriod === 'Monthly') {
                    return d.getFullYear() === year && (d.getMonth() + 1) === month;
                } else {
                    return d.getFullYear() === selectedYear;
                }
            };

            // Income
            const incomeItems = [
                ...tickets.filter(t => t.paymentStatus === 'Paid' && isSamePeriod(t.updatedAt)).map(t => ({ category: 'Services', amount: t.laborCost + t.partsCost })),
                ...prints.filter(p => p.paymentStatus === 'Paid' && p.completedAt && isSamePeriod(p.completedAt)).map(p => ({ category: 'Printing', amount: p.totalAmount })),
                ...sales.filter(s => s.paymentStatus === 'Paid' && isSamePeriod(s.date)).map(s => ({ category: 'Sales', amount: s.total }))
            ];

            // Expenses
            const expenseItems = expenses.filter(e => isSamePeriod(e.date));

            const totalIncome = incomeItems.reduce((acc, i) => acc + i.amount, 0);
            const totalExpense = expenseItems.reduce((acc, e) => acc + e.totalCost, 0);

            setFinancialData({ income: incomeItems, expenses: expenseItems, totalIncome, totalExpense });
        };
        loadFinancials();
    }, [activeTab, monthFilter, financialPeriod, yearFilter]);


    // Load Customer History
    useEffect(() => {
        const loadCustomer = async () => {
            if (activeTab !== 'Customer' || !customerFilter) return;
            const tickets = await Storage.getTickets();
            const prints = await Storage.getPrintOrders();
            const sales = await Storage.getSales();

            const history = [
                ...tickets.filter(t => t.customerName === customerFilter).map(t => ({ date: t.createdAt, type: 'Service', desc: t.ticketNumber, amount: (t.laborCost + t.partsCost), status: t.paymentStatus })),
                ...prints.filter(p => p.customerName === customerFilter).map(p => ({ date: p.createdAt, type: 'Print', desc: p.printType, amount: p.totalAmount, status: p.paymentStatus })),
                ...sales.filter(s => s.customerName === customerFilter).map(s => ({ date: s.date, type: 'Sale', desc: 'Items Purchased', amount: s.total, status: s.paymentStatus }))
            ].sort((a,b) => b.date - a.date);
            setCustomerHistory(history);
        };
        loadCustomer();
    }, [activeTab, customerFilter]);

    const handlePrint = () => window.print();

    const getTechName = (id: string) => technicians.find(u => u.id === id)?.name || 'Unknown';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <h2 className="text-2xl font-bold text-slate-800">Reports</h2>
                <Button onClick={handlePrint} variant="secondary">Print Report</Button>
            </div>

            <div className="flex gap-2 print:hidden border-b pb-4 overflow-x-auto">
                <button onClick={() => setActiveTab('Daily')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'Daily' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Daily Sales</button>
                <button onClick={() => setActiveTab('Monthly')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'Monthly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Monthly Service</button>
                <button onClick={() => setActiveTab('Financials')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'Financials' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Financial Statement</button>
                <button onClick={() => setActiveTab('Customer')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'Customer' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Customer Statement</button>
            </div>

            <ReportHeader />

            <div className="bg-white min-h-[500px] print:shadow-none print:border-none p-6 rounded-lg shadow-sm border border-gray-200">
                {/* DAILY SALES REPORT */}
                {activeTab === 'Daily' && (
                    <div>
                        <div className="flex justify-between items-center mb-6 print:hidden">
                            <h3 className="text-lg font-bold">Sales Report</h3>
                            <input type="date" className="border p-2 rounded" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                        </div>
                        <h3 className="text-xl font-bold text-center mb-4 hidden print:block">Sales Report: {dateFilter}</h3>

                        <table className="min-w-full divide-y divide-gray-200 border">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Handled By</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {salesData.map((item, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-2 text-sm">{item.type}</td>
                                        <td className="px-4 py-2 text-sm font-mono">{item.ref}</td>
                                        <td className="px-4 py-2 text-sm">{item.desc}</td>
                                        <td className="px-4 py-2 text-sm">{getTechName(item.user)}</td>
                                        <td className="px-4 py-2 text-sm text-right font-medium">₱{item.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-100 font-bold">
                                <tr>
                                    <td colSpan={4} className="px-4 py-2 text-right">TOTAL REVENUE</td>
                                    <td className="px-4 py-2 text-right text-blue-700">₱{salesData.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}

                {/* MONTHLY SERVICE REPORT */}
                {activeTab === 'Monthly' && (
                    <div>
                        <div className="flex flex-col md:flex-row gap-4 mb-6 print:hidden">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Month</label>
                                <input type="month" className="border p-2 rounded w-full" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Technician</label>
                                <select className="border p-2 rounded w-full min-w-[200px]" value={techFilter} onChange={e => setTechFilter(e.target.value)}>
                                    <option value="">All Technicians</option>
                                    {technicians.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-center mb-4 hidden print:block">
                            Service Desk Performance: {monthFilter} {techFilter ? `(${getTechName(techFilter)})` : ''}
                        </h3>

                        <table className="min-w-full divide-y divide-gray-200 border">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ticket #</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Device/Issue</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {monthlyData.map((t, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-2 text-sm">{new Date(t.updatedAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-2 text-sm font-mono">{t.ticketNumber}</td>
                                        <td className="px-4 py-2 text-sm">{t.customerName}</td>
                                        <td className="px-4 py-2 text-sm">{t.deviceType} - {t.issueDescription}</td>
                                        <td className="px-4 py-2 text-sm">{getTechName(t.assignedTo || '')}</td>
                                        <td className="px-4 py-2 text-sm text-right">₱{(t.laborCost + t.partsCost).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-100 font-bold">
                                <tr>
                                    <td colSpan={5} className="px-4 py-2 text-right">TOTAL SERVICE REVENUE</td>
                                    <td className="px-4 py-2 text-right text-blue-700">₱{monthlyData.reduce((sum, t) => sum + (t.laborCost + t.partsCost), 0).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}

                {/* FINANCIAL REPORT (PROFIT & LOSS) */}
                {activeTab === 'Financials' && (
                    <div>
                        <div className="flex justify-between items-center mb-6 print:hidden">
                            <h3 className="text-lg font-bold">Financial Statement</h3>
                            <div className="flex gap-2 bg-gray-100 p-1 rounded">
                                <button onClick={() => setFinancialPeriod('Monthly')} className={`px-3 py-1 text-sm rounded ${financialPeriod === 'Monthly' ? 'bg-white shadow' : 'text-gray-600'}`}>Monthly</button>
                                <button onClick={() => setFinancialPeriod('Yearly')} className={`px-3 py-1 text-sm rounded ${financialPeriod === 'Yearly' ? 'bg-white shadow' : 'text-gray-600'}`}>Yearly</button>
                            </div>
                        </div>

                        <div className="flex justify-center mb-6 print:hidden">
                            {financialPeriod === 'Monthly' ? (
                                <input type="month" className="border p-2 rounded" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} />
                            ) : (
                                <select className="border p-2 rounded w-32" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                                    {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-center mb-2">Statement of Financial Performance</h3>
                        <p className="text-center text-gray-600 mb-6">For the {financialPeriod === 'Monthly' ? `Month of ${monthFilter}` : `Year ${yearFilter}`}</p>

                        <div className="max-w-2xl mx-auto border p-6 rounded bg-gray-50">
                            
                            {/* Visual Chart */}
                            <div className="flex justify-around items-end h-40 gap-4 mb-8 border-b pb-4 px-8">
                                <div className="flex flex-col items-center w-24">
                                    <div className="text-xs font-bold mb-1 text-green-700">₱{financialData.totalIncome.toLocaleString()}</div>
                                    <div style={{ height: `${(financialData.totalIncome / Math.max(financialData.totalIncome, financialData.totalExpense, 1)) * 100}%` }} className="w-full bg-green-500 rounded-t shadow-sm transition-all duration-500"></div>
                                    <span className="text-xs mt-2 font-bold uppercase text-gray-600">Income</span>
                                </div>
                                <div className="flex flex-col items-center w-24">
                                    <div className="text-xs font-bold mb-1 text-red-700">₱{financialData.totalExpense.toLocaleString()}</div>
                                    <div style={{ height: `${(financialData.totalExpense / Math.max(financialData.totalIncome, financialData.totalExpense, 1)) * 100}%` }} className="w-full bg-red-500 rounded-t shadow-sm transition-all duration-500"></div>
                                    <span className="text-xs mt-2 font-bold uppercase text-gray-600">Expenses</span>
                                </div>
                                <div className="flex flex-col items-center w-24">
                                    <div className={`text-xs font-bold mb-1 ${financialData.totalIncome - financialData.totalExpense >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                                        ₱{(financialData.totalIncome - financialData.totalExpense).toLocaleString()}
                                    </div>
                                    <div style={{ height: `${Math.max(0, ((financialData.totalIncome - financialData.totalExpense) / Math.max(financialData.totalIncome, financialData.totalExpense, 1)) * 100)}%` }} className={`w-full rounded-t shadow-sm transition-all duration-500 ${financialData.totalIncome - financialData.totalExpense >= 0 ? 'bg-blue-600' : 'bg-red-800'}`}></div>
                                    <span className="text-xs mt-2 font-bold uppercase text-gray-600">Profit</span>
                                </div>
                            </div>

                            {/* Income Section */}
                            <div className="mb-6">
                                <h4 className="font-bold text-lg border-b border-gray-300 mb-2 pb-1">INCOME</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Service Revenue</span>
                                        <span>₱{financialData.income.filter(i => i.category === 'Services').reduce((s,i) => s+i.amount, 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Printing Revenue</span>
                                        <span>₱{financialData.income.filter(i => i.category === 'Printing').reduce((s,i) => s+i.amount, 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sales / Parts Revenue</span>
                                        <span>₱{financialData.income.filter(i => i.category === 'Sales').reduce((s,i) => s+i.amount, 0).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200 text-green-700">
                                    <span>TOTAL INCOME</span>
                                    <span>₱{financialData.totalIncome.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Expenses Section */}
                            <div className="mb-6">
                                <h4 className="font-bold text-lg border-b border-gray-300 mb-2 pb-1">EXPENSES</h4>
                                <div className="space-y-2 text-sm">
                                    {Object.entries(financialData.expenses.reduce((acc: any, exp: any) => {
                                        acc[exp.category] = (acc[exp.category] || 0) + exp.totalCost;
                                        return acc;
                                    }, {})).map(([cat, amount]: any) => (
                                        <div key={cat} className="flex justify-between">
                                            <span>{cat}</span>
                                            <span>₱{amount.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    {financialData.expenses.length === 0 && <p className="text-gray-400 italic">No expenses recorded.</p>}
                                </div>
                                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200 text-red-700">
                                    <span>TOTAL EXPENSES</span>
                                    <span>(₱{financialData.totalExpense.toFixed(2)})</span>
                                </div>
                            </div>

                            {/* Net Profit Section */}
                            <div className="border-t-2 border-black pt-4">
                                <div className="flex justify-between items-center text-xl font-bold">
                                    <span>NET PROFIT / (LOSS)</span>
                                    <span className={(financialData.totalIncome - financialData.totalExpense) >= 0 ? 'text-blue-800' : 'text-red-800'}>
                                        ₱{(financialData.totalIncome - financialData.totalExpense).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* CUSTOMER STATEMENT */}
                {activeTab === 'Customer' && (
                    <div>
                        <div className="mb-6 print:hidden">
                            <label className="block text-sm font-medium mb-1">Select Customer</label>
                            <CustomerInput value={customerFilter} onChange={setCustomerFilter} />
                        </div>
                        
                        {customerFilter ? (
                            <div>
                                <div className="mb-6 bg-gray-50 p-4 rounded border">
                                    <h3 className="text-xl font-bold mb-2">Statement of Account</h3>
                                    <p className="text-lg">Customer: <strong>{customerFilter}</strong></p>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="p-3 bg-white border rounded">
                                            <span className="text-gray-500 text-sm">Total Spent (Lifetime)</span>
                                            <p className="text-xl font-bold">₱{customerHistory.reduce((s,i) => s + i.amount, 0).toFixed(2)}</p>
                                        </div>
                                        <div className="p-3 bg-white border rounded border-red-200 bg-red-50">
                                            <span className="text-red-700 text-sm">Current Balance (Unpaid)</span>
                                            <p className="text-xl font-bold text-red-700">
                                                ₱{customerHistory.filter(i => i.status === 'Unpaid').reduce((s,i) => s + i.amount, 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <table className="min-w-full divide-y divide-gray-200 border">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {customerHistory.map((item, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-2 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-2 text-sm"><Badge color="gray">{item.type}</Badge></td>
                                                <td className="px-4 py-2 text-sm">{item.desc}</td>
                                                <td className="px-4 py-2 text-sm">
                                                    <span className={item.status === 'Paid' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{item.status}</span>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-right">₱{item.amount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-10 print:hidden">Please select a customer to view their statement.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const Dashboard = ({ user, onChangeView }: { user: User, onChangeView: (view: string) => void }) => {
  const [stats, setStats] = useState({ tickets: 0, printOrders: 0, salesToday: 0 });
  const [topProduct, setTopProduct] = useState<{name: string, count: number} | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [collectibles, setCollectibles] = useState(0);
  const [ticketStatusCounts, setTicketStatusCounts] = useState<Record<string, number>>({});
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [weeklySales, setWeeklySales] = useState<{date: string, amount: number}[]>([]);
  const [techWorkload, setTechWorkload] = useState<{name: string, count: number}[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      const tickets = await Storage.getTickets();
      const orders = await Storage.getPrintOrders();
      const sales = await Storage.getSales();
      const products = await Storage.getProducts();
      const users = await Storage.getUsers();
      
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const posSales = sales
        .filter(s => s.date >= today.getTime() && s.paymentStatus === 'Paid')
        .reduce((acc, curr) => acc + curr.total, 0);
      
      const ticketSales = tickets
        .filter(t => t.status === TicketStatus.COMPLETED && t.paymentStatus === 'Paid' && t.updatedAt >= today.getTime())
        .reduce((acc, t) => acc + (t.laborCost + t.partsCost), 0);
        
      const printSales = orders
        .filter(o => o.status === 'Delivered' && o.paymentStatus === 'Paid' && (o.completedAt || o.createdAt) >= today.getTime())
        .reduce((acc, o) => acc + o.totalAmount, 0);
      
      // Calculate Collectibles
      const unpaidTickets = tickets.filter(t => t.paymentStatus === 'Unpaid' && t.status === TicketStatus.COMPLETED).reduce((acc,t) => acc + (t.laborCost + t.partsCost), 0);
      const unpaidPrints = orders.filter(o => o.paymentStatus === 'Unpaid' && o.status === 'Delivered').reduce((acc,o) => acc + o.totalAmount, 0);
      const unpaidSales = sales.filter(s => s.paymentStatus === 'Unpaid').reduce((acc,s) => acc + s.total, 0);

      // Ticket Status Breakdown
      const statusCounts: Record<string, number> = {};
      tickets.forEach(t => {
          statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
      });
      setTicketStatusCounts(statusCounts);

      setStats({
        tickets: tickets.filter(t => t.status !== TicketStatus.COMPLETED && t.status !== TicketStatus.CANCELLED).length,
        printOrders: orders.filter(o => o.status !== 'Delivered').length,
        salesToday: posSales + ticketSales + printSales
      });
      setCollectibles(unpaidTickets + unpaidPrints + unpaidSales);

      // Top Product
      const productCounts = new Map<string, number>();
      sales.forEach(s => {
        s.items.forEach(item => {
            const current = productCounts.get(item.productName) || 0;
            productCounts.set(item.productName, current + item.quantity);
        });
      });
      let maxCount = 0;
      let topProdName = '';
      productCounts.forEach((count, name) => {
        if(count > maxCount) { maxCount = count; topProdName = name; }
      });
      if(topProdName) setTopProduct({ name: topProdName, count: maxCount });

      // Low Stock
      setLowStockProducts(products.filter(p => p.stock <= 5));

      // Recent Activity
      const activities = [
          ...tickets.map(t => ({ type: 'ticket', desc: `Ticket #${t.ticketNumber} Updated (${t.status})`, date: t.updatedAt, id: t.id })),
          ...orders.map(o => ({ type: 'print', desc: `Print Order (${o.printType}) ${o.status}`, date: o.completedAt || o.createdAt, id: o.id })),
          ...sales.map(s => ({ type: 'sale', desc: `Sale Recorded (₱${s.total})`, date: s.date, id: s.id }))
      ].sort((a,b) => b.date - a.date).slice(0, 8);
      setRecentActivities(activities);

      // Weekly Revenue (Last 7 Days)
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          d.setHours(0,0,0,0);
          const nextDay = new Date(d);
          nextDay.setDate(d.getDate() + 1);

          const daySales = sales.filter(s => s.paymentStatus === 'Paid' && s.date >= d.getTime() && s.date < nextDay.getTime()).reduce((a,b) => a + b.total, 0);
          const dayTickets = tickets.filter(t => t.paymentStatus === 'Paid' && t.updatedAt >= d.getTime() && t.updatedAt < nextDay.getTime()).reduce((a,b) => a + (b.laborCost + b.partsCost), 0);
          const dayPrints = orders.filter(o => o.paymentStatus === 'Paid' && (o.completedAt || o.createdAt) >= d.getTime() && (o.completedAt || o.createdAt) < nextDay.getTime()).reduce((a,b) => a + b.totalAmount, 0);
          
          weeklyData.push({
              date: d.toLocaleDateString('en-US', { weekday: 'short' }),
              amount: daySales + dayTickets + dayPrints
          });
      }
      setWeeklySales(weeklyData);

      // Tech Workload
      const workload: Record<string, number> = {};
      tickets.filter(t => t.status !== TicketStatus.COMPLETED && t.status !== TicketStatus.CANCELLED).forEach(t => {
          if(t.assignedTo) workload[t.assignedTo] = (workload[t.assignedTo] || 0) + 1;
      });
      const techLoad = users.filter(u => u.role !== UserRole.ADMIN).map(u => ({
          name: u.name,
          count: workload[u.id] || 0
      })).sort((a,b) => b.count - a.count);
      setTechWorkload(techLoad);

    };
    loadStats();
  }, []);

  const maxWeekly = Math.max(...weeklySales.map(d => d.amount), 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
        <div className="flex gap-2">
            <Button onClick={() => onChangeView('tickets')} className="text-sm flex items-center gap-1"><Icons.Plus /> New Ticket</Button>
            <Button onClick={() => onChangeView('sales')} variant="success" className="text-sm flex items-center gap-1"><Icons.Plus /> New Sale</Button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
             <div>
               <h3 className="text-gray-500 text-sm font-medium">Open Service Tickets</h3>
               <p className="text-3xl font-bold text-slate-900 mt-2">{stats.tickets}</p>
             </div>
             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Icons.Ticket /></div>
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-purple-500">
           <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Pending Print Orders</h3>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.printOrders}</p>
              </div>
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Icons.Print /></div>
           </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-green-500">
           <div className="flex justify-between items-start">
              <div>
                  <h3 className="text-gray-500 text-sm font-medium">Sales Today (Paid)</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">₱{stats.salesToday.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Icons.Cart /></div>
           </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-orange-500">
            <div className="flex justify-between items-start">
                <div>
                   <h3 className="text-gray-500 text-sm font-medium">Total Collectibles</h3>
                   <p className="text-3xl font-bold text-orange-600 mt-2">₱{collectibles.toFixed(2)}</p>
                </div>
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Icons.Collection /></div>
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Revenue Chart */}
          <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Icons.Chart /> Weekly Revenue Trend</h3>
              <div className="flex items-end justify-between h-48 gap-2">
                  {weeklySales.map((day, i) => (
                      <div key={i} className="flex flex-col items-center flex-1 group relative">
                          <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              ₱{day.amount.toFixed(0)}
                          </div>
                          <div 
                              className="w-full bg-blue-100 hover:bg-blue-300 rounded-t-sm transition-all" 
                              style={{ height: `${(day.amount / maxWeekly) * 100}%` }}
                          ></div>
                          <span className="text-xs text-gray-500 mt-2 font-medium">{day.date}</span>
                      </div>
                  ))}
              </div>
          </Card>

          {/* Ticket Breakdown */}
          <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Service Status</h3>
              <div className="space-y-4">
                  {[TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_PARTS].map(status => {
                      const count = ticketStatusCounts[status] || 0;
                      const total = stats.tickets || 1; 
                      return (
                        <div key={status}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">{status}</span>
                                <span className="font-bold text-gray-900">{count}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full ${status === TicketStatus.OPEN ? 'bg-blue-500' : status === TicketStatus.IN_PROGRESS ? 'bg-orange-500' : 'bg-red-500'}`} 
                                    style={{ width: `${(count / total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                      );
                  })}
              </div>
              <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Technician Workload (Active)</h4>
                  <div className="space-y-2">
                      {techWorkload.map((tech, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{tech.name}</span>
                              <Badge color="gray">{tech.count} tickets</Badge>
                          </div>
                      ))}
                      {techWorkload.length === 0 && <p className="text-xs text-gray-400">No active technicians.</p>}
                  </div>
              </div>
          </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Icons.Activity /> Recent Activity</h3>
              <div className="space-y-4">
                  {recentActivities.map((act, i) => (
                      <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                          <div className={`mt-1 p-1.5 rounded-full ${act.type === 'ticket' ? 'bg-blue-100 text-blue-600' : act.type === 'sale' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                              {act.type === 'ticket' ? <Icons.Ticket /> : act.type === 'sale' ? <Icons.Cart /> : <Icons.Print />}
                          </div>
                          <div>
                              <p className="text-sm font-medium text-gray-900">{act.desc}</p>
                              <p className="text-xs text-gray-500">{new Date(act.date).toLocaleString()}</p>
                          </div>
                      </div>
                  ))}
                  {recentActivities.length === 0 && <p className="text-gray-500 text-sm">No recent activity found.</p>}
              </div>
          </Card>

          {/* Alerts & Insights */}
          <div className="space-y-6">
             {topProduct && (
               <Card className="p-6 bg-yellow-50 border-yellow-200">
                  <div className="flex items-start gap-3">
                      <div className="p-3 bg-yellow-100 rounded-full text-yellow-600"><Icons.Trophy /></div>
                      <div>
                          <h3 className="text-lg font-bold text-yellow-900">Top Product</h3>
                          <p className="text-xl font-bold text-slate-800 mt-1">{topProduct.name}</p>
                          <p className="text-sm text-yellow-700 mt-1">{topProduct.count} units sold recently</p>
                      </div>
                  </div>
              </Card>
             )}

             {lowStockProducts.length > 0 && (
                <Card className="p-6 border-l-4 border-l-red-500 bg-red-50">
                    <div className="flex items-start gap-2 mb-2">
                        <span className="text-red-600 mt-1"><Icons.Alert /></span>
                        <h3 className="text-lg font-bold text-red-800">Low Stock Alert</h3>
                    </div>
                    <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
                        {lowStockProducts.map(p => (
                            <div key={p.id} className="flex justify-between items-center bg-white p-2 rounded border border-red-200 shadow-sm">
                                <span className="text-sm font-medium truncate flex-1 pr-2" title={p.name}>{p.name}</span>
                                <Badge color="red">{p.stock} left</Badge>
                            </div>
                        ))}
                    </div>
                </Card>
             )}
          </div>
      </div>
    </div>
  );
};

const Collectibles = ({ user }: { user: User }) => {
  const [unpaidItems, setUnpaidItems] = useState<any[]>([]);
  const [customerFilter, setCustomerFilter] = useState('');

  const loadData = async () => {
    const tickets = await Storage.getTickets();
    const orders = await Storage.getPrintOrders();
    const sales = await Storage.getSales();

    const items = [
      ...tickets.filter(t => t.status === TicketStatus.COMPLETED && t.paymentStatus === 'Unpaid').map(t => ({ ...t, type: 'ticket', amount: t.laborCost + t.partsCost, name: t.customerName, date: t.updatedAt })),
      ...orders.filter(o => o.status === 'Delivered' && o.paymentStatus === 'Unpaid').map(o => ({ ...o, type: 'print', amount: o.totalAmount, name: o.customerName, date: o.completedAt || o.createdAt })),
      ...sales.filter(s => s.paymentStatus === 'Unpaid').map(s => ({ ...s, type: 'sale', amount: s.total, name: s.customerName || 'Unknown', date: s.date }))
    ];
    setUnpaidItems(items.sort((a,b) => b.date - a.date));
  };

  useEffect(() => { loadData(); }, []);

  const handleMarkPaid = async (id: string, type: 'ticket'|'print'|'sale') => {
    if(confirm("Mark this transaction as PAID?")) {
      await Storage.updatePaymentStatus(id, type, 'Paid');
      loadData();
    }
  };

  const handleMarkAllPaid = async (customerName: string) => {
     if(confirm(`Mark ALL transactions for ${customerName} as PAID?`)) {
        const toPay = unpaidItems.filter(i => i.name === customerName);
        for(const item of toPay) {
            await Storage.updatePaymentStatus(item.id, item.type, 'Paid');
        }
        loadData();
     }
  };

  const filteredItems = customerFilter 
    ? unpaidItems.filter(i => i.name === customerFilter) 
    : unpaidItems;

  const totalDue = filteredItems.reduce((sum, i) => sum + i.amount, 0);

  const handlePrint = () => {
      window.print();
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center print:hidden">
         <h2 className="text-2xl font-bold text-slate-800">Collectibles (Unpaid Transactions)</h2>
         <Button onClick={handlePrint} variant="secondary">Print List</Button>
       </div>

       <div className="print:block hidden"><ReportHeader /></div>
       
       <Card className="p-4 print:shadow-none print:border-none">
          <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-end print:hidden">
              <div className="w-full md:w-1/3">
                  <label className="block text-sm font-medium mb-1">Filter by Customer</label>
                  <select className="w-full border p-2 rounded" value={customerFilter} onChange={e => setCustomerFilter(e.target.value)}>
                      <option value="">All Customers</option>
                      {Array.from(new Set(unpaidItems.map(i => i.name))).sort().map(name => (
                          <option key={name} value={name}>{name}</option>
                      ))}
                  </select>
              </div>
              {customerFilter && (
                  <Button onClick={() => handleMarkAllPaid(customerFilter)} variant="success">Mark All Paid for {customerFilter}</Button>
              )}
          </div>

          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded text-center">
              <p className="text-sm text-orange-800 font-medium">Total Amount Due</p>
              <p className="text-3xl font-bold text-orange-600">₱{totalDue.toFixed(2)}</p>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase print:hidden">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <Badge color={item.type === 'ticket' ? 'purple' : item.type === 'print' ? 'blue' : 'green'}>{item.type.toUpperCase()}</Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.type === 'ticket' ? `Ticket ${item.ticketNumber}` : item.type === 'print' ? `${item.printType} (${item.quantity})` : `POS Sale`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-red-600">₱{item.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right print:hidden">
                  <Button variant="success" className="py-1 px-3 text-sm" onClick={() => handleMarkPaid(item.id, item.type)}>Pay Now</Button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No unpaid transactions found.</td></tr>
            )}
          </tbody>
        </table>
       </Card>
    </div>
  );
};
// ... (Including rest of the file ServiceDesk, PrintShop, Sales, Inventory, Attendance, UserManagement, Sidebar, App default function) ...

const ServiceDesk = ({ user }: { user: User }) => {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'Details' | 'Parts' | 'Checklist' | 'Logs'>('Details');
  const [viewClaimStub, setViewClaimStub] = useState<ServiceTicket | null>(null);
  
  // Custom date state for backdating (Admin only)
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

  // Form State
  const [formData, setFormData] = useState<Partial<ServiceTicket>>({
    deviceType: DeviceType.LAPTOP,
    status: TicketStatus.OPEN,
    assignedTo: '',
    paymentStatus: 'Unpaid',
    usedParts: [],
    checklist: [],
    logs: []
  });

  const loadData = async () => {
    const tData = await Storage.getTickets();
    const uData = await Storage.getUsers();
    const pData = await Storage.getProducts();
    setTickets(tData.sort((a, b) => b.updatedAt - a.updatedAt));
    setStaffList(uData);
    setInventory(pData);
  };

  useEffect(() => { loadData(); }, []);

  const openForm = (ticket?: ServiceTicket) => {
      setSelectedTicket(ticket || null);
      if (ticket) {
          setFormData(ticket);
          setCustomDate(new Date(ticket.createdAt).toISOString().split('T')[0]);
      } else {
          setFormData({ deviceType: DeviceType.LAPTOP, status: TicketStatus.OPEN, assignedTo: '', paymentStatus: 'Unpaid', usedParts: [], checklist: [], logs: [] });
          setCustomDate(new Date().toISOString().split('T')[0]);
      }
      setActiveTab('Details');
      setShowForm(true);
      setAiAnalysis('');
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.issueDescription) return;

    let ticketNumber = selectedTicket?.ticketNumber;
    if (!ticketNumber) {
        let maxNum = 1000;
        tickets.forEach(t => {
            if (t.ticketNumber && t.ticketNumber.startsWith('TKT-')) {
                const num = parseInt(t.ticketNumber.split('-')[1]);
                if (!isNaN(num) && num > maxNum) maxNum = num;
            }
        });
        ticketNumber = `TKT-${maxNum + 1}`;
    }

    // Calculate Parts Cost
    const partsCost = (formData.usedParts || []).reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);

    // Logs Logic
    const newLogs = [...(formData.logs || [])];
    if (selectedTicket && selectedTicket.status !== formData.status) {
        newLogs.push({ date: Date.now(), action: `Status changed to ${formData.status}`, user: user.name });
    } else if (!selectedTicket) {
        newLogs.push({ date: Date.now(), action: 'Ticket Created', user: user.name });
    }

    // Determine created date (allow backdating for admins)
    const creationTime = (user.role === UserRole.ADMIN && customDate) 
        ? new Date(customDate).getTime() 
        : (selectedTicket ? selectedTicket.createdAt : Date.now());

    const ticket: ServiceTicket = {
      id: selectedTicket ? selectedTicket.id : Date.now().toString(),
      ticketNumber,
      customerName: formData.customerName!,
      customerContact: formData.customerContact || '',
      customerType: formData.customerType as CustomerType,
      careOf: formData.careOf,
      deviceType: formData.deviceType as DeviceType,
      deviceModel: formData.deviceModel || '',
      issueDescription: formData.issueDescription!,
      diagnosis: formData.diagnosis || '',
      status: formData.status as TicketStatus,
      laborCost: Number(formData.laborCost) || 0,
      partsCost: partsCost,
      createdAt: creationTime,
      updatedAt: Date.now(),
      assignedTo: formData.assignedTo || user.id,
      notes: selectedTicket ? selectedTicket.notes : [],
      paymentStatus: formData.paymentStatus as PaymentStatus || 'Unpaid',
      usedParts: formData.usedParts || [],
      checklist: formData.checklist || [],
      logs: newLogs
    };

    await Storage.saveTicket(ticket);
    setShowForm(false);
    setSelectedTicket(null);
    setFormData({});
    loadData();
  };

  const addPartToTicket = (productId: string) => {
      const product = inventory.find(p => p.id === productId);
      if (!product || product.stock <= 0) return;

      const newPart: ServicePart = {
          productId: product.id,
          name: product.name,
          quantity: 1,
          unitPrice: product.price
      };

      const existingPartIndex = (formData.usedParts || []).findIndex(p => p.productId === productId);
      const updatedParts = [...(formData.usedParts || [])];
      
      if (existingPartIndex >= 0) {
          updatedParts[existingPartIndex].quantity += 1;
      } else {
          updatedParts.push(newPart);
      }
      
      setFormData({ ...formData, usedParts: updatedParts });
  };

  const removePart = (index: number) => {
      const updatedParts = [...(formData.usedParts || [])];
      updatedParts.splice(index, 1);
      setFormData({ ...formData, usedParts: updatedParts });
  }

  const addTask = (desc: string) => {
      if(!desc) return;
      const newTask: ServiceTask = { id: Date.now().toString(), description: desc, isCompleted: false };
      setFormData({ ...formData, checklist: [...(formData.checklist || []), newTask] });
  };

  const toggleTask = (index: number) => {
      const updatedTasks = [...(formData.checklist || [])];
      updatedTasks[index].isCompleted = !updatedTasks[index].isCompleted;
      setFormData({ ...formData, checklist: updatedTasks });
  };

  const loadPresetTasks = (type: string) => {
      let tasks: string[] = [];
      if (type === 'Format') tasks = ['Backup Data', 'Format Drive', 'Install OS', 'Install Drivers', 'Update Windows', 'Install Common Apps'];
      if (type === 'Hardware') tasks = ['Diagnose Component', 'Order Part', 'Remove Old Part', 'Install New Part', 'Test Functionality'];
      if (type === 'Cleanup') tasks = ['Physical Cleaning', 'Fan Cleaning', 'Thermal Paste Replacement', 'Disk Cleanup', 'Virus Scan'];

      const newTasks = tasks.map((t, i) => ({ id: `${Date.now()}-${i}`, description: t, isCompleted: false }));
      setFormData({ ...formData, checklist: [...(formData.checklist || []), ...newTasks] });
  }

  const runAiAnalysis = async (ticket: ServiceTicket) => {
    setAnalyzing(true);
    setAiAnalysis('');
    const result = await Gemini.analyzeIssue(ticket.deviceType, ticket.issueDescription);
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  const getAssignedName = (id?: string) => {
    if(!id) return 'Unassigned';
    return staffList.find(u => u.id === id)?.name || 'Unknown';
  }

  const filteredTickets = tickets.filter(t => 
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.ticketNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (viewClaimStub) {
      const t = viewClaimStub;

      const RenderStub = ({ title, type }: { title: string, type: 'CUSTOMER' | 'SERVICE' }) => (
          <div className="border-2 border-slate-800 p-6 rounded-lg relative h-[48%] flex flex-col justify-between">
              {/* Corner Label */}
              <div className="absolute top-0 right-0 border-b-2 border-l-2 border-slate-800 px-3 py-1 bg-gray-100 font-bold text-sm">
                  {title}
              </div>

              {/* Header */}
              <div className="text-center mb-4">
                  <div className="flex justify-center mb-1">
                     {LOGO_URL && <img src={LOGO_URL} alt="Logo" className="h-12 w-auto" />}
                  </div>
                  <h1 className="text-xl font-bold uppercase tracking-wide">Retxed Computer Repair and Services</h1>
                  <p className="text-xs text-gray-600">Address: Del Carmen St. Baybay Carigara, Leyte</p>
                  <p className="text-xs text-gray-600">Contact: 09995752331 | Fb: Retxed Computer Repair</p>
                  <div className="mt-2 text-2xl font-mono font-bold bg-slate-100 inline-block px-4 py-1 rounded border border-slate-300">
                      {t.ticketNumber}
                  </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm mb-4">
                  <div>
                      <span className="block text-xs font-bold text-gray-500 uppercase">Customer</span>
                      <p className="font-bold truncate">{t.customerName}</p>
                      <p className="text-xs text-gray-600">{t.customerContact}</p>
                      {t.careOf && <p className="text-xs italic">c/o {t.careOf}</p>}
                  </div>
                  <div>
                      <span className="block text-xs font-bold text-gray-500 uppercase">Device</span>
                      <p className="font-bold truncate">{t.deviceType} - {t.deviceModel}</p>
                      <p className="text-xs text-gray-600">Date: {new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="col-span-2">
                      <span className="block text-xs font-bold text-gray-500 uppercase">Issue / Service</span>
                      <p className="bg-gray-50 p-2 border rounded text-xs leading-snug">{t.issueDescription}</p>
                  </div>
              </div>
              
              {/* Financials Summary */}
              <div className="flex justify-between items-center border-t border-b py-2 mb-2 text-sm">
                   <span className="font-bold">Estimated Cost:</span>
                   <span className="font-bold text-lg">₱{(t.laborCost + t.partsCost).toFixed(2)}</span>
              </div>

              {/* Terms & Conditions */}
              <div className="text-[10px] text-gray-500 leading-tight space-y-1 mb-6">
                  <p className="font-bold text-xs text-gray-700">TERMS AND CONDITIONS:</p>
                  <ul className="list-disc pl-3">
                      <li><strong>90 DAYS CLAIM POLICY:</strong> Retxed Computer Repair is not liable for items unclaimed 90 days after notification of completion. Unclaimed units may be disposed of to cover repair costs.</li>
                      <li><strong>CLAIM REQUIREMENT:</strong> Customer must present this Claim Stub or a valid Government ID to claim the unit.</li>
                      <li><strong>DATA PRIVACY:</strong> We are not responsible for any data loss. Please backup your files before repair. No guarantee of data retrieval.</li>
                      <li><strong>WARRANTY:</strong> 7 days service warranty on the same issue. Hardware warranty subject to supplier terms.</li>
                      <li>Known issues must be listed before acceptance.</li>
                  </ul>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end mt-auto pt-2">
                  <div className="text-center w-1/3">
                      <div className="border-b border-black mb-1 h-4"></div>
                      <p className="text-[10px] uppercase">Customer Signature</p>
                  </div>
                  <div className="text-center w-1/3">
                      <div className="border-b border-black mb-1 h-4"></div>
                      <p className="text-[10px] uppercase">Received By ({getAssignedName(t.assignedTo)})</p>
                  </div>
              </div>
          </div>
      );

      return (
          <div className="bg-white min-h-screen p-8 mx-auto w-full max-w-[800px]">
              <div className="flex justify-between items-center mb-8 print:hidden">
                  <Button variant="secondary" onClick={() => setViewClaimStub(null)}>Back to Tickets</Button>
                  <Button onClick={() => window.print()}>Print Claim Stub</Button>
              </div>

              <div className="h-[1000px] flex flex-col relative">
                   {/* Service Desk Copy */}
                   <RenderStub title="SERVICE DESK COPY" type="SERVICE" />

                   {/* Cut Line */}
                   <div className="flex items-center justify-center my-4 text-gray-400">
                       <div className="border-b-2 border-dashed w-full border-gray-400"></div>
                       <span className="px-2"><Icons.Scissors /></span>
                       <div className="border-b-2 border-dashed w-full border-gray-400"></div>
                   </div>

                   {/* Customer Copy */}
                   <RenderStub title="CUSTOMER COPY" type="CUSTOMER" />
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Service Desk</h2>
        <div className="flex gap-2 w-full md:w-auto">
            <input 
                type="text" 
                placeholder="Search Ticket # or Customer..." 
                className="border p-2 rounded flex-1 min-w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={() => openForm()}>New Ticket</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTickets.map(t => (
          <Card key={t.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4" style={{borderLeftColor: t.status === 'Completed' ? '#10B981' : '#3B82F6'}} onClick={() => openForm(t)}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-sm">{t.ticketNumber || 'N/A'}</span>
                    <h3 className="font-semibold text-lg">{t.customerName} {t.careOf ? <span className="text-sm font-normal text-gray-500">(c/o {t.careOf})</span> : ''}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 mt-2">
                    <p><span className="font-medium text-gray-800">Contact:</span> {t.customerContact || 'N/A'}</p>
                    <p><span className="font-medium text-gray-800">Device:</span> {t.deviceType} - {t.deviceModel}</p>
                    <p className="col-span-1 md:col-span-2 mt-1"><span className="font-medium text-gray-800">Issue:</span> {t.issueDescription}</p>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded border">Assigned to: {getAssignedName(t.assignedTo)}</span>
                    <span>Created: {new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right pl-4">
                <Badge color={t.status === 'Completed' ? 'green' : t.status === 'Cancelled' ? 'red' : 'yellow'}>{t.status}</Badge>
                {t.status === TicketStatus.COMPLETED && (
                    <div className="mt-1"><Badge color={t.paymentStatus === 'Paid' ? 'green' : 'red'}>{t.paymentStatus}</Badge></div>
                )}
                <div className="mt-2 text-right">
                    <p className="font-bold text-gray-700">₱{(t.laborCost + t.partsCost).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Total</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t flex justify-end">
                <Button className="text-xs py-1" variant="secondary" onClick={(e: any) => { e.stopPropagation(); setViewClaimStub(t); }}>View Claim Stub</Button>
            </div>
          </Card>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-4xl p-0 relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-bold">{selectedTicket ? `Edit Ticket ${selectedTicket.ticketNumber}` : 'New Service Ticket'}</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 font-bold text-xl">&times;</button>
            </div>

            <div className="flex border-b bg-gray-50">
                <button onClick={() => setActiveTab('Details')} className={`px-6 py-3 font-medium text-sm ${activeTab === 'Details' ? 'bg-white border-t-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:bg-white'}`}>Details</button>
                <button onClick={() => setActiveTab('Parts')} className={`px-6 py-3 font-medium text-sm ${activeTab === 'Parts' ? 'bg-white border-t-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:bg-white'}`}>Parts & Materials</button>
                <button onClick={() => setActiveTab('Checklist')} className={`px-6 py-3 font-medium text-sm ${activeTab === 'Checklist' ? 'bg-white border-t-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:bg-white'}`}>Service Checklist</button>
                <button onClick={() => setActiveTab('Logs')} className={`px-6 py-3 font-medium text-sm ${activeTab === 'Logs' ? 'bg-white border-t-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:bg-white'}`}>History Logs</button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6">
              
              {/* --- DETAILS TAB --- */}
              {activeTab === 'Details' && (
                <div className="space-y-4">
                    {user.role === UserRole.ADMIN && (
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mb-4">
                             <label className="block text-xs font-bold text-yellow-800 uppercase mb-1">Transaction Date (Admin Only)</label>
                             <input 
                                type="date" 
                                className="border p-2 rounded w-full md:w-auto" 
                                value={customDate}
                                onChange={e => setCustomDate(e.target.value)}
                             />
                             <p className="text-xs text-yellow-700 mt-1">Allows entering old transactions.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-1">Customer Name</label>
                        <CustomerInput 
                            value={formData.customerName || ''} 
                            onChange={(val) => setFormData({...formData, customerName: val})}
                            onSelectExisting={(c) => {
                                setFormData(prev => ({...prev, customerName: c.name, customerContact: c.contact || prev.customerContact}));
                            }}
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-1">Contact Info</label>
                        <input className="w-full border p-2 rounded" value={formData.customerContact || ''} onChange={e => setFormData({...formData, customerContact: e.target.value})} placeholder="Phone / Email" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Customer Type</label>
                            <select className="w-full border p-2 rounded" value={formData.customerType || 'Individual'} onChange={e => setFormData({...formData, customerType: e.target.value as any})}>
                                <option value="Individual">Individual</option>
                                <option value="Company">Company</option>
                                <option value="LGU">LGU</option>
                                <option value="School">School</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Care Of (Optional)</label>
                            <input className="w-full border p-2 rounded" value={formData.careOf || ''} onChange={e => setFormData({...formData, careOf: e.target.value})} placeholder="For Companies/LGUs" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-1">Device Type</label>
                        <select className="w-full border p-2 rounded" value={formData.deviceType} onChange={e => setFormData({...formData, deviceType: e.target.value as DeviceType})}>
                            {Object.values(DeviceType).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-1">Model</label>
                        <input className="w-full border p-2 rounded" value={formData.deviceModel || ''} onChange={e => setFormData({...formData, deviceModel: e.target.value})} placeholder="e.g. Dell Inspiron 15" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Issue Description</label>
                        <textarea required className="w-full border p-2 rounded" rows={3} value={formData.issueDescription || ''} onChange={e => setFormData({...formData, issueDescription: e.target.value})} />
                    </div>
                    
                    {selectedTicket && (
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-blue-900 flex items-center gap-2"><Icons.Sparkles /> AI Diagnosis</h4>
                            <Button type="button" variant="secondary" onClick={() => runAiAnalysis(selectedTicket)} disabled={analyzing}>
                            {analyzing ? 'Analyzing...' : 'Analyze Issue'}
                            </Button>
                        </div>
                        {aiAnalysis && <pre className="whitespace-pre-wrap text-sm text-blue-800 bg-white p-3 rounded border border-blue-100">{aiAnalysis}</pre>}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Diagnosis / Tech Notes</label>
                        <textarea className="w-full border p-2 rounded" rows={3} value={formData.diagnosis || ''} onChange={e => setFormData({...formData, diagnosis: e.target.value})} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Assigned Staff / Technician</label>
                        <select 
                            className="w-full border p-2 rounded" 
                            value={formData.assignedTo || ''} 
                            onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                        >
                            <option value="">Select Staff...</option>
                            {staffList.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select className="w-full border p-2 rounded" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as TicketStatus})}>
                            {Object.values(TicketStatus).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-1">Labor Cost (₱)</label>
                        <input type="number" className="w-full border p-2 rounded" value={formData.laborCost || 0} onChange={e => setFormData({...formData, laborCost: Number(e.target.value)})} />
                        </div>
                    </div>
                    
                    {formData.status === TicketStatus.COMPLETED && (
                        <div className="bg-green-50 p-4 rounded border border-green-200">
                            <label className="block text-sm font-bold text-green-800 mb-2">Payment Status</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="payStatus" checked={formData.paymentStatus === 'Paid'} onChange={() => setFormData({...formData, paymentStatus: 'Paid'})} />
                                    <span>Paid (Cash)</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="payStatus" checked={formData.paymentStatus === 'Unpaid'} onChange={() => setFormData({...formData, paymentStatus: 'Unpaid'})} />
                                    <span>Unpaid (Credit/Collectibles)</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
              )}

              {/* --- PARTS TAB --- */}
              {activeTab === 'Parts' && (
                <div className="space-y-4">
                    <div className="flex gap-4 items-end bg-gray-50 p-4 rounded border">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Add Part from Inventory</label>
                            <select id="partSelect" className="w-full border p-2 rounded">
                                <option value="">Select a product...</option>
                                {inventory.map(p => (
                                    <option key={p.id} value={p.id} disabled={p.stock <= 0}>{p.name} (₱{p.price}) - {p.stock} in stock</option>
                                ))}
                            </select>
                        </div>
                        <Button type="button" onClick={() => {
                            const select = document.getElementById('partSelect') as HTMLSelectElement;
                            if(select.value) { addPartToTicket(select.value); select.value = ''; }
                        }}>Add Part</Button>
                    </div>

                    <table className="w-full border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 text-left">Item Name</th>
                                <th className="p-2 text-center">Qty</th>
                                <th className="p-2 text-right">Price</th>
                                <th className="p-2 text-right">Subtotal</th>
                                <th className="p-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(formData.usedParts || []).map((part, i) => (
                                <tr key={i} className="border-t">
                                    <td className="p-2">{part.name}</td>
                                    <td className="p-2 text-center">{part.quantity}</td>
                                    <td className="p-2 text-right">₱{part.unitPrice}</td>
                                    <td className="p-2 text-right">₱{(part.unitPrice * part.quantity).toFixed(2)}</td>
                                    <td className="p-2 text-center">
                                        <button type="button" onClick={() => removePart(i)} className="text-red-500 hover:underline">Remove</button>
                                    </td>
                                </tr>
                            ))}
                            {(formData.usedParts || []).length === 0 && (
                                <tr><td colSpan={5} className="p-4 text-center text-gray-500">No parts used yet.</td></tr>
                            )}
                        </tbody>
                        <tfoot className="font-bold bg-gray-50">
                             <tr>
                                 <td colSpan={3} className="p-2 text-right">Parts Total:</td>
                                 <td className="p-2 text-right">₱{(formData.usedParts || []).reduce((s, p) => s + (p.unitPrice * p.quantity), 0).toFixed(2)}</td>
                                 <td></td>
                             </tr>
                        </tfoot>
                    </table>
                </div>
              )}

              {/* --- CHECKLIST TAB --- */}
              {activeTab === 'Checklist' && (
                <div className="space-y-4">
                    <div className="flex gap-2 mb-4">
                        <Button type="button" variant="secondary" onClick={() => loadPresetTasks('Format')}>+ Reformat Preset</Button>
                        <Button type="button" variant="secondary" onClick={() => loadPresetTasks('Hardware')}>+ Hardware Preset</Button>
                        <Button type="button" variant="secondary" onClick={() => loadPresetTasks('Cleanup')}>+ Cleanup Preset</Button>
                    </div>
                    
                    <div className="flex gap-2">
                        <input id="newTaskInput" type="text" className="flex-1 border p-2 rounded" placeholder="Add custom task..." 
                            onKeyDown={(e) => {
                                if(e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = e.currentTarget.value;
                                    addTask(val);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                        <Button type="button" onClick={() => {
                             const input = document.getElementById('newTaskInput') as HTMLInputElement;
                             addTask(input.value);
                             input.value = '';
                        }}>Add</Button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {(formData.checklist || []).map((task, i) => (
                            <div key={task.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded border">
                                <input 
                                    type="checkbox" 
                                    checked={task.isCompleted} 
                                    onChange={() => toggleTask(i)}
                                    className="w-5 h-5"
                                />
                                <span className={`flex-1 ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>{task.description}</span>
                                <button type="button" onClick={() => {
                                    const updated = [...(formData.checklist || [])];
                                    updated.splice(i, 1);
                                    setFormData({...formData, checklist: updated});
                                }} className="text-red-500 text-xs hover:underline">Delete</button>
                            </div>
                        ))}
                         {(formData.checklist || []).length === 0 && <p className="text-gray-500 text-sm text-center">No tasks added.</p>}
                    </div>
                </div>
              )}

              {/* --- LOGS TAB --- */}
              {activeTab === 'Logs' && (
                  <div className="space-y-4">
                      <div className="border rounded bg-gray-50 p-4 max-h-60 overflow-y-auto">
                          {(formData.logs || []).slice().reverse().map((log, i) => (
                              <div key={i} className="mb-3 border-b pb-2 last:border-0 last:pb-0">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                      <span>{new Date(log.date).toLocaleString()}</span>
                                      <span>{log.user}</span>
                                  </div>
                                  <p className="text-sm text-gray-800">{log.action}</p>
                              </div>
                          ))}
                          {(formData.logs || []).length === 0 && <p className="text-center text-gray-500">No logs yet.</p>}
                      </div>
                  </div>
              )}

            </form>

            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
                 <div className="text-sm">
                     <span className="text-gray-600 mr-4">Labor: ₱{Number(formData.laborCost || 0).toFixed(2)}</span>
                     <span className="text-gray-600 mr-4">Parts: ₱{(formData.usedParts || []).reduce((s, p) => s + (p.unitPrice * p.quantity), 0).toFixed(2)}</span>
                     <span className="font-bold text-lg">Total: ₱{((Number(formData.laborCost) || 0) + (formData.usedParts || []).reduce((s, p) => s + (p.unitPrice * p.quantity), 0)).toFixed(2)}</span>
                 </div>
                 <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Ticket</Button>
                 </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const PrintShop = ({ user }: { user: User }) => {
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'Current' | 'Completed'>('Current');
  const [staffFilter, setStaffFilter] = useState<string>('');
  const [viewJobOrder, setViewJobOrder] = useState<PrintOrder | null>(null);

  // Custom date state for backdating (Admin only)
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState<Partial<PrintOrder>>({
    printType: PrintType.DOCUMENT,
    quantity: 1,
    status: 'Pending',
    details: {},
    paymentStatus: 'Unpaid',
    priority: 'Standard'
  });

  const loadOrders = async () => {
    const data = await Storage.getPrintOrders();
    const users = await Storage.getUsers();
    setOrders(data.sort((a, b) => b.createdAt - a.createdAt));
    setStaffList(users);
  };

  useEffect(() => { loadOrders(); }, []);

  const openForm = (order?: PrintOrder) => {
      if (order) {
          setFormData(order);
          setCustomDate(new Date(order.createdAt).toISOString().split('T')[0]);
      } else {
          setFormData({ printType: PrintType.DOCUMENT, quantity: 1, status: 'Pending', details: {}, paymentStatus: 'Unpaid', priority: 'Standard' });
          setCustomDate(new Date().toISOString().split('T')[0]);
      }
      setShowForm(true);
  }

  const handleStatusChange = async (order: PrintOrder, newStatus: string) => {
    let paymentStatus = order.paymentStatus;
    if(newStatus === 'Delivered' && (!paymentStatus || paymentStatus === 'Unpaid')) {
        if(confirm("Is this order PAID now? Click OK for Paid (Cash), Cancel for Unpaid (Credit).")) {
            paymentStatus = 'Paid';
        } else {
            paymentStatus = 'Unpaid';
        }
    }

    const updated = { 
        ...order, 
        status: newStatus as any,
        paymentStatus,
        completedAt: newStatus === 'Delivered' ? Date.now() : order.completedAt
    };
    await Storage.savePrintOrder(updated);
    loadOrders();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determine created date (allow backdating for admins)
    const creationTime = (user.role === UserRole.ADMIN && customDate) 
        ? new Date(customDate).getTime() 
        : (formData.createdAt || Date.now());

    const order: PrintOrder = {
      id: formData.id || Date.now().toString(),
      customerName: formData.customerName!,
      customerType: formData.customerType,
      printType: formData.printType as PrintType,
      quantity: Number(formData.quantity) || 1,
      priority: formData.priority || 'Standard',
      details: formData.details || {},
      totalAmount: Number(formData.totalAmount) || 0,
      status: formData.status as any || 'Pending',
      createdAt: creationTime,
      completedAt: formData.completedAt,
      handledBy: formData.handledBy || user.id,
      paymentStatus: formData.paymentStatus as PaymentStatus
    };
    await Storage.savePrintOrder(order);
    setShowForm(false);
    loadOrders();
  };

  const handleTogglePaid = async (order: PrintOrder) => {
      const newStatus = order.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid';
      await Storage.updatePaymentStatus(order.id, 'print', newStatus);
      loadOrders();
  }
  
  const getHandlerName = (id: string) => {
      return staffList.find(u => u.id === id)?.name || 'Unknown Staff';
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'Current' 
        ? ['Pending', 'Printing', 'Done'].includes(o.status)
        : o.status === 'Delivered';
    const matchesStaff = staffFilter ? o.handledBy === staffFilter : true;
    return matchesFilter && matchesStaff;
  });

  if (viewJobOrder) {
      return (
          <div className="bg-white min-h-screen p-8 max-w-2xl mx-auto">
              <div className="print:block hidden"><ReportHeader /></div>
              <div className="flex justify-between items-center mb-8 print:hidden">
                  <Button variant="secondary" onClick={() => setViewJobOrder(null)}>Back to List</Button>
                  <Button onClick={() => window.print()}>Print Job Order</Button>
              </div>

              <div className="border p-8 rounded-lg">
                  <div className="text-center mb-6">
                      <div className="flex justify-center mb-1">
                         {LOGO_URL && <img src={LOGO_URL} alt="Logo" className="h-12 w-auto" />}
                      </div>
                      <h2 className="text-2xl font-bold uppercase">Job Order / Claim Stub</h2>
                      <p className="text-sm text-gray-500">Order ID: #{viewJobOrder.id.slice(-6)}</p>
                      <p className="text-sm text-gray-500">Date: {new Date(viewJobOrder.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500 mt-1">Processed By: {getHandlerName(viewJobOrder.handledBy)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                      <div>
                          <p className="text-xs text-gray-500 uppercase">Customer</p>
                          <p className="font-bold text-lg">{viewJobOrder.customerName}</p>
                          <p className="text-sm text-gray-600">{viewJobOrder.customerType || 'Individual'}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-xs text-gray-500 uppercase">Priority</p>
                          <span className={`font-bold ${viewJobOrder.priority === 'Rush' ? 'text-red-600' : 'text-gray-800'}`}>{viewJobOrder.priority}</span>
                      </div>
                  </div>

                  <div className="mb-8">
                      <table className="w-full text-sm">
                          <thead className="border-b">
                              <tr>
                                  <th className="text-left py-2">Description</th>
                                  <th className="text-right py-2">Details</th>
                                  <th className="text-right py-2">Amount</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr>
                                  <td className="py-2">{viewJobOrder.printType} (Qty: {viewJobOrder.quantity})</td>
                                  <td className="py-2 text-right">
                                      {viewJobOrder.details.size && `Size: ${viewJobOrder.details.size}`}
                                      {viewJobOrder.details.dimensions && `Dim: ${viewJobOrder.details.dimensions}`}
                                      {viewJobOrder.details.paperType && `Paper: ${viewJobOrder.details.paperType}`}
                                  </td>
                                  <td className="py-2 text-right font-bold">₱{viewJobOrder.totalAmount.toFixed(2)}</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>

                  <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total Amount</span>
                          <span>₱{viewJobOrder.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                           <span>Payment Status</span>
                           <span className={viewJobOrder.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}>{viewJobOrder.paymentStatus || 'Unpaid'}</span>
                      </div>
                  </div>

                  <div className="mt-12 text-center text-xs text-gray-400">
                      <p>Please present this stub when claiming your order.</p>
                      <p>Thank you for choosing Retxed Computer Repair and Services!</p>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Printing Shop</h2>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
                <button onClick={() => setFilter('Current')} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === 'Current' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Current Jobs</button>
                <button onClick={() => setFilter('Completed')} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === 'Completed' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>History</button>
            </div>
            <select 
                className="border rounded-md px-2 py-1 text-sm bg-white" 
                value={staffFilter} 
                onChange={e => setStaffFilter(e.target.value)}
            >
                <option value="">All Staff</option>
                {staffList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>
        <Button onClick={() => openForm()}>New Order</Button>
      </div>
      
      {/* Staff Workload Summary */}
      {staffFilter && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex flex-col md:flex-row gap-6">
              <div>
                  <h4 className="font-bold text-blue-900">{getHandlerName(staffFilter)}'s Workload</h4>
                  <p className="text-sm text-blue-700">Summary of orders processed by this staff member.</p>
              </div>
              <div className="flex gap-4">
                  <div className="bg-white px-4 py-2 rounded shadow-sm border">
                      <p className="text-xs text-gray-500 uppercase font-bold">Pending Jobs</p>
                      <p className="text-xl font-bold text-orange-600">
                          {orders.filter(o => o.handledBy === staffFilter && o.status !== 'Delivered').length}
                      </p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded shadow-sm border">
                      <p className="text-xs text-gray-500 uppercase font-bold">Unpaid Completed</p>
                      <p className="text-xl font-bold text-red-600">
                          {orders.filter(o => o.handledBy === staffFilter && o.status === 'Delivered' && o.paymentStatus === 'Unpaid').length}
                      </p>
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOrders.map(o => (
          <Card key={o.id} className="p-4 flex flex-col justify-between h-full border-l-4" style={{ borderLeftColor: o.status === 'Pending' ? '#F59E0B' : o.status === 'Printing' ? '#3B82F6' : o.status === 'Done' ? '#10B981' : '#9CA3AF' }}>
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="space-x-1">
                   <Badge color={o.status === 'Done' ? 'green' : o.status === 'Printing' ? 'blue' : o.status === 'Pending' ? 'yellow' : 'gray'}>{o.status}</Badge>
                   {o.priority === 'Rush' && <Badge color="red">RUSH</Badge>}
                </div>
                <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="font-bold text-lg text-slate-800">{o.customerName}</h3>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p><span className="font-semibold">Type:</span> {o.printType}</p>
                <p><span className="font-semibold">Qty:</span> {o.quantity}</p>
                {o.details.size && <p><span className="font-semibold">Size:</span> {o.details.size}</p>}
                {o.details.dimensions && <p><span className="font-semibold">Dim:</span> {o.details.dimensions}</p>}
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-1">
                   <span>Processed by:</span>
                   <span className="font-semibold text-gray-700">{getHandlerName(o.handledBy)}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-500">Total</span>
                <span className="font-bold text-lg">₱{o.totalAmount.toFixed(2)}</span>
              </div>
              {o.status === 'Delivered' && (
                  <div className="mb-2">
                      <Badge color={o.paymentStatus === 'Paid' ? 'green' : 'red'}>{o.paymentStatus}</Badge>
                  </div>
              )}
              
              {/* Actions */}
              <div className="grid grid-cols-1 gap-2">
                <Button className="w-full justify-center text-xs" variant="secondary" onClick={() => setViewJobOrder(o)}>Job Order / Stub</Button>
                {o.status === 'Pending' && <Button className="w-full justify-center" variant="primary" onClick={() => handleStatusChange(o, 'Printing')}>Start Job</Button>}
                {o.status === 'Printing' && <Button className="w-full justify-center" variant="success" onClick={() => handleStatusChange(o, 'Done')}>Mark as Done</Button>}
                {o.status === 'Done' && <Button className="w-full justify-center" variant="secondary" onClick={() => handleStatusChange(o, 'Delivered')}>Deliver to Customer</Button>}
                {o.status === 'Delivered' && (
                  <div className="mt-2 space-y-2">
                      <Button className="w-full justify-center" variant="secondary" onClick={() => { setFormData(o); setShowForm(true); }}>Edit Order</Button>
                      <Button className="w-full justify-center text-xs" variant={o.paymentStatus === 'Unpaid' ? 'success' : 'secondary'} onClick={() => handleTogglePaid(o)}>
                          {o.paymentStatus === 'Unpaid' ? 'Mark as Paid' : 'Mark as Unpaid'}
                      </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg p-6">
            <h3 className="text-xl font-bold mb-4">{formData.id ? 'Edit Print Order' : 'New Print Order'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              
              {user.role === UserRole.ADMIN && (
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mb-2">
                     <label className="block text-xs font-bold text-yellow-800 uppercase mb-1">Transaction Date (Admin Only)</label>
                     <input 
                        type="date" 
                        className="border p-2 rounded w-full" 
                        value={customDate}
                        onChange={e => setCustomDate(e.target.value)}
                     />
                     <p className="text-xs text-yellow-700 mt-1">Allows entering old transactions.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium">Customer Name</label>
                <CustomerInput 
                    value={formData.customerName || ''} 
                    onChange={(val) => setFormData({...formData, customerName: val})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Customer Type</label>
                    <select className="w-full border p-2 rounded" value={formData.customerType || 'Individual'} onChange={e => setFormData({...formData, customerType: e.target.value as any})}>
                        <option value="Individual">Individual</option>
                        <option value="Company">Company</option>
                        <option value="LGU">LGU</option>
                        <option value="School">School</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Priority</label>
                    <select className="w-full border p-2 rounded" value={formData.priority || 'Standard'} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                        <option value="Standard">Standard</option>
                        <option value="Rush">Rush</option>
                    </select>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Type</label>
                  <select className="w-full border p-2 rounded" value={formData.printType} onChange={e => setFormData({...formData, printType: e.target.value as PrintType})}>
                    {Object.values(PrintType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Quantity</label>
                  <input type="number" min="1" className="w-full border p-2 rounded" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                </div>
              </div>

              {/* Dynamic Fields */}
              {formData.printType === PrintType.TARPAULIN && (
                <div>
                  <label className="block text-sm font-medium">Size</label>
                  <div className="flex gap-2">
                    <select 
                        className="w-full border p-2 rounded" 
                        value={TARPAULIN_SIZES.includes(formData.details?.dimensions || '') ? formData.details?.dimensions : 'Custom'} 
                        onChange={e => {
                            const val = e.target.value;
                            setFormData({...formData, details: {...formData.details, dimensions: val === 'Custom' ? 'Custom' : val}});
                        }}
                    >
                        <option value="">Select Size</option>
                        {TARPAULIN_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {(!TARPAULIN_SIZES.includes(formData.details?.dimensions || '') || formData.details?.dimensions === 'Custom') && (
                        <input type="text" placeholder="e.g. 5x8" className="w-full border p-2 rounded" value={formData.details?.dimensions === 'Custom' ? '' : formData.details?.dimensions} onChange={e => setFormData({...formData, details: {...formData.details, dimensions: e.target.value}})} />
                    )}
                  </div>
                </div>
              )}
               {(formData.printType === PrintType.DOCUMENT || formData.printType === PrintType.PHOTO) && (
                 <div>
                 <label className="block text-sm font-medium">Paper Type</label>
                 <select className="w-full border p-2 rounded" value={formData.details?.paperType || ''} onChange={e => setFormData({...formData, details: {...formData.details, paperType: e.target.value}})}>
                   <option value="">Select Type</option>
                   {PAPER_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>
              )}

              <div>
                <label className="block text-sm font-medium">Total Amount (₱)</label>
                <input type="number" required className="w-full border p-2 rounded" value={formData.totalAmount || ''} onChange={e => setFormData({...formData, totalAmount: Number(e.target.value)})} />
              </div>
              
              {formData.status === 'Delivered' && (
                  <div>
                    <label className="block text-sm font-medium">Payment Status</label>
                    <select className="w-full border p-2 rounded" value={formData.paymentStatus || 'Unpaid'} onChange={e => setFormData({...formData, paymentStatus: e.target.value as PaymentStatus})}>
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid (Credit)</option>
                    </select>
                  </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

const Sales = ({ user }: { user: User }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'POS' | 'History'>('POS');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [viewReceipt, setViewReceipt] = useState<SaleRecord | null>(null);
  
  // Checkout Modal State
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{method: 'Cash'|'Credit', customerName: string, customerType: string, careOf: string, discount: number}>({
      method: 'Cash', customerName: '', customerType: 'Individual', careOf: '', discount: 0
  });

  const loadData = async () => {
    Storage.getProducts().then(setProducts);
    Storage.getSales().then(s => setSalesHistory(s.sort((a,b) => b.date - a.date)));
  }

  useEffect(() => { loadData(); }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (p: Product) => {
    if (p.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === p.id);
      if (existing) {
        if (existing.quantity >= p.stock) return prev;
        return prev.map(item => item.product.id === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product: p, quantity: 1 }];
    });
  };

  const updateQuantity = (pid: string, delta: number) => {
     setCart(prev => prev.map(item => {
        if (item.product.id === pid) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return item; 
            if (newQty > item.product.stock) return item;
            return { ...item, quantity: newQty };
        }
        return item;
     }));
  };

  const removeFromCart = (pid: string) => {
    setCart(prev => prev.filter(item => item.product.id !== pid));
  };

  const handleConfirmSale = async () => {
    if (cart.length === 0) return;
    if (checkoutData.method === 'Credit' && !checkoutData.customerName) {
        alert("Customer Name is required for Credit sales.");
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const total = Math.max(0, subtotal - checkoutData.discount);
    
    const sale: SaleRecord = {
      id: Date.now().toString(),
      date: Date.now(),
      items: cart.map(i => ({ productId: i.product.id, productName: i.product.name, quantity: i.quantity, priceAtSale: i.product.price })),
      total,
      discount: checkoutData.discount,
      handledBy: user.id,
      paymentStatus: checkoutData.method === 'Cash' ? 'Paid' : 'Unpaid',
      customerName: checkoutData.customerName,
      customerType: checkoutData.customerType as CustomerType
    };
    await Storage.recordSale(sale);
    setCart([]);
    setShowCheckout(false);
    setCheckoutData({ method: 'Cash', customerName: '', customerType: 'Individual', careOf: '', discount: 0 });
    alert('Sale Recorded Successfully!');
    loadData();
  };

  const categories = ['All', 'Desktop Part', 'Laptop Part', 'Printer Part', 'Accessory', 'Other'];
  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const finalTotal = Math.max(0, cartTotal - checkoutData.discount);

  if (viewReceipt) {
      return (
          <div className="bg-white min-h-screen p-8 max-w-lg mx-auto">
              <div className="print:block hidden"><ReportHeader /></div>
              <div className="flex justify-between items-center mb-8 print:hidden">
                  <Button variant="secondary" onClick={() => setViewReceipt(null)}>Back to Sales</Button>
                  <Button onClick={() => window.print()}>Print Receipt</Button>
              </div>

              <div className="border p-6 rounded shadow-sm print:shadow-none print:border-none">
                  <div className="text-center mb-4">
                      <div className="flex justify-center mb-1">
                         {LOGO_URL && <img src={LOGO_URL} alt="Logo" className="h-12 w-auto" />}
                      </div>
                      <h2 className="text-xl font-bold uppercase">Official Receipt</h2>
                      <p className="text-xs text-gray-500">Receipt #: {viewReceipt.id.slice(-6)}</p>
                      <p className="text-xs text-gray-500">{new Date(viewReceipt.date).toLocaleString()}</p>
                  </div>
                  
                  <div className="mb-4 text-sm border-b pb-4">
                       <p><span className="font-semibold">Customer:</span> {viewReceipt.customerName || 'Walk-in'}</p>
                       <p><span className="font-semibold">Cashier:</span> {user.name}</p>
                  </div>

                  <table className="w-full text-sm mb-4">
                      <thead>
                          <tr className="border-b">
                              <th className="text-left py-1">Item</th>
                              <th className="text-center py-1">Qty</th>
                              <th className="text-right py-1">Price</th>
                              <th className="text-right py-1">Total</th>
                          </tr>
                      </thead>
                      <tbody>
                          {viewReceipt.items.map((item, i) => (
                              <tr key={i}>
                                  <td className="py-1">{item.productName}</td>
                                  <td className="py-1 text-center">{item.quantity}</td>
                                  <td className="py-1 text-right">{item.priceAtSale}</td>
                                  <td className="py-1 text-right">{(item.quantity * item.priceAtSale).toFixed(2)}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>

                  <div className="border-t pt-2 space-y-1">
                      {viewReceipt.discount && viewReceipt.discount > 0 ? (
                           <>
                             <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>₱{(viewReceipt.total + viewReceipt.discount).toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between text-sm text-red-600">
                                <span>Discount</span>
                                <span>- ₱{viewReceipt.discount.toFixed(2)}</span>
                             </div>
                           </>
                      ) : null}
                      <div className="flex justify-between font-bold text-lg">
                          <span>Total Due</span>
                          <span>₱{viewReceipt.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                          <span>Payment Method</span>
                          <span>{viewReceipt.paymentStatus === 'Paid' ? 'Cash' : 'Credit'}</span>
                      </div>
                  </div>
                  
                  <div className="text-center text-xs text-gray-400 mt-8">
                      <p>Retxed Computer Repair and Services</p>
                      <p>Thank you!</p>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="flex h-full flex-col">
       <div className="flex gap-4 mb-4 border-b">
          <button onClick={() => setActiveTab('POS')} className={`px-4 py-2 font-bold ${activeTab === 'POS' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>POS Terminal</button>
          <button onClick={() => { setActiveTab('History'); loadData(); }} className={`px-4 py-2 font-bold ${activeTab === 'History' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Recent Sales</button>
       </div>

       {activeTab === 'History' ? (
           <div className="bg-white rounded shadow overflow-hidden flex-1 overflow-y-auto">
               <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                       <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                           <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                           <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-200">
                       {salesHistory.map(s => (
                           <tr key={s.id}>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(s.date).toLocaleString()}</td>
                               <td className="px-6 py-4 font-medium">{s.customerName || 'Walk-in'}</td>
                               <td className="px-6 py-4 text-sm text-gray-500">{s.items.length} items</td>
                               <td className="px-6 py-4 text-right font-bold">₱{s.total.toFixed(2)}</td>
                               <td className="px-6 py-4 text-right">
                                   <Button className="py-1 px-2 text-xs" variant="secondary" onClick={() => setViewReceipt(s)}>View Receipt</Button>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       ) : (
        <div className="flex h-full gap-6 flex-col lg:flex-row flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="mb-4 space-y-4">
                <div className="flex gap-4 flex-wrap">
                    <input 
                        type="text" 
                        placeholder="Search parts..." 
                        className="border p-2 rounded flex-1 min-w-[200px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select 
                        className="border p-2 rounded w-full md:w-auto"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-20">
            {filteredProducts.map(p => {
                const inCart = cart.find(i => i.product.id === p.id)?.quantity || 0;
                const available = p.stock - inCart;
                const isOutOfStock = available <= 0;

                return (
                    <Card 
                        key={p.id} 
                        className={`p-4 cursor-pointer transition-all border-2 ${isOutOfStock ? 'opacity-60 bg-gray-50 border-gray-200' : 'hover:border-blue-500 border-transparent'}`} 
                        onClick={() => !isOutOfStock && addToCart(p)}
                    >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-slate-800 line-clamp-2">{p.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">{p.category}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                        <span className="font-bold text-lg text-blue-600">₱{p.price}</span>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${p.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                        </span>
                    </div>
                    </Card>
                );
            })}
            </div>
        </div>

        <div className="w-full lg:w-96 bg-white border-l p-6 flex flex-col h-[50vh] lg:h-auto shadow-xl lg:shadow-none z-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800"><Icons.Cart /> Current Sale</h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {cart.map((item, idx) => (
                <div key={idx} className="flex flex-col border-b pb-3 border-gray-100 last:border-0">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="font-medium text-slate-800">{item.product.name}</p>
                        <p className="text-xs text-gray-500">₱{item.product.price} / unit</p>
                    </div>
                    <p className="font-semibold text-slate-800">₱{(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center bg-gray-50 rounded p-1">
                    <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item.product.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded border hover:bg-gray-100 font-bold">-</button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded border hover:bg-gray-100 font-bold">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 text-xs hover:underline">Remove</button>
                </div>
                </div>
            ))}
            {cart.length === 0 && <div className="text-center text-gray-400 mt-10">Cart is empty</div>}
            </div>
            <div className="pt-4 border-t border-gray-200 mt-4 bg-white">
            <div className="flex justify-between text-xl font-bold mb-4 text-slate-800">
                <span>Total</span>
                <span>₱{cartTotal.toFixed(2)}</span>
            </div>
            <Button className="w-full py-3 text-lg" onClick={() => setShowCheckout(true)} disabled={cart.length === 0}>
                Checkout
            </Button>
            </div>
        </div>
        </div>
       )}

      {showCheckout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md p-6">
                  <h3 className="text-xl font-bold mb-4">Checkout</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium mb-1">Subtotal</label>
                          <div className="text-lg text-gray-600">₱{cartTotal.toFixed(2)}</div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Discount (₱)</label>
                          <input 
                            type="number" 
                            className="w-full border p-2 rounded" 
                            value={checkoutData.discount} 
                            onChange={e => setCheckoutData({...checkoutData, discount: Number(e.target.value)})} 
                          />
                      </div>
                      <div className="pt-2 border-t">
                          <label className="block text-sm font-medium mb-1">Total Amount Due</label>
                          <div className="text-2xl font-bold text-blue-600">₱{finalTotal.toFixed(2)}</div>
                      </div>
                      
                      <div>
                          <label className="block text-sm font-medium mb-2">Payment Method</label>
                          <div className="flex gap-4">
                              <label className="flex items-center gap-2 border p-3 rounded cursor-pointer w-full hover:bg-gray-50">
                                  <input type="radio" name="payMethod" checked={checkoutData.method === 'Cash'} onChange={() => setCheckoutData({...checkoutData, method: 'Cash'})} />
                                  <span className="font-medium">Cash</span>
                              </label>
                              <label className="flex items-center gap-2 border p-3 rounded cursor-pointer w-full hover:bg-gray-50">
                                  <input type="radio" name="payMethod" checked={checkoutData.method === 'Credit'} onChange={() => setCheckoutData({...checkoutData, method: 'Credit'})} />
                                  <span className="font-medium">Credit</span>
                              </label>
                          </div>
                      </div>

                      {/* Customer Details - Optional for Cash, Required for Credit */}
                      <div className="border-t pt-4">
                          <label className="block text-sm font-medium mb-1">Customer Name {checkoutData.method === 'Credit' && <span className="text-red-500">*</span>}</label>
                          <CustomerInput 
                             value={checkoutData.customerName} 
                             onChange={(val) => setCheckoutData({...checkoutData, customerName: val})}
                             required={checkoutData.method === 'Credit'}
                          />
                      </div>
                      
                      {checkoutData.method === 'Credit' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">Customer Type</label>
                                <select className="w-full border p-2 rounded" value={checkoutData.customerType} onChange={e => setCheckoutData({...checkoutData, customerType: e.target.value})}>
                                    <option value="Individual">Individual</option>
                                    <option value="Company">Company</option>
                                    <option value="LGU">LGU</option>
                                    <option value="School">School</option>
                                </select>
                            </div>
                            {checkoutData.customerType !== 'Individual' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Care Of (Person Responsible)</label>
                                    <input className="w-full border p-2 rounded" value={checkoutData.careOf} onChange={e => setCheckoutData({...checkoutData, careOf: e.target.value})} />
                                </div>
                            )}
                        </>
                      )}

                      <div className="flex justify-end gap-2 pt-4">
                          <Button variant="secondary" onClick={() => setShowCheckout(false)}>Cancel</Button>
                          <Button onClick={handleConfirmSale}>Complete Sale</Button>
                      </div>
                  </div>
              </Card>
          </div>
      )}
    </div>
  );
};

const Inventory = ({ user }: { user: User }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});

  const loadProducts = async () => {
    setProducts(await Storage.getProducts());
  };

  useEffect(() => { loadProducts(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct.name || !editingProduct.price) return;
    
    const product: Product = {
      id: editingProduct.id || Date.now().toString(),
      name: editingProduct.name,
      category: editingProduct.category as any || 'Other',
      price: Number(editingProduct.price),
      stock: Number(editingProduct.stock) || 0,
      description: editingProduct.description
    };
    
    await Storage.saveProduct(product);
    setShowForm(false);
    setEditingProduct({});
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if(confirm('Delete this product?')) {
        await Storage.deleteProduct(id);
        loadProducts();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
        <Button onClick={() => { setEditingProduct({ category: 'Other' }); setShowForm(true); }}>Add Product</Button>
      </div>

      <Card className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{p.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{p.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">₱{p.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => { setEditingProduct(p); setShowForm(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg p-6">
            <h3 className="text-xl font-bold mb-4">{editingProduct.id ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input required className="w-full border p-2 rounded" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Category</label>
                    <select className="w-full border p-2 rounded" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})}>
                        <option>Desktop Part</option>
                        <option>Laptop Part</option>
                        <option>Printer Part</option>
                        <option>Accessory</option>
                        <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Price</label>
                    <input type="number" required className="w-full border p-2 rounded" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Stock</label>
                    <input type="number" required className="w-full border p-2 rounded" value={editingProduct.stock || ''} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea className="w-full border p-2 rounded" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save Product</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

const Attendance = ({ user }: { user: User }) => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
    const [activeTab, setActiveTab] = useState<'MyAttendance' | 'Daily' | 'Monthly'>('MyAttendance');
    const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));

    const loadData = async () => {
        const data = await Storage.getAttendance();
        const users = await Storage.getUsers();
        setRecords(data.sort((a,b) => b.timeIn - a.timeIn));
        setAllUsers(users);
        
        const today = new Date().toISOString().split('T')[0];
        const myRecord = data.find(r => r.userId === user.id && r.date === today);
        setTodayRecord(myRecord || null);
    };

    useEffect(() => { loadData(); }, []);

    const handleClockIn = async () => {
        try { await Storage.clockIn(user.id, user.name); loadData(); } catch(e: any) { alert(e.message); }
    };

    const handleClockOut = async () => {
        try { await Storage.clockOut(user.id); loadData(); } catch(e: any) { alert(e.message); }
    };

    const analyzeRecord = (r: AttendanceRecord) => {
        const inTime = new Date(r.timeIn);
        const lateThreshold = new Date(inTime).setHours(8, 0, 0, 0);
        const isLate = r.timeIn > lateThreshold;

        let isOvertime = false;
        if (r.timeOut) {
            const outTime = new Date(r.timeOut);
            const otThreshold = new Date(outTime).setHours(18, 30, 0, 0); // 6:30 PM
            isOvertime = r.timeOut > otThreshold;
        }
        return { isLate, isOvertime };
    }

    const renderMyAttendance = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <Card className="p-8 flex flex-col items-center justify-center bg-blue-50 border-blue-200">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Current Status</h3>
                    <div className="text-6xl font-mono font-bold text-slate-800 mb-6 tracking-wider">
                         {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    
                    {!todayRecord ? (
                        <Button className="w-48 py-4 text-lg" variant="success" onClick={handleClockIn}>CLOCK IN</Button>
                    ) : !todayRecord.timeOut ? (
                        <div className="text-center">
                            <p className="mb-4 text-blue-700">Clocked in at {new Date(todayRecord.timeIn).toLocaleTimeString()}</p>
                            <Button className="w-48 py-4 text-lg" variant="danger" onClick={handleClockOut}>CLOCK OUT</Button>
                        </div>
                    ) : (
                        <div className="text-center p-4 bg-green-100 rounded-lg border border-green-200">
                            <p className="font-bold text-green-800 text-lg">Shift Completed</p>
                            <p className="text-green-700">See you tomorrow!</p>
                        </div>
                    )}
                </Card>
            </div>
            
            <Card className="overflow-hidden h-full">
                <div className="bg-gray-50 px-6 py-4 border-b">
                    <h3 className="font-bold text-gray-700">My Recent History</h3>
                </div>
                <div className="overflow-y-auto max-h-[400px]">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">In</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Out</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {records.filter(r => r.userId === user.id).map(r => {
                                const { isLate, isOvertime } = analyzeRecord(r);
                                return (
                                    <tr key={r.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{r.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{new Date(r.timeIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{r.timeOut ? new Date(r.timeOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs space-x-1">
                                            {isLate && <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Late</span>}
                                            {isOvertime && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">OT</span>}
                                            {!isLate && !isOvertime && <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">Normal</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );

    const renderDailyOverview = () => {
        const today = new Date().toISOString().split('T')[0];
        const todaysRecords = records.filter(r => r.date === today);

        return (
            <div>
                 <h3 className="text-xl font-bold mb-4 print:hidden">Today's Attendance Overview ({today})</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                     <Card className="p-4 bg-green-50 border-green-200">
                         <span className="text-sm text-green-700 uppercase font-bold">Present</span>
                         <p className="text-3xl font-bold text-green-800">{todaysRecords.length}</p>
                     </Card>
                     <Card className="p-4 bg-red-50 border-red-200">
                         <span className="text-sm text-red-700 uppercase font-bold">Absent</span>
                         <p className="text-3xl font-bold text-red-800">{allUsers.length - todaysRecords.length}</p>
                     </Card>
                     <Card className="p-4 bg-yellow-50 border-yellow-200">
                         <span className="text-sm text-yellow-700 uppercase font-bold">Late Arrivals</span>
                         <p className="text-3xl font-bold text-yellow-800">{todaysRecords.filter(r => analyzeRecord(r).isLate).length}</p>
                     </Card>
                 </div>

                 <Card>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time In</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Out</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {allUsers.map(u => {
                                const rec = todaysRecords.find(r => r.userId === u.id);
                                return (
                                    <tr key={u.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {rec ? new Date(rec.timeIn).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {rec?.timeOut ? new Date(rec.timeOut).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {rec ? (
                                                <div className="space-x-1">
                                                    <Badge color="green">Present</Badge>
                                                    {analyzeRecord(rec).isLate && <Badge color="red">Late</Badge>}
                                                </div>
                                            ) : (
                                                <Badge color="gray">Absent</Badge>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                 </Card>
            </div>
        )
    };

    const renderMonthlyReport = () => {
        // Calculate working days excluding Sundays
        const [year, month] = reportMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        
        // Limit reporting to "today" if viewing current month, otherwise full month
        const limitDay = (year === currentYear && month === currentMonth) ? today.getDate() : daysInMonth;

        let workingDaysCount = 0;
        for (let d = 1; d <= limitDay; d++) {
            const date = new Date(year, month - 1, d);
            if (date.getDay() !== 0) workingDaysCount++; // 0 is Sunday
        }

        const reportData = allUsers.map(u => {
            const userRecords = records.filter(r => {
                const rDate = new Date(r.date);
                return r.userId === u.id && rDate.getMonth() === (month - 1) && rDate.getFullYear() === year;
            });
            
            const presentCount = userRecords.length;
            const absentCount = Math.max(0, workingDaysCount - presentCount);
            const lateCount = userRecords.filter(r => analyzeRecord(r).isLate).length;
            const overtimeCount = userRecords.filter(r => analyzeRecord(r).isOvertime).length;

            return { user: u, presentCount, absentCount, lateCount, overtimeCount };
        });

        return (
            <div>
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-bold">Monthly Report</h3>
                        <input type="month" className="border p-2 rounded" value={reportMonth} onChange={e => setReportMonth(e.target.value)} />
                    </div>
                    <Button onClick={() => window.print()} variant="secondary">Print Report</Button>
                </div>
                
                <div className="hidden print:block"><ReportHeader /></div>
                <h2 className="hidden print:block text-center text-xl font-bold mb-4">Attendance Report: {reportMonth}</h2>
                <p className="mb-4 text-sm text-gray-500">Total Working Days (excl. Sundays): {workingDaysCount}</p>

                <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Employee</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Days Present</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Days Absent</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-red-600 uppercase">Late Arrivals</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-blue-600 uppercase">Overtime Days</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.map((row, i) => (
                            <tr key={i}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{row.user.name}</td>
                                <td className="px-6 py-4 text-center font-bold text-green-700">{row.presentCount}</td>
                                <td className="px-6 py-4 text-center font-bold text-red-700">{row.absentCount}</td>
                                <td className="px-6 py-4 text-center">{row.lateCount}</td>
                                <td className="px-6 py-4 text-center">{row.overtimeCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <h2 className="text-2xl font-bold text-slate-800">Attendance</h2>
                {user.role === UserRole.ADMIN && (
                    <div className="flex bg-white rounded-lg border p-1">
                        <button onClick={() => setActiveTab('MyAttendance')} className={`px-4 py-1 rounded text-sm font-medium ${activeTab === 'MyAttendance' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}>My Clock</button>
                        <button onClick={() => setActiveTab('Daily')} className={`px-4 py-1 rounded text-sm font-medium ${activeTab === 'Daily' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}>Daily Overview</button>
                        <button onClick={() => setActiveTab('Monthly')} className={`px-4 py-1 rounded text-sm font-medium ${activeTab === 'Monthly' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}>Monthly Report</button>
                    </div>
                )}
            </div>
            
            <div className="print:block">
                {activeTab === 'MyAttendance' && renderMyAttendance()}
                {activeTab === 'Daily' && user.role === UserRole.ADMIN && renderDailyOverview()}
                {activeTab === 'Monthly' && user.role === UserRole.ADMIN && renderMonthlyReport()}
            </div>
        </div>
    );
};

const UserManagement = ({ user }: { user: User }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});

  const loadUsers = async () => {
    setUsers(await Storage.getUsers());
  };

  useEffect(() => { loadUsers(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser.username || !editingUser.name) return;
    
    const userToSave: User = {
      id: editingUser.id || Date.now().toString(),
      username: editingUser.username,
      password: editingUser.password || 'password123',
      name: editingUser.name,
      role: editingUser.role as UserRole || UserRole.STAFF,
      permissions: editingUser.permissions || []
    };
    
    try {
        await Storage.saveUser(userToSave);
        setShowForm(false);
        setEditingUser({});
        loadUsers();
    } catch (err: any) {
        alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Delete this user?')) {
        try {
            await Storage.deleteUser(id);
            loadUsers();
        } catch(err: any) {
            alert(err.message);
        }
    }
  }

  const togglePermission = (perm: string) => {
      const current = editingUser.permissions || [];
      if (current.includes(perm)) {
          setEditingUser({ ...editingUser, permissions: current.filter(p => p !== perm) });
      } else {
          setEditingUser({ ...editingUser, permissions: [...current, perm] });
      }
  }

  const allPermissions = ['dashboard', 'tickets', 'printing', 'sales', 'inventory', 'attendance', 'reports', 'users', 'collectibles', 'expenses'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
        <Button onClick={() => { setEditingUser({ role: UserRole.STAFF, permissions: [] }); setShowForm(true); }}>Add User</Button>
      </div>

      <Card className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(u => (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{u.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{u.username}</td>
                <td className="px-6 py-4 whitespace-nowrap"><Badge color={u.role === UserRole.ADMIN ? 'purple' : 'blue'}>{u.role}</Badge></td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={u.permissions.join(', ')}>
                  {u.role === UserRole.ADMIN ? 'All Access' : u.permissions.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => { setEditingUser(u); setShowForm(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingUser.id ? 'Edit User' : 'Add User'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Full Name</label>
                <input required className="w-full border p-2 rounded" value={editingUser.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Username</label>
                    <input required className="w-full border p-2 rounded" value={editingUser.username || ''} onChange={e => setEditingUser({...editingUser, username: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Password</label>
                    <input className="w-full border p-2 rounded" type="password" placeholder={editingUser.id ? "Leave blank to keep" : "Required"} value={editingUser.password || ''} onChange={e => setEditingUser({...editingUser, password: e.target.value})} required={!editingUser.id} />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium">Role</label>
                  <select className="w-full border p-2 rounded" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})}>
                      {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
              </div>

              {editingUser.role !== UserRole.ADMIN && (
                  <div>
                      <label className="block text-sm font-medium mb-2">Permissions</label>
                      <div className="grid grid-cols-2 gap-2">
                          {allPermissions.map(perm => (
                              <label key={perm} className="flex items-center space-x-2 text-sm">
                                  <input 
                                    type="checkbox" 
                                    checked={(editingUser.permissions || []).includes(perm)} 
                                    onChange={() => togglePermission(perm)}
                                    className="rounded text-blue-600"
                                  />
                                  <span className="capitalize">{perm}</span>
                              </label>
                          ))}
                      </div>
                  </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save User</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ user, setView, currentView, onLogout }: any) => {
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'tickets', label: 'Service Desk', icon: Icons.Ticket },
    { id: 'printing', label: 'Printing Shop', icon: Icons.Print },
    { id: 'sales', label: 'Sales & POS', icon: Icons.Cart },
    { id: 'inventory', label: 'Inventory', icon: Icons.Box },
    { id: 'expenses', label: 'Expenses', icon: Icons.Dollar },
    { id: 'attendance', label: 'Attendance', icon: Icons.Clock },
    { id: 'collectibles', label: 'Collectibles', icon: Icons.Collection },
    { id: 'reports', label: 'Reports', icon: Icons.Chart },
    { id: 'users', label: 'User Management', icon: Icons.Users },
  ];

  const menu = allMenuItems.filter(item => {
    if (user.role === UserRole.ADMIN) return true;
    return user.permissions?.includes(item.id);
  });

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full flex-shrink-0 print:hidden">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight">RCRS System</h1>
        <p className="text-xs text-slate-500 mt-1">v1.3.0 • Offline Ready</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${currentView === item.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <item.icon />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.role}</p>
          </div>
        </div>
        <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 p-2 rounded text-sm transition-colors">
          <Icons.Logout />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    const u = Storage.getCurrentUser();
    if (u) setUser(u);
  }, []);

  if (!user) return <LoginScreen onLogin={setUser} />;

  const hasAccess = (viewId: string) => {
    if (user.role === UserRole.ADMIN) return true;
    return user.permissions?.includes(viewId);
  };

  const renderView = () => {
    if (!hasAccess(view)) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500">
          <div className="bg-red-50 p-6 rounded-lg text-center max-w-md">
            <h3 className="text-lg font-bold text-red-800 mb-2">Access Denied</h3>
            <p className="text-sm">You do not have permission to access the <strong>{view}</strong> module.</p>
            <button onClick={() => setView('dashboard')} className="mt-4 text-blue-600 underline">Return to Dashboard</button>
          </div>
        </div>
      );
    }

    switch(view) {
      case 'dashboard': return <Dashboard user={user} onChangeView={setView} />;
      case 'inventory': return <Inventory user={user} />;
      case 'tickets': return <ServiceDesk user={user} />;
      case 'printing': return <PrintShop user={user} />;
      case 'sales': return <Sales user={user} />;
      case 'attendance': return <Attendance user={user} />;
      case 'collectibles': return <Collectibles user={user} />;
      case 'reports': return <Reports user={user} />;
      case 'users': return <UserManagement user={user} />;
      case 'expenses': return <Expenses user={user} />;
      default: return <Dashboard user={user} onChangeView={setView} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
       <Sidebar user={user} setView={setView} currentView={view} onLogout={() => { Storage.logout(); setUser(null); }} />
       <main className="flex-1 overflow-auto p-8 relative print:p-0 print:overflow-visible">
         {renderView()}
       </main>
    </div>
  )
}
