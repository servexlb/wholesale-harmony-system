
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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

const queryClient = new QueryClient();

// Admin authentication check
const AdminRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem("adminAuthenticated") === "true";
  
  if (!isAuthenticated) {
    return <Navigate to="/admin-auth" replace />;
  }
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
