import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain,
  TrendingUp,
  Users,
  Heart,
  ShoppingCart,
  Star,
  Eye,
  RefreshCw,
  Zap,
  Target,
  ThumbsUp,
  ThumbsDown,
  X
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface RecommendationProduct {
  id: number;
  title: string;
  description: string;
  price: string;
  images: string[];
  rating: number;
  reviewCount: number;
  seller: {
    name: string;
    isVerified: boolean;
  };
}

interface SmartRecommendation {
  id: number;
  product: RecommendationProduct;
  score: number;
  algorithm: 'collaborative' | 'content' | 'hybrid' | 'trending' | 'seasonal';
  reason: string;
  confidence: number;
  userInteractions?: {
    views: number;
    likes: number;
    cartAdds: number;
  };
}

interface RecommendationSection {
  title: string;
  description: string;
  icon: React.ReactNode;
  algorithmType: string;
  recommendations: SmartRecommendation[];
}

interface UserPreferences {
  categories: string[];
  priceRange: { min: number; max: number };
  materials: string[];
  regions: string[];
  techniques: string[];
}

export function SmartRecommendations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user-specific recommendations
  const { data: personalizedRecs = [], isLoading: personalizedLoading, refetch: refetchPersonalized } = useQuery<SmartRecommendation[]>({
    queryKey: ['/api/recommendations/personalized'],
    staleTime: 300000, // 5 minutes
  });

  // Fetch trending recommendations
  const { data: trendingRecs = [], isLoading: trendingLoading } = useQuery<SmartRecommendation[]>({
    queryKey: ['/api/recommendations/trending'],
    staleTime: 600000, // 10 minutes
  });

  // Fetch similar user recommendations
  const { data: collaborativeRecs = [], isLoading: collaborativeLoading } = useQuery<SmartRecommendation[]>({
    queryKey: ['/api/recommendations/collaborative'],
    staleTime: 900000, // 15 minutes
  });

  // Fetch seasonal recommendations
  const { data: seasonalRecs = [], isLoading: seasonalLoading } = useQuery<SmartRecommendation[]>({
    queryKey: ['/api/recommendations/seasonal'],
    staleTime: 1800000, // 30 minutes
  });

  // Fetch user preferences
  const { data: userPreferences } = useQuery<UserPreferences>({
    queryKey: ['/api/user/preferences'],
  });

  // Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async ({ recommendationId, feedback }: { recommendationId: number; feedback: 'like' | 'dislike' | 'not_interested' }) => {
      return apiRequest('POST', '/api/recommendations/feedback', {
        recommendationId,
        feedback
      });
    },
    onSuccess: () => {
      toast({
        title: "Gracias por tu feedback",
        description: "Esto nos ayudará a mejorar tus recomendaciones.",
      });
      // Refetch recommendations to update scores
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar el feedback. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity?: number }) => {
      return apiRequest('POST', '/api/cart/add', { productId, quantity });
    },
    onSuccess: () => {
      toast({
        title: "Producto agregado",
        description: "El producto se agregó a tu carrito.",
      });
      // Track interaction
      trackInteraction('add_to_cart');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito.",
        variant: "destructive",
      });
    }
  });

  // Track interaction mutation
  const trackInteraction = async (type: string) => {
    try {
      await apiRequest('POST', '/api/user/interactions', { 
        interactionType: type, 
        context: 'recommendations' 
      });
    } catch (error) {
      // Silent fail for tracking
    }
  };

  // Handle feedback
  const handleFeedback = (recommendationId: number, feedback: 'like' | 'dislike' | 'not_interested') => {
    feedbackMutation.mutate({ recommendationId, feedback });
  };

  // Handle add to cart
  const handleAddToCart = (productId: number) => {
    addToCartMutation.mutate({ productId });
  };

  // Recommendation sections
  const recommendationSections: RecommendationSection[] = [
    {
      title: "Recomendaciones Personalizadas",
      description: "Basadas en tu historial y preferencias",
      icon: <Target className="w-5 h-5" />,
      algorithmType: "hybrid",
      recommendations: personalizedRecs
    },
    {
      title: "Tendencias Actuales",
      description: "Los productos más populares del momento",
      icon: <TrendingUp className="w-5 h-5" />,
      algorithmType: "trending",
      recommendations: trendingRecs
    },
    {
      title: "Usuarios Similares También Compraron",
      description: "Basado en patrones de compra similares",
      icon: <Users className="w-5 h-5" />,
      algorithmType: "collaborative",
      recommendations: collaborativeRecs
    },
    {
      title: "Recomendaciones de Temporada",
      description: "Productos perfectos para esta época",
      icon: <Zap className="w-5 h-5" />,
      algorithmType: "seasonal",
      recommendations: seasonalRecs
    }
  ];

  const isAnyLoading = personalizedLoading || trendingLoading || collaborativeLoading || seasonalLoading;

  return (
    <div className="space-y-8" data-testid="smart-recommendations">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Recomendaciones Inteligentes
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Descubre productos únicos de plata mexicana seleccionados especialmente para ti 
          usando inteligencia artificial y machine learning.
        </p>
      </div>

      {/* User Preferences Summary */}
      {userPreferences && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Tu Perfil de Preferencias
            </CardTitle>
            <CardDescription>
              Basado en tu actividad y preferencias declaradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Categories */}
              {userPreferences.categories.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Categorías Favoritas</h4>
                  <div className="flex flex-wrap gap-1">
                    {userPreferences.categories.slice(0, 3).map((category, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h4 className="font-medium text-sm mb-2">Rango de Precios</h4>
                <p className="text-sm text-gray-600">
                  ${userPreferences.priceRange.min.toLocaleString()} - ${userPreferences.priceRange.max.toLocaleString()}
                </p>
              </div>

              {/* Materials */}
              {userPreferences.materials.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Materiales</h4>
                  <div className="flex flex-wrap gap-1">
                    {userPreferences.materials.map((material, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Techniques */}
              {userPreferences.techniques.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Técnicas Favoritas</h4>
                  <div className="flex flex-wrap gap-1">
                    {userPreferences.techniques.slice(0, 2).map((technique, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {technique}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendation Sections */}
      {recommendationSections.map((section, sectionIndex) => (
        section.recommendations.length > 0 && (
          <Card key={sectionIndex}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  {section.icon}
                  <span className="ml-2">{section.title}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    IA
                  </Badge>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (section.algorithmType === 'hybrid') {
                      refetchPersonalized();
                    }
                  }}
                  data-testid={`refresh-${section.algorithmType}`}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Actualizar
                </Button>
              </div>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {section.recommendations.slice(0, 8).map((rec) => (
                  <Card key={rec.id} className="relative group hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Algorithm Badge */}
                        <div className="absolute top-2 right-2 z-10">
                          <Badge 
                            variant={rec.algorithm === 'hybrid' ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {rec.algorithm === 'collaborative' ? 'Social' :
                             rec.algorithm === 'content' ? 'Similar' :
                             rec.algorithm === 'trending' ? 'Popular' :
                             rec.algorithm === 'seasonal' ? 'Temporal' : 'IA'}
                          </Badge>
                        </div>

                        {/* Product Image */}
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                          <img 
                            src={rec.product.images[0]} 
                            alt={rec.product.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          
                          {/* Confidence Score */}
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                              {Math.round(rec.confidence * 100)}% match
                            </Badge>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-2">
                          <h4 className="font-semibold line-clamp-2 text-sm">{rec.product.title}</h4>
                          <p className="text-lg font-bold text-primary">{rec.product.price}</p>
                          
                          {/* Rating */}
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${
                                    i < Math.round(rec.product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">({rec.product.reviewCount})</span>
                          </div>

                          {/* Reason */}
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {rec.reason}
                          </p>

                          {/* User Interactions */}
                          {rec.userInteractions && (
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {rec.userInteractions.views}
                              </span>
                              <span className="flex items-center">
                                <Heart className="w-3 h-3 mr-1" />
                                {rec.userInteractions.likes}
                              </span>
                              <span className="flex items-center">
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                {rec.userInteractions.cartAdds}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          <Button 
                            className="w-full" 
                            size="sm"
                            onClick={() => handleAddToCart(rec.product.id)}
                            disabled={addToCartMutation.isPending}
                            data-testid={`add-to-cart-${rec.id}`}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {addToCartMutation.isPending ? 'Agregando...' : 'Agregar al Carrito'}
                          </Button>

                          {/* Feedback Buttons */}
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(rec.id, 'like')}
                              disabled={feedbackMutation.isPending}
                              className="h-8 px-2"
                              data-testid={`like-${rec.id}`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(rec.id, 'dislike')}
                              disabled={feedbackMutation.isPending}
                              className="h-8 px-2"
                              data-testid={`dislike-${rec.id}`}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(rec.id, 'not_interested')}
                              disabled={feedbackMutation.isPending}
                              className="h-8 px-2"
                              data-testid={`not-interested-${rec.id}`}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Show More Button */}
              {section.recommendations.length > 8 && (
                <div className="text-center mt-6">
                  <Button variant="outline">
                    Ver Más Recomendaciones ({section.recommendations.length - 8} más)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      ))}

      {/* Loading State */}
      {isAnyLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="space-y-3">
                        <div className="aspect-square bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isAnyLoading && recommendationSections.every(section => section.recommendations.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Construyendo tus Recomendaciones</h3>
            <p className="text-gray-600 mb-4">
              Navega por productos y realiza algunas compras para que podamos 
              crear recomendaciones personalizadas perfectas para ti.
            </p>
            <Button variant="outline">
              Explorar Productos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}