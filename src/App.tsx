import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import IndustryDashboard from "./pages/IndustryDashboard";
import IndustryProducts from "./pages/IndustryProducts";
import IndustryNetwork from "./pages/IndustryNetwork";
import IndustrySettings from "./pages/IndustrySettings";
import IndustryAddProperty from "./pages/IndustryAddProperty";
import BuyerDashboard from "./pages/BuyerDashboard";
import BuyerProducts from "./pages/BuyerProducts";
import BuyerNetwork from "./pages/BuyerNetwork";
import BuyerSettings from "./pages/BuyerSettings";
import SocialFeed from "./pages/SocialFeed";
import Cart from "./pages/Cart";
import Messages from "./pages/Messages";
import VideoFeed from "./pages/VideoFeed";
import SearchPage from "./pages/SearchPage";
import MenuPage from "./pages/MenuPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/industry" element={<IndustryDashboard />} />
          <Route path="/industry/products" element={<IndustryProducts />} />
          <Route path="/industry/network" element={<IndustryNetwork />} />
          <Route path="/industry/settings" element={<IndustrySettings />} />
          <Route path="/industry/add-property" element={<IndustryAddProperty />} />
          <Route path="/buyer" element={<BuyerDashboard />} />
          <Route path="/buyer/products" element={<BuyerProducts />} />
          <Route path="/buyer/network" element={<BuyerNetwork />} />
          <Route path="/buyer/settings" element={<BuyerSettings />} />
          <Route path="/social" element={<SocialFeed />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/video" element={<VideoFeed />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/menu" element={<MenuPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
