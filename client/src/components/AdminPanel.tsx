import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserCheck,
  MessageSquare,
  Package
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AdminKPIs {
  gmv: {
    totalCents: number;
    totalMXN: number;
    orderCount: number;
    avgOrderValue: number;
  };
  conversion: {
    visitorsToSignup: number;
    signupToFirstPurchase: number;
    repeatPurchaseRate: number;
  };
  kyc: {
    pending: number;
    approved: number;
    rejected: number;
    totalVendors: number;
  };
  topProducts: Array<{
    id: number;
    title: string;
    price: string;
    totalSales: number;
    revenue: number;
  }>;
}

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'cliente' | 'vendedor' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

interface KYCRequest {
  id: number;
  userId: number;
  user: User;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  documents: {
    identification: boolean;
    proofOfAddress: boolean;
    businessLicense: boolean;
    bankStatement: boolean;
  };
}

interface Dispute {
  id: number;
  orderId: number;
  reason: string;
  status: 'open' | 'resolved' | 'escalated';
  openedById: number;
  createdAt: string;
}

export function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('7d');

  // Fetch KPIs
  const { data: kpis, isLoading: kpisLoading } = useQuery<AdminKPIs>({
    queryKey: ['/api/admin/kpis', { dateRange }],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Calculate date range
      const now = new Date();
      let dateFrom: Date;
      switch (dateRange) {
        case '1d':
          dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      
      params.set('dateFrom', dateFrom.toISOString());
      params.set('dateTo', now.toISOString());

      const response = await fetch(`/api/admin/kpis?${params}`);
      return response.json();
    }
  });

  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users']
  });

  // Fetch KYC requests
  const { data: kycRequests = [] } = useQuery<KYCRequest[]>({
    queryKey: ['/api/admin/kyc/requests']
  });

  // Fetch disputes
  const { data: disputes = [] } = useQuery<Dispute[]>({
    queryKey: ['/api/disputes']
  });

  // KYC approval/rejection mutation
  const updateKYCMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: 'approved' | 'rejected' }) => {
      return apiRequest('PUT', `/api/admin/kyc/${userId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kpis'] });
      toast({
        title: "Estado actualizado",
        description: "El estado KYC se ha actualizado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado KYC",
        variant: "destructive",
      });
    }
  });

  // Dispute status update mutation
  const updateDisputeMutation = useMutation({
    mutationFn: async ({ disputeId, status }: { disputeId: number; status: string }) => {
      return apiRequest('PUT', `/api/disputes/${disputeId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/disputes'] });
      toast({
        title: "Disputa actualizada",
        description: "El estado de la disputa se ha actualizado",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la disputa",
        variant: "destructive",
      });
    }
  });

  const formatCurrency = (cents: number): string => {
    return (cents / 100).toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN'
    });
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="container mx-auto px-4 py-8" data-testid="admin-panel">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Panel Administrativo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona el marketplace PlataMX y supervisa métricas clave
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Label>Período:</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32" data-testid="date-range-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Último día</SelectItem>
                <SelectItem value="7d">7 días</SelectItem>
                <SelectItem value="30d">30 días</SelectItem>
                <SelectItem value="90d">90 días</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="w-4 h-4 mr-2" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="kyc" data-testid="tab-kyc">
              <Shield className="w-4 h-4 mr-2" />
              KYC ({kycRequests.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="disputes" data-testid="tab-disputes">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Disputas ({disputes.filter(d => d.status === 'open').length})
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              <Package className="w-4 h-4 mr-2" />
              Productos
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {kpisLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : kpis ? (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">GMV Total</p>
                          <p className="text-2xl font-bold text-primary" data-testid="kpi-gmv">
                            {formatCurrency(kpis.gmv.totalCents)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {kpis.gmv.orderCount} órdenes
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Ticket Promedio</p>
                          <p className="text-2xl font-bold text-primary" data-testid="kpi-aov">
                            {formatCurrency(kpis.gmv.avgOrderValue * 100)}
                          </p>
                          <p className="text-xs text-green-600 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +12.5%
                          </p>
                        </div>
                        <ShoppingBag className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Conversión</p>
                          <p className="text-2xl font-bold text-primary" data-testid="kpi-conversion">
                            {formatPercentage(kpis.conversion.visitorsToSignup)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Visitante → Registro
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Vendedores KYC</p>
                          <p className="text-2xl font-bold text-primary" data-testid="kpi-kyc-approved">
                            {kpis.kyc.approved}
                          </p>
                          <p className="text-xs text-gray-500">
                            de {kpis.kyc.totalVendors} vendedores
                          </p>
                        </div>
                        <Shield className="w-8 h-8 text-indigo-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Products */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Productos Más Vendidos</CardTitle>
                      <CardDescription>
                        Los 5 productos con más ventas en el período seleccionado
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3" data-testid="top-products">
                        {kpis.topProducts.map((product, index) => (
                          <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary">{index + 1}</Badge>
                              <div>
                                <p className="font-medium text-sm">{product.title}</p>
                                <p className="text-xs text-gray-600">
                                  {product.totalSales} ventas
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">
                                {formatCurrency(product.revenue * 100)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Conversion Funnel */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Embudo de Conversión</CardTitle>
                      <CardDescription>
                        Métricas de conversión del marketplace
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Visitantes → Registro</span>
                          <span className="font-semibold text-primary">
                            {formatPercentage(kpis.conversion.visitorsToSignup)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Registro → Primera Compra</span>
                          <span className="font-semibold text-primary">
                            {formatPercentage(kpis.conversion.signupToFirstPurchase)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Tasa de Recompra</span>
                          <span className="font-semibold text-primary">
                            {formatPercentage(kpis.conversion.repeatPurchaseRate)}
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h4 className="font-medium">Estado KYC Vendedores</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{kpis.kyc.approved}</p>
                            <p className="text-xs text-green-700 dark:text-green-300">Aprobados</p>
                          </div>
                          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-600">{kpis.kyc.pending}</p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">Pendientes</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : null}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                  Administra todos los usuarios del marketplace ({users.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="users-list">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-silver-400 to-silver-600 flex items-center justify-center text-white text-sm font-bold">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-600">@{user.username} • {user.email}</p>
                          <p className="text-xs text-gray-500">
                            Creado: {new Date(user.createdAt).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'vendedor' ? 'secondary' : 'outline'}>
                          {user.role === 'admin' ? 'Admin' : user.role === 'vendedor' ? 'Vendedor' : 'Cliente'}
                        </Badge>
                        {user.isVerified && (
                          <Badge variant="default">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verificado
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" data-testid={`view-user-${user.id}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KYC Tab */}
          <TabsContent value="kyc">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes de Verificación KYC</CardTitle>
                <CardDescription>
                  Revisa y aprueba solicitudes de verificación de vendedores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="kyc-requests">
                  {kycRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                            {request.user.firstName[0]}{request.user.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium">{request.user.firstName} {request.user.lastName}</p>
                            <p className="text-sm text-gray-600">@{request.user.username}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {request.status === 'approved' ? (
                              <><CheckCircle className="w-3 h-3 mr-1" />Aprobado</>
                            ) : request.status === 'pending' ? (
                              <><Clock className="w-3 h-3 mr-1" />Pendiente</>
                            ) : (
                              <><XCircle className="w-3 h-3 mr-1" />Rechazado</>
                            )}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`w-4 h-4 ${request.documents.identification ? 'text-green-600' : 'text-gray-400'}`} />
                          <span className="text-sm">Identificación</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`w-4 h-4 ${request.documents.proofOfAddress ? 'text-green-600' : 'text-gray-400'}`} />
                          <span className="text-sm">Comp. Domicilio</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`w-4 h-4 ${request.documents.businessLicense ? 'text-green-600' : 'text-gray-400'}`} />
                          <span className="text-sm">Licencia</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`w-4 h-4 ${request.documents.bankStatement ? 'text-green-600' : 'text-gray-400'}`} />
                          <span className="text-sm">Estado Cuenta</span>
                        </div>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => updateKYCMutation.mutate({ userId: request.userId, status: 'approved' })}
                            disabled={updateKYCMutation.isPending}
                            data-testid={`approve-kyc-${request.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprobar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => updateKYCMutation.mutate({ userId: request.userId, status: 'rejected' })}
                            disabled={updateKYCMutation.isPending}
                            data-testid={`reject-kyc-${request.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {kycRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No hay solicitudes de KYC pendientes.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disputes Tab */}
          <TabsContent value="disputes">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Disputas</CardTitle>
                <CardDescription>
                  Maneja disputas y conflictos entre compradores y vendedores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="disputes-list">
                  {disputes.map((dispute) => (
                    <div key={dispute.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">Disputa #{dispute.id}</p>
                          <p className="text-sm text-gray-600">Orden #{dispute.orderId}</p>
                        </div>
                        <Badge variant={
                          dispute.status === 'resolved' ? 'default' : 
                          dispute.status === 'escalated' ? 'destructive' : 'secondary'
                        }>
                          {dispute.status === 'resolved' ? 'Resuelta' : 
                           dispute.status === 'escalated' ? 'Escalada' : 'Abierta'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        <strong>Razón:</strong> {dispute.reason}
                      </p>
                      
                      <p className="text-xs text-gray-500 mb-3">
                        Creada: {new Date(dispute.createdAt).toLocaleDateString('es-MX')}
                      </p>

                      {dispute.status === 'open' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm"
                            onClick={() => updateDisputeMutation.mutate({ disputeId: dispute.id, status: 'resolved' })}
                            disabled={updateDisputeMutation.isPending}
                            data-testid={`resolve-dispute-${dispute.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marcar Resuelta
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateDisputeMutation.mutate({ disputeId: dispute.id, status: 'escalated' })}
                            disabled={updateDisputeMutation.isPending}
                            data-testid={`escalate-dispute-${dispute.id}`}
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Escalar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {disputes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No hay disputas activas.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Productos</CardTitle>
                <CardDescription>
                  Supervisa y modera productos en el marketplace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Panel de productos en desarrollo...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}