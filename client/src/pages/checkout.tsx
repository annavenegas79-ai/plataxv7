import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Lock, CreditCard, Truck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth-store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Cart, Product } from "@shared/schema";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Teléfono inválido"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  city: z.string().min(2, "Ciudad requerida"),
  state: z.string().min(2, "Estado requerido"),
  postalCode: z.string().min(5, "Código postal inválido"),
  paymentMethod: z.enum(["card", "transfer", "cash"]),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: cartItems = [], isLoading: cartLoading } = useQuery<(Cart & { product: Product })[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      paymentMethod: "card",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => apiRequest("POST", "/api/orders", orderData),
    onSuccess: (response) => {
      toast({
        title: "¡Pedido realizado!",
        description: "Tu pedido se ha procesado correctamente.",
      });
      setLocation(`/profile?tab=orders`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo procesar el pedido. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const subtotal = cartItems.reduce((sum: number, item: any) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  );
  const shipping = subtotal > 1000 ? 0 : 99;
  const total = subtotal + shipping;

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderData = {
        total: total.toString(),
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          phone: data.phone,
        },
        paymentMethod: data.paymentMethod,
        paymentStatus: "paid",
        items: cartItems.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      createOrderMutation.mutate(orderData);
    } catch (error) {
      toast({
        title: "Error de pago",
        description: "No se pudo procesar el pago. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-silver-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <Lock className="w-16 h-16 text-silver-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-silver-800 mb-2">Inicia sesión para continuar</h2>
          <p className="text-silver-600 mb-6">Necesitas una cuenta para realizar el checkout.</p>
          <Button
            onClick={() => setLocation("/auth")}
            className="bg-gold-500 hover:bg-gold-600 text-white"
            data-testid="button-login-checkout"
          >
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-silver-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-silver-200 rounded w-1/4" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="h-32 bg-silver-200 rounded" />
                <div className="h-32 bg-silver-200 rounded" />
              </div>
              <div className="h-64 bg-silver-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-silver-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <h2 className="text-2xl font-bold text-silver-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-silver-600 mb-6">Agrega productos antes de proceder al checkout.</p>
          <Button
            onClick={() => setLocation("/products")}
            className="bg-gold-500 hover:bg-gold-600 text-white"
            data-testid="button-shop-now"
          >
            Ir a comprar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-silver-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => setLocation("/cart")}
            data-testid="button-back-to-cart"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al carrito
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-silver-800" data-testid="text-checkout-title">
              Finalizar Compra
            </h1>
            <p className="text-silver-600">Completa tu información para procesar el pedido</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Información de Envío
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nombre *</Label>
                      <Input
                        id="firstName"
                        {...register("firstName")}
                        className={errors.firstName ? "border-red-500" : ""}
                        data-testid="input-first-name"
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellido *</Label>
                      <Input
                        id="lastName"
                        {...register("lastName")}
                        className={errors.lastName ? "border-red-500" : ""}
                        data-testid="input-last-name"
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      className={errors.email ? "border-red-500" : ""}
                      data-testid="input-email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="10 dígitos"
                      className={errors.phone ? "border-red-500" : ""}
                      data-testid="input-phone"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address">Dirección *</Label>
                    <Input
                      id="address"
                      {...register("address")}
                      placeholder="Calle, número, colonia"
                      className={errors.address ? "border-red-500" : ""}
                      data-testid="input-address"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        {...register("city")}
                        className={errors.city ? "border-red-500" : ""}
                        data-testid="input-city"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">Estado *</Label>
                      <Input
                        id="state"
                        {...register("state")}
                        className={errors.state ? "border-red-500" : ""}
                        data-testid="input-state"
                      />
                      {errors.state && (
                        <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="postalCode">CP *</Label>
                      <Input
                        id="postalCode"
                        {...register("postalCode")}
                        className={errors.postalCode ? "border-red-500" : ""}
                        data-testid="input-postal-code"
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Método de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    onValueChange={(value) => setValue("paymentMethod", value as "card" | "transfer" | "cash")}
                    defaultValue="card"
                  >
                    <SelectTrigger data-testid="select-payment-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Tarjeta de Crédito/Débito</SelectItem>
                      <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                      <SelectItem value="cash">Pago Contra Entrega</SelectItem>
                    </SelectContent>
                  </Select>

                  {watch("paymentMethod") === "card" && (
                    <div className="mt-4 p-4 bg-silver-50 rounded-lg">
                      <p className="text-sm text-silver-600 mb-2">
                        <Lock className="w-4 h-4 inline mr-1" />
                        Pago seguro procesado por Stripe
                      </p>
                      <p className="text-xs text-silver-500">
                        Será redirigido a la página de pago seguro para completar la transacción.
                      </p>
                    </div>
                  )}

                  {watch("paymentMethod") === "transfer" && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Recibirás los datos bancarios por email para realizar la transferencia.
                      </p>
                    </div>
                  )}

                  {watch("paymentMethod") === "cash" && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        Pagarás en efectivo al momento de recibir tu pedido.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cartItems.map((item: any) => (
                      <div key={item.id} className="flex gap-3" data-testid={`order-item-${item.productId}`}>
                        <img
                          src={item.product.images?.[0] || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"}
                          alt={item.product.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-silver-800 truncate">
                            {item.product.title}
                          </p>
                          <p className="text-xs text-silver-600">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-silver-800">
                          ${(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Pricing Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-silver-600">Subtotal</span>
                      <span data-testid="text-order-subtotal">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-silver-600">Envío</span>
                      <span className={shipping === 0 ? "text-green-600" : ""} data-testid="text-order-shipping">
                        {shipping === 0 ? "Gratis" : `$${shipping}`}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span data-testid="text-order-total">${total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    type="submit"
                    disabled={isProcessing || createOrderMutation.isPending}
                    className="w-full bg-gold-500 hover:bg-gold-600 text-white py-3 text-lg font-semibold"
                    data-testid="button-place-order"
                  >
                    {isProcessing ? (
                      "Procesando..."
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Realizar Pedido - ${total.toLocaleString()}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-silver-500 text-center">
                    Al realizar el pedido, aceptas nuestros términos y condiciones.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
