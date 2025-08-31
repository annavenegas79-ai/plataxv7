import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Mic, 
  Camera, 
  Sparkles, 
  Filter, 
  MapPin, 
  User,
  Hammer,
  Star,
  Clock,
  Zap,
  X,
  ChevronRight
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface SearchResult {
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
  relevanceScore: number;
  matchType: 'semantic' | 'keyword' | 'visual' | 'ai';
  highlightedFeatures: string[];
}

interface SearchFilters {
  region?: string;
  artisan?: string;
  technique?: string;
  priceMin?: number;
  priceMax?: number;
  material?: string;
  purity?: string;
}

interface AiSuggestion {
  query: string;
  type: 'similar' | 'related' | 'trending';
  reasoning: string;
}

interface VoiceSearchState {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
}

export function AiSearch() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Search state
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'text' | 'voice' | 'image' | 'semantic'>('text');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // Voice search state
  const [voiceState, setVoiceState] = useState<VoiceSearchState>({
    isListening: false,
    transcript: '',
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  });
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search results query
  const { data: searchResults = [], isLoading: searchLoading, refetch: performSearch } = useQuery<SearchResult[]>({
    queryKey: ['/api/search/ai', { query, filters, mode: searchMode }],
    enabled: false // Only search when triggered
  });

  // AI suggestions query
  const { data: aiSuggestions = [] } = useQuery<AiSuggestion[]>({
    queryKey: ['/api/search/suggestions', { query }],
    enabled: query.length > 2
  });

  // Search mutation for tracking
  const searchMutation = useMutation({
    mutationFn: async ({ searchQuery, searchType }: { searchQuery: string; searchType: string }) => {
      return apiRequest('POST', '/api/search/track', {
        query: searchQuery,
        searchType,
        filters
      });
    },
    onSuccess: () => {
      // Add to search history
      if (query && !searchHistory.includes(query)) {
        setSearchHistory(prev => [query, ...prev].slice(0, 5));
      }
    }
  });

  // Image search mutation
  const imageSearchMutation = useMutation({
    mutationFn: async (imageFile: File) => {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch('/api/search/image', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to search by image');
      return response.json();
    },
    onSuccess: (results) => {
      // Handle image search results
      setQuery('Búsqueda por imagen');
      setSearchMode('image');
      queryClient.setQueryData(['/api/search/ai', { query: 'Búsqueda por imagen', filters, mode: 'image' }], results);
    },
    onError: () => {
      toast({
        title: "Error en búsqueda por imagen",
        description: "No se pudo procesar la imagen. Intenta con otra imagen.",
        variant: "destructive",
      });
    }
  });

  // Initialize speech recognition
  useEffect(() => {
    if (voiceState.isSupported) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-MX';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceState(prev => ({ ...prev, transcript, isListening: false }));
        setQuery(transcript);
        setSearchMode('voice');
      };

      recognitionRef.current.onend = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current.onerror = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }));
        toast({
          title: "Error de reconocimiento de voz",
          description: "No se pudo procesar el audio. Intenta nuevamente.",
          variant: "destructive",
        });
      };
    }
  }, [voiceState.isSupported, toast]);

  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    await searchMutation.mutateAsync({ 
      searchQuery: query, 
      searchType: searchMode 
    });
    
    performSearch();
  };

  // Handle voice search
  const startVoiceSearch = () => {
    if (!voiceState.isSupported) {
      toast({
        title: "Búsqueda por voz no disponible",
        description: "Tu navegador no soporta reconocimiento de voz.",
        variant: "destructive",
      });
      return;
    }

    setVoiceState(prev => ({ ...prev, isListening: true }));
    recognitionRef.current?.start();
  };

  const stopVoiceSearch = () => {
    recognitionRef.current?.stop();
    setVoiceState(prev => ({ ...prev, isListening: false }));
  };

  // Handle image search
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Archivo inválido",
        description: "Por favor selecciona una imagen válida.",
        variant: "destructive",
      });
      return;
    }

    imageSearchMutation.mutate(file);
  };

  // Handle semantic search toggle
  const toggleSemanticSearch = () => {
    setSearchMode(searchMode === 'semantic' ? 'text' : 'semantic');
  };

  return (
    <div className="space-y-6" data-testid="ai-search">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Búsqueda Inteligente PlataMX
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Encuentra productos de plata mexicana usando inteligencia artificial. 
          Busca por texto, voz, imágenes o descripción semántica.
        </p>
      </div>

      {/* Search Interface */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  placeholder={
                    searchMode === 'voice' ? 'Habla ahora...' :
                    searchMode === 'image' ? 'Sube una imagen para buscar...' :
                    searchMode === 'semantic' ? 'Describe lo que buscas (ej: "anillo elegante para boda")' :
                    'Buscar productos de plata mexicana...'
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-20"
                  data-testid="search-input"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                
                {/* Search Mode Indicators */}
                <div className="absolute right-3 top-2 flex items-center space-x-1">
                  {searchMode === 'semantic' && (
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      IA
                    </Badge>
                  )}
                  {searchMode === 'voice' && (
                    <Badge variant="secondary" className="text-xs">
                      <Mic className="w-3 h-3 mr-1" />
                      Voz
                    </Badge>
                  )}
                  {searchMode === 'image' && (
                    <Badge variant="secondary" className="text-xs">
                      <Camera className="w-3 h-3 mr-1" />
                      Imagen
                    </Badge>
                  )}
                </div>
              </div>

              <Button onClick={handleSearch} disabled={!query.trim() || searchLoading} data-testid="search-button">
                {searchLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Search Mode Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant={searchMode === 'semantic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleSemanticSearch}
                  data-testid="semantic-search-toggle"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Búsqueda Semántica
                </Button>

                <Button
                  variant={voiceState.isListening ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={voiceState.isListening ? stopVoiceSearch : startVoiceSearch}
                  disabled={!voiceState.isSupported}
                  data-testid="voice-search-button"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  {voiceState.isListening ? 'Detener' : 'Por Voz'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageSearchMutation.isPending}
                  data-testid="image-search-button"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {imageSearchMutation.isPending ? 'Procesando...' : 'Por Imagen'}
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="filters-toggle"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros {showFilters && <ChevronRight className="w-4 h-4 ml-1 rotate-90" />}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros Avanzados
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Region Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Región
                      </label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={filters.region || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value || undefined }))}
                      >
                        <option value="">Todas las regiones</option>
                        <option value="taxco">Taxco, Guerrero</option>
                        <option value="oaxaca">Oaxaca</option>
                        <option value="guadalajara">Guadalajara, Jalisco</option>
                        <option value="yucatan">Yucatán</option>
                      </select>
                    </div>

                    {/* Technique Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center">
                        <Hammer className="w-4 h-4 mr-1" />
                        Técnica Artesanal
                      </label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={filters.technique || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, technique: e.target.value || undefined }))}
                      >
                        <option value="">Todas las técnicas</option>
                        <option value="filigrana">Filigrana</option>
                        <option value="repujado">Repujado</option>
                        <option value="fundicion">Fundición</option>
                        <option value="engaste">Engaste</option>
                      </select>
                    </div>

                    {/* Material Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pureza de Plata</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={filters.purity || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, purity: e.target.value || undefined }))}
                      >
                        <option value="">Cualquier pureza</option>
                        <option value="925">Plata 925 (Ley)</option>
                        <option value="950">Plata 950</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sugerencias de IA:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(suggestion.query)}
                      className="text-xs"
                      data-testid={`suggestion-${index}`}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {suggestion.query}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Búsquedas recientes:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((historyQuery, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuery(historyQuery)}
                      className="text-xs flex items-center"
                      data-testid={`history-${index}`}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {historyQuery}
                      <X 
                        className="w-3 h-3 ml-1 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchHistory(prev => prev.filter((_, i) => i !== index));
                        }}
                      />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4" data-testid="search-results">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Resultados de búsqueda ({searchResults.length})
            </h3>
            {searchMode === 'semantic' && (
              <Badge variant="secondary">
                <Sparkles className="w-3 h-3 mr-1" />
                Ordenado por relevancia IA
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((result) => (
              <Card key={result.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Product Image */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={result.images[0]} 
                        alt={result.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h4 className="font-semibold line-clamp-2">{result.title}</h4>
                      <p className="text-2xl font-bold text-primary">{result.price}</p>
                      
                      {/* Rating */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${
                                i < Math.round(result.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({result.reviewCount})</span>
                      </div>

                      {/* Seller */}
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{result.seller.name}</span>
                        {result.seller.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            Verificado
                          </Badge>
                        )}
                      </div>

                      {/* Match Type */}
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={result.matchType === 'semantic' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {result.matchType === 'semantic' ? 'IA Match' : 
                           result.matchType === 'visual' ? 'Visual' :
                           result.matchType === 'keyword' ? 'Palabra clave' : 'Relevante'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {Math.round(result.relevanceScore * 100)}% relevancia
                        </span>
                      </div>

                      {/* Highlighted Features */}
                      {result.highlightedFeatures.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-700">Características destacadas:</p>
                          <div className="flex flex-wrap gap-1">
                            {result.highlightedFeatures.slice(0, 3).map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Button className="w-full" size="sm">
                      Ver Producto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {query && searchResults.length === 0 && !searchLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron resultados</h3>
            <p className="text-gray-600 mb-4">
              No encontramos productos que coincidan con "{query}". 
              Intenta con otros términos o usa la búsqueda semántica.
            </p>
            <Button onClick={toggleSemanticSearch} variant="outline">
              <Sparkles className="w-4 h-4 mr-2" />
              Probar Búsqueda Semántica
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}