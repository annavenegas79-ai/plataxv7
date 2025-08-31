import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  Crown, 
  Gem, 
  Award, 
  Gift, 
  CreditCard, 
  TrendingUp,
  Clock,
  ShoppingBag,
  Heart,
  Zap,
  Plus,
  Minus,
  Calendar
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface UserLoyaltyInfo {
  currentPoints: number;
  totalEarned: number;
  totalRedeemed: number;
  tier: {
    id: number;
    name: string;
    minPoints: number;
    maxPoints?: number;
    benefits: {
      cashbackPercent: number;
      freeShipping: boolean;
      earlyAccess: boolean;
      prioritySupport: boolean;
      exclusiveDeals: boolean;
    };
    badgeColor: string;
  };
  nextTier?: {
    id: number;
    name: string;
    minPoints: number;
    badgeColor: string;
  };
  pointsToNextTier: number;
  tierProgress: number; // percentage
  recentTransactions: LoyaltyTransaction[];
}

interface LoyaltyTransaction {
  id: number;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  source: string;
  description: string;
  createdAt: string;
}

interface LoyaltyTier {
  id: number;
  name: string;
  minPoints: number;
  maxPoints?: number;
  benefits: any;
  badgeColor: string;
  isActive: boolean;
}

interface RedeemableReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'free_shipping' | 'cash_back' | 'exclusive_product';
  value: number;
  validUntil?: string;
  maxRedemptions?: number;
  currentRedemptions: number;
  isAvailable: boolean;
}

const TIER_ICONS = {
  'Plata': Star,
  'Plata Plus': Award,
  'Oro': Crown,
  'Platino': Gem
};

const TIER_GRADIENTS = {
  'silver': 'from-gray-400 to-gray-600',
  'gold': 'from-yellow-400 to-yellow-600',
  'platinum': 'from-purple-400 to-purple-600',
  'diamond': 'from-blue-400 to-blue-600'
};

