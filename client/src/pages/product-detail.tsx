import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Star, Heart, ShoppingCart, CheckCircle, ArrowLeft, Share2, Shield, Truck, Clock, CreditCard, MapPin, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LoginModal from "@/components/auth/login-modal";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { openCart } = useCartStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('full');

  const { data: product, isLoading } = useQuery({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/products", id, "reviews"],
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/cart", { productId: parseInt(id!), quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "¡Agregado al carrito!",
        description: "El producto se agregó correctamente a tu carrito.",
      });
      openCart();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito.",
        variant: "destructive",
      });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/wishlist", { productId: parseInt(id!) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "¡Agregado a favoritos!",
        description: "El producto se agregó a tu lista de deseos.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar a favoritos.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    addToCartMutation.mutate();
  };

  const handleAddToWishlist = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    addToWishlistMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-silver-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-silver-200 rounded-xl" />
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-silver-200 rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-silver-200 rounded w-3/4" />
                <div className="h-6 bg-silver-200 rounded w-1/2" />
                <div className="h-12 bg-silver-200 rounded w-1/3" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-4 bg-silver-200 rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-silver-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-silver-800 mb-2">Producto no encontrado</h2>
          <p className="text-silver-600 mb-4">El producto que buscas no existe o ya no está disponible.</p>
          <Link href="/products">
            <Button className="bg-gold-500 hover:bg-gold-600 text-white">
              Ver todos los productos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const rating = parseFloat(product.rating);
  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const price = parseFloat(product.price);
  
  // Installment calculations
  const installmentPlans = [
    { months: 3, monthlyPayment: price / 3, totalInterest: 0 },
    { months: 6, monthlyPayment: (price * 1.05) / 6, totalInterest: price * 0.05 },
    { months: 12, monthlyPayment: (price * 1.15) / 12, totalInterest: price * 0.15 }
  ];
  
  // Shipping progress
  const shippingSteps = [
    { label: 'Pedido confirmado', date: 'Hoy', completed: true },
    { label: 'En preparación', date: 'Mañana', completed: false },
    { label: 'Enviado', date: '2-3 días', completed: false },
    { label: 'Entregado', date: '3-5 días', completed: false }
  ];

  return (
    <div className="min-h-screen bg-silver-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-silver-600 mb-6">
          <Link href="/" className="hover:text-gold-500" data-testid="link-home-breadcrumb">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gold-500" data-testid="link-products-breadcrumb">
            Productos
          </Link>
          <span>/</span>
          <span className="text-silver-800" data-testid="text-current-product">
            {product.title}
          </span>
        </div>

        {/* Back Button */}
        <Link href="/products">
          <Button variant="outline" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a productos
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Product Images */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="aspect-square bg-white rounded-2xl border border-silver-200 overflow-hidden shadow-lg">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={images[selectedImage] || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"}
                alt={product.title}
                className="w-full h-full object-cover blur-up"
                data-testid="img-product-main"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all ${
                      selectedImage === index ? 'border-gold-500 shadow-md' : 'border-silver-200'
                    }`}
                    data-testid={`button-image-${index}`}
                  >
                    <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Seller Info */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-silver-600">Vendido por:</span>
              <span className="font-medium text-silver-800" data-testid="text-seller">
                {product.seller?.username || 'Vendedor verificado'}
              </span>
              <Badge className="badge-verified">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verificado
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-silver-800" data-testid="text-product-title">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <div className="flex text-gold-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= rating ? "fill-current" : ""}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-silver-600" data-testid="text-rating">
                  {rating.toFixed(1)} ({product.reviewCount} reseñas)
                </span>
              </div>
              {hasDiscount && (
                <Badge className="bg-red-100 text-red-800">
                  -{Math.round(((parseFloat(product.originalPrice!) - parseFloat(product.price)) / parseFloat(product.originalPrice!)) * 100)}% OFF
                </Badge>
              )}
            </div>

            {/* Price */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-silver-800" data-testid="text-product-price">
                  ${price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-silver-400 line-through">
                    ${parseFloat(product.originalPrice!).toLocaleString()}
                  </span>
                )}
              </div>
              
              {/* Payment Options */}
              <div className="card-modern p-4">
                <h4 className="font-semibold text-silver-800 mb-3 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Opciones de pago
                </h4>
                <div className="space-y-2">
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPaymentMethod === 'full' ? 'border-gold-500 bg-gold-50' : 'border-silver-200'
                    }`}
                    onClick={() => setSelectedPaymentMethod('full')}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Pago completo</span>
                      <span className="text-lg font-bold text-green-600">${price.toLocaleString()}</span>
                    </div>
                  </div>
                  {installmentPlans.map((plan) => (
                    <div
                      key={plan.months}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPaymentMethod === `installment-${plan.months}` ? 'border-gold-500 bg-gold-50' : 'border-silver-200'
                      }`}
                      onClick={() => setSelectedPaymentMethod(`installment-${plan.months}`)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{plan.months} meses</span>
                          {plan.totalInterest === 0 && (
                            <Badge className="ml-2 badge-premium text-xs">Sin intereses</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${plan.monthlyPayment.toFixed(0)}/mes</div>
                          {plan.totalInterest > 0 && (
                            <div className="text-xs text-silver-500">+${plan.totalInterest.toFixed(0)} intereses</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <Badge className="bg-green-100 text-green-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Envío gratis
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  Garantía de autenticidad
                </Badge>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-silver-700">Cantidad</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-silver-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-silver-100 transition-colors"
                    data-testid="button-decrease-quantity"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-silver-200" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-silver-100 transition-colors"
                    data-testid="button-increase-quantity"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-silver-600">
                  {product.stock} disponibles
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending || product.stock === 0}
                  className="flex-1 bg-gold-500 hover:bg-gold-600 text-white py-3 text-lg font-semibold"
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
                </Button>
                <Button
                  onClick={handleAddToWishlist}
                  variant="outline"
                  className="px-4"
                  data-testid="button-add-to-wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="outline" className="px-4" data-testid="button-share">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="card-modern p-4">
              <h4 className="font-semibold text-silver-800 mb-3 flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Información de envío
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-silver-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Envío desde:
                  </span>
                  <span className="font-medium">Taxco, Guerrero</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-silver-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Tiempo estimado:
                  </span>
                  <span className="font-medium">3-5 días hábiles</span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-silver-600 mb-2">
                    <span>Progreso estimado del pedido</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  <div className="flex justify-between mt-2 text-xs">
                    {shippingSteps.map((step, index) => (
                      <div key={index} className={`text-center ${step.completed ? 'text-green-600' : 'text-silver-400'}`}>
                        <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${step.completed ? 'bg-green-500' : 'bg-silver-300'}`} />
                        <div className="font-medium">{step.label}</div>
                        <div>{step.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Specifications Preview */}
            {product.specifications && (
              <Card className="card-modern">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-silver-800 mb-3">Especificaciones</h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(product.specifications as Record<string, any>).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-silver-600 capitalize">{key}:</span>
                        <span className="text-silver-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
          
          {/* Sticky Buy Box */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:sticky lg:top-8 lg:h-fit"
          >
            <div className="card-elevated p-6 space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-silver-800 mb-2">
                  {selectedPaymentMethod === 'full' ? (
                    `$${price.toLocaleString()}`
                  ) : (
                    `$${installmentPlans.find(p => selectedPaymentMethod === `installment-${p.months}`)?.monthlyPayment.toFixed(0)}/mes`
                  )}
                </div>
                {selectedPaymentMethod !== 'full' && (
                  <div className="text-sm text-silver-600">
                    {selectedPaymentMethod.split('-')[1]} meses sin intereses
                  </div>
                )}
              </div>
              
              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-silver-700">Cantidad</label>
                <div className="flex items-center justify-center">
                  <div className="flex items-center border border-silver-200 rounded-lg">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-silver-100 transition-colors"
                      data-testid="button-decrease-quantity"
                    >
                      -
                    </motion.button>
                    <span className="px-6 py-2 border-x border-silver-200 font-medium" data-testid="text-quantity">
                      {quantity}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 hover:bg-silver-100 transition-colors"
                      data-testid="button-increase-quantity"
                    >
                      +
                    </motion.button>
                  </div>
                </div>
                <div className="text-center text-sm text-silver-600">
                  {product.stock} disponibles
                </div>
              </div>
              
              {/* Actions */}
              <div className="space-y-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending || product.stock === 0}
                    className="w-full gradient-gold text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    data-testid="button-add-to-cart"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
                  </Button>
                </motion.div>
                
                <div className="flex gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button
                      onClick={handleAddToWishlist}
                      variant="outline"
                      className="w-full border-silver-300 hover:border-gold-400"
                      data-testid="button-add-to-wishlist"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Favoritos
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      className="px-4 border-silver-300 hover:border-gold-400" 
                      data-testid="button-share"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
                
                {/* Trust Badges */}
                <div className="border-t border-silver-200 pt-4 space-y-2">
                  <div className="flex items-center text-sm text-silver-600">
                    <Shield className="w-4 h-4 mr-2 text-green-500" />
                    Compra 100% segura
                  </div>
                  <div className="flex items-center text-sm text-silver-600">
                    <Truck className="w-4 h-4 mr-2 text-blue-500" />
                    Envío gratis a todo México
                  </div>
                  <div className="flex items-center text-sm text-silver-600">
                    <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                    30 días para devoluciones
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="description" data-testid="tab-description">Descripción</TabsTrigger>
            <TabsTrigger value="specifications" data-testid="tab-specifications">Especificaciones</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">Reseñas ({reviews.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-silver-800 mb-4">Descripción del producto</h3>
                <div className="prose prose-silver max-w-none">
                  <p className="text-silver-600 leading-relaxed" data-testid="text-product-description">
                    {product.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-silver-800 mb-4">Especificaciones técnicas</h3>
                {product.specifications ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications as Record<string, any>).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-silver-100">
                        <span className="font-medium text-silver-700 capitalize">{key}:</span>
                        <span className="text-silver-600">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-silver-600">No hay especificaciones disponibles para este producto.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-silver-800 mb-4">Reseñas de clientes</h3>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-silver-100 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-silver-800">
                              {review.user?.firstName || 'Usuario Anónimo'}
                            </span>
                            <div className="flex text-gold-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${star <= (review.rating || 0) ? "fill-current" : ""}`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-silver-500">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Fecha no disponible'}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-silver-600">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-silver-600">Aún no hay reseñas para este producto.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          // After successful login, try adding to cart again
          addToCartMutation.mutate();
        }}
      />
    </div>
  );
}
