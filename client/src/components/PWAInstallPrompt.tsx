import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/lib/pwa';
import { 
  Download, 
  Smartphone, 
  X, 
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  Star
} from 'lucide-react';

export function PWAInstallPrompt() {
  const [isVisible, setIsVisible] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const {
    canInstall,
    isInstalled,
    isOnline,
    updateAvailable,
    install,
    checkForUpdates,
    requestNotificationPermission
  } = usePWA();

  if (!isVisible || isInstalled || !canInstall) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const installed = await install();
      if (installed) {
        setIsVisible(false);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const handleEnableNotifications = async () => {
    await requestNotificationPermission();
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-primary" />
              <CardTitle className="text-sm">Instalar PlataMX</CardTitle>
              <Badge variant="secondary" className="text-xs">
                Gratis
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            Instala la app para una experiencia completa
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Features */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <Star className="w-3 h-3 text-yellow-500" />
              <span>Acceso offline a productos favoritos</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Bell className="w-3 h-3 text-blue-500" />
              <span>Notificaciones de ofertas especiales</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Smartphone className="w-3 h-3 text-green-500" />
              <span>Experiencia nativa móvil</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <RefreshCw className="w-3 h-3 text-purple-500" />
              <span>Sincronización automática</span>
            </div>
          </div>

          {/* Network Status */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">En línea</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-red-500" />
                  <span className="text-red-600">Sin conexión</span>
                </>
              )}
            </div>
            
            {updateAvailable && (
              <Badge variant="secondary" className="text-xs animate-pulse">
                Actualización disponible
              </Badge>
            )}
          </div>

          {/* Install Button */}
          <Button
            onClick={handleInstall}
            disabled={isInstalling}
            className="w-full"
            size="sm"
            data-testid="pwa-install-button"
          >
            {isInstalling ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Instalando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Instalar App
              </>
            )}
          </Button>

          {/* Secondary Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEnableNotifications}
              className="text-xs"
            >
              <Bell className="w-3 h-3 mr-1" />
              Notificaciones
            </Button>

            <Button
              variant="ghost" 
              size="sm"
              onClick={checkForUpdates}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Buscar updates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}