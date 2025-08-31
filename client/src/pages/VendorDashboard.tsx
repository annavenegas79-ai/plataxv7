import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle,
  Package,
  BarChart3,
  Settings,
  MessageSquare,
  Eye
} from "lucide-react";
import { Vendor, BusinessMetric, Commission, MarketingCampaign } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface VendorStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  newCustomers: number;
  returningCustomers: number;
}

export default function VendorDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  // Fetch vendor profile
  const { data: vendor, isLoading: vendorLoading } = useQuery<Vendor | null>({
    queryKey: ["/api/vendors/me"],
    retry: false,
  });

  // Fetch vendor metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<BusinessMetric[]>({
    queryKey: ["/api/vendors", vendor?.id, "metrics", selectedPeriod],
    enabled: !!vendor?.id,
    retry: false,
  });

  // Fetch commissions
  const { data: commissions, isLoading: commissionsLoading } = useQuery<Commission[]>({
    queryKey: ["/api/vendors", vendor?.id, "commissions"],
    enabled: !!vendor?.id,
    retry: false,
  });

  // Fetch marketing campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery<MarketingCampaign[]>({
    queryKey: ["/api/vendors", vendor?.id, "campaigns"],
    enabled: !!vendor?.id,
    retry: false,
  });

  // Calculate stats from metrics
  const calculateStats = (metrics: BusinessMetric[]): VendorStats => {
    const latest = metrics[0];
    if (!latest) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        newCustomers: 0,
        returningCustomers: 0
      };
    }

    return {
      totalRevenue: latest.revenue || 0,
      totalOrders: latest.orders || 0,
      averageOrderValue: latest.average_order_value || 0,
      conversionRate: parseFloat(latest.conversion_rate || "0"),
      newCustomers: latest.new_customers || 0,
      returningCustomers: latest.returning_customers || 0
    };
  };

  const stats = metrics ? calculateStats(metrics) : null;

  // Chart data for revenue trend
  const chartData = metrics?.slice(0, 12).reverse().map(metric => ({
    month: new Date(metric.periodStart).toLocaleDateString('es-MX', { month: 'short' }),
    revenue: (metric.revenue || 0) / 100, // Convert cents to pesos
    orders: metric.orders || 0
  })) || [];

  if (vendorLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Crear Perfil de Vendedor</CardTitle>
            <CardDescription>
              Para acceder al dashboard de vendedor, necesitas crear tu perfil empresarial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button data-testid="button-create-vendor-profile">
              Crear Perfil de Vendedor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-vendor-dashboard-title">
              Dashboard de Vendedor
            </h1>
            <p className="text-muted-foreground" data-testid="text-vendor-business-name">
              {vendor.businessName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              variant={vendor.status === 'active' ? 'default' : 'secondary'}
              data-testid="badge-vendor-status"
            >
              {vendor.status === 'active' ? 'Activo' : 'Pendiente'}
            </Badge>
            <Button variant="outline" data-testid="button-vendor-settings">
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="card-revenue-stats">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-revenue">
                  ${(stats.totalRevenue / 100).toLocaleString('es-MX')}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20.1% desde el mes pasado
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-orders-stats">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Órdenes</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-orders">
                  {stats.totalOrders}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% desde el mes pasado
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-aov-stats">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-average-order-value">
                  ${(stats.averageOrderValue / 100).toLocaleString('es-MX')}
                </div>
                <p className="text-xs text-muted-foreground">
                  +5.2% desde el mes pasado
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-conversion-stats">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversión</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-conversion-rate">
                  {stats.conversionRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  +0.8% desde el mes pasado
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList data-testid="tabs-vendor-dashboard">
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="commissions" data-testid="tab-commissions">
              <DollarSign className="w-4 h-4 mr-2" />
              Comisiones
            </TabsTrigger>
            <TabsTrigger value="campaigns" data-testid="tab-campaigns">
              <MessageSquare className="w-4 h-4 mr-2" />
              Marketing
            </TabsTrigger>
            <TabsTrigger value="inventory" data-testid="tab-inventory">
              <Package className="w-4 h-4 mr-2" />
              Inventario
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card data-testid="card-revenue-chart">
                <CardHeader>
                  <CardTitle>Tendencia de Ingresos</CardTitle>
                  <CardDescription>
                    Ingresos de los últimos 12 meses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${value.toLocaleString('es-MX')}`, 'Ingresos']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Orders Chart */}
              <Card data-testid="card-orders-chart">
                <CardHeader>
                  <CardTitle>Órdenes por Mes</CardTitle>
                  <CardDescription>
                    Número de órdenes recibidas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card data-testid="card-performance-metrics">
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
                <CardDescription>
                  Indicadores clave de tu negocio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Rating Promedio</span>
                      <span data-testid="text-average-rating">
                        {parseFloat(vendor.averageRating?.toString() || "0").toFixed(1)}/5.0
                      </span>
                    </div>
                    <Progress 
                      value={parseFloat(vendor.averageRating?.toString() || "0") * 20} 
                      className="h-2"
                      data-testid="progress-rating"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tiempo de Respuesta</span>
                      <span data-testid="text-response-time">
                        {vendor.responseTime}h
                      </span>
                    </div>
                    <Progress 
                      value={Math.max(0, 100 - (vendor.responseTime || 24) * 4)} 
                      className="h-2"
                      data-testid="progress-response-time"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Nivel de Verificación</span>
                      <span data-testid="text-verification-level">
                        {vendor.verificationLevel === 'premium' ? 'Premium' : 
                         vendor.verificationLevel === 'verified' ? 'Verificado' : 'Básico'}
                      </span>
                    </div>
                    <Progress 
                      value={vendor.verificationLevel === 'premium' ? 100 : 
                             vendor.verificationLevel === 'verified' ? 66 : 33} 
                      className="h-2"
                      data-testid="progress-verification"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="space-y-6">
            <Card data-testid="card-commissions-overview">
              <CardHeader>
                <CardTitle>Comisiones</CardTitle>
                <CardDescription>
                  Historial de comisiones y pagos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {commissionsLoading ? (
                  <div className="flex justify-center p-6">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : commissions && commissions.length > 0 ? (
                  <div className="space-y-4">
                    {commissions.map((commission) => (
                      <div 
                        key={commission.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`commission-item-${commission.id}`}
                      >
                        <div>
                          <p className="font-medium">
                            Orden #{commission.orderId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(commission.createdAt).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${(commission.vendorPayout / 100).toLocaleString('es-MX')}
                          </p>
                          <Badge 
                            variant={commission.status === 'paid' ? 'default' : 'secondary'}
                            data-testid={`badge-commission-status-${commission.id}`}
                          >
                            {commission.status === 'paid' ? 'Pagado' : 'Pendiente'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-6" data-testid="text-no-commissions">
                    No hay comisiones registradas
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketing Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card data-testid="card-marketing-campaigns">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Campañas de Marketing</CardTitle>
                  <CardDescription>
                    Gestiona tus campañas de marketing automatizadas
                  </CardDescription>
                </div>
                <Button data-testid="button-create-campaign">
                  Crear Campaña
                </Button>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="flex justify-center p-6">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : campaigns && campaigns.length > 0 ? (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div 
                        key={campaign.id} 
                        className="p-4 border rounded-lg"
                        data-testid={`campaign-item-${campaign.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{campaign.name}</h3>
                          <Badge 
                            variant={campaign.status === 'active' ? 'default' : 'secondary'}
                            data-testid={`badge-campaign-status-${campaign.id}`}
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Enviados:</span>
                            <span className="ml-1 font-medium" data-testid={`text-campaign-sent-${campaign.id}`}>
                              {campaign.sent}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Abiertos:</span>
                            <span className="ml-1 font-medium" data-testid={`text-campaign-opened-${campaign.id}`}>
                              {campaign.opened}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Clicks:</span>
                            <span className="ml-1 font-medium" data-testid={`text-campaign-clicked-${campaign.id}`}>
                              {campaign.clicked}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Conversiones:</span>
                            <span className="ml-1 font-medium" data-testid={`text-campaign-converted-${campaign.id}`}>
                              {campaign.converted}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground" data-testid="text-no-campaigns">
                      No tienes campañas activas
                    </p>
                    <Button className="mt-4" data-testid="button-create-first-campaign">
                      Crear Primera Campaña
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card data-testid="card-inventory-overview">
              <CardHeader>
                <CardTitle>Gestión de Inventario</CardTitle>
                <CardDescription>
                  Monitorea y gestiona tu inventario en tiempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground" data-testid="text-inventory-coming-soon">
                    Gestión avanzada de inventario - Próximamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}