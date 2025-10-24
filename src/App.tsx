import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ThemeProvider } from "next-themes";
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const IndustryDashboard = lazy(() => import("./pages/IndustryDashboard"));
const IndustryProducts = lazy(() => import("./pages/IndustryProducts"));
const IndustryNetwork = lazy(() => import("./pages/IndustryNetwork"));
const IndustrySettings = lazy(() => import("./pages/IndustrySettings"));
const IndustryAddProperty = lazy(() => import("./pages/IndustryAddProperty"));
const IndustryProductEdit = lazy(() => import("./pages/IndustryProductEdit"));
const IndustryProductStats = lazy(() => import("./pages/IndustryProductStats"));
const IndustryCollections = lazy(() => import("./pages/IndustryCollections"));
const IndustryRecentActivity = lazy(() => import("./pages/IndustryRecentActivity"));
const Analytics = lazy(() => import("./pages/Analytics"));
const BuyerAnalytics = lazy(() => import("./pages/BuyerAnalytics"));
const BuyerDashboard = lazy(() => import("./pages/BuyerDashboard"));
const BuyerProducts = lazy(() => import("./pages/BuyerProducts"));
const BuyerNetwork = lazy(() => import("./pages/BuyerNetwork"));
const BuyerSettings = lazy(() => import("./pages/BuyerSettings"));
const SocialFeed = lazy(() => import("./pages/SocialFeed"));
const Cart = lazy(() => import("./pages/Cart"));
const Messages = lazy(() => import("./pages/Messages"));
const VideoFeed = lazy(() => import("./pages/VideoFeed"));
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
const WalletApps = lazy(() => import("./pages/WalletApps"));
const Invest = lazy(() => import("./pages/Invest"));
const InvestAnalytics = lazy(() => import("./pages/InvestAnalytics"));
const InvestSupport = lazy(() => import("./pages/InvestSupport"));
const InvestResources = lazy(() => import("./pages/InvestResources"));
const InvestSettings = lazy(() => import("./pages/InvestSettings"));
const InvestHistory = lazy(() => import("./pages/InvestHistory"));
const InvestSecurity = lazy(() => import("./pages/InvestSecurity"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading…</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/industry" element={<ProtectedRoute element={<IndustryDashboard />} requiredRole="industry" />} />
              <Route path="/industry/products" element={<ProtectedRoute element={<IndustryProducts />} requiredRole="industry" />} />
              <Route path="/industry/products/:id/edit" element={<ProtectedRoute element={<IndustryProductEdit />} requiredRole="industry" />} />
              <Route path="/industry/products/:id/stats" element={<ProtectedRoute element={<IndustryProductStats />} requiredRole="industry" />} />
              <Route path="/industry/network" element={<ProtectedRoute element={<IndustryNetwork />} requiredRole="industry" />} />
              <Route path="/industry/settings" element={<ProtectedRoute element={<IndustrySettings />} requiredRole="industry" />} />
              <Route path="/industry/add-property" element={<ProtectedRoute element={<IndustryAddProperty />} requiredRole="industry" />} />
              <Route path="/industry/collections" element={<ProtectedRoute element={<IndustryCollections />} requiredRole="industry" />} />
              <Route path="/industry/recent-activity" element={<ProtectedRoute element={<IndustryRecentActivity />} requiredRole="industry" />} />
              <Route path="/buyer" element={<ProtectedRoute element={<BuyerDashboard />} requiredRole="buyer" />} />
              <Route path="/buyer/products" element={<ProtectedRoute element={<BuyerProducts />} requiredRole="buyer" />} />
              <Route path="/buyer/network" element={<ProtectedRoute element={<BuyerNetwork />} requiredRole="buyer" />} />
              <Route path="/buyer/settings" element={<ProtectedRoute element={<BuyerSettings />} requiredRole="buyer" />} />
              <Route path="/buyer/settings/password" element={<ProtectedRoute element={<BuyerChangePassword />} requiredRole="buyer" />} />
              <Route path="/buyer/settings/2fa" element={<ProtectedRoute element={<BuyerTwoFactor />} requiredRole="buyer" />} />
              <Route path="/buyer/products/:id" element={<ProtectedRoute element={<ProductDetails />} requiredRole="buyer" />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/social" element={<SocialFeed />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/video" element={<VideoFeed />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/buyer/analytics" element={<BuyerAnalytics />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/wallet/actions" element={<WalletActions />} />
              <Route path="/wallet/pay" element={<WalletPay />} />
              <Route path="/wallet/apps" element={<WalletApps />} />
              <Route path="/invest" element={<Invest />} />
              <Route path="/invest/analytics" element={<InvestAnalytics />} />
              <Route path="/invest/support" element={<InvestSupport />} />
              <Route path="/invest/resources" element={<InvestResources />} />
              <Route path="/invest/settings" element={<InvestSettings />} />
              <Route path="/invest/history" element={<InvestHistory />} />
              <Route path="/invest/security" element={<InvestSecurity />} />
              <Route path="/support-chat" element={<SupportChat />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
