import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import WalletGuard from "@/components/WalletGuard";
import { ThemeProvider } from "next-themes";
import { initializeMockAuth } from "@/lib/auth";

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminProductEdit = lazy(() => import("./pages/AdminProductEdit"));
const AdminProductStats = lazy(() => import("./pages/AdminProductStats"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const BuyerDashboard = lazy(() => import("./pages/BuyerDashboard"));
const BuyerProducts = lazy(() => import("./pages/BuyerProducts"));
const BuyerSettings = lazy(() => import("./pages/BuyerSettings"));
const BuyerOrders = lazy(() => import("./pages/BuyerOrders"));
const BuyerCollections = lazy(() => import("./pages/BuyerCollections"));
const Cluster = lazy(() => import("./pages/Cluster"));
const ClusterDetails = lazy(() => import("./pages/ClusterDetails"));
const ClusterChat = lazy(() => import("./pages/ClusterChat"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const MenuPage = lazy(() => import("./pages/MenuPage"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Notifications = lazy(() => import("./pages/Notifications"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const BuyerChangePassword = lazy(() => import("./pages/BuyerChangePassword"));
const BuyerTwoFactor = lazy(() => import("./pages/BuyerTwoFactor"));
const Wallet = lazy(() => import("./pages/Wallet"));
const SupportChat = lazy(() => import("./pages/SupportChat"));
const WalletActions = lazy(() => import("./pages/WalletActions"));
const WalletPay = lazy(() => import("./pages/WalletPay"));
const WalletDeposit = lazy(() => import("./pages/WalletDeposit"));
const WalletWithdraw = lazy(() => import("./pages/WalletWithdraw"));
const WalletPin = lazy(() => import("./pages/WalletPin"));
const WalletApps = lazy(() => import("./pages/WalletApps"));
const Analytics = lazy(() => import("./pages/Analytics"));
const BuyerAnalytics = lazy(() => import("./pages/BuyerAnalytics"));
const Theme = lazy(() => import("./pages/Theme"));
const Utilities = lazy(() => import("./pages/Utilities"));
const UtilitiesAirtime = lazy(() => import("./pages/UtilitiesAirtime"));
const UtilitiesData = lazy(() => import("./pages/UtilitiesData"));
const UtilitiesTV = lazy(() => import("./pages/UtilitiesTV"));

const queryClient = new QueryClient();

// Initialize mock authentication
const AppContent = () => {
  useEffect(() => {
    // Auto-login with mock data when app loads
    initializeMockAuth();
  }, []);

  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} />
        <Route path="/admin/products" element={<ProtectedRoute element={<AdminProducts />} requiredRole="admin" />} />
        <Route path="/admin/products/add" element={<ProtectedRoute element={<AdminProductEdit />} requiredRole="admin" />} />
        <Route path="/admin/products/:id/edit" element={<ProtectedRoute element={<AdminProductEdit />} requiredRole="admin" />} />
        <Route path="/admin/products/:id/stats" element={<ProtectedRoute element={<AdminProductStats />} requiredRole="admin" />} />
        <Route path="/admin/orders" element={<ProtectedRoute element={<AdminOrders />} requiredRole="admin" />} />
        <Route path="/admin/settings" element={<ProtectedRoute element={<AdminSettings />} requiredRole="admin" />} />
        
        {/* Buyer Routes */}
        <Route path="/buyer" element={<ProtectedRoute element={<BuyerDashboard />} requiredRole="buyer" />} />
        <Route path="/buyer/products" element={<ProtectedRoute element={<BuyerProducts />} requiredRole="buyer" />} />
        <Route path="/buyer/products/:id" element={<ProtectedRoute element={<ProductDetails />} requiredRole="buyer" />} />
        <Route path="/buyer/settings" element={<ProtectedRoute element={<BuyerSettings />} requiredRole="buyer" />} />
        <Route path="/buyer/settings/password" element={<ProtectedRoute element={<BuyerChangePassword />} requiredRole="buyer" />} />
        <Route path="/buyer/settings/2fa" element={<ProtectedRoute element={<BuyerTwoFactor />} requiredRole="buyer" />} />
        <Route path="/buyer/collections" element={<ProtectedRoute element={<BuyerCollections />} requiredRole="buyer" />} />
        <Route path="/buyer/orders" element={<ProtectedRoute element={<BuyerOrders />} requiredRole="buyer" />} />
        
        {/* Cluster Routes */}
        <Route path="/cluster" element={<ProtectedRoute element={<Cluster />} requiredRole="buyer" />} />
        <Route path="/cluster/:clusterId" element={<ProtectedRoute element={<ClusterDetails />} requiredRole="buyer" />} />
        <Route path="/cluster/:clusterId/chat" element={<ProtectedRoute element={<ClusterChat />} requiredRole="buyer" />} />
        
        {/* Shared Routes */}
        <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} />} />
        <Route path="/search" element={<ProtectedRoute element={<SearchPage />} />} />
        <Route path="/menu" element={<ProtectedRoute element={<MenuPage />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/analytics" element={<ProtectedRoute element={<Analytics />} />} />
        <Route path="/theme" element={<ProtectedRoute element={<Theme />} />} />
        <Route path="/buyer/analytics" element={<ProtectedRoute element={<BuyerAnalytics />} />} />
        <Route path="/wallet/pin" element={<ProtectedRoute element={<WalletPin />} />} />
        <Route path="/wallet" element={<ProtectedRoute element={<WalletGuard element={<Wallet />} requirePin={true} />} />} />
        <Route path="/wallet/actions" element={<ProtectedRoute element={<WalletGuard element={<WalletActions />} requirePin={true} />} />} />
        <Route path="/wallet/pay" element={<ProtectedRoute element={<WalletGuard element={<WalletPay />} requirePin={true} />} />} />
        <Route path="/wallet/apps" element={<ProtectedRoute element={<WalletGuard element={<WalletApps />} requirePin={true} />} />} />
        <Route path="/wallet/deposit" element={<ProtectedRoute element={<WalletGuard element={<WalletDeposit />} requirePin={true} />} />} />
        <Route path="/utilities" element={<ProtectedRoute element={<Utilities />} />} />
        <Route path="/utilities/airtime" element={<ProtectedRoute element={<UtilitiesAirtime />} />} />
        <Route path="/utilities/data" element={<ProtectedRoute element={<UtilitiesData />} />} />
        <Route path="/utilities/tv" element={<ProtectedRoute element={<UtilitiesTV />} />} />
        <Route path="/support-chat" element={<ProtectedRoute element={<SupportChat />} />} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
