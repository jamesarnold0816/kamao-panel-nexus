
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

export type UserRole = 'admin' | 'reseller' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: 'free' | 'basic' | 'vip' | null;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isReseller: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for saved user on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('kamao-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('kamao-user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('kamao-user');
      setIsAuthenticated(false);
    }
  }, [user]);

  // Mock authentication functions (in a real app, these would connect to a backend)
  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock login validation - in a real app, this would be validated by a backend
      if (!email || !password) {
        toast.error("Please enter both email and password");
        return false;
      }
      
      // Demo users
      if (role === 'admin' && email === 'admin@kamao.com' && password === 'password') {
        setUser({
          id: '1',
          name: 'Admin User',
          email,
          role: 'admin',
          plan: null
        });
        toast.success("Admin login successful");
        return true;
      } else if (role === 'reseller') {
        // For demo, any email/password combo works for resellers
        setUser({
          id: `r-${Date.now()}`,
          name: email.split('@')[0],
          email,
          role: 'reseller',
          plan: 'free'
        });
        toast.success("Reseller login successful");
        return true;
      }
      
      toast.error("Invalid credentials");
      return false;
    } catch (error) {
      toast.error("Login failed");
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock signup validation
      if (!name || !email || !password) {
        toast.error("Please fill all required fields");
        return false;
      }
      
      // Create new user
      setUser({
        id: `${role}-${Date.now()}`,
        name,
        email,
        role,
        plan: role === 'reseller' ? 'free' : null
      });
      
      toast.success(`${role === 'admin' ? 'Admin' : 'Reseller'} account created successfully`);
      return true;
    } catch (error) {
      toast.error("Signup failed");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    toast.info("Logged out successfully");
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      login, 
      signup, 
      logout, 
      isAuthenticated,
      isAdmin: user?.role === 'admin',
      isReseller: user?.role === 'reseller',
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
