
import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  ShoppingCart, 
  User, 
  LogIn, 
  LogOut,
  Search,
  Menu,
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

const ResellerLayout = () => {
  const { user, logout, isAuthenticated } = useUser();
  const { cartCount } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { title: 'Dashboard', path: '/reseller' },
    { title: 'Products', path: '/reseller/products' },
    { title: 'Introduction', path: '/reseller/introduction' },
    { title: 'Orders', path: '/reseller/orders', protected: true }
  ];

  const isActive = (path: string) => {
    return path === location.pathname || 
      (path !== '/reseller' && location.pathname.startsWith(path));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/reseller" className="flex items-center">
                <h1 className="text-xl font-bold text-kamao-purple">Kamao</h1>
              </Link>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex space-x-8 items-center">
              {navItems.map((item) => (
                (!item.protected || isAuthenticated) && (
                  <Link
                    key={item.title}
                    to={item.path}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive(item.path)
                        ? "text-kamao-purple border-b-2 border-kamao-purple"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {item.title}
                  </Link>
                )
              ))}
            </nav>

            {/* Right side buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/reseller/products" className="text-gray-600 hover:text-gray-900">
                <Search className="h-5 w-5" />
              </Link>
              <Link 
                to="/reseller/cart" 
                className="text-gray-600 hover:text-gray-900 relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-kamao-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to="/reseller/profile" className="text-gray-600 hover:text-gray-900">
                    <User className="h-5 w-5" />
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600"
                    onClick={() => logout()}
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      <LogIn className="h-4 w-4 mr-1" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Link 
                to="/reseller/cart" 
                className="text-gray-600 hover:text-gray-900 relative mr-4"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-kamao-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg absolute top-16 inset-x-0 z-50">
            <div className="pt-2 pb-3 space-y-1 px-4">
              {navItems.map((item) => (
                (!item.protected || isAuthenticated) && (
                  <Link
                    key={item.title}
                    to={item.path}
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      isActive(item.path)
                        ? "bg-kamao-purple-light text-kamao-purple"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                )
              ))}
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/reseller/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-grow bg-gray-50">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Kamao. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ResellerLayout;
