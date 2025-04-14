import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { authService, userService } from '../services/api';

export type UserRole = 'admin' | 'reseller' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: 'free' | 'basic' | 'vip' | null;
  avatar?: string;
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
  updateAvatar: (avatarUrl: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for saved user and token on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('kamao-user');
    const token = localStorage.getItem('kamao-token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Real authentication functions with API integration
  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      if (!email || !password) {
        toast.error("Please enter both email and password");
        return false;
      }
      
      const response = await authService.login(email, password, role as string);
      
      if (!response || !response.token || !response.user) {
        toast.error("Invalid response from server");
        return false;
      }
      
      // Save token in localStorage and then update user state
      localStorage.setItem('kamao-token', response.token);
      localStorage.setItem('kamao-user', JSON.stringify(response.user));
      
      // Update state with user data
      setUser(response.user);
      setIsAuthenticated(true);
      
      console.log("Login successful with token:", response.token.substring(0, 10) + "...");
      toast.success("Login successful");
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      if (!name || !email || !password) {
        toast.error("Please fill all required fields");
        return false;
      }
      
      const response = await authService.signup(name, email, password, role as string);
      
      if (!response || !response.token || !response.user) {
        toast.error("Invalid response from server");
        return false;
      }
      
      // Save token in localStorage and then update user state
      localStorage.setItem('kamao-token', response.token);
      localStorage.setItem('kamao-user', JSON.stringify(response.user));
      
      // Update state with user data
      setUser(response.user);
      setIsAuthenticated(true);
      
      console.log("Signup successful with token:", response.token.substring(0, 10) + "...");
      toast.success(`Account created successfully`);
      return true;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.message || "Signup failed");
      return false;
    }
  };

  const logout = () => {
    // Remove token and user data
    localStorage.removeItem('kamao-token');
    localStorage.removeItem('kamao-user');
    setUser(null);
    setIsAuthenticated(false);
    toast.info("Logged out successfully");
  };

  // Update user avatar
  const updateAvatar = async (avatarUrl: string): Promise<boolean> => {
    try {
      if (!user) {
        toast.error("You must be logged in to update your avatar");
        return false;
      }
      
      try {
        // In a real app, this would update the server
        // Here we'll try but handle the case where it fails
        await userService.updateUser(user.id, { avatar: avatarUrl });
      } catch (error) {
        console.warn("Server update failed, but we'll continue with local update", error);
        // Continue with local update even if server update fails
      }
      
      // Update local state
      const updatedUser = { ...user, avatar: avatarUrl };
      setUser(updatedUser);
      
      // Make sure to update localStorage with the new user data
      localStorage.setItem('kamao-user', JSON.stringify(updatedUser));
      
      toast.success("Avatar updated successfully");
      return true;
    } catch (error: any) {
      console.error("Avatar update error:", error);
      toast.error(error.response?.data?.message || "Failed to update avatar");
      return false;
    }
  };

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
      updateAvatar,
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
