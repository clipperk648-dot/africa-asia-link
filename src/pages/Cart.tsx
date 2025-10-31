import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { getCart, updateQuantity as updateQty, removeFromCart, setCart } from "@/utils/cart";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  company: string;
}

const Cart = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [cartItems, setCartItems] = useState<CartItem[]>(getCart());

  const goBack = () => {
    if (user?.role === "industry") {
      navigate("/industry");
    } else if (user?.role === "buyer") {
      navigate("/buyer");
    } else {
      navigate("/login");
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    const updated = updateQty(id, delta);
    setCartItems(updated);
  };

  const removeItem = (id: string) => {
    const updated = removeFromCart(id);
    setCartItems(updated);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    setCart(cartItems);
  }, [cartItems]);

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      {/* Header */}
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Shopping Cart
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {cartItems.length === 0 ? (
          <GlassCard className="p-8 sm:p-12 text-center">
            <ShoppingBag className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Add some products to get started
            </p>
            <Button onClick={goBack} variant="gradient">
              Continue Shopping
            </Button>
          </GlassCard>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <GlassCard key={item.id} className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {item.company}
                      </p>
                      <p className="text-sm sm:text-base font-bold text-primary mt-1">
                        ${item.price.toLocaleString()}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Summary */}
            <GlassCard className="p-4 sm:p-6 sticky bottom-20 sm:bottom-24">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-muted-foreground">Subtotal</span>
                  <span className="text-sm sm:text-base font-medium">
                    ${total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-muted-foreground">Shipping</span>
                  <span className="text-sm sm:text-base font-medium">Calculated at checkout</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-base sm:text-lg font-bold">Total</span>
                    <span className="text-lg sm:text-xl font-bold text-primary">
                      ${total.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="gradient"
                    className="w-full"
                    size="lg"
                    onClick={() => navigate(user?.role === "buyer" ? "/wallet/deposit" : "/wallet")}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </GlassCard>
          </>
        )}
      </main>
    </div>
  );
};

export default Cart;
