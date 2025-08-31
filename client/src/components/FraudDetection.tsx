import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Brain,
  TrendingUp,
  Users,
  CreditCard,
  MapPin,
  Phone
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface FraudAlert {
  id: number;
  userId: number;
  orderId?: number;
  riskScore: number; // 0-100
  riskFactors: string[];
  status: 'pending' | 'approved' | 'flagged' | 'blocked';
  user: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  };
  order?: {
    id: number;
    totalCents: number;
    createdAt: string;
  };
  createdAt: string;
  reviewedAt?: string;
}

interface FraudMetrics {
  totalAlerts: number;
  pendingReview: number;
  blocked: number;
  falsePositiveRate: number;
  averageRiskScore: number;
  riskFactorDistribution: Array<{
    factor: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  trendData: Array<{
    date: string;
    alerts: number;
    blocked: number;
    averageRisk: number;
  }>;
}

const RISK_FACTOR_DESCRIPTIONS = {
  'high_velocity_orders': 'Múltiples órdenes en poco tiempo',
  'suspicious_email': 'Email con patrón sospechoso',
  'proxy_ip': 'Uso de proxy o VPN',
  'new_account': 'Cuenta recién creada',
  'unusual_location': 'Ubicación inusual para el usuario',
  'failed_payments': 'Múltiples pagos fallidos',
  'bulk_orders': 'Órdenes en cantidades inusuales',
  'price_inconsistency': 'Precio inusualmente alto o bajo',
  'duplicate_address': 'Dirección duplicada con otra cuenta',
  'device_fingerprint': 'Dispositivo asociado con actividad sospechosa'
};

export function FraudDetection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('alerts');

