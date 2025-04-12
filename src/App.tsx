
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { CartProvider } from "./contexts/CartContext";
import { ProductProvider } from "./contexts/ProductContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminResellers from "./pages/admin/Resellers";
import AdminSettings from "./pages/admin/Settings";
import ResellerDashboard from "./pages/reseller/Dashboard";
import ResellerProducts from "./pages/reseller/Products";
import ResellerIntroduction from "./pages/reseller/Introduction";
import ResellerOrders from "./pages/reseller/Orders";
import ResellerProfile from "./pages/reseller/Profile";
import ResellerCart from "./pages/reseller/Cart";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminLayout from "./layouts/AdminLayout";
import ResellerLayout from "./layouts/ResellerLayout";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <ProductProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute role="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="resellers" element={<AdminResellers />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                
                {/* Reseller Routes */}
                <Route path="/reseller" element={<ResellerLayout />}>
                  <Route index element={<ResellerDashboard />} />
                  <Route path="products" element={<ResellerProducts />} />
                  <Route path="introduction" element={<ResellerIntroduction />} />
                  <Route path="orders" element={
                    <ProtectedRoute role="reseller">
                      <ResellerOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedRoute role="reseller">
                      <ResellerProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="cart" element={<ResellerCart />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </ProductProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
