import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Package, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  ShoppingCart,
  Clock,
  Activity,
  Filter,
  Download,
  Upload,
  BarChart3
} from "lucide-react";
import { Product, InventoryEvent } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface InventoryItem extends Product {
  stockLevel: 'critical' | 'low' | 'normal' | 'high';
  lastRestocked: Date;
  averageDailySales: number;
  daysOfStock: number;
  predictedStockOut: Date | null;
}

interface StockAlert {
  id: number;
  productId: number;
  productName: string;
  currentStock: number;
  minimumStock: number;
  severity: 'critical' | 'warning';
  daysRemaining: number;
}

export default function InventoryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [vendorId] = useState(1); // This would come from auth context

  // Fetch products (inventory items)
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: false,
  });

  // Fetch inventory events
  const { data: inventoryEvents, isLoading: eventsLoading } = useQuery<InventoryEvent[]>({
    queryKey: ["/api/vendors", vendorId, "inventory/events"],
    retry: false,
  });

  // Simulate inventory data with stock levels and predictions
  const enrichInventoryData = (products: Product[]): InventoryItem[] => {
    return products.map(product => {
      const currentStock = product.stock || 0;
      const averageDailySales = Math.floor(Math.random() * 5) + 1; // Simulated
      const daysOfStock = Math.floor(currentStock / averageDailySales);
      
      let stockLevel: 'critical' | 'low' | 'normal' | 'high';
      if (currentStock < 5) stockLevel = 'critical';
      else if (currentStock < 20) stockLevel = 'low';
      else if (currentStock < 50) stockLevel = 'normal';
      else stockLevel = 'high';

      return {
        ...product,
        stockLevel,
        lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        averageDailySales,
        daysOfStock,
        predictedStockOut: daysOfStock < 30 ? new Date(Date.now() + daysOfStock * 24 * 60 * 60 * 1000) : null
      };
    });
  };

  // Generate stock alerts
  const generateStockAlerts = (inventoryItems: InventoryItem[]): StockAlert[] => {
    return inventoryItems
      .filter(item => item.stockLevel === 'critical' || item.stockLevel === 'low')
      .map(item => ({
        id: item.id,
        productId: item.id,
        productName: item.title,
        currentStock: item.stock || 0,
        minimumStock: item.stockLevel === 'critical' ? 5 : 20,
        severity: item.stockLevel === 'critical' ? 'critical' as const : 'warning' as const,
        daysRemaining: item.daysOfStock
      }));
  };

  const inventoryItems = products ? enrichInventoryData(products) : [];
  const stockAlerts = generateStockAlerts(inventoryItems);

  // Calculate inventory statistics
  const inventoryStats = {
    totalProducts: inventoryItems.length,
    totalValue: inventoryItems.reduce((sum, item) => sum + (item.price * (item.stock || 0)), 0),
    criticalItems: inventoryItems.filter(item => item.stockLevel === 'critical').length,
    lowStockItems: inventoryItems.filter(item => item.stockLevel === 'low').length,
    averageStockDays: inventoryItems.reduce((sum, item) => sum + item.daysOfStock, 0) / inventoryItems.length || 0
  };

  // Mock data for charts
  const stockMovementData = [
    { date: '2024-01-01', inbound: 150, outbound: 120, net: 30 },
    { date: '2024-01-02', inbound: 80, outbound: 95, net: -15 },
    { date: '2024-01-03', inbound: 200, outbound: 110, net: 90 },
    { date: '2024-01-04', inbound: 60, outbound: 130, net: -70 },
    { date: '2024-01-05', inbound: 180, outbound: 105, net: 75 },
    { date: '2024-01-06', inbound: 90, outbound: 140, net: -50 },
    { date: '2024-01-07', inbound: 250, outbound: 125, net: 125 }
  ];

  const topSellingData = inventoryItems
    .sort((a, b) => b.averageDailySales - a.averageDailySales)
    .slice(0, 5)
    .map(item => ({
      name: item.title.slice(0, 20) + (item.title.length > 20 ? '...' : ''),
      sales: item.averageDailySales,
      stock: item.stock || 0
    }));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-inventory-title">
              Gestión de Inventario
            </h1>
            <p className="text-muted-foreground" data-testid="text-inventory-subtitle">
              Control avanzado de stock y predicciones
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" data-testid="button-export-inventory">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button data-testid="button-add-stock">
              <Upload className="w-4 h-4 mr-2" />
              Agregar Stock
            </Button>
          </div>
        </div>

        {/* Stock Alerts */}
        {stockAlerts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold" data-testid="text-stock-alerts-title">
              Alertas de Stock
            </h2>
            {stockAlerts.map((alert) => (
              <Alert 
                key={alert.id} 
                variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                data-testid={`alert-stock-${alert.id}`}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  {alert.severity === 'critical' ? 'Stock Crítico' : 'Stock Bajo'}
                </AlertTitle>
                <AlertDescription>
                  <strong>{alert.productName}</strong> - Solo quedan {alert.currentStock} unidades 
                  ({alert.daysRemaining} días de stock restante)
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card data-testid="card-total-products">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-products">
                {inventoryStats.totalProducts}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-inventory-value">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-inventory-value">
                ${(inventoryStats.totalValue / 100).toLocaleString('es-MX')}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-critical-items">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Crítico</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive" data-testid="text-critical-items">
                {inventoryStats.criticalItems}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-low-stock-items">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <TrendingDown className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning" data-testid="text-low-stock-items">
                {inventoryStats.lowStockItems}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-average-stock-days">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Días Stock Prom.</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-average-stock-days">
                {Math.round(inventoryStats.averageStockDays)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList data-testid="tabs-inventory">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              <Package className="w-4 h-4 mr-2" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="movements" data-testid="tab-movements">
              <Activity className="w-4 h-4 mr-2" />
              Movimientos
            </TabsTrigger>
            <TabsTrigger value="predictions" data-testid="tab-predictions">
              <TrendingUp className="w-4 h-4 mr-2" />
              Predicciones
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stock Movement Chart */}
              <Card data-testid="card-stock-movement-chart">
                <CardHeader>
                  <CardTitle>Movimientos de Stock</CardTitle>
                  <CardDescription>
                    Entradas y salidas de los últimos 7 días
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stockMovementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('es-MX')}
                      />
                      <Line type="monotone" dataKey="inbound" stroke="#10b981" strokeWidth={2} name="Entradas" />
                      <Line type="monotone" dataKey="outbound" stroke="#ef4444" strokeWidth={2} name="Salidas" />
                      <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} name="Neto" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Selling Products */}
              <Card data-testid="card-top-selling">
                <CardHeader>
                  <CardTitle>Productos Más Vendidos</CardTitle>
                  <CardDescription>
                    Basado en ventas diarias promedio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topSellingData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#8884d8" name="Ventas/día" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card data-testid="card-products-inventory">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Inventario de Productos</CardTitle>
                  <CardDescription>
                    Gestión detallada de cada producto
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="button-filter-products">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="flex justify-center p-6">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : inventoryItems.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Ventas/día</TableHead>
                        <TableHead>Días restantes</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryItems.slice(0, 10).map((item) => (
                        <TableRow key={item.id} data-testid={`product-row-${item.id}`}>
                          <TableCell className="font-medium">
                            {item.title}
                          </TableCell>
                          <TableCell data-testid={`text-stock-${item.id}`}>
                            {item.stock || 0}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                item.stockLevel === 'critical' ? 'destructive' :
                                item.stockLevel === 'low' ? 'destructive' :
                                item.stockLevel === 'normal' ? 'secondary' : 'default'
                              }
                              data-testid={`badge-stock-level-${item.id}`}
                            >
                              {item.stockLevel === 'critical' ? 'Crítico' :
                               item.stockLevel === 'low' ? 'Bajo' :
                               item.stockLevel === 'normal' ? 'Normal' : 'Alto'}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`text-daily-sales-${item.id}`}>
                            {item.averageDailySales}
                          </TableCell>
                          <TableCell data-testid={`text-days-stock-${item.id}`}>
                            {item.daysOfStock}
                          </TableCell>
                          <TableCell data-testid={`text-price-${item.id}`}>
                            ${(item.price / 100).toLocaleString('es-MX')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" data-testid={`button-restock-${item.id}`}>
                                <Package className="w-4 h-4 mr-1" />
                                Reabastecer
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-6" data-testid="text-no-products">
                    No hay productos en el inventario
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Movements Tab */}
          <TabsContent value="movements" className="space-y-6">
            <Card data-testid="card-inventory-movements">
              <CardHeader>
                <CardTitle>Historial de Movimientos</CardTitle>
                <CardDescription>
                  Registro de todas las transacciones de inventario
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="flex justify-center p-6">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : inventoryEvents && inventoryEvents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Razón</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryEvents.slice(0, 10).map((event) => (
                        <TableRow key={event.id} data-testid={`movement-row-${event.id}`}>
                          <TableCell data-testid={`text-event-date-${event.id}`}>
                            {new Date(event.createdAt).toLocaleDateString('es-MX')}
                          </TableCell>
                          <TableCell data-testid={`text-product-${event.id}`}>
                            Producto #{event.productId}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={event.eventType === 'inbound' ? 'default' : 'secondary'}
                              data-testid={`badge-event-type-${event.id}`}
                            >
                              {event.eventType === 'inbound' ? 'Entrada' : 'Salida'}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`text-quantity-${event.id}`}>
                            {event.quantityChange > 0 ? '+' : ''}{event.quantityChange}
                          </TableCell>
                          <TableCell data-testid={`text-reason-${event.id}`}>
                            {event.reason || 'Sin especificar'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-6" data-testid="text-no-movements">
                    No hay movimientos registrados
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <Card data-testid="card-stock-predictions">
              <CardHeader>
                <CardTitle>Predicciones de Stock</CardTitle>
                <CardDescription>
                  Análisis predictivo basado en patrones de venta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventoryItems
                    .filter(item => item.predictedStockOut)
                    .slice(0, 10)
                    .map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`prediction-item-${item.id}`}
                      >
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Stock actual: {item.stock} unidades
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-destructive" data-testid={`text-stockout-date-${item.id}`}>
                            Agotamiento estimado: {item.predictedStockOut?.toLocaleDateString('es-MX')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            En {item.daysOfStock} días
                          </p>
                        </div>
                      </div>
                    ))}
                  
                  {inventoryItems.filter(item => item.predictedStockOut).length === 0 && (
                    <div className="text-center py-6">
                      <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground" data-testid="text-no-predictions">
                        No hay productos en riesgo de agotamiento próximo
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}