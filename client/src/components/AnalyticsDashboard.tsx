import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Eye,
  MousePointer,
  CreditCard,
  Target,
  Zap,
  Star,
  ArrowRight
} from 'lucide-react';

interface AdvancedAnalytics {
  // Traffic and engagement
  traffic: {
    totalViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: number;
    topPages: Array<{ page: string; views: number; }>;
  };
  
  // Conversion funnel
  funnel: {
    visitors: number;
    signups: number;
    productViews: number;
    addToCart: number;
    checkouts: number;
    purchases: number;
  };
  
  // User cohort analysis
  cohorts: Array<{
    month: string;
    newUsers: number;
    retention: { 
      week1: number; 
      week4: number; 
      week12: number; 
    };
    ltv: number;
  }>;
  
  // Behavior patterns
  behavior: {
    topSearchTerms: Array<{ term: string; count: number; }>;
    popularProducts: Array<{ 
      id: number; 
      title: string; 
      views: number; 
      conversions: number; 
      conversionRate: number; 
    }>;
    userSegments: Array<{
      segment: string;
      count: number;
      avgOrderValue: number;
      frequency: number;
    }>;
  };
  
  // Revenue insights
  revenue: {
    daily: Array<{ date: string; revenue: number; orders: number; }>;
    byCategory: Array<{ category: string; revenue: number; }>;
    byLocation: Array<{ state: string; revenue: number; orders: number; }>;
  };
}

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5A3C'];

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch advanced analytics data
  const { data: analytics, isLoading } = useQuery<AdvancedAnalytics>({
    queryKey: ['/api/analytics/advanced', { dateRange }],
    queryFn: async () => {
      const params = new URLSearchParams({ range: dateRange });
      const response = await fetch(`/api/analytics/advanced?${params}`);
      return response.json();
    }
  });

  // Calculate conversion rates
  const conversionRates = useMemo(() => {
    if (!analytics?.funnel) return null;
    
    const { visitors, signups, productViews, addToCart, checkouts, purchases } = analytics.funnel;
    
    return {
      visitorToSignup: signups / visitors * 100,
      signupToView: productViews / signups * 100,
      viewToCart: addToCart / productViews * 100,
      cartToCheckout: checkouts / addToCart * 100,
      checkoutToPurchase: purchases / checkouts * 100,
      overallConversion: purchases / visitors * 100
    };
  }, [analytics]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="analytics-loading">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No se pudieron cargar los datos de analytics.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="analytics-dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Avanzado - Nivel 2
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Métricas avanzadas de comportamiento, cohorts y revenue intelligence
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Label>Período:</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32" data-testid="analytics-date-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 días</SelectItem>
                <SelectItem value="30d">30 días</SelectItem>
                <SelectItem value="90d">90 días</SelectItem>
                <SelectItem value="365d">1 año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Eye className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="funnel" data-testid="tab-funnel">
              <Target className="w-4 h-4 mr-2" />
              Funnel
            </TabsTrigger>
            <TabsTrigger value="cohorts" data-testid="tab-cohorts">
              <Users className="w-4 h-4 mr-2" />
              Cohorts
            </TabsTrigger>
            <TabsTrigger value="behavior" data-testid="tab-behavior">
              <MousePointer className="w-4 h-4 mr-2" />
              Comportamiento
            </TabsTrigger>
            <TabsTrigger value="revenue" data-testid="tab-revenue">
              <DollarSign className="w-4 h-4 mr-2" />
              Revenue
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Visitantes Únicos</p>
                      <p className="text-2xl font-bold text-primary" data-testid="metric-visitors">
                        {analytics.traffic.uniqueVisitors.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +15.2%
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Bounce Rate</p>
                      <p className="text-2xl font-bold text-primary" data-testid="metric-bounce">
                        {formatPercent(analytics.traffic.bounceRate)}
                      </p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        -3.1%
                      </p>
                    </div>
                    <Zap className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Conversión Global</p>
                      <p className="text-2xl font-bold text-primary" data-testid="metric-conversion">
                        {conversionRates ? formatPercent(conversionRates.overallConversion) : '0%'}
                      </p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +0.8%
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sesión Promedio</p>
                      <p className="text-2xl font-bold text-primary" data-testid="metric-session">
                        {Math.round(analytics.traffic.avgSessionDuration / 60)}m
                      </p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +12%
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Pages and Search Terms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Páginas Más Visitadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4" data-testid="top-pages">
                    {analytics.traffic.topPages.map((page, index) => (
                      <div key={page.page} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{index + 1}</Badge>
                          <span className="text-sm">{page.page}</span>
                        </div>
                        <span className="text-sm font-medium">{page.views.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Búsquedas Populares</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4" data-testid="top-searches">
                    {analytics.behavior.topSearchTerms.map((term, index) => (
                      <div key={term.term} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="text-sm">"{term.term}"</span>
                        </div>
                        <span className="text-sm font-medium">{term.count} búsquedas</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Funnel Tab */}
          <TabsContent value="funnel" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Embudo de Conversión</CardTitle>
                <CardDescription>
                  Análisis del journey completo de usuarios desde visita hasta compra
                </CardDescription>
              </CardHeader>
              <CardContent>
                {conversionRates && (
                  <div className="space-y-6">
                    {/* Funnel Visualization */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div>
                          <h4 className="font-medium">Visitantes</h4>
                          <p className="text-2xl font-bold text-blue-600">{analytics.funnel.visitors.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Base</p>
                          <p className="text-lg font-semibold">100%</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 mx-4">
                          <div className="text-xs text-center text-gray-600 mb-1">
                            {formatPercent(conversionRates.visitorToSignup)}
                          </div>
                          <Progress value={conversionRates.visitorToSignup} className="h-2" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div>
                          <h4 className="font-medium">Registros</h4>
                          <p className="text-2xl font-bold text-green-600">{analytics.funnel.signups.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Conversión</p>
                          <p className="text-lg font-semibold">{formatPercent(conversionRates.visitorToSignup)}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 mx-4">
                          <div className="text-xs text-center text-gray-600 mb-1">
                            {formatPercent(conversionRates.signupToView)}
                          </div>
                          <Progress value={conversionRates.signupToView} className="h-2" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div>
                          <h4 className="font-medium">Vistas de Producto</h4>
                          <p className="text-2xl font-bold text-purple-600">{analytics.funnel.productViews.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">del Signup</p>
                          <p className="text-lg font-semibold">{formatPercent(conversionRates.signupToView)}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 mx-4">
                          <div className="text-xs text-center text-gray-600 mb-1">
                            {formatPercent(conversionRates.viewToCart)}
                          </div>
                          <Progress value={conversionRates.viewToCart} className="h-2" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div>
                          <h4 className="font-medium">Agregados al Carrito</h4>
                          <p className="text-2xl font-bold text-yellow-600">{analytics.funnel.addToCart.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">de las Vistas</p>
                          <p className="text-lg font-semibold">{formatPercent(conversionRates.viewToCart)}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 mx-4">
                          <div className="text-xs text-center text-gray-600 mb-1">
                            {formatPercent(conversionRates.cartToCheckout)}
                          </div>
                          <Progress value={conversionRates.cartToCheckout} className="h-2" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <div>
                          <h4 className="font-medium">Checkouts Iniciados</h4>
                          <p className="text-2xl font-bold text-indigo-600">{analytics.funnel.checkouts.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">del Carrito</p>
                          <p className="text-lg font-semibold">{formatPercent(conversionRates.cartToCheckout)}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 mx-4">
                          <div className="text-xs text-center text-gray-600 mb-1">
                            {formatPercent(conversionRates.checkoutToPurchase)}
                          </div>
                          <Progress value={conversionRates.checkoutToPurchase} className="h-2" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border-2 border-emerald-200 dark:border-emerald-800">
                        <div>
                          <h4 className="font-medium">Compras Completadas</h4>
                          <p className="text-3xl font-bold text-emerald-600">{analytics.funnel.purchases.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">del Checkout</p>
                          <p className="text-xl font-bold text-emerald-600">{formatPercent(conversionRates.checkoutToPurchase)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cohorts Tab */}
          <TabsContent value="cohorts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Cohorts</CardTitle>
                <CardDescription>
                  Retención y LTV de usuarios por mes de registro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Cohort Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.cohorts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="newUsers" name="Nuevos Usuarios" fill="#8B5CF6" />
                        <Bar dataKey="ltv" name="LTV (MXN)" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Retention Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Mes</th>
                          <th className="text-right p-2">Nuevos Usuarios</th>
                          <th className="text-right p-2">Semana 1</th>
                          <th className="text-right p-2">Mes 1</th>
                          <th className="text-right p-2">Mes 3</th>
                          <th className="text-right p-2">LTV</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.cohorts.map((cohort) => (
                          <tr key={cohort.month} className="border-b">
                            <td className="p-2 font-medium">{cohort.month}</td>
                            <td className="p-2 text-right">{cohort.newUsers}</td>
                            <td className="p-2 text-right">{formatPercent(cohort.retention.week1)}</td>
                            <td className="p-2 text-right">{formatPercent(cohort.retention.week4)}</td>
                            <td className="p-2 text-right">{formatPercent(cohort.retention.week12)}</td>
                            <td className="p-2 text-right font-semibold text-green-600">
                              {formatCurrency(cohort.ltv)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Productos Populares</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4" data-testid="popular-products">
                    {analytics.behavior.popularProducts.map((product) => (
                      <div key={product.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{product.title}</h4>
                          <Badge variant="secondary">
                            {formatPercent(product.conversionRate)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>Vistas: {product.views}</div>
                          <div>Conversiones: {product.conversions}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* User Segments */}
              <Card>
                <CardHeader>
                  <CardTitle>Segmentos de Usuario</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4" data-testid="user-segments">
                    {analytics.behavior.userSegments.map((segment) => (
                      <div key={segment.segment} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{segment.segment}</h4>
                          <span className="text-sm">{segment.count} usuarios</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>AOV: {formatCurrency(segment.avgOrderValue)}</div>
                          <div>Frecuencia: {segment.frequency}x</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="space-y-6">
              {/* Revenue by Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Diario</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.revenue.daily}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#8B5CF6" 
                          fill="#8B5CF6" 
                          fillOpacity={0.3} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue by Category and Location */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.revenue.byCategory}
                            dataKey="revenue"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={(entry) => `${entry.category}: ${formatCurrency(entry.revenue)}`}
                          >
                            {analytics.revenue.byCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue por Estado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3" data-testid="revenue-by-state">
                      {analytics.revenue.byLocation.map((location) => (
                        <div key={location.state} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-medium">{location.state}</span>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(location.revenue)}</div>
                            <div className="text-xs text-gray-600">{location.orders} órdenes</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}