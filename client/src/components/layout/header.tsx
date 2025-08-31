import { Link, useLocation } from "wouter";
import { Search, Heart, ShoppingCart, User, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { logout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Cart, Product, Wishlist } from "@shared/schema";

export default function Header() {
  const [location] = useLocation();
  const { user, clearAuth } = useAuthStore();
  const { openCart } = useCartStore();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      clearAuth();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error) {
      // Even if logout fails on server, clear local state
      clearAuth();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    }
  };

  const { data: cartItems = [] } = useQuery<(Cart & { product: Product })[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const { data: wishlist = [] } = useQuery<(Wishlist & { product: Product })[]>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  const cartCount = cartItems.reduce((sum: number, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-silver-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-2 text-sm text-silver-600 border-b border-silver-100">
          <div className="flex items-center space-x-4">
            <span>🇲🇽 México</span>
            <span>|</span>
            <Link href="/seller" className="hover:text-gold-500 transition-colors">
              Vender en PlataMX
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-gold-500 transition-colors">
              Ayuda
            </a>
            <span>|</span>
            {user ? (
              <>
                <span className="text-silver-800">Hola, {user.firstName}</span>
                <span>|</span>
                <button 
                  onClick={handleLogout}
                  className="hover:text-gold-500 transition-colors"
                  data-testid="button-logout"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/auth" className="hover:text-gold-500 transition-colors" data-testid="link-login">
                  Ingresar
                </Link>
                <span>|</span>
                <Link href="/auth?mode=register" className="hover:text-gold-500 transition-colors" data-testid="link-register">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <div className="w-10 h-10 bg-gradient-to-br from-silver-400 to-silver-600 rounded-lg flex items-center justify-center">
                <Gem className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-silver-600 to-silver-800 bg-clip-text text-transparent">
                PlataMX
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar productos de plata, joyas, accesorios..."
                className="w-full pl-4 pr-12 py-3 rounded-lg border-2 border-silver-200 focus:border-gold-400 focus:outline-none transition-colors"
                data-testid="input-search"
              />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gold-500 hover:bg-gold-600 text-white p-2 rounded-md transition-colors"
                data-testid="button-search"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            <button 
              className="relative hover:text-gold-500 transition-colors"
              data-testid="button-wishlist"
            >
              <Heart className="w-6 h-6" />
              {wishlist.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-gold-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlist.length}
                </Badge>
              )}
            </button>
            
            <button 
              onClick={openCart}
              className="relative hover:text-gold-500 transition-colors"
              data-testid="button-cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-gold-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </Badge>
              )}
            </button>
            
            <Link 
              href={user ? "/profile" : "/auth"}
              className="flex items-center space-x-2 hover:text-gold-500 transition-colors"
              data-testid="link-profile"
            >
              <div className="w-8 h-8 bg-silver-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span className="hidden md:block">
                {user ? "Mi cuenta" : "Ingresar"}
              </span>
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="pb-4">
          <nav className="flex space-x-8 text-sm">
            <Link 
              href="/products" 
              className={`pb-2 transition-colors ${
                location === "/products" 
                  ? "text-gold-600 font-medium border-b-2 border-gold-500" 
                  : "hover:text-gold-500"
              }`}
              data-testid="link-all-products"
            >
              Todos
            </Link>
            <Link href="/products?category=anillos" className="hover:text-gold-500 transition-colors pb-2" data-testid="link-rings">
              Anillos
            </Link>
            <Link href="/products?category=collares" className="hover:text-gold-500 transition-colors pb-2" data-testid="link-necklaces">
              Collares
            </Link>
            <Link href="/products?category=aretes" className="hover:text-gold-500 transition-colors pb-2" data-testid="link-earrings">
              Aretes
            </Link>
            <Link href="/products?category=pulseras" className="hover:text-gold-500 transition-colors pb-2" data-testid="link-bracelets">
              Pulseras
            </Link>
            <Link href="/products?category=relojes" className="hover:text-gold-500 transition-colors pb-2" data-testid="link-watches">
              Relojes
            </Link>
            <Link href="/products?category=accesorios" className="hover:text-gold-500 transition-colors pb-2" data-testid="link-accessories">
              Accesorios
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
