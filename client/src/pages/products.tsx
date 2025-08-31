import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Filter, Grid3X3, List, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ProductGrid from "@/components/product/product-grid";
import type { Product, Category } from "@shared/schema";

export default function Products() {
  const [location, navigate] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  
  const [filters, setFilters] = useState({
    search: urlParams.get('search') || '',
    category: urlParams.get('category') || '',
    minPrice: urlParams.get('minPrice') || '',
    maxPrice: urlParams.get('maxPrice') || '',
    sortBy: urlParams.get('sortBy') || 'newest',
    sortOrder: urlParams.get('sortOrder') || 'desc' as 'asc' | 'desc',
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", filters],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    navigate(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
      sortOrder: 'desc',
    });
    navigate('/products');
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'newest' && v !== 'desc').length;

  return (
    <div className="min-h-screen bg-silver-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-silver-800 mb-2" data-testid="text-products-title">
            Productos de Plata
          </h1>
          <p className="text-silver-600" data-testid="text-products-subtitle">
            Descubre nuestra colección completa de joyas y accesorios de plata auténtica
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-silver-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver-400 w-4 h-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                  data-testid="input-search-products"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="w-full lg:w-48" data-testid="select-category">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las categorías</SelectItem>
                <SelectItem value="anillos">Anillos</SelectItem>
                <SelectItem value="collares">Collares</SelectItem>
                <SelectItem value="aretes">Aretes</SelectItem>
                <SelectItem value="pulseras">Pulseras</SelectItem>
                <SelectItem value="relojes">Relojes</SelectItem>
                <SelectItem value="accesorios">Accesorios</SelectItem>
              </SelectContent>
            </Select>

            {/* Price Range */}
            <div className="flex gap-2">
              <Input
                placeholder="Precio mín."
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-32"
                type="number"
                data-testid="input-min-price"
              />
              <Input
                placeholder="Precio máx."
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-32"
                type="number"
                data-testid="input-max-price"
              />
            </div>

            {/* Sort */}
            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger className="w-full lg:w-48" data-testid="select-sort">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="price">Precio</SelectItem>
                <SelectItem value="rating">Mejor calificado</SelectItem>
                <SelectItem value="popular">Más populares</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-silver-200">
              <span className="text-sm text-silver-600">Filtros activos:</span>
              {filters.search && (
                <Badge variant="secondary" className="text-xs">
                  Búsqueda: {filters.search}
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="text-xs">
                  Categoría: {filters.category}
                </Badge>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Badge variant="secondary" className="text-xs">
                  Precio: ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gold-500 hover:text-gold-600"
                data-testid="button-clear-filters"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-silver-600" data-testid="text-results-count">
              {products.length} productos encontrados
            </span>
            {filters.category && (
              <Badge className="bg-gold-100 text-gold-800">
                {filters.category}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-silver-200 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
                data-testid="button-grid-view"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
                data-testid="button-list-view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Sort Order */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2"
              data-testid="button-sort-order"
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <ProductGrid products={products} isLoading={isLoading} />

        {/* Load More */}
        {products.length > 0 && !isLoading && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="px-8"
              data-testid="button-load-more"
            >
              Cargar más productos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
