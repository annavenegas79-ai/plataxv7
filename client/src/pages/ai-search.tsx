import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AiSearch } from '@/components/AiSearch';
import { SmartRecommendations } from '@/components/SmartRecommendations';
import { 
  Search,
  Sparkles,
  Mic,
  Camera,
  Brain,
  Zap
} from 'lucide-react';
import { Link } from 'wouter';

export default function AiSearchPage() {
  const [searchMode, setSearchMode] = useState<'text' | 'voice' | 'image' | 'semantic'>('text');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-yellow-400/20 rounded-full blur-lg animate-pulse" />
              <div className="relative bg-primary text-white rounded-full p-4">
                <Brain className="w-8 h-8" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent mb-4">
            Búsqueda Inteligente con IA
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Encuentra exactamente lo que buscas usando inteligencia artificial avanzada, 
            búsqueda por voz, reconocimiento de imágenes y recomendaciones personalizadas.
          </p>
        </div>

        {/* Search Modes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              Modos de Búsqueda Inteligente
            </CardTitle>
            <CardDescription>
              Elige el método que mejor se adapte a tu necesidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                variant={searchMode === 'text' ? 'default' : 'outline'}
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setSearchMode('text')}
                data-testid="search-mode-text"
              >
                <Search className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">Texto</div>
                  <div className="text-xs opacity-70">Búsqueda tradicional mejorada</div>
                </div>
              </Button>

              <Button
                variant={searchMode === 'semantic' ? 'default' : 'outline'}
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setSearchMode('semantic')}
                data-testid="search-mode-semantic"
              >
                <Brain className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">Semántica</div>
                  <div className="text-xs opacity-70">Comprende el significado</div>
                </div>
              </Button>

              <Button
                variant={searchMode === 'voice' ? 'default' : 'outline'}
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setSearchMode('voice')}
                data-testid="search-mode-voice"
              >
                <Mic className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">Voz</div>
                  <div className="text-xs opacity-70">Habla naturalmente</div>
                </div>
              </Button>

              <Button
                variant={searchMode === 'image' ? 'default' : 'outline'}
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setSearchMode('image')}
                data-testid="search-mode-image"
              >
                <Camera className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">Imagen</div>
                  <div className="text-xs opacity-70">Buscar por foto</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Search Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Component */}
          <div className="lg:col-span-2">
            <Card className="h-fit">
              <CardContent className="p-6">
                <AiSearch 
                  mode={searchMode}
                  showModeSelector={false}
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/products">
                    <Search className="w-4 h-4 mr-2" />
                    Explorar Catálogo
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/categories">
                    <Search className="w-4 h-4 mr-2" />
                    Por Categoría
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Search Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Consejos de Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="space-y-2">
                  <div className="font-medium">Prueba estas búsquedas:</div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">anillo boda</Badge>
                    <Badge variant="outline" className="text-xs">collar Taxco</Badge>
                    <Badge variant="outline" className="text-xs">aretes turquesa</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Smart Recommendations Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Recomendaciones Inteligentes</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Productos seleccionados especialmente para ti usando inteligencia artificial
            </p>
          </div>
          
          <SmartRecommendations 
            algorithms={['personalized', 'trending', 'collaborative']}
            showAlgorithmInfo={true}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          />
        </div>
      </div>
    </div>
  );
}