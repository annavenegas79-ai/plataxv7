import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle,
  Shield,
  Activity,
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Search,
  Filter,
  MessageSquare,
  FileText,
  Star,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { Vendor, BusinessMetric, FraudAlert } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  
  // Mock dispute data - in real app this would come from API
  const mockDisputes = [
    {
      id: 1,
      orderId: 'ORD-2024-001',
      buyerName: 'María González',
      sellerName: 'Joyería Azteca',
      amount: 2850,
      reason: 'Producto no coincide con descripción',
      status: 'pending',
      priority: 'high',
      createdAt: '2024-08-25T10:00:00Z',
      messages: 3
    },
    {
      id: 2,
      orderId: 'ORD-2024-002',
      buyerName: 'Carlos Rodríguez',
      sellerName: 'Plata Sterling MX',
      amount: 1250,
      reason: 'Producto llegó dañado',
      status: 'investigating',
      priority: 'medium',
      createdAt: '2024-08-24T15:30:00Z',
      messages: 1
    },
    {
      id: 3,
      orderId: 'ORD-2024-003',
      buyerName: 'Ana López',
      sellerName: 'Artesanías de Taxco',
      amount: 890,
      reason: 'No se recibió el producto',
      status: 'resolved',
      priority: 'low',
      createdAt: '2024-08-23T09:15:00Z',
      messages: 5
    }
  ];
  
  // CSV Export function
  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Exportación exitosa",
      description: `Archivo ${filename}.csv descargado correctamente.`
    });
  };
  
  // Fetch all vendors
  const { data: vendors, isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
    retry: false,
  });

  // Filter vendors based on search and status
  const filteredVendors = useMemo(() => {
    if (!vendors) return [];
    
    return vendors.filter(vendor => {
      const matchesSearch = vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vendor.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [vendors, searchTerm, statusFilter]);
  
  // Filter disputes
  const filteredDisputes = useMemo(() => {
    return mockDisputes.filter(dispute => {
      const matchesSearch = dispute.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dispute.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dispute.orderId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [mockDisputes, searchTerm, statusFilter]);

  // Fetch platform metrics
  const { data: platformMetrics, isLoading: metricsLoading } = useQuery<BusinessMetric[]>({
    queryKey: ["/api/platform/metrics", selectedPeriod],
    retry: false,
  });

  // Fetch fraud alerts
  const { data: fraudAlerts, isLoading: fraudLoading } = useQuery<FraudAlert[]>({
    queryKey: ["/api/fraud/alerts"],
    retry: false,
  });

  // Update vendor status mutation
  const updateVendorStatusMutation = useMutation({
    mutationFn: async ({ vendorId, status }: { vendorId: number; status: string }) => {
      await apiRequest("PUT", `/api/vendors/${vendorId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      toast({
        title: "Estado actualizado",
        description: "El estado del vendedor ha sido actualizado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del vendedor.",
        variant: "destructive",
      });
    },
  });

  // Update fraud alert mutation
  const updateFraudAlertMutation = useMutation({
    mutationFn: async ({ alertId, updates }: { alertId: number; updates: any }) => {
      await apiRequest("PUT", `/api/fraud/alerts/${alertId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fraud/alerts"] });
      toast({
        title: "Alerta actualizada",
        description: "La alerta de fraude ha sido actualizada exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la alerta de fraude.",
        variant: "destructive",
      });
    },
  });

  // Calculate platform stats
  const calculatePlatformStats = () => {
    if (!platformMetrics || platformMetrics.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalVendors: vendors?.length || 0,
        activeVendors: vendors?.filter(v => v.status === 'active').length || 0,
        pendingVendors: vendors?.filter(v => v.status === 'pending').length || 0,
        averageOrderValue: 0
      };
    }

    const totalRevenue = platformMetrics.reduce((sum, metric) => sum + (metric.revenue || 0), 0);
    const totalOrders = platformMetrics.reduce((sum, metric) => sum + (metric.orders || 0), 0);
    
    return {
      totalRevenue,
      totalOrders,
      totalVendors: vendors?.length || 0,
      activeVendors: vendors?.filter(v => v.status === 'active').length || 0,
      pendingVendors: vendors?.filter(v => v.status === 'pending').length || 0,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
  };

  const stats = calculatePlatformStats();

  // Chart data for platform metrics
  const chartData = platformMetrics?.slice(0, 12).reverse().map(metric => ({
    month: new Date(metric.periodStart).toLocaleDateString('es-MX', { month: 'short' }),
    revenue: (metric.revenue || 0) / 100,
    orders: metric.orders || 0
  })) || [];

  // Vendor status distribution
  const vendorStatusData = [
    { name: 'Activos', value: stats.activeVendors, color: '#00C49F' },
    { name: 'Pendientes', value: stats.pendingVendors, color: '#FFBB28' },
    { name: 'Suspendidos', value: vendors?.filter(v => v.status === 'suspended').length || 0, color: '#FF8042' }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-admin-dashboard-title">
              Panel de Administración
            </h1>
            <p className="text-muted-foreground" data-testid="text-platform-overview">
              Gestión de la plataforma PlataMX
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40" data-testid="select-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-platform-settings">
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="card-platform-revenue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-platform-revenue">
                ${(stats.totalRevenue / 100).toLocaleString('es-MX')}
              </div>
              <p className="text-xs text-muted-foreground">
                +15.2% desde el mes pasado
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-platform-orders">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Órdenes Totales</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-platform-orders">
                {stats.totalOrders.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +8.5% desde el mes pasado
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-vendors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-vendors">
                {stats.totalVendors}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.activeVendors} activos, {stats.pendingVendors} pendientes
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-fraud-alerts">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas de Fraude</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-fraud-alerts-count">
                {fraudAlerts?.filter(alert => alert.status === 'pending').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Pendientes de revisión
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl" data-testid="tabs-admin-dashboard">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Activity className="w-4 h-4 mr-2" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="vendors" data-testid="tab-vendors">
              <Users className="w-4 h-4 mr-2" />
              Vendedores
            </TabsTrigger>
            <TabsTrigger value="disputes" data-testid="tab-disputes">
              <MessageSquare className="w-4 h-4 mr-2" />
              Disputas
            </TabsTrigger>
            <TabsTrigger value="fraud" data-testid="tab-fraud">
              <Shield className="w-4 h-4 mr-2" />
              Fraude
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card data-testid="card-platform-revenue-chart">
                <CardHeader>
                  <CardTitle>Ingresos de la Plataforma</CardTitle>
                  <CardDescription>
                    Ingresos totales de los últimos 12 meses
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

              {/* Vendor Status Distribution */}
              <Card data-testid="card-vendor-status-chart">
                <CardHeader>
                  <CardTitle>Estado de Vendedores</CardTitle>
                  <CardDescription>
                    Distribución por estado de verificación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={vendorStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {vendorStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Vendors Tab */}
          <TabsContent value="vendors" className="space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Gestión de Vendedores
                    </CardTitle>
                    <CardDescription>
                      Administra el estado y verificación de vendedores
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToCSV(filteredVendors || [], 'vendedores')}
                      data-testid="button-export-vendors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </div>
                </div>
                
                {/* Search and Filter Controls */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar vendedores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-vendors"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40" data-testid="select-status-filter">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="suspended">Suspendidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendedor</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Verificación</TableHead>
                        <TableHead>Ventas</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorsLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Cargando vendedores...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredVendors?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-silver-500">
                            No se encontraron vendedores
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredVendors?.map((vendor, index) => (
                          <motion.tr
                            key={vendor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="group hover:bg-silver-50"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-silver-300 to-silver-500 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-bold text-white">
                                    {vendor.businessName?.[0] || 'V'}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-silver-800">{vendor.businessName}</p>
                                  <p className="text-sm text-silver-500">ID: {vendor.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-silver-600">{vendor.email}</TableCell>
                            <TableCell>
                              <Badge 
                                className={`
                                  ${vendor.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                                  ${vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                  ${vendor.status === 'suspended' ? 'bg-red-100 text-red-800' : ''}
                                `}
                              >
                                {vendor.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {vendor.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                {vendor.status === 'suspended' && <XCircle className="w-3 h-3 mr-1" />}
                                {vendor.status === 'active' ? 'Activo' : vendor.status === 'pending' ? 'Pendiente' : 'Suspendido'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {vendor.verifiedAt && <Badge className="bg-green-100 text-green-800 text-xs">KYC</Badge>}
                                {vendor.businessName && <Badge className="bg-silver-100 text-silver-800 text-xs">Verificado</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className="text-silver-600">${(vendor.totalSales || 0).toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" data-testid={`button-view-vendor-${vendor.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Select
                                  value={vendor.status || "pending"}
                                  onValueChange={(status) => updateVendorStatusMutation.mutate({ vendorId: vendor.id, status })}
                                >
                                  <SelectTrigger className="w-24 h-8" data-testid={`select-vendor-status-${vendor.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Activo</SelectItem>
                                    <SelectItem value="pending">Pendiente</SelectItem>
                                    <SelectItem value="suspended">Suspendido</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Disputes Tab */}
          <TabsContent value="disputes" className="space-y-6">
            <Card data-testid="card-disputes">
              <CardHeader>
                <CardTitle>Gestión de Disputas</CardTitle>
                <CardDescription>
                  Resolución de disputas entre compradores y vendedores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDisputes.map((dispute) => (
                    <div 
                      key={dispute.id} 
                      className="p-4 border rounded-lg"
                      data-testid={`dispute-${dispute.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              dispute.priority === 'high' ? 'destructive' :
                              dispute.priority === 'medium' ? 'secondary' : 'outline'
                            }
                            data-testid={`badge-dispute-priority-${dispute.id}`}
                          >
                            {dispute.priority}
                          </Badge>
                          <span className="font-medium">{dispute.orderId}</span>
                        </div>
                        <Badge 
                          variant={dispute.status === 'pending' ? 'secondary' : 'outline'}
                          data-testid={`badge-dispute-status-${dispute.id}`}
                        >
                          {dispute.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                        <div>
                          <span>Comprador:</span>
                          <span className="ml-1 font-medium">{dispute.buyerName}</span>
                        </div>
                        <div>
                          <span>Vendedor:</span>
                          <span className="ml-1 font-medium">{dispute.sellerName}</span>
                        </div>
                        <div>
                          <span>Monto:</span>
                          <span className="ml-1 font-medium">${dispute.amount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span>Mensajes:</span>
                          <span className="ml-1 font-medium">{dispute.messages}</span>
                        </div>
                      </div>
                      <p className="text-sm mb-3">{dispute.reason}</p>
                      {dispute.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedDispute(dispute)}
                            data-testid={`button-view-dispute-${dispute.id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalles
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Disputa resuelta",
                                description: "La disputa ha sido marcada como resuelta."
                              });
                            }}
                            data-testid={`button-resolve-dispute-${dispute.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolver
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fraud Detection Tab */}
          <TabsContent value="fraud" className="space-y-6">
            <Card data-testid="card-fraud-alerts">
              <CardHeader>
                <CardTitle>Alertas de Fraude</CardTitle>
                <CardDescription>
                  Monitoreo y gestión de alertas de seguridad
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fraudLoading ? (
                  <div className="flex justify-center p-6">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : fraudAlerts && fraudAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {fraudAlerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className="p-4 border rounded-lg"
                        data-testid={`fraud-alert-${alert.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                alert.severity === 'critical' ? 'destructive' :
                                alert.severity === 'high' ? 'destructive' :
                                alert.severity === 'medium' ? 'secondary' : 'outline'
                              }
                              data-testid={`badge-alert-severity-${alert.id}`}
                            >
                              {alert.severity}
                            </Badge>
                            <span className="font-medium">{alert.alertType}</span>
                          </div>
                          <Badge 
                            variant={alert.status === 'pending' ? 'secondary' : 'outline'}
                            data-testid={`badge-alert-status-${alert.id}`}
                          >
                            {alert.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                          <div>
                            <span>Tipo de objetivo:</span>
                            <span className="ml-1 font-medium">{alert.targetType}</span>
                          </div>
                          <div>
                            <span>Puntuación de riesgo:</span>
                            <span className="ml-1 font-medium" data-testid={`text-risk-score-${alert.id}`}>
                              {parseFloat(alert.riskScore).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span>Método de detección:</span>
                            <span className="ml-1 font-medium">{alert.detectionMethod}</span>
                          </div>
                          <div>
                            <span>Fecha:</span>
                            <span className="ml-1 font-medium">
                              {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString('es-MX') : 'N/A'}
                            </span>
                          </div>
                        </div>
                        {alert.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateFraudAlertMutation.mutate({ 
                                alertId: alert.id, 
                                updates: { status: 'investigating' }
                              })}
                              data-testid={`button-investigate-alert-${alert.id}`}
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              Investigar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateFraudAlertMutation.mutate({ 
                                alertId: alert.id, 
                                updates: { status: 'false_positive' }
                              })}
                              data-testid={`button-mark-false-positive-${alert.id}`}
                            >
                              Falso Positivo
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateFraudAlertMutation.mutate({ 
                                alertId: alert.id, 
                                updates: { status: 'resolved' }
                              })}
                              data-testid={`button-resolve-alert-${alert.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Resolver
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground" data-testid="text-no-fraud-alerts">
                      No hay alertas de fraude pendientes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}