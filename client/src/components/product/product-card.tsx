import { Heart, Plus, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface Product {
  id: number;
  title: string;
  price: string;
  originalPrice?: string;
  images: string[];
  rating: string;
  reviewCount: number;
  seller?: {
    username: string;
    isVerified: boolean;
  };
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: (productId: number) =>
      apiRequest("POST", "/api/cart", { productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "¡Agregado al carrito!",
        description: "El producto se agregó correctamente a tu carrito.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito.",
        variant: "destructive",
      });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: (productId: number) =>
      apiRequest("POST", "/api/wishlist", { productId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "¡Agregado a favoritos!",
        description: "El producto se agregó a tu lista de deseos.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar a favoritos.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para agregar productos al carrito.",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate(product.id);
  };

  const handleAddToWishlist = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para agregar a favoritos.",
        variant: "destructive",
      });
      return;
    }
    addToWishlistMutation.mutate(product.id);
  };

  const rating = parseFloat(product.rating);
  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);

  return (
    <Card className="bg-white rounded-xl border border-silver-200 hover:shadow-lg transition-shadow" data-testid={`card-product-${product.id}`}>
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <img
            src={product.images[0] || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"}
            alt={product.title}
            className="w-full h-48 object-cover rounded-t-xl"
            data-testid={`img-product-${product.id}`}
          />
        </Link>
        
        <button
          onClick={handleAddToWishlist}
          className="absolute top-2 right-2 bg-white/80 hover:bg-white p-1.5 rounded-full transition-colors"
          data-testid={`button-wishlist-${product.id}`}
        >
          <Heart className="w-4 h-4 text-silver-600" />
        </button>
        
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium">
            -{Math.round(((parseFloat(product.originalPrice!) - parseFloat(product.price)) / parseFloat(product.originalPrice!)) * 100)}%
          </Badge>
        )}
        
        <Badge className="absolute bottom-2 left-2 bg-green-100 text-green-800 text-xs font-medium">
          Envío gratis
        </Badge>
      </div>
      
      <CardContent className="p-4">
        {product.seller && (
          <div className="flex items-center text-xs text-silver-500 mb-1">
            <span data-testid={`text-seller-${product.id}`}>{product.seller.username}</span>
            {product.seller.isVerified && (
              <CheckCircle className="w-3 h-3 text-silver-400 ml-1" />
            )}
          </div>
        )}
        
        <h3 className="font-medium text-silver-800 mb-2 line-clamp-2" data-testid={`text-title-${product.id}`}>
          {product.title}
        </h3>
        
        <div className="flex items-center mb-2">
          <div className="flex text-gold-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${star <= rating ? "fill-current" : ""}`}
              />
            ))}
          </div>
          <span className="text-xs text-silver-500 ml-1" data-testid={`text-reviews-${product.id}`}>
            ({product.reviewCount})
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-silver-800" data-testid={`text-price-${product.id}`}>
              ${parseFloat(product.price).toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-silver-400 line-through ml-1">
                ${parseFloat(product.originalPrice!).toLocaleString()}
              </span>
            )}
          </div>
          
          <Button
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            className="bg-gold-500 hover:bg-gold-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            data-testid={`button-add-cart-${product.id}`}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
