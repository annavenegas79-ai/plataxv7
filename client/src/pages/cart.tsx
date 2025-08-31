import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, X, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Cart, Product } from "@shared/schema";

export default function Cart() {
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

  const clearCartMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/cart"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Carrito vacío",
        description: "Se eliminaron todos los productos del carrito.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo vaciar el carrito.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ productId, quantity: newQuantity });
  };

  const handleRemoveItem = (productId: number) => {
    removeItemMutation.mutate(productId);
  };

  const subtotal = cartItems.reduce((sum: number, item: any) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  );

  const shipping = subtotal > 1000 ? 0 : 99; // Free shipping over $1000
  const total = subtotal + shipping;

  if (!user) {
    return (
      <div className="min-h-screen bg-silver-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <ShoppingBag className="w-16 h-16 text-silver-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-silver-800 mb-2">Inicia sesión para ver tu carrito</h2>
          <p className="text-silver-600 mb-6">Necesitas una cuenta para agregar productos al carrito.</p>
          <Link href="/auth">
            <Button className="bg-gold-500 hover:bg-gold-600 text-white" data-testid="button-login-cart">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-silver-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-silver-200 rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-silver-200 rounded w-3/4" />
                      <div className="h-4 bg-silver-200 rounded w-1/2" />
                      <div className="h-4 bg-silver-200 rounded w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-silver-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-silver-800" data-testid="text-cart-title">
              Tu Carrito
            </h1>
            <p className="text-silver-600" data-testid="text-cart-items-count">
              {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <Link href="/products">
            <Button variant="outline" data-testid="button-continue-shopping">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Seguir comprando
            </Button>
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16" data-testid="cart-empty-state">
            <ShoppingBag className="w-16 h-16 text-silver-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-silver-800 mb-2">Tu carrito está vacío</h2>
            <p className="text-silver-600 mb-6">Descubre nuestros productos de plata y encuentra algo especial.</p>
            <Link href="/products">
              <Button className="bg-gold-500 hover:bg-gold-600 text-white" data-testid="button-start-shopping">
                Comenzar a comprar
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-silver-800">Productos</h2>
                {cartItems.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearCartMutation.mutate()}
                    className="text-red-500 hover:text-red-600"
                    data-testid="button-clear-cart"
                  >
                    Vaciar carrito
                  </Button>
                )}
              </div>

              {cartItems.map((item: any) => (
                <Card key={item.id} data-testid={`cart-item-${item.productId}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Link href={`/products/${item.productId}`}>
                        <img
                          src={item.product.images?.[0] || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"}
                          alt={item.product.title}
                          className="w-24 h-24 object-cover rounded-lg"
                          data-testid={`img-cart-item-${item.productId}`}
                        />
                      </Link>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link href={`/products/${item.productId}`}>
                              <h3 className="font-semibold text-silver-800 hover:text-gold-600 transition-colors" data-testid={`text-cart-item-title-${item.productId}`}>
                                {item.product.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-silver-600">
                              Vendido por: {item.product.seller?.username || 'Vendedor verificado'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-silver-400 hover:text-red-500 transition-colors"
                            data-testid={`button-remove-${item.productId}`}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-silver-800" data-testid={`text-cart-item-price-${item.productId}`}>
                              ${parseFloat(item.product.price).toLocaleString()}
                            </span>
                            <div className="flex items-center border border-silver-200 rounded-lg">
                              <button
                                onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="px-3 py-1 hover:bg-silver-100 transition-colors disabled:opacity-50"
                                data-testid={`button-decrease-${item.productId}`}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-3 py-1 border-x border-silver-200" data-testid={`text-quantity-${item.productId}`}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                className="px-3 py-1 hover:bg-silver-100 transition-colors"
                                data-testid={`button-increase-${item.productId}`}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-silver-800">
                            ${(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-silver-800 mb-4">Resumen del pedido</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-silver-600">Subtotal ({cartItems.length} productos)</span>
                      <span className="text-silver-800" data-testid="text-subtotal">
                        ${subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-600">Envío</span>
                      <span className={`${shipping === 0 ? 'text-green-600' : 'text-silver-800'}`} data-testid="text-shipping">
                        {shipping === 0 ? 'Gratis' : `$${shipping}`}
                      </span>
                    </div>
                    {subtotal < 1000 && (
                      <p className="text-sm text-silver-500">
                        Agrega ${(1000 - subtotal).toLocaleString()} más para envío gratis
                      </p>
                    )}
                    <hr className="border-silver-200" />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-silver-800">Total</span>
                      <span className="text-silver-800" data-testid="text-total">
                        ${total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Link href="/checkout">
                    <Button 
                      className="w-full bg-gold-500 hover:bg-gold-600 text-white py-3 text-lg font-semibold"
                      data-testid="button-checkout"
                    >
                      Proceder al pago
                    </Button>
                  </Link>

                  <div className="mt-4 space-y-2 text-sm text-silver-600">
                    <div className="flex items-center gap-2">
                      <span>✓</span>
                      <span>Pago seguro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✓</span>
                      <span>Garantía de autenticidad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✓</span>
                      <span>Devoluciones fáciles</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
