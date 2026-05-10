import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ThemeProvider } from "next-themes";
import { initializeAuth } from "@/lib/auth";
import LoadingProgress from "@/components/LoadingProgress";

const Index = lazy(() => import("./pages/Index"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminClusters = lazy(() => import("./pages/AdminClusters"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminProductEdit = lazy(() => import("./pages/AdminProductEdit"));
const AdminProductStats = lazy(() => import("./pages/AdminProductStats"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AdminContent = lazy(() => import("./pages/AdminContent"));
const AdminNotifications = lazy(() => import("./pages/AdminNotifications"));
const BuyerDashboard = lazy(() => import("./pages/BuyerDashboard"));
const BuyerProducts = lazy(() => import("./pages/BuyerProducts"));
const BuyerSettings = lazy(() => import("./pages/BuyerSettings"));
const BuyerOrders = lazy(() => import("./pages/BuyerOrders"));
const BuyerCollections = lazy(() => import("./pages/BuyerCollections"));
const Cluster = lazy(() => import("./pages/Cluster"));
const ClusterDetails = lazy(() => import("./pages/ClusterDetails"));
const ClusterChat = lazy(() => import("./pages/ClusterChat"));
const ClusterAnalytics = lazy(() => import("./pages/ClusterAnalytics"));
const ClusterSettings = lazy(() => import("./pages/ClusterSettings"));
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
const WalletApps = lazy(() => import("./pages/WalletApps"));
const Analytics = lazy(() => import("./pages/Analytics"));
const BuyerAnalytics = lazy(() => import("./pages/BuyerAnalytics"));
const Theme = lazy(() => import("./pages/Theme"));
const UtilitiesAirtime = lazy(() => import("./pages/UtilitiesAirtime"));
const UtilitiesData = lazy(() => import("./pages/UtilitiesData"));
const UtilitiesTV = lazy(() => import("./pages/UtilitiesTV"));
const AdminSupplierProducts = lazy(() => import("./pages/AdminSupplierProducts"));

const queryClient = new QueryClient();

// Initialize mock authentication
const AppContent = () => {
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} />
        <Route path="/admin/users" element={<ProtectedRoute element={<AdminUsers />} requiredRole="admin" />} />
        <Route path="/admin/clusters" element={<ProtectedRoute element={<AdminClusters />} requiredRole="admin" />} />
        <Route path="/admin/products" element={<ProtectedRoute element={<AdminProducts />} requiredRole="admin" />} />
        <Route path="/admin/products/add" element={<ProtectedRoute element={<AdminProductEdit />} requiredRole="admin" />} />
        <Route path="/admin/products/:id/edit" element={<ProtectedRoute element={<AdminProductEdit />} requiredRole="admin" />} />
        <Route path="/admin/products/:id/stats" element={<ProtectedRoute element={<AdminProductStats />} requiredRole="admin" />} />
        <Route path="/admin/orders" element={<ProtectedRoute element={<AdminOrders />} requiredRole="admin" />} />
        <Route path="/admin/settings" element={<ProtectedRoute element={<AdminSettings />} requiredRole="admin" />} />
        <Route path="/admin/categories" element={<ProtectedRoute element={<AdminCategories />} requiredRole="admin" />} />
        <Route path="/admin/reports" element={<ProtectedRoute element={<AdminReports />} requiredRole="admin" />} />
        <Route path="/admin/content" element={<ProtectedRoute element={<AdminContent />} requiredRole="admin" />} />
        <Route path="/admin/notifications" element={<ProtectedRoute element={<AdminNotifications />} requiredRole="admin" />} />
        <Route path="/admin/supplier-products" element={<ProtectedRoute element={<AdminSupplierProducts />} requiredRole="admin" />} />
        
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
        <Route path="/cluster/:clusterId/analytics" element={<ProtectedRoute element={<ClusterAnalytics />} requiredRole="buyer" />} />
        <Route path="/cluster/:clusterId/settings" element={<ProtectedRoute element={<ClusterSettings />} requiredRole="buyer" />} />
        
        {/* Shared Routes */}
        <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} />} />
        <Route path="/search" element={<ProtectedRoute element={<SearchPage />} />} />
        <Route path="/menu" element={<ProtectedRoute element={<MenuPage />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/analytics" element={<ProtectedRoute element={<Analytics />} />} />
        <Route path="/theme" element={<ProtectedRoute element={<Theme />} />} />
        <Route path="/buyer/analytics" element={<ProtectedRoute element={<BuyerAnalytics />} />} />
        <Route path="/wallet" element={<ProtectedRoute element={<Wallet />} />} />
        <Route path="/wallet/actions" element={<ProtectedRoute element={<WalletActions />} />} />
        <Route path="/wallet/pay" element={<ProtectedRoute element={<WalletPay />} />} />
        <Route path="/wallet/apps" element={<ProtectedRoute element={<WalletApps />} />} />
        <Route path="/wallet/deposit" element={<ProtectedRoute element={<WalletDeposit />} />} />
        <Route path="/wallet/withdraw" element={<ProtectedRoute element={<WalletWithdraw />} />} />
        <Route path="/wallet/airtime" element={<ProtectedRoute element={<UtilitiesAirtime />} />} />
        <Route path="/wallet/data" element={<ProtectedRoute element={<UtilitiesData />} />} />
        <Route path="/wallet/tv" element={<ProtectedRoute element={<UtilitiesTV />} />} />
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
          <LoadingProgress />
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
