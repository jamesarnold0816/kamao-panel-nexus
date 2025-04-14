
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole, useUser } from "@/contexts/UserContext";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { 
    message: "Password must be at least 6 characters long." 
  }),
});

const Login = () => {
  const { login, isAuthenticated, user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<UserRole>('reseller');
  
  // Get role from URL query param if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role') as UserRole;
    if (roleParam === 'admin' || roleParam === 'reseller') {
      setRole(roleParam);
    }
  }, [location.search]);
  
  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else if (user?.role === 'reseller') {
        navigate('/reseller');
      }
    }
  }, [isAuthenticated, navigate, user]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const success = await login(values.email, values.password, role);
      
      if (success) {
        navigate(role === 'admin' ? '/admin' : '/reseller');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Login to Kamao</h1>
            <p className="text-gray-600 mt-2">Enter your credentials to access your account</p>
          </div>

          <Tabs defaultValue={role} onValueChange={(v) => setRole(v as UserRole)}>
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="reseller">Reseller</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link 
                to={`/signup${role === 'admin' ? '?role=admin' : ''}`} 
                className="text-kamao-purple hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
        
        {role === 'admin' && (
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Demo Admin Credentials:</p>
            <p>Email: admin@kamao.com</p>
            <p>Password: password</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
