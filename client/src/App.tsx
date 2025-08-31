import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from 'react';
import { pwaManager } from '@/lib/pwa';
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Auth from "@/pages/auth";
import Profile from "@/pages/profile";
import SellerDashboard from "@/pages/seller-dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import VendorDashboard from "@/pages/VendorDashboard";
import CreateVendor from "@/pages/CreateVendor";
import InventoryManagement from "@/pages/InventoryManagement";
import SellerVerification from "@/pages/seller-verification";
import KYCReview from "@/pages/kyc-review";
import SellerOnboarding from "@/pages/seller-onboarding";
import Loyalty from "@/pages/loyalty";
import AiSearchPage from "@/pages/ai-search";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CartSidebar from "@/components/cart/cart-sidebar";
import { ChatbotToggle } from "@/components/ChatbotToggle";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

function Router() {
  return (
    <div className="min-h-screen bg-silver-50">
      <Header />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/auth" component={Auth} />
          <Route path="/profile" component={Profile} />
          <Route path="/seller" component={SellerDashboard} />
          <Route path="/seller/verification" component={SellerVerification} />
          <Route path="/seller/onboarding" component={SellerOnboarding} />
          <Route path="/vendor/dashboard" component={VendorDashboard} />
          <Route path="/vendor/create" component={CreateVendor} />
          <Route path="/vendor/inventory" component={InventoryManagement} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/kyc" component={KYCReview} />
          <Route path="/loyalty" component={Loyalty} />
          <Route path="/ai-search" component={AiSearchPage} />
          {/* NIVEL 2: Advanced Features - will be integrated in existing admin dashboard */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <CartSidebar />
      <ChatbotToggle />
      <PWAInstallPrompt />
    </div>
  );
}

function App() {
  useEffect(() => {
    // Initialize PWA features
    if (pwaManager.isPWASupported()) {
      console.log('[PlataMX] PWA features initialized');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
