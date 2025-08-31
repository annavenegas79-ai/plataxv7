import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Eye, Trash2, TrendingUp, Package, DollarSign, Users, Star, CheckCircle, Clock, Award, Shield, Zap, Target, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/auth-store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, Category } from "@shared/schema";

const productSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
  price: z.string().min(1, "El precio es requerido"),
  originalPrice: z.string().optional(),
  categoryId: z.string().min(1, "La categoría es requerida"),
  stock: z.string().min(1, "El stock es requerido"),
  images: z.array(z.string()).min(1, "Debe agregar al menos una imagen"),
  specifications: z.record(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function SellerDashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // Mock seller performance data - in real app this would come from API
  const sellerMetrics = {
    totalSales: 125850,
    totalOrders: 342,
    rating: 4.8,
    responseTime: '2.1 horas',
    trustScore: 95,
    silverVerified: true,
    kycStatus: 'approved' as const,
    verificationLevel: 'Vendedor Certificado',
    monthlyGrowth: 18.5,
    satisfactionRate: 98.2,
    fastShipping: true,
    authenticityGuarantee: true
  };

  const { data: myProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { sellerId: user?.id }],
    enabled: !!user && user.role === 'vendedor',
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const createProductMutation = useMutation({
    mutationFn: (productData: any) => apiRequest("POST", "/api/products", productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "¡Producto creado!",
        description: "Tu producto se ha agregado correctamente.",
      });
      setIsAddingProduct(false);
      reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el producto.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "¡Producto actualizado!",
        description: "Los cambios se han guardado correctamente.",
      });
      setEditingProduct(null);
      reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId: number) => apiRequest("DELETE", `/api/products/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente.",
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

  const onSubmit = (data: ProductFormData) => {
    const productData = {
      ...data,
      price: parseFloat(data.price),
      originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : undefined,
      categoryId: parseInt(data.categoryId),
      stock: parseInt(data.stock),
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setValue("title", product.title);
    setValue("description", product.description);
    setValue("price", product.price.toString());
    setValue("originalPrice", product.originalPrice?.toString() || "");
    setValue("categoryId", product.categoryId.toString());
    setValue("stock", product.stock.toString());
    setValue("images", product.images || []);
    setValue("specifications", product.specifications || {});
  };

  const handleDelete = (productId: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  if (!user || user.role !== 'vendedor') {
    return (
      <div className="min-h-screen bg-silver-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <Package className="w-16 h-16 text-silver-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-silver-800 mb-2">Panel de Vendedor</h2>
          <p className="text-silver-600 mb-6">
            {!user 
              ? "Necesitas iniciar sesión con una cuenta de vendedor." 
              : "Tu cuenta no tiene permisos de vendedor."}
          </p>
          <Button
            onClick={() => window.location.href = user ? "/" : "/auth"}
            className="bg-gold-500 hover:bg-gold-600 text-white"
            data-testid="button-seller-access"
          >
            {user ? "Ir al inicio" : "Iniciar Sesión"}
          </Button>
        </div>
      </div>
    );
  }
  
  const getVerificationBadges = () => [
    { 
      icon: CheckCircle, 
      label: sellerMetrics.verificationLevel, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      verified: sellerMetrics.kycStatus === 'approved'
    },
    { 
      icon: Shield, 
      label: 'Verificación Plata', 
      color: 'text-silver-600', 
      bgColor: 'bg-silver-100',
      verified: sellerMetrics.silverVerified
    },
    { 
      icon: Zap, 
      label: 'Envío Rápido', 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      verified: sellerMetrics.fastShipping
    },
    { 
      icon: Award, 
      label: 'Autenticidad Garantizada', 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100',
      verified: sellerMetrics.authenticityGuarantee
    }
  ];

  // Mock stats for demo - in real app these would come from API
  const stats = {
    totalProducts: myProducts.length,
    totalSales: 0, // Would calculate from orders
    totalRevenue: 0, // Would calculate from orders
    totalViews: 0, // Would track product views
  };

  return (
    <div className="min-h-screen bg-silver-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Verification */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-silver-800" data-testid="text-seller-title">
                Panel de Vendedor
              </h1>
              <p className="text-silver-600">Gestiona tus productos y ventas</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gold-600">{sellerMetrics.trustScore}%</div>
                <div className="text-sm text-silver-600">Puntuación de Confianza</div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-white fill-current" />
              </div>
            </div>
          </div>
          
          {/* Verification Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            {getVerificationBadges().map((badge, index) => {
              const IconComponent = badge.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Badge className={`${badge.bgColor} ${badge.color} border-0 px-4 py-2 text-sm font-medium ${!badge.verified && 'opacity-50'}`}>
                    <IconComponent className="w-4 h-4 mr-2" />
                    {badge.label}
                    {badge.verified && <CheckCircle className="w-3 h-3 ml-2" />}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
        
        {/* Enhanced Performance Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-silver-800">${sellerMetrics.totalSales.toLocaleString()}</p>
                  <p className="text-silver-600">Ventas Totales</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{sellerMetrics.monthlyGrowth}% este mes</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-silver-800">{sellerMetrics.totalOrders}</p>
                  <p className="text-silver-600">Órdenes Completadas</p>
                  <div className="flex items-center mt-2">
                    <div className="flex text-gold-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-3 h-3 ${star <= sellerMetrics.rating ? "fill-current" : ""}`} />
                      ))}
                    </div>
                    <span className="text-sm text-silver-600 ml-1">{sellerMetrics.rating}</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-silver-800">{sellerMetrics.satisfactionRate}%</p>
                  <p className="text-silver-600">Satisfacción del Cliente</p>
                  <div className="mt-2">
                    <Progress value={sellerMetrics.satisfactionRate} className="h-2" />
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-silver-800">{sellerMetrics.responseTime}</p>
                  <p className="text-silver-600">Tiempo de Respuesta</p>
                  <div className="flex items-center mt-2">
                    <Clock className="w-4 h-4 text-orange-500 mr-1" />
                    <span className="text-sm text-orange-600">Respuesta rápida</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust Score Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Puntuación de Confianza del Vendedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Puntuación General</span>
                    <span className="text-3xl font-bold text-gold-600">{sellerMetrics.trustScore}%</span>
                  </div>
                  <Progress value={sellerMetrics.trustScore} className="h-3 mb-4" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-silver-600">Verificación:</span>
                      <span className="font-medium text-green-600">Completa</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-600">Calificación:</span>
                      <span className="font-medium">{sellerMetrics.rating}/5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-600">Respuesta:</span>
                      <span className="font-medium text-orange-600">Rápida</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-600">Envío:</span>
                      <span className="font-medium text-blue-600">Certificado</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-silver-800">Métricas de Rendimiento</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Órdenes completadas a tiempo</span>
                      <span className="font-medium">96%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Productos como se describe</span>
                      <span className="font-medium">99%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Comunicación efectiva</span>
                      <span className="font-medium">98%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Problemas resueltos</span>
                      <span className="font-medium">100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Product Management Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-silver-800">Gestión de Productos</h2>
            <p className="text-silver-600">Administra tu inventario y catálogo</p>
          </div>
          <Dialog open={isAddingProduct || !!editingProduct} onOpenChange={(open) => {
            if (!open) {
              setIsAddingProduct(false);
              setEditingProduct(null);
              reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setIsAddingProduct(true)}
                className="bg-gold-500 hover:bg-gold-600 text-white"
                data-testid="button-add-product"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título del producto *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    className={errors.title ? "border-red-500" : ""}
                    data-testid="input-product-title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    className={errors.description ? "border-red-500" : ""}
                    rows={4}
                    data-testid="input-product-description"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Precio *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register("price")}
                      className={errors.price ? "border-red-500" : ""}
                      data-testid="input-product-price"
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Precio original (opcional)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      {...register("originalPrice")}
                      data-testid="input-product-original-price"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoryId">Categoría *</Label>
                    <Select onValueChange={(value) => setValue("categoryId", value)}>
                      <SelectTrigger data-testid="select-product-category">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Anillos</SelectItem>
                        <SelectItem value="2">Collares</SelectItem>
                        <SelectItem value="3">Aretes</SelectItem>
                        <SelectItem value="4">Pulseras</SelectItem>
                        <SelectItem value="5">Relojes</SelectItem>
                        <SelectItem value="6">Accesorios</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.categoryId && (
                      <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      {...register("stock")}
                      className={errors.stock ? "border-red-500" : ""}
                      data-testid="input-product-stock"
                    />
                    {errors.stock && (
                      <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="images">URLs de imágenes (una por línea) *</Label>
                  <Textarea
                    id="images"
                    placeholder="https://ejemplo.com/imagen1.jpg&#10;https://ejemplo.com/imagen2.jpg"
                    onChange={(e) => {
                      const urls = e.target.value.split('\n').filter(url => url.trim());
                      setValue("images", urls);
                    }}
                    rows={3}
                    data-testid="input-product-images"
                  />
                  {errors.images && (
                    <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    className="bg-gold-500 hover:bg-gold-600 text-white"
                    data-testid="button-save-product"
                  >
                    {editingProduct ? "Actualizar" : "Crear"} Producto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProduct(null);
                      reset();
                    }}
                    data-testid="button-cancel-product"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-silver-600">Productos</p>
                  <p className="text-2xl font-bold text-silver-800" data-testid="text-total-products">
                    {stats.totalProducts}
                  </p>
                </div>
                <Package className="w-8 h-8 text-gold-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-silver-600">Ventas</p>
                  <p className="text-2xl font-bold text-silver-800" data-testid="text-total-sales">
                    {stats.totalSales}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-silver-600">Ingresos</p>
                  <p className="text-2xl font-bold text-silver-800" data-testid="text-total-revenue">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-gold-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-silver-600">Visualizaciones</p>
                  <p className="text-2xl font-bold text-silver-800" data-testid="text-total-views">
                    {stats.totalViews.toLocaleString()}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Mis Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-4 p-4 border border-silver-200 rounded-lg">
                    <div className="w-16 h-16 bg-silver-200 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-silver-200 rounded w-3/4" />
                      <div className="h-4 bg-silver-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : myProducts.length === 0 ? (
              <div className="text-center py-8" data-testid="products-empty">
                <Package className="w-12 h-12 text-silver-400 mx-auto mb-4" />
                <p className="text-silver-600 mb-4">Aún no tienes productos</p>
                <Button
                  onClick={() => setIsAddingProduct(true)}
                  className="bg-gold-500 hover:bg-gold-600 text-white"
                  data-testid="button-create-first-product"
                >
                  Crear tu primer producto
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 border border-silver-200 rounded-lg hover:shadow-sm transition-shadow"
                    data-testid={`product-${product.id}`}
                  >
                    <img
                      src={product.images?.[0] || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-silver-800" data-testid={`product-title-${product.id}`}>
                        {product.title}
                      </h3>
                      <p className="text-sm text-silver-600 line-clamp-1">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="font-bold text-silver-800">
                          ${parseFloat(product.price).toLocaleString()}
                        </span>
                        <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                          Stock: {product.stock}
                        </Badge>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/products/${product.id}`, '_blank')}
                        data-testid={`button-view-${product.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        data-testid={`button-edit-${product.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        data-testid={`button-delete-${product.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
