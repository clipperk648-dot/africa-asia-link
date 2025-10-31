import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import WalletGuard from "@/components/WalletGuard";
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
const BuyerCollections = lazy(() => import("./pages/BuyerCollections"));
const Analytics = lazy(() => import("./pages/Analytics"));
const BuyerAnalytics = lazy(() => import("./pages/BuyerAnalytics"));
const BuyerDashboard = lazy(() => import("./pages/BuyerDashboard"));
const BuyerProducts = lazy(() => import("./pages/BuyerProducts"));
const BuyerNetwork = lazy(() => import("./pages/BuyerNetwork"));
const BuyerSettings = lazy(() => import("./pages/BuyerSettings"));
const BuyerOrders = lazy(() => import("./pages/BuyerOrders"));
const SocialFeed = lazy(() => import("./pages/SocialFeed"));
const SocialAddPost = lazy(() => import("./pages/SocialAddPost"));
const Clan = lazy(() => import("./pages/Clan"));
const ClanDetails = lazy(() => import("./pages/ClanDetails"));
const ClanChat = lazy(() => import("./pages/ClanChat"));
const ClanAnalytics = lazy(() => import("./pages/ClanAnalytics"));
const ClanSettings = lazy(() => import("./pages/ClanSettings"));
const Cart = lazy(() => import("./pages/Cart"));
const Messages = lazy(() => import("./pages/Messages"));
const Chat = lazy(() => import("./pages/Chat"));
const VideoFeed = lazy(() => import("./pages/VideoFeed"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const MenuPage = lazy(() => import("./pages/MenuPage"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Notifications = lazy(() => import("./pages/Notifications"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const BuyerChangePassword = lazy(() => import("./pages/BuyerChangePassword"));
const BuyerTwoFactor = lazy(() => import("./pages/BuyerTwoFactor"));
const IndustryChangePassword = lazy(() => import("./pages/IndustryChangePassword"));
const IndustryTwoFactor = lazy(() => import("./pages/IndustryTwoFactor"));
const Wallet = lazy(() => import("./pages/Wallet"));
const SupportChat = lazy(() => import("./pages/SupportChat"));
const WalletActions = lazy(() => import("./pages/WalletActions"));
const WalletPay = lazy(() => import("./pages/WalletPay"));
const WalletDeposit = lazy(() => import("./pages/WalletDeposit"));
const WalletWithdraw = lazy(() => import("./pages/WalletWithdraw"));
const WalletPin = lazy(() => import("./pages/WalletPin"));
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
              <Route path="/industry/settings/password" element={<ProtectedRoute element={<IndustryChangePassword />} requiredRole="industry" />} />
              <Route path="/industry/settings/2fa" element={<ProtectedRoute element={<IndustryTwoFactor />} requiredRole="industry" />} />
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
              <Route path="/buyer/collections" element={<ProtectedRoute element={<BuyerCollections />} requiredRole="buyer" />} />
              <Route path="/buyer/orders" element={<ProtectedRoute element={<BuyerOrders />} requiredRole="buyer" />} />
              <Route path="/clan" element={<ProtectedRoute element={<Clan />} requiredRole="buyer" />} />
              <Route path="/clan/:clanId" element={<ProtectedRoute element={<ClanDetails />} requiredRole="buyer" />} />
              <Route path="/clan/:clanId/chat" element={<ProtectedRoute element={<ClanChat />} requiredRole="buyer" />} />
              <Route path="/clan/:clanId/analytics" element={<ProtectedRoute element={<ClanAnalytics />} requiredRole="buyer" />} />
              <Route path="/clan/:clanId/settings" element={<ProtectedRoute element={<ClanSettings />} requiredRole="buyer" />} />
              <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} />} />
              <Route path="/social" element={<ProtectedRoute element={<SocialFeed />} />} />
              <Route path="/social/add" element={<ProtectedRoute element={<SocialAddPost />} />} />
              <Route path="/cart" element={<ProtectedRoute element={<Cart />} />} />
              <Route path="/messages" element={<ProtectedRoute element={<Messages />} />} />
              <Route path="/messages/:id" element={<ProtectedRoute element={<Chat />} />} />
              <Route path="/video" element={<ProtectedRoute element={<VideoFeed />} />} />
              <Route path="/search" element={<ProtectedRoute element={<SearchPage />} />} />
              <Route path="/menu" element={<ProtectedRoute element={<MenuPage />} />} />
              <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
              <Route path="/analytics" element={<ProtectedRoute element={<Analytics />} />} />
              <Route path="/buyer/analytics" element={<ProtectedRoute element={<BuyerAnalytics />} />} />
              <Route path="/wallet/pin" element={<ProtectedRoute element={<WalletPin />} />} />
              <Route path="/wallet" element={<ProtectedRoute element={<WalletGuard element={<Wallet />} requirePin={true} />} />} />
              <Route path="/wallet/actions" element={<ProtectedRoute element={<WalletGuard element={<WalletActions />} requirePin={true} />} />} />
              <Route path="/wallet/pay" element={<ProtectedRoute element={<WalletGuard element={<WalletPay />} requirePin={true} />} />} />
              <Route path="/wallet/apps" element={<ProtectedRoute element={<WalletGuard element={<WalletApps />} requirePin={true} />} />} />
              <Route path="/wallet/deposit" element={<ProtectedRoute element={<WalletGuard element={<WalletDeposit />} requirePin={true} />} />} />
              <Route path="/wallet/withdraw" element={<ProtectedRoute element={<WalletGuard element={<WalletWithdraw />} requirePin={true} />} />} />
              <Route path="/invest" element={<ProtectedRoute element={<Invest />} />} />
              <Route path="/invest/analytics" element={<ProtectedRoute element={<InvestAnalytics />} />} />
              <Route path="/invest/support" element={<ProtectedRoute element={<InvestSupport />} />} />
              <Route path="/invest/resources" element={<ProtectedRoute element={<InvestResources />} />} />
              <Route path="/invest/settings" element={<ProtectedRoute element={<InvestSettings />} />} />
              <Route path="/invest/history" element={<ProtectedRoute element={<InvestHistory />} />} />
              <Route path="/invest/security" element={<ProtectedRoute element={<InvestSecurity />} />} />
              <Route path="/support-chat" element={<ProtectedRoute element={<SupportChat />} />} />
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
