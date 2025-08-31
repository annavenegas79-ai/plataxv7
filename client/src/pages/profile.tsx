import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User, ShoppingBag, Heart, Settings, Star, Package, Wallet, CreditCard, TrendingUp, Truck, MapPin, Clock, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/auth-store";
import type { Order, OrderItem, Product, Review, Wishlist } from "@shared/schema";

export default function Profile() {
  const [location] = useLocation();
  const { user, clearAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  const { data: orders = [] } = useQuery<(Order & { items: (OrderItem & { product: Product })[] })[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const { data: reviews = [] } = useQuery<(Review & { product: Product })[]>({
    queryKey: ["/api/reviews"],
    enabled: !!user,
  });

  const { data: wishlist = [] } = useQuery<(Wishlist & { product: Product })[]>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });
  
  // Mock wallet data - in real app this would come from API
  const walletBalance = 2450.75;
  const walletTransactions = [
    { id: 1, type: 'credit', amount: 500, description: 'Reembolso pedido #1023', date: '2024-01-20', icon: ArrowDownLeft, color: 'text-green-600' },
    { id: 2, type: 'debit', amount: 125.50, description: 'Compra - Anillo de plata', date: '2024-01-18', icon: ArrowUpRight, color: 'text-red-600' },
    { id: 3, type: 'credit', amount: 1000, description: 'Recarga de saldo', date: '2024-01-15', icon: ArrowDownLeft, color: 'text-green-600' },
    { id: 4, type: 'debit', amount: 89.25, description: 'Compra - Aretes Taxco', date: '2024-01-12', icon: ArrowUpRight, color: 'text-red-600' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-silver-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <User className="w-16 h-16 text-silver-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-silver-800 mb-2">Inicia sesión</h2>
          <p className="text-silver-600 mb-6">Necesitas una cuenta para ver tu perfil.</p>
          <Button
            onClick={() => window.location.href = "/auth"}
            className="bg-gold-500 hover:bg-gold-600 text-white"
            data-testid="button-login-profile"
          >
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-silver-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-silver-300 to-silver-500 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-silver-800" data-testid="text-user-name">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-silver-600" data-testid="text-user-email">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={user.role === 'vendedor' ? 'default' : 'secondary'}>
                  {user.role === 'vendedor' ? 'Vendedor' : 'Cliente'}
                </Badge>
                {user.isVerified && (
                  <Badge className="bg-green-100 text-green-800">Verificado</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="card-modern p-6 text-center">
            <div className="text-2xl font-bold text-silver-800">{orders.length}</div>
            <div className="text-sm text-silver-600">Pedidos totales</div>
          </div>
          <div className="card-modern p-6 text-center">
            <div className="text-2xl font-bold text-green-600">${walletBalance.toLocaleString()}</div>
            <div className="text-sm text-silver-600">Saldo disponible</div>
          </div>
          <div className="card-modern p-6 text-center">
            <div className="text-2xl font-bold text-gold-600">{reviews.length}</div>
            <div className="text-sm text-silver-600">Reseñas escritas</div>
          </div>
          <div className="card-modern p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{wishlist.length}</div>
            <div className="text-sm text-silver-600">Productos favoritos</div>
          </div>
        </motion.div>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="profile" className="flex items-center gap-2" data-testid="tab-profile">
              <User className="w-4 h-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2" data-testid="tab-wallet">
              <Wallet className="w-4 h-4" />
              Cartera
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2" data-testid="tab-orders">
              <ShoppingBag className="w-4 h-4" />
              Compras ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2" data-testid="tab-wishlist">
              <Heart className="w-4 h-4" />
              Favoritos ({wishlist.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2" data-testid="tab-reviews">
              <Star className="w-4 h-4" />
              Reseñas ({reviews.length})
            </TabsTrigger>
          </TabsList>

          {/* Profile Information */}
          <TabsContent value="profile" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-silver-700">Nombre completo</label>
                      <p className="text-lg font-semibold text-silver-800" data-testid="text-profile-fullname">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-silver-700">Nombre de usuario</label>
                      <p className="text-silver-800" data-testid="text-profile-username">@{user.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-silver-700">Email</label>
                      <p className="text-silver-800" data-testid="text-profile-email">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-silver-700">Tipo de cuenta</label>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === 'vendedor' ? 'default' : 'secondary'}>
                          {user.role === 'vendedor' ? 'Vendedor' : 'Cliente'}
                        </Badge>
                        {user.isVerified && (
                          <Badge className="badge-verified">Verificado</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" data-testid="button-edit-profile">
                        Editar Perfil
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        onClick={clearAuth}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        data-testid="button-logout"
                      >
                        Cerrar Sesión
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-silver-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-silver-800">Última compra</p>
                          <p className="text-sm text-silver-600">Hace 3 días</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-silver-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Heart className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-silver-800">Productos favoritos</p>
                          <p className="text-sm text-silver-600">{wishlist.length} productos</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-silver-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-silver-800">Reseñas escritas</p>
                          <p className="text-sm text-silver-600">{reviews.length} reseñas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          {/* Wallet Section */}
          <TabsContent value="wallet" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Wallet Balance */}
              <div className="lg:col-span-1">
                <Card className="card-elevated gradient-silver text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Wallet className="w-8 h-8" />
                      <CreditCard className="w-6 h-6 opacity-70" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Saldo disponible</p>
                      <p className="text-3xl font-bold">${walletBalance.toLocaleString()}</p>
                    </div>
                    <div className="mt-6 space-y-2">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="w-full bg-white text-silver-800 hover:bg-silver-100">
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar fondos
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Transaction History */}
              <div className="lg:col-span-2">
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle>Historial de transacciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {walletTransactions.map((transaction) => {
                        const IconComponent = transaction.icon;
                        return (
                          <motion.div
                            key={transaction.id}
                            whileHover={{ scale: 1.01 }}
                            className="flex items-center justify-between p-4 border border-silver-200 rounded-xl hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                <IconComponent className={`w-5 h-5 ${transaction.color}`} />
                              </div>
                              <div>
                                <p className="font-medium text-silver-800">{transaction.description}</p>
                                <p className="text-sm text-silver-600">{transaction.date}</p>
                              </div>
                            </div>
                            <div className={`font-bold ${
                              transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          {/* Orders & Shipments */}
          <TabsContent value="orders" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {orders.length === 0 ? (
                <Card className="card-modern">
                  <CardContent className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-silver-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-silver-800 mb-2">Aún no tienes pedidos</h3>
                    <p className="text-silver-600 mb-6">Descubre nuestra increíble colección de joyas de plata auténtica</p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => window.location.href = "/products"}
                        className="gradient-gold text-white px-8 py-3"
                        data-testid="button-start-shopping"
                      >
                        Comenzar a comprar
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {orders.map((order: any, index: number) => {
                    const getProgress = (status: string) => {
                      switch(status) {
                        case 'pending': return 25;
                        case 'paid': return 50;
                        case 'shipped': return 75;
                        case 'delivered': return 100;
                        default: return 0;
                      }
                    };
                    
                    const getStatusSteps = (status: string) => [
                      { label: 'Pedido confirmado', completed: true },
                      { label: 'En preparación', completed: ['paid', 'shipped', 'delivered'].includes(status) },
                      { label: 'Enviado', completed: ['shipped', 'delivered'].includes(status) },
                      { label: 'Entregado', completed: status === 'delivered' }
                    ];
                    
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <Card className="card-elevated hover:shadow-xl transition-all duration-300">
                          <CardContent className="p-6">
                            {/* Order Header */}
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <h3 className="font-bold text-lg text-silver-800">
                                  Pedido #{order.id}
                                </h3>
                                <p className="text-silver-600 flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-silver-800">
                                  ${parseFloat(order.total).toLocaleString()}
                                </p>
                                <Badge
                                  className={
                                    order.status === 'delivered'
                                      ? 'bg-green-100 text-green-800'
                                      : order.status === 'shipped'
                                      ? 'bg-blue-100 text-blue-800'
                                      : order.status === 'paid'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-silver-100 text-silver-800'
                                  }
                                >
                                  {order.status === 'delivered'
                                    ? 'Entregado'
                                    : order.status === 'shipped'
                                    ? 'Enviado'
                                    : order.status === 'paid'
                                    ? 'Pagado'
                                    : 'Pendiente'}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Shipping Progress */}
                            <div className="mb-6 p-4 bg-silver-50 rounded-xl">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-silver-800 flex items-center gap-2">
                                  <Truck className="w-4 h-4" />
                                  Estado del envío
                                </h4>
                                <span className="text-sm text-silver-600">{getProgress(order.status)}% completado</span>
                              </div>
                              <Progress value={getProgress(order.status)} className="mb-4" />
                              <div className="flex justify-between">
                                {getStatusSteps(order.status).map((step, i) => (
                                  <div key={i} className={`text-center ${step.completed ? 'text-green-600' : 'text-silver-400'}`}>
                                    <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                                      step.completed ? 'bg-green-500' : 'bg-silver-300'
                                    }`} />
                                    <div className="text-xs font-medium">{step.label}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Order Items */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-silver-800">Productos</h4>
                              {order.items?.map((item: any) => (
                                <motion.div 
                                  key={item.id} 
                                  whileHover={{ scale: 1.01 }}
                                  className="flex items-center gap-4 p-3 border border-silver-200 rounded-xl hover:shadow-sm transition-all"
                                >
                                  <img
                                    src={item.product.images?.[0] || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"}
                                    alt={item.product.title}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <h5 className="font-medium text-silver-800">{item.product.title}</h5>
                                    <p className="text-sm text-silver-600">Cantidad: {item.quantity}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <MapPin className="w-3 h-3 text-silver-500" />
                                      <span className="text-xs text-silver-500">Taxco, Guerrero</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-silver-800">
                                      ${parseFloat(item.price).toLocaleString()}
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Wishlist */}
          <TabsContent value="wishlist" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {wishlist.length === 0 ? (
                <Card className="card-modern">
                  <CardContent className="text-center py-12">
                    <Heart className="w-16 h-16 text-silver-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-silver-800 mb-2">Tu lista de deseos está vacía</h3>
                    <p className="text-silver-600 mb-6">Guarda tus productos favoritos para no perderlos de vista</p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => window.location.href = "/products"}
                        className="gradient-gold text-white px-8 py-3"
                        data-testid="button-browse-products"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Explorar productos
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((item: any, index: number) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="card-elevated hover:shadow-xl transition-all duration-300"
                      data-testid={`wishlist-item-${item.productId}`}
                    >
                      <div className="relative">
                        <img
                          src={item.product.images?.[0] || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"}
                          alt={item.product.title}
                          className="w-full h-48 object-cover rounded-t-2xl blur-up"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute top-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                        >
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                        </motion.button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-silver-800 mb-2 line-clamp-2">
                          {item.product.title}
                        </h3>
                        <div className="flex items-center mb-3">
                          <div className="flex text-gold-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-3 h-3 ${star <= 4 ? "fill-current" : ""}`} />
                            ))}
                          </div>
                          <span className="text-xs text-silver-500 ml-1">(124)</span>
                        </div>
                        <p className="text-xl font-bold text-silver-800 mb-4">
                          ${parseFloat(item.product.price).toLocaleString()}
                        </p>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            onClick={() => window.location.href = `/products/${item.productId}`}
                            className="w-full gradient-gold text-white"
                            data-testid={`button-view-product-${item.productId}`}
                          >
                            Ver Producto
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {reviews.length === 0 ? (
                <Card className="card-modern">
                  <CardContent className="text-center py-12">
                    <Star className="w-16 h-16 text-silver-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-silver-800 mb-2">Aún no has escrito reseñas</h3>
                    <p className="text-silver-600 mb-2">
                      Comparte tu experiencia con otros compradores
                    </p>
                    <p className="text-sm text-silver-500">
                      Las reseñas aparecerán aquí después de comprar y calificar productos.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Reviews Summary */}
                  <Card className="card-modern">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gold-600">
                            {(reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                          </div>
                          <div className="flex items-center justify-center mt-1">
                            <div className="flex text-gold-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-4 h-4 fill-current" />
                              ))}
                            </div>
                          </div>
                          <div className="text-sm text-silver-600 mt-1">Promedio general</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-silver-800">{reviews.length}</div>
                          <div className="text-sm text-silver-600 mt-1">Total de reseñas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">95%</div>
                          <div className="text-sm text-silver-600 mt-1">Calificaciones positivas</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Individual Reviews */}
                  <div className="space-y-4">
                    {reviews.map((review: any, index: number) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        className="card-elevated p-6"
                        data-testid={`review-${review.id}`}
                      >
                        <div className="flex items-start gap-4">
                          <motion.img
                            whileHover={{ scale: 1.05 }}
                            src={review.product.images?.[0] || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
                            alt={review.product.title}
                            className="w-20 h-20 object-cover rounded-xl"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-silver-800 text-lg mb-1">
                                  {review.product.title}
                                </h4>
                                <div className="flex items-center gap-3">
                                  <div className="flex text-gold-400">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-4 h-4 ${star <= review.rating ? "fill-current" : ""}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-silver-600">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Badge className={`${
                                review.rating >= 4 ? 'bg-green-100 text-green-800' :
                                review.rating >= 3 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {review.rating >= 4 ? 'Excelente' :
                                 review.rating >= 3 ? 'Bueno' : 'Regular'}
                              </Badge>
                            </div>
                            {review.comment && (
                              <div className="bg-silver-50 rounded-lg p-4">
                                <p className="text-silver-700 leading-relaxed">
                                  “{review.comment}”
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
