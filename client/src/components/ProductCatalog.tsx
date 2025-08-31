import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, Grid, List, Star, Shield, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product, Category } from '@shared/schema';

interface ProductFilters {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  materials?: string[];
  purity?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function ProductCatalog() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch products with filters
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.set(key, value.toString());
          }
        }
      });
      const response = await fetch(`/api/products?${params}`);
      return response.json();
    }
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories']
  });

  // Filter products based on search and price range
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priceRange[0] > 0 || priceRange[1] < 10000) {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price);
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    return filtered;
  }, [products, searchTerm, priceRange]);

  const materials = ['Plata 925', 'Plata 950', 'Plata Oxidada', 'Con Turquesa', 'Con Ónix', 'Con Perla'];
  const purities = ['925', '950', '999'];

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ sortBy: 'createdAt', sortOrder: 'desc' });
    setSearchTerm('');
    setPriceRange([0, 10000]);
  };

  if (productsLoading) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="catalog-loading">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="product-catalog">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Catálogo de Plata Mexicana
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Descubre auténticas piezas de plata mexicana de artesanos verificados
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="toggle-filters"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              data-testid="view-grid"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              data-testid="view-list"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Buscar productos de plata mexicana..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-3 text-lg"
          data-testid="search-input"
        />
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80 space-y-6" data-testid="filters-sidebar">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Filtros</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="clear-filters">
                    Limpiar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Categoría</Label>
                  <Select
                    value={filters.categoryId?.toString() || ""}
                    onValueChange={(value) => handleFilterChange('categoryId', value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger data-testid="category-select">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las categorías</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Price Range */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Rango de Precio</Label>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={10000}
                      min={0}
                      step={100}
                      className="mb-4"
                      data-testid="price-slider"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${priceRange[0].toLocaleString()} MXN</span>
                      <span>${priceRange[1].toLocaleString()} MXN</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Material Filter */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Material</Label>
                  <div className="space-y-2">
                    {materials.map((material) => (
                      <div key={material} className="flex items-center space-x-2">
                        <Checkbox 
                          id={material}
                          checked={filters.materials?.includes(material) || false}
                          onCheckedChange={(checked) => {
                            const current = filters.materials || [];
                            const updated = checked 
                              ? [...current, material]
                              : current.filter(m => m !== material);
                            handleFilterChange('materials', updated);
                          }}
                          data-testid={`material-${material.replace(/\\s+/g, '-').toLowerCase()}`}
                        />
                        <Label htmlFor={material} className="text-sm">
                          {material}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Purity Filter */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Pureza</Label>
                  <div className="space-y-2">
                    {purities.map((purity) => (
                      <div key={purity} className="flex items-center space-x-2">
                        <Checkbox 
                          id={purity}
                          checked={filters.purity?.includes(purity) || false}
                          onCheckedChange={(checked) => {
                            const current = filters.purity || [];
                            const updated = checked 
                              ? [...current, purity]
                              : current.filter(p => p !== purity);
                            handleFilterChange('purity', updated);
                          }}
                          data-testid={`purity-${purity}`}
                        />
                        <Label htmlFor={purity} className="text-sm">
                          {purity} (Plata {purity})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Grid/List */}
        <div className="flex-1">
          {/* Sort and Results Count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600 dark:text-gray-400" data-testid="results-count">
              {filteredProducts.length} productos encontrados
            </p>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="sort">Ordenar por:</Label>
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder as 'asc' | 'desc');
                }}
              >
                <SelectTrigger className="w-48" data-testid="sort-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Más Reciente</SelectItem>
                  <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                  <SelectItem value="title-asc">Nombre A-Z</SelectItem>
                  <SelectItem value="title-desc">Nombre Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Display */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12" data-testid="no-products">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-500">
                Intenta ajustar tus filtros o términos de búsqueda
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            } data-testid="products-container">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, viewMode }: { product: Product; viewMode: 'grid' | 'list' }) {
  const { toast } = useToast();

  const handleAddToCart = () => {
    toast({
      title: "Agregado al carrito",
      description: `${product.title} se agregó a tu carrito`,
    });
  };

  const handleAddToWishlist = () => {
    toast({
      title: "Agregado a favoritos",
      description: `${product.title} se agregó a tus favoritos`,
    });
  };

  if (viewMode === 'list') {
    return (
      <Card className="flex flex-row overflow-hidden hover:shadow-lg transition-shadow" data-testid={`product-card-${product.id}`}>
        <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Shield className="w-16 h-16" />
            </div>
          )}
        </div>
        
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2">
                {product.title}
              </h3>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddToWishlist}
                  data-testid={`wishlist-${product.id}`}
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              {product.sellerProfile?.silverCheck && (
                <Badge variant="secondary" className="bg-gradient-to-r from-silver-500 to-silver-600 text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              )}
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600 ml-1">4.8 (23 reseñas)</span>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
              {product.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">
                ${parseFloat(product.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500">MXN</p>
            </div>
            
            <Button onClick={handleAddToCart} data-testid={`add-to-cart-${product.id}`}>
              Agregar al Carrito
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`product-card-${product.id}`}>
      <CardHeader className="p-0">
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Shield className="w-16 h-16" />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={handleAddToWishlist}
            data-testid={`wishlist-${product.id}`}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          {product.sellerProfile?.silverCheck && (
            <Badge variant="secondary" className="bg-gradient-to-r from-silver-500 to-silver-600 text-white text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Verificado
            </Badge>
          )}
          <div className="flex items-center">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-600 ml-1">4.8</span>
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {product.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {product.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div>
          <p className="text-xl font-bold text-primary">
            ${parseFloat(product.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500">MXN</p>
        </div>
        
        <Button size="sm" onClick={handleAddToCart} data-testid={`add-to-cart-${product.id}`}>
          Agregar
        </Button>
      </CardFooter>
    </Card>
  );
}