export function LoyaltyProgram() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user loyalty info
  const { data: loyaltyInfo, isLoading } = useQuery<UserLoyaltyInfo>({
    queryKey: ['/api/loyalty/user']
  });

  // Fetch available rewards
  const { data: rewards = [], isLoading: rewardsLoading } = useQuery<RedeemableReward[]>({
    queryKey: ['/api/loyalty/rewards']
  });

  // Fetch all tiers info
  const { data: tiers = [] } = useQuery<LoyaltyTier[]>({
    queryKey: ['/api/loyalty/tiers']
  });

  // Redeem reward mutation
  const redeemMutation = useMutation({
    mutationFn: async ({ rewardId }: { rewardId: string }) => {
      return apiRequest('POST', '/api/loyalty/redeem', { rewardId });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/loyalty/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/loyalty/rewards'] });
      toast({
        title: "¡Recompensa canjeada!",
        description: `Has canjeado exitosamente tu recompensa. ${data.message || ''}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al canjear",
        description: error.message || "No se pudo canjear la recompensa",
        variant: "destructive",
      });
    }
  });

  // Format points with thousands separator
  const formatPoints = (points: number) => {
    return points.toLocaleString('es-MX');
  };

  // Get tier icon
  const getTierIcon = (tierName: string) => {
    const IconComponent = TIER_ICONS[tierName as keyof typeof TIER_ICONS] || Star;
    return IconComponent;
  };

  // Calculate tier progress
  const calculateTierProgress = useMemo(() => {
    if (!loyaltyInfo || !loyaltyInfo.nextTier) return 100;
    
    const currentTierMin = loyaltyInfo.tier.minPoints;
    const nextTierMin = loyaltyInfo.nextTier.minPoints;
    const userPoints = loyaltyInfo.currentPoints;
    
    const progressInTier = userPoints - currentTierMin;
    const tierRange = nextTierMin - currentTierMin;
    
    return Math.min(100, (progressInTier / tierRange) * 100);
  }, [loyaltyInfo]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="loyalty-loading">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!loyaltyInfo) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No se pudo cargar la información del programa de lealtad.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="loyalty-program">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${TIER_GRADIENTS[loyaltyInfo.tier.badgeColor as keyof typeof TIER_GRADIENTS]} flex items-center justify-center`}>
              {React.createElement(getTierIcon(loyaltyInfo.tier.name), { 
                className: "w-8 h-8 text-white" 
              })}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Programa PlataMX Loyalty
              </h1>
              <p className="text-xl text-primary font-semibold">
                Nivel {loyaltyInfo.tier.name}
              </p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Gana puntos con cada compra, alcanza nuevos niveles y disfruta beneficios exclusivos 
            en nuestra comunidad de amantes de la plata mexicana.
          </p>
        </div>

        {/* Points Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Puntos Disponibles</p>
                  <p className="text-3xl font-bold text-primary" data-testid="current-points">
                    {formatPoints(loyaltyInfo.currentPoints)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Vale {(loyaltyInfo.currentPoints * 0.1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </p>
                </div>
                <Gem className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Ganados</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="total-earned">
                    {formatPoints(loyaltyInfo.totalEarned)}
                  </p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{Math.round((loyaltyInfo.totalEarned / 30))} este mes
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Canjeados</p>
                  <p className="text-3xl font-bold text-blue-600" data-testid="total-redeemed">
                    {formatPoints(loyaltyInfo.totalRedeemed)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Ahorros de {(loyaltyInfo.totalRedeemed * 0.1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </p>
                </div>
                <Gift className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tier Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Progreso al Siguiente Nivel</h3>
                {loyaltyInfo.nextTier ? (
                  <Badge variant="outline" className="font-medium">
                    {loyaltyInfo.pointsToNextTier} puntos para {loyaltyInfo.nextTier.name}
                  </Badge>
                ) : (
                  <Badge className="bg-gradient-to-r from-purple-500 to-purple-700 text-white">
                    ¡Nivel Máximo Alcanzado!
                  </Badge>
                )}
              </div>
              
              {loyaltyInfo.nextTier && (
                <>
                  <Progress value={calculateTierProgress} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{loyaltyInfo.tier.name}</span>
                    <span>{loyaltyInfo.nextTier.name}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Star className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="benefits" data-testid="tab-benefits">
              <Crown className="w-4 h-4 mr-2" />
              Beneficios
            </TabsTrigger>
            <TabsTrigger value="rewards" data-testid="tab-rewards">
              <Gift className="w-4 h-4 mr-2" />
              Recompensas
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <Clock className="w-4 h-4 mr-2" />
              Historial
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* How it Works */}
            <Card>
              <CardHeader>
                <CardTitle>¿Cómo Funciona PlataMX Loyalty?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <ShoppingBag className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Compra</h4>
                    <p className="text-sm text-gray-600">
                      Gana 10 puntos por cada $100 MXN en compras de plata auténtica mexicana.
                    </p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Participa</h4>
                    <p className="text-sm text-gray-600">
                      Escribe reseñas, refiere amigos y participa en eventos para ganar puntos bonus.
                    </p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <Gift className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Canjea</h4>
                    <p className="text-sm text-gray-600">
                      Usa tus puntos para descuentos, envío gratis y productos exclusivos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Tier Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {React.createElement(getTierIcon(loyaltyInfo.tier.name), { 
                    className: "w-5 h-5 text-primary" 
                  })}
                  <span>Beneficios de tu Nivel {loyaltyInfo.tier.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">
                      {loyaltyInfo.tier.benefits.cashbackPercent}% cashback en todas las compras
                    </span>
                  </div>
                  
                  {loyaltyInfo.tier.benefits.freeShipping && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Envío gratuito en todas las órdenes</span>
                    </div>
                  )}
                  
                  {loyaltyInfo.tier.benefits.earlyAccess && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Acceso anticipado a nuevos productos</span>
                    </div>
                  )}
                  
                  {loyaltyInfo.tier.benefits.prioritySupport && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Soporte prioritario 24/7</span>
                    </div>
                  )}
                  
                  {loyaltyInfo.tier.benefits.exclusiveDeals && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Ofertas exclusivas solo para miembros</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ways to Earn Points */}
            <Card>
              <CardHeader>
                <CardTitle>Formas de Ganar Puntos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                      <span>Compras de productos</span>
                    </div>
                    <Badge variant="outline">10 pts / $100 MXN</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-yellow-600" />
                      <span>Escribir reseña con foto</span>
                    </div>
                    <Badge variant="outline">50 pts</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Heart className="w-5 h-5 text-red-600" />
                      <span>Referir un amigo</span>
                    </div>
                    <Badge variant="outline">200 pts</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span>Cumpleaños (anual)</span>
                    </div>
                    <Badge variant="outline">500 pts</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tiers.map((tier) => {
                const TierIcon = getTierIcon(tier.name);
                const isCurrentTier = tier.id === loyaltyInfo.tier.id;
                
                return (
                  <Card key={tier.id} className={isCurrentTier ? 'border-primary border-2' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${TIER_GRADIENTS[tier.badgeColor as keyof typeof TIER_GRADIENTS]} flex items-center justify-center`}>
                            <TierIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="flex items-center space-x-2">
                              <span>Nivel {tier.name}</span>
                              {isCurrentTier && <Badge variant="default">Tu Nivel</Badge>}
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                              {tier.minPoints.toLocaleString()} - {tier.maxPoints ? tier.maxPoints.toLocaleString() : '∞'} puntos
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{tier.benefits.cashbackPercent}% cashback</span>
                      </div>
                      
                      {tier.benefits.freeShipping && (
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">Envío gratis</span>
                        </div>
                      )}
                      
                      {tier.benefits.earlyAccess && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">Acceso anticipado</span>
                        </div>
                      )}
                      
                      {tier.benefits.prioritySupport && (
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm">Soporte prioritario</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recompensas Disponibles</CardTitle>
                <CardDescription>
                  Canjea tus puntos PlataMX por descuentos exclusivos y beneficios especiales
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rewardsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="rewards-list">
                    {rewards.map((reward) => {
                      const canAfford = loyaltyInfo.currentPoints >= reward.pointsCost;
                      const isAvailable = reward.isAvailable && (
                        !reward.maxRedemptions || reward.currentRedemptions < reward.maxRedemptions
                      );
                      
                      return (
                        <Card key={reward.id} className={`${canAfford && isAvailable ? 'border-green-300' : 'opacity-60'}`}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <h4 className="font-semibold text-sm">{reward.title}</h4>
                                <Badge variant={canAfford && isAvailable ? 'default' : 'secondary'}>
                                  {reward.pointsCost.toLocaleString()} pts
                                </Badge>
                              </div>
                              
                              <p className="text-xs text-gray-600">{reward.description}</p>
                              
                              {reward.value > 0 && (
                                <p className="text-sm font-medium text-green-600">
                                  Valor: {reward.value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                </p>
                              )}
                              
                              {reward.validUntil && (
                                <p className="text-xs text-gray-500">
                                  Válido hasta: {new Date(reward.validUntil).toLocaleDateString('es-MX')}
                                </p>
                              )}
                              
                              <Button
                                size="sm"
                                className="w-full"
                                disabled={!canAfford || !isAvailable || redeemMutation.isPending}
                                onClick={() => redeemMutation.mutate({ rewardId: reward.id })}
                                data-testid={`redeem-${reward.id}`}
                              >
                                {!canAfford ? 'Puntos Insuficientes' : 
                                 !isAvailable ? 'No Disponible' : 
                                 redeemMutation.isPending ? 'Canjeando...' : 'Canjear'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Puntos</CardTitle>
                <CardDescription>
                  Todas tus transacciones de puntos PlataMX
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3" data-testid="points-history">
                  {loyaltyInfo.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'earned' ? 'bg-green-100 text-green-600' :
                          transaction.type === 'redeemed' ? 'bg-blue-100 text-blue-600' :
                          transaction.type === 'bonus' ? 'bg-purple-100 text-purple-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {transaction.type === 'earned' ? <Plus className="w-4 h-4" /> :
                           transaction.type === 'redeemed' ? <Minus className="w-4 h-4" /> :
                           transaction.type === 'bonus' ? <Gift className="w-4 h-4" /> :
                           <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-gray-500">
                            {transaction.source} • {new Date(transaction.createdAt).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'earned' || transaction.type === 'bonus' ? 'text-green-600' : 
                          transaction.type === 'redeemed' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {transaction.type === 'earned' || transaction.type === 'bonus' ? '+' : '-'}
                          {Math.abs(transaction.points).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {loyaltyInfo.recentTransactions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No hay transacciones aún.</p>
                      <p className="text-sm">¡Haz tu primera compra para empezar a ganar puntos!</p>
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