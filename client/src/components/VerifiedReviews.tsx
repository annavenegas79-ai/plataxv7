import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  Shield, 
  Camera, 
  Video, 
  ThumbsUp, 
  MessageSquare, 
  CheckCircle,
  Clock,
  ImageIcon,
  PlayCircle,
  Heart,
  Flag
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface VerifiedReview {
  id: number;
  review: {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    createdBy: {
      id: number;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  isVerifiedPurchase: boolean;
  reviewImages: string[];
  reviewVideo?: string;
  helpfulVotes: number;
  sellerResponse?: string;
  sellerResponseAt?: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  hasUserVoted?: boolean;
  hasUserReported?: boolean;
}

interface ReviewsSummary {
  totalReviews: number;
  averageRating: number;
  verifiedPurchasePercent: number;
  ratingDistribution: Array<{
    stars: number;
    count: number;
    percentage: number;
  }>;
  featuredReview?: VerifiedReview;
}

interface Props {
  productId: number;
  allowNewReview?: boolean;
  onReviewSubmitted?: () => void;
}

export function VerifiedReviews({ productId, allowNewReview = false, onReviewSubmitted }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [sellerResponseText, setSellerResponseText] = useState('');
  const [respondingToReview, setRespondingToReview] = useState<number | null>(null);

  // Fetch reviews summary
  const { data: summary, isLoading: summaryLoading } = useQuery<ReviewsSummary>({
    queryKey: ['/api/products', productId, 'reviews-summary']
  });

  // Fetch reviews list
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<VerifiedReview[]>({
    queryKey: ['/api/products', productId, 'reviews'],
    enabled: showAllReviews
  });

  // Vote helpful mutation
  const voteHelpfulMutation = useMutation({
    mutationFn: async ({ reviewId }: { reviewId: number }) => {
      return apiRequest('POST', `/api/reviews/${reviewId}/helpful`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId, 'reviews'] });
      toast({
        title: "Voto registrado",
        description: "Gracias por tu feedback sobre esta reseña",
      });
    }
  });

  // Report review mutation
  const reportMutation = useMutation({
    mutationFn: async ({ reviewId, reason }: { reviewId: number; reason: string }) => {
      return apiRequest('POST', `/api/reviews/${reviewId}/report`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "Reseña reportada",
        description: "Hemos recibido tu reporte y lo revisaremos pronto",
      });
    }
  });

  // Seller response mutation
  const respondMutation = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: number; response: string }) => {
      return apiRequest('POST', `/api/reviews/${reviewId}/response`, { response });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId, 'reviews'] });
      setSellerResponseText('');
      setRespondingToReview(null);
      toast({
        title: "Respuesta publicada",
        description: "Tu respuesta ha sido publicada exitosamente",
      });
    }
  });

  // Render stars
  const renderStars = (rating: number, size = 'sm') => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (summaryLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No hay reseñas disponibles aún.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="verified-reviews">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Reseñas Verificadas</span>
            </CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {summary.verifiedPurchasePercent.toFixed(0)}% compras verificadas
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Rating */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2" data-testid="average-rating">
                {summary.averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(summary.averageRating), 'lg')}
              <p className="text-sm text-gray-600 mt-1">
                {summary.totalReviews} reseñas
              </p>
            </div>
            
            <div className="flex-1 space-y-2">
              {summary.ratingDistribution.map((dist) => (
                <div key={dist.stars} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm">{dist.stars}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress value={dist.percentage} className="flex-1 h-2" />
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {dist.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Review */}
          {summary.featuredReview && (
            <div className="border-t pt-6">
              <h4 className="font-semibold mb-4 flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Reseña Destacada</span>
              </h4>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={summary.featuredReview.review.createdBy.avatar} />
                    <AvatarFallback>
                      {summary.featuredReview.review.createdBy.firstName[0]}
                      {summary.featuredReview.review.createdBy.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">
                        {summary.featuredReview.review.createdBy.firstName} {summary.featuredReview.review.createdBy.lastName}
                      </span>
                      {summary.featuredReview.isVerifiedPurchase && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Compra verificada
                        </Badge>
                      )}
                      {renderStars(summary.featuredReview.review.rating)}
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300">
                      {summary.featuredReview.review.comment}
                    </p>
                    
                    {/* Review Images */}
                    {summary.featuredReview.reviewImages.length > 0 && (
                      <div className="flex space-x-2 mt-3">
                        {summary.featuredReview.reviewImages.slice(0, 3).map((image, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={image} 
                              alt={`Foto de reseña ${index + 1}`}
                              className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80"
                            />
                          </div>
                        ))}
                        {summary.featuredReview.reviewImages.length > 3 && (
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-xs">+{summary.featuredReview.reviewImages.length - 3}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDate(summary.featuredReview.review.createdAt)}</span>
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 hover:text-green-600">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{summary.featuredReview.helpfulVotes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setShowAllReviews(!showAllReviews)}
              data-testid="toggle-reviews"
            >
              {showAllReviews ? 'Ocultar reseñas' : `Ver todas las reseñas (${summary.totalReviews})`}
            </Button>
            
            {allowNewReview && (
              <Button onClick={onReviewSubmitted} data-testid="write-review">
                <Star className="w-4 h-4 mr-2" />
                Escribir reseña
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Reviews */}
      {showAllReviews && (
        <Card>
          <CardHeader>
            <CardTitle>Todas las Reseñas</CardTitle>
            <CardDescription>
              Reseñas ordenadas por más útiles primero
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviewsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-3">
                    <div className="flex space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6" data-testid="reviews-list">
                {reviews.map((verifiedReview) => {
                  const review = verifiedReview.review;
                  
                  return (
                    <div key={review.id} className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={review.createdBy.avatar} />
                          <AvatarFallback>
                            {review.createdBy.firstName[0]}{review.createdBy.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                          {/* Review Header */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3 flex-wrap">
                              <span className="font-medium">
                                {review.createdBy.firstName} {review.createdBy.lastName}
                              </span>
                              
                              {verifiedReview.isVerifiedPurchase && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Compra verificada
                                </Badge>
                              )}
                              
                              {renderStars(review.rating)}
                              
                              <span className="text-sm text-gray-500">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Review Content */}
                          <p className="text-gray-700 dark:text-gray-300">
                            {review.comment}
                          </p>
                          
                          {/* Review Media */}
                          {(verifiedReview.reviewImages.length > 0 || verifiedReview.reviewVideo) && (
                            <div className="space-y-2">
                              {/* Images */}
                              {verifiedReview.reviewImages.length > 0 && (
                                <div className="flex space-x-2 flex-wrap">
                                  {verifiedReview.reviewImages.map((image, index) => (
                                    <div key={index} className="relative group">
                                      <img 
                                        src={image} 
                                        alt={`Foto ${index + 1}`}
                                        className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => {/* Open modal */}}
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-opacity flex items-center justify-center">
                                        <ImageIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Video */}
                              {verifiedReview.reviewVideo && (
                                <div className="relative group cursor-pointer">
                                  <video 
                                    className="w-40 h-24 rounded-lg object-cover"
                                    poster="/api/video-thumbnail"
                                  >
                                    <source src={verifiedReview.reviewVideo} type="video/mp4" />
                                  </video>
                                  <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                                    <PlayCircle className="w-8 h-8 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Seller Response */}
                          {verifiedReview.sellerResponse && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-4">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                  <MessageSquare className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className="font-medium text-blue-800 dark:text-blue-200">Respuesta del Vendedor</span>
                                    <span className="text-xs text-blue-600 dark:text-blue-400">
                                      {verifiedReview.sellerResponseAt && formatDate(verifiedReview.sellerResponseAt)}
                                    </span>
                                  </div>
                                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                                    {verifiedReview.sellerResponse}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Review Actions */}
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center space-x-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => voteHelpfulMutation.mutate({ reviewId: review.id })}
                                disabled={verifiedReview.hasUserVoted || voteHelpfulMutation.isPending}
                                data-testid={`helpful-${review.id}`}
                              >
                                <ThumbsUp className={`w-4 h-4 mr-2 ${verifiedReview.hasUserVoted ? 'fill-green-600 text-green-600' : ''}`} />
                                Útil ({verifiedReview.helpfulVotes})
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => reportMutation.mutate({ reviewId: review.id, reason: 'inappropriate' })}
                                disabled={verifiedReview.hasUserReported || reportMutation.isPending}
                                data-testid={`report-${review.id}`}
                              >
                                <Flag className="w-4 h-4 mr-2" />
                                Reportar
                              </Button>
                            </div>
                            
                            {/* Seller Response Button - Only show to sellers */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRespondingToReview(review.id)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              data-testid={`respond-${review.id}`}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Responder
                            </Button>
                          </div>
                          
                          {/* Seller Response Form */}
                          {respondingToReview === review.id && (
                            <div className="mt-4 space-y-3">
                              <Textarea
                                placeholder="Escribe tu respuesta a esta reseña..."
                                value={sellerResponseText}
                                onChange={(e) => setSellerResponseText(e.target.value)}
                                rows={3}
                                data-testid="seller-response-text"
                              />
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => respondMutation.mutate({ 
                                    reviewId: review.id, 
                                    response: sellerResponseText 
                                  })}
                                  disabled={!sellerResponseText.trim() || respondMutation.isPending}
                                  data-testid="submit-response"
                                >
                                  Publicar Respuesta
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setRespondingToReview(null);
                                    setSellerResponseText('');
                                  }}
                                  data-testid="cancel-response"
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                    </div>
                  );
                })}
                
                {reviews.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay reseñas para este producto aún.</p>
                    <p className="text-sm">¡Sé el primero en dejar una reseña!</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}