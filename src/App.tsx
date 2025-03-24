
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FirebaseProvider } from "@/contexts/FirebaseContext";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import AdminPanel from "./pages/AdminPanel";
import AdminAuth from "./components/AdminAuth";
import NotFound from "./pages/NotFound";
import Wholesale from "./pages/Wholesale";
import TransactionHistory from "./pages/TransactionHistory";
import Support from "./pages/Support";
import Account from "./pages/Account";
import About from "./pages/About";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

// PayPal configuration
const paypalOptions = {
  clientId: "test", // Corrected from "client-id" to "clientId"
  currency: "USD",
  intent: "capture",
  components: "buttons"
};

// Admin authentication check
const AdminRoute = ({ children }) => {
  // Check both localStorage and sessionStorage for admin authentication
  const isAuthenticated = 
    localStorage.getItem("adminAuthenticated") === "true" || 
    sessionStorage.getItem("adminAuthenticated") === "true";
  
  if (!isAuthenticated) {
    return <Navigate to="/admin-auth" replace />;
  }
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FirebaseProvider>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <SubscriptionProvider>
              <PayPalScriptProvider options={paypalOptions}>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AnimatePresence mode="wait">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/dashboard/*" element={<Dashboard />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/services/:id" element={<ServiceDetail />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/payment" element={<Payment />} />
                      <Route path="/admin-auth" element={<AdminAuth />} />
                      <Route path="/admin/*" element={
                        <AdminRoute>
                          <AdminPanel />
                        </AdminRoute>
                      } />
                      <Route path="/wholesale" element={<Wholesale />} />
                      <Route path="/dashboard/transaction-history" element={<TransactionHistory />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AnimatePresence>
                </BrowserRouter>
              </PayPalScriptProvider>
            </SubscriptionProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </FirebaseProvider>
  </QueryClientProvider>
);

export default App;
