import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gem } from "lucide-react";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { useAuthStore } from "@/store/auth-store";

export default function Auth() {
  const [location, navigate] = useLocation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    // Check URL params for mode
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const mode = urlParams.get('mode');
    if (mode === 'register') {
      setActiveTab('register');
    }
  }, [location]);

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (user) {
    return null; // Will redirect above
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-silver-100 via-white to-silver-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-silver-400 to-silver-600 rounded-full flex items-center justify-center">
                <Gem className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-silver-800 mb-2" data-testid="text-auth-title">
                Bienvenido a PlataMX
              </h1>
              <p className="text-silver-600" data-testid="text-auth-subtitle">
                {activeTab === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta para comenzar'}
              </p>
            </div>

            {/* Auth Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="tab-login">
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">
                  Registrarse
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <LoginForm />
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <RegisterForm />
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="text-center mt-8 pt-6 border-t border-silver-200">
              <p className="text-sm text-silver-600">
                ¿Problemas para acceder?{" "}
                <a href="#" className="text-gold-500 hover:text-gold-600 font-medium transition-colors" data-testid="link-help">
                  Contacta soporte
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="text-silver-600">
            <div className="w-8 h-8 mx-auto mb-2 text-gold-500">
              ✓
            </div>
            <p className="text-xs">Productos auténticos</p>
          </div>
          <div className="text-silver-600">
            <div className="w-8 h-8 mx-auto mb-2 text-gold-500">
              ✓
            </div>
            <p className="text-xs">Vendedores verificados</p>
          </div>
          <div className="text-silver-600">
            <div className="w-8 h-8 mx-auto mb-2 text-gold-500">
              ✓
            </div>
            <p className="text-xs">Envío seguro</p>
          </div>
        </div>
      </div>
    </div>
  );
}