  // Fetch fraud alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery<FraudAlert[]>({
    queryKey: ['/api/admin/fraud/alerts'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch fraud metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<FraudMetrics>({
    queryKey: ['/api/admin/fraud/metrics']
  });

  // Update fraud status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ alertId, status }: { alertId: number; status: string }) => {
      return apiRequest('PUT', `/api/admin/fraud/${alertId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/fraud/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/fraud/metrics'] });
      toast({
        title: "Estado actualizado",
        description: "El estado de la alerta de fraude se actualizó correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  });

  // Calculate risk level and color
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'Crítico', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
    if (score >= 60) return { level: 'Alto', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
    if (score >= 40) return { level: 'Medio', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    return { level: 'Bajo', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'flagged':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'blocked':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Format currency
  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8" data-testid="fraud-detection">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Prevención de Fraude con ML
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Detección inteligente de patrones sospechosos y actividad fraudulenta
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Overview */}
        {!metricsLoading && metrics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Alertas</p>
                    <p className="text-2xl font-bold text-primary" data-testid="total-alerts">
                      {metrics.totalAlerts}
                    </p>
                  </div>
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600" data-testid="pending-alerts">
                      {metrics.pendingReview}
                    </p>
                  </div>
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bloqueados</p>
                    <p className="text-2xl font-bold text-red-600" data-testid="blocked-alerts">
                      {metrics.blocked}
                    </p>
                  </div>
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Riesgo Promedio</p>
                    <p className="text-2xl font-bold text-primary" data-testid="average-risk">
                      {Math.round(metrics.averageRiskScore)}%
                    </p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Falsos Positivos</p>
                    <p className="text-2xl font-bold text-green-600" data-testid="false-positive-rate">
                      {(metrics.falsePositiveRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts" data-testid="tab-alerts">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alertas Activas ({alerts.filter(a => a.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <Eye className="w-4 h-4 mr-2" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <Brain className="w-4 h-4 mr-2" />
              Analytics ML
            </TabsTrigger>
          </TabsList>

          {/* Active Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {alertsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4" data-testid="fraud-alerts">
                {alerts.filter(alert => alert.status === 'pending').map((alert) => {
                  const riskInfo = getRiskLevel(alert.riskScore);
                  
                  return (
                    <Card key={alert.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold">
                              {alert.user.firstName[0]}{alert.user.lastName[0]}
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {alert.user.firstName} {alert.user.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">@{alert.user.username} • {alert.user.email}</p>
                              <p className="text-xs text-gray-500">
                                Usuario desde: {new Date(alert.user.createdAt).toLocaleDateString('es-MX')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Badge className={riskInfo.color}>
                              Riesgo {riskInfo.level}: {alert.riskScore}%
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(alert.status)}
                              <span className="text-sm capitalize">{alert.status}</span>
                            </div>
                          </div>
                        </div>

                        {/* Risk Score Visualization */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Score de Riesgo</span>
                            <span className="text-sm font-bold">{alert.riskScore}/100</span>
                          </div>
                          <Progress 
                            value={alert.riskScore} 
                            className={`h-2 ${alert.riskScore >= 80 ? 'bg-red-200' : alert.riskScore >= 60 ? 'bg-orange-200' : 'bg-yellow-200'}`}
                          />
                        </div>

                        {/* Order Info */}
                        {alert.order && (
                          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-sm mb-2">Orden Asociada</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Orden ID: #{alert.order.id}</div>
                              <div>Valor: {formatCurrency(alert.order.totalCents)}</div>
                              <div>Fecha: {new Date(alert.order.createdAt).toLocaleDateString('es-MX')}</div>
                            </div>
                          </div>
                        )}

                        {/* Risk Factors */}
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-2">Factores de Riesgo Detectados</h4>
                          <div className="flex flex-wrap gap-2">
                            {alert.riskFactors.map((factor, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {RISK_FACTOR_DESCRIPTIONS[factor as keyof typeof RISK_FACTOR_DESCRIPTIONS] || factor}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ alertId: alert.id, status: 'approved' })}
                            disabled={updateStatusMutation.isPending}
                            data-testid={`approve-alert-${alert.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ alertId: alert.id, status: 'flagged' })}
                            disabled={updateStatusMutation.isPending}
                            data-testid={`flag-alert-${alert.id}`}
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Marcar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatusMutation.mutate({ alertId: alert.id, status: 'blocked' })}
                            disabled={updateStatusMutation.isPending}
                            data-testid={`block-alert-${alert.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Bloquear
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {alerts.filter(alert => alert.status === 'pending').length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No hay alertas pendientes
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        El sistema de ML no ha detectado actividad sospechosa reciente.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Alertas</CardTitle>
                <CardDescription>
                  Todas las alertas de fraude procesadas y su resolución
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="fraud-history">
                  {alerts.filter(alert => alert.status !== 'pending').map((alert) => {
                    const riskInfo = getRiskLevel(alert.riskScore);
                    
                    return (
                      <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-bold">
                            {alert.user.firstName[0]}
                          </div>
                          <div>
                            <p className="font-medium">{alert.user.firstName} {alert.user.lastName}</p>
                            <p className="text-sm text-gray-600">
                              Score: {alert.riskScore}% • {new Date(alert.createdAt).toLocaleDateString('es-MX')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={riskInfo.color}>{riskInfo.level}</Badge>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(alert.status)}
                            <span className="text-sm capitalize">{alert.status}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {alerts.filter(alert => alert.status !== 'pending').length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No hay historial de alertas disponible.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {metrics && (
              <div className="space-y-6">
                {/* Risk Factor Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Factores de Riesgo</CardTitle>
                    <CardDescription>
                      Análisis de los patrones más comunes detectados por el sistema ML
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4" data-testid="risk-factors">
                      {metrics.riskFactorDistribution.map((factor) => (
                        <div key={factor.factor} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              factor.severity === 'high' ? 'bg-red-500' : 
                              factor.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>
                            <div>
                              <p className="font-medium">
                                {RISK_FACTOR_DESCRIPTIONS[factor.factor as keyof typeof RISK_FACTOR_DESCRIPTIONS] || factor.factor}
                              </p>
                              <p className="text-sm text-gray-600 capitalize">Severidad: {factor.severity}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{factor.count} detecciones</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* ML Model Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento del Modelo ML</CardTitle>
                    <CardDescription>
                      Métricas de precisión y efectividad del sistema de detección
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {((1 - metrics.falsePositiveRate) * 100).toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600">Precisión del Modelo</p>
                        <p className="text-xs text-gray-500">Alertas correctas vs falsas</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {Math.round(metrics.averageRiskScore)}%
                        </div>
                        <p className="text-sm text-gray-600">Score de Riesgo Medio</p>
                        <p className="text-xs text-gray-500">Promedio de todas las alertas</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {metrics.totalAlerts}
                        </div>
                        <p className="text-sm text-gray-600">Alertas Procesadas</p>
                        <p className="text-xs text-gray-500">Total desde el último mes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Sistema ML Activo:</strong> El modelo de detección de fraude está procesando 
                    transacciones en tiempo real usando más de 20 características de comportamiento. 
                    Última actualización del modelo: hace 2 horas.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}