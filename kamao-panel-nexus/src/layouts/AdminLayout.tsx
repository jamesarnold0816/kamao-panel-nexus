
import { useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package2, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
  const { logout, isAdmin } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { 
      title: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/admin' 
    },
    { 
      title: 'Products', 
      icon: Package2, 
      path: '/admin/products' 
    },
    { 
      title: 'Orders', 
      icon: ShoppingCart, 
      path: '/admin/orders' 
    },
    { 
      title: 'Resellers', 
      icon: Users, 
      path: '/admin/resellers' 
    },
    { 
      title: 'Settings', 
      icon: Settings, 
      path: '/admin/settings' 
    }
  ];

  const isActive = (path: string) => {
    return path === location.pathname || 
      (path !== '/admin' && location.pathname.startsWith(path));
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar for larger screens */}
      <div 
        className={cn(
          "bg-white shadow-md transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-16",
          "fixed inset-y-0 left-0 z-30 transform md:relative md:translate-x-0",
          !sidebarOpen && "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 h-16 border-b">
          <Link to="/admin" className="flex items-center">
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-kamao-purple">Kamao Admin</h1>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar content */}
        <nav className="mt-5 px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.title}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                isActive(item.path)
                  ? "bg-kamao-purple-light text-kamao-purple-dark"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <item.icon className={cn("h-5 w-5", sidebarOpen ? "mr-3" : "mx-auto")} />
              {sidebarOpen && <span>{item.title}</span>}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 mt-auto"
          >
            <LogOut className={cn("h-5 w-5", sidebarOpen ? "mr-3" : "mx-auto")} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="bg-white shadow-sm z-10 md:hidden">
          <div className="px-4 h-16 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-kamao-purple">Kamao Admin</h1>
            <div className="w-8"></div> {/* Spacer for alignment */}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
