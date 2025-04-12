
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";

const Index = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on user role
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'reseller') {
      navigate('/reseller');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-kamao-purple-light">
      <div className="max-w-4xl mx-auto text-center px-4 py-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-kamao-purple-dark">Welcome to Kamao</h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-700">
          Choose your role to continue
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
          <div className="bg-white p-8 rounded-lg shadow-lg flex-1 max-w-xs">
            <h2 className="text-2xl font-bold mb-4 text-kamao-purple-dark">Admin</h2>
            <p className="text-gray-600 mb-6">
              Manage products, orders, and resellers.
            </p>
            <Button 
              className="w-full" 
              onClick={() => navigate('/login?role=admin')}
            >
              Login as Admin
            </Button>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-lg flex-1 max-w-xs">
            <h2 className="text-2xl font-bold mb-4 text-kamao-purple-dark">Reseller</h2>
            <p className="text-gray-600 mb-6">
              Browse products and place orders.
            </p>
            <Button 
              className="w-full"
              onClick={() => navigate('/reseller')}
            >
              Continue as Reseller
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
