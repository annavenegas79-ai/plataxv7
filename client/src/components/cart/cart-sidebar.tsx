import { X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Cart, Product } from "@shared/schema";

export default function CartSidebar() {
  const { isOpen, closeCart } = useCartStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery<(Cart & { product: Product })[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      apiRequest("PUT", `/api/cart/${productId}`, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad.",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (productId: number) =>
      apiRequest("DELETE", `/api/cart/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó del carrito.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto.",
        variant: "destructive",
      });
    },
  });

  const total = cartItems.reduce((sum: number, item) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  );

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ productId, quantity: newQuantity });
  };

  const handleRemoveItem = (productId: number) => {
    removeItemMutation.mutate(productId);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeCart}
        data-testid="cart-overlay"
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col" data-testid="cart-sidebar">
        <div className="flex items-center justify-between p-6 border-b border-silver-200">
          <h3 className="text-lg font-semibold text-silver-800" data-testid="text-cart-title">
            Carrito de Compras
          </h3>
          <button 
            onClick={closeCart}
            className="text-silver-500 hover:text-silver-700 transition-colors"
            data-testid="button-close-cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!user ? (
            <div className="text-center py-8">
              <p className="text-silver-600 mb-4">Inicia sesión para ver tu carrito</p>
              <Link href="/auth">
                <Button className="bg-gold-500 hover:bg-gold-600 text-white" data-testid="button-login-cart">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse flex space-x-4">
                  <div className="w-16 h-16 bg-silver-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-silver-200 rounded w-3/4" />
                    <div className="h-4 bg-silver-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-8" data-testid="cart-empty">
              <p className="text-silver-600 mb-4">Tu carrito está vacío</p>
              <p className="text-silver-500 text-sm">Agrega productos para comenzar tu compra</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item: any) => (
                <div key={item.id} className="flex items-center space-x-4" data-testid={`cart-item-${item.productId}`}>
                  <img
                    src={item.product.images?.[0] || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
                    alt={item.product.title}
                    className="w-16 h-16 object-cover rounded-lg"
                    data-testid={`img-cart-item-${item.productId}`}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-silver-800 mb-1" data-testid={`text-cart-item-title-${item.productId}`}>
                      {item.product.title}
                    </h4>
                    <p className="text-sm font-semibold text-silver-800" data-testid={`text-cart-item-price-${item.productId}`}>
                      ${parseFloat(item.product.price).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 bg-silver-100 hover:bg-silver-200 rounded-md flex items-center justify-center transition-colors"
                      data-testid={`button-decrease-${item.productId}`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center" data-testid={`text-quantity-${item.productId}`}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 bg-silver-100 hover:bg-silver-200 rounded-md flex items-center justify-center transition-colors"
                      data-testid={`button-increase-${item.productId}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="text-red-500 hover:text-red-600 ml-2"
                      data-testid={`button-remove-${item.productId}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {user && cartItems.length > 0 && (
          <div className="border-t border-silver-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-silver-800">Total:</span>
              <span className="text-xl font-bold text-silver-800" data-testid="text-cart-total">
                ${total.toLocaleString()}
              </span>
            </div>
            <Link href="/checkout" onClick={closeCart}>
              <Button 
                className="w-full bg-gold-500 hover:bg-gold-600 text-white py-3 rounded-lg font-semibold transition-colors mb-2"
                data-testid="button-checkout"
              >
                Proceder al Pago
              </Button>
            </Link>
            <Button 
              variant="outline"
              onClick={closeCart}
              className="w-full border border-silver-300 hover:border-silver-400 text-silver-700 py-3 rounded-lg font-semibold transition-colors"
              data-testid="button-continue-shopping"
            >
              Continuar Comprando
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
