
import { UploadCloud, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlanCard from "@/components/PlanCard";
import { useUser } from "@/contexts/UserContext";
import { Link } from "react-router-dom";

// Save the uploaded image for the plans comparison
const planImage = "/lovable-uploads/194c425f-7842-4164-91af-1df9d3f67f05.png";

const ResellerIntroduction = () => {
  const { user, setUser } = useUser();
  const [selectedTab, setSelectedTab] = useState("about");

  // Function to handle plan upgrade
  const handleUpgradePlan = (plan: 'free' | 'basic' | 'vip') => {
    if (user) {
      setUser({ ...user, plan });
    } else {
      // Redirect to signup
      window.location.href = '/signup';
    }
  };

  return (
    <div className="container py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome to Kamao</h1>
          <p className="text-muted-foreground">
            Your complete reselling platform to grow your business
          </p>
        </div>

        <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">About Kamao</TabsTrigger>
            <TabsTrigger value="plans">Reseller Plans</TabsTrigger>
            <TabsTrigger value="howto">How It Works</TabsTrigger>
          </TabsList>
          
          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">What is Kamao?</h2>
                <p className="mb-4">
                  Kamao is a powerful platform designed to help resellers start and grow their business. 
                  We provide access to a wide range of products at competitive prices, allowing you to 
                  earn a healthy profit margin on every sale.
                </p>
                <p className="mb-4">
                  Whether you're just starting out or looking to expand your existing business, 
                  Kamao offers the tools and resources you need to succeed.
                </p>
                <Button asChild>
                  <Link to="/reseller/products">Browse Products</Link>
                </Button>
              </div>
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Key Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Access to high-quality products from trusted suppliers</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Competitive pricing to maximize your profit margins</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Easy order management and tracking system</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Different plans to suit your business needs</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Dedicated support to help you grow</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-kamao-purple-light rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-kamao-purple-dark">Why Choose Kamao?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">Extensive Product Range</h3>
                    <p className="text-sm text-gray-600">
                      From electronics to fashion, we offer a diverse catalog to meet your customers' needs.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">Flexible Plans</h3>
                    <p className="text-sm text-gray-600">
                      Start with our free plan and upgrade as your business grows.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">Reliable Support</h3>
                    <p className="text-sm text-gray-600">
                      Our team is dedicated to helping you succeed at every step.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Choose Your Reseller Plan</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Select the plan that fits your reselling business needs. Upgrade anytime as your business grows.
              </p>
            </div>
            
            {/* Display the uploaded plan image */}
            <div className="flex justify-center mb-8">
              <img 
                src={planImage} 
                alt="Kamao Reseller Plans" 
                className="max-w-full rounded-lg shadow-md"
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <PlanCard
                title="Free Plan"
                subtitle="Perfect for beginners"
                price="Rs. 0"
                features={[
                  { title: "Access to basic products", included: true },
                  { title: "Browse product catalog", included: true },
                  { title: "Cannot place orders", included: false },
                ]}
                buttonText={user?.plan === 'free' ? 'Current Plan' : 'Sign Up Free'}
                buttonAction={() => handleUpgradePlan('free')}
              />
              <PlanCard
                title="Basic Plan"
                subtitle="For growing resellers"
                price="Rs. 1,000"
                period="month"
                features={[
                  { title: "Access to basic & premium products", included: true },
                  { title: "Place unlimited orders", included: true },
                  { title: "Priority support", included: true },
                ]}
                buttonText={user?.plan === 'basic' ? 'Current Plan' : 'Upgrade to Basic'}
                buttonAction={() => handleUpgradePlan('basic')}
                popular={true}
              />
              <PlanCard
                title="VIP Plan"
                subtitle="For serious resellers"
                price="Rs. 3,000"
                period="month"
                features={[
                  { title: "Access to ALL products", included: true },
                  { title: "Exclusive high-profit products", included: true },
                  { title: "Priority fulfillment", included: true },
                  { title: "24/7 dedicated support", included: true },
                ]}
                buttonText={user?.plan === 'vip' ? 'Current Plan' : 'Upgrade to VIP'}
                buttonAction={() => handleUpgradePlan('vip')}
              />
            </div>
            
            <div className="bg-gray-100 p-6 rounded-lg mt-8">
              <h3 className="text-lg font-semibold mb-2">Plan FAQ</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Can I change plans later?</h4>
                  <p className="text-sm text-gray-600">Yes, you can upgrade or downgrade your plan at any time.</p>
                </div>
                <div>
                  <h4 className="font-medium">What happens when I upgrade?</h4>
                  <p className="text-sm text-gray-600">
                    You'll immediately gain access to all the products and features available in your new plan.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Is there a contract period?</h4>
                  <p className="text-sm text-gray-600">
                    No, all plans are month-to-month with no long-term commitment required.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* How It Works Tab */}
          <TabsContent value="howto" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">How Kamao Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get started with Kamao in just a few easy steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-kamao-purple-light text-kamao-purple flex items-center justify-center font-bold text-xl">
                      1
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-center">Sign Up</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Create your free account and choose a plan that fits your needs.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-kamao-purple-light text-kamao-purple flex items-center justify-center font-bold text-xl">
                      2
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-center">Browse Products</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Explore our catalog and find products that match your business needs.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-kamao-purple-light text-kamao-purple flex items-center justify-center font-bold text-xl">
                      3
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-center">Place Orders</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Add products to your cart and place orders with just a few clicks.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-kamao-purple-light text-kamao-purple flex items-center justify-center font-bold text-xl">
                      4
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-center">Grow Your Business</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Sell products to your customers and watch your business thrive.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-white border rounded-lg p-6 mt-8">
              <h3 className="text-xl font-semibold mb-4">Getting Started Guide</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-full mr-4">
                    <Check className="h-5 w-5 text-kamao-purple" />
                  </div>
                  <div>
                    <h4 className="font-medium">Create Your Account</h4>
                    <p className="text-sm text-gray-600">
                      Sign up with your email and create a password. Choose your preferred plan.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-full mr-4">
                    <Check className="h-5 w-5 text-kamao-purple" />
                  </div>
                  <div>
                    <h4 className="font-medium">Complete Your Profile</h4>
                    <p className="text-sm text-gray-600">
                      Add your business details and contact information to your profile.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-full mr-4">
                    <Check className="h-5 w-5 text-kamao-purple" />
                  </div>
                  <div>
                    <h4 className="font-medium">Explore Products</h4>
                    <p className="text-sm text-gray-600">
                      Browse our catalog by category and find products that fit your target market.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-full mr-4">
                    <Check className="h-5 w-5 text-kamao-purple" />
                  </div>
                  <div>
                    <h4 className="font-medium">Place Your First Order</h4>
                    <p className="text-sm text-gray-600">
                      Add products to your cart, review your order, and submit.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Button asChild>
                  <Link to={user ? "/reseller/products" : "/signup"}>
                    {user ? "Browse Products Now" : "Sign Up to Get Started"}
                  </Link>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResellerIntroduction;
