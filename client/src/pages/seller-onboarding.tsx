import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Store, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowRight, 
  Shield,
  DollarSign,
  TrendingUp,
  Users
} from "lucide-react";

interface SellerProfile {
  id: number;
  userId: number;
  storeName: string;
  bio?: string;
  silverCheck: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected';
  kycDocs?: any;
  createdAt: string;
  updatedAt: string;
}

export default function SellerOnboarding() {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);

  // Get seller profile to check current status
  const { data: profile, isLoading } = useQuery<SellerProfile>({
    queryKey: ["/api/seller/profile"],
    retry: false
  });

  const steps = [
    {
      id: 1,
      title: "Crear cuenta vendedor",
      description: "Registra tu cuenta como vendedor",
      icon: Store,
      completed: user?.role === 'vendedor'
    },
    {
      id: 2,
      title: "Completar perfil",
      description: "Completa la información de tu tienda",
      icon: FileText,
      completed: !!profile
    },
    {
      id: 3,
      title: "Verificación KYC",
      description: "Sube tus documentos para verificación",
      icon: Shield,
      completed: profile?.kycStatus === 'approved'
    },
    {
      id: 4,
      title: "¡Empezar a vender!",
      description: "Publica tus productos y comienza a vender",
      icon: TrendingUp,
      completed: profile?.kycStatus === 'approved'
    }
  ];

  const getStepProgress = () => {
    const completedSteps = steps.filter(step => step.completed).length;
    return (completedSteps / steps.length) * 100;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobado
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En revisión
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazado
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-silver-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-silver-200 rounded w-1/3" />
            <div className="h-64 bg-silver-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-silver-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-silver-800 mb-4" data-testid="heading-onboarding">
            ¡Bienvenido a PlataMX Vendedores!
          </h1>
          <p className="text-silver-600 text-lg">
            Sigue estos pasos para configurar tu tienda y empezar a vender
          </p>
        </div>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Progreso de configuración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-silver-700">
                  Progreso general
                </span>
                <span className="text-sm text-silver-600">
                  {Math.round(getStepProgress())}% completo
                </span>
              </div>
              <Progress value={getStepProgress()} className="w-full" />
              
              {profile?.kycStatus && (
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-sm text-silver-600">Estado de verificación:</span>
                  {getStatusBadge(profile.kycStatus)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCurrentStep = !step.completed && steps.slice(0, index).every(s => s.completed);
            
            return (
              <Card 
                key={step.id} 
                className={`transition-all ${
                  step.completed 
                    ? 'border-green-200 bg-green-50' 
                    : isCurrentStep 
                      ? 'border-gold-200 bg-gold-50 shadow-md' 
                      : 'border-silver-200'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${step.completed 
                        ? 'bg-green-500 text-white' 
                        : isCurrentStep 
                          ? 'bg-gold-500 text-white' 
                          : 'bg-silver-200 text-silver-500'
                      }
                    `}>
                      {step.completed ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-silver-800">
                        {step.title}
                      </h3>
                      <p className="text-silver-600">
                        {step.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {step.completed && (
                        <Badge className="bg-green-100 text-green-800">
                          Completado
                        </Badge>
                      )}
                      
                      {isCurrentStep && (
                        <Button 
                          onClick={() => {
                            if (step.id === 1 && user?.role !== 'vendedor') {
                              window.location.href = '/auth';
                            } else if (step.id === 2 || step.id === 3) {
                              window.location.href = '/seller/verification';
                            } else if (step.id === 4) {
                              window.location.href = '/seller';
                            }
                          }}
                          className="bg-gold-500 hover:bg-gold-600 text-white"
                          data-testid={`button-step-${step.id}`}
                        >
                          {step.id === 1 && user?.role !== 'vendedor' ? 'Crear Cuenta' : 'Continuar'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Beneficios de vender en PlataMX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-gold-600" />
                </div>
                <h4 className="font-semibold text-silver-800 mb-2">
                  Audiencia Especializada
                </h4>
                <p className="text-sm text-silver-600">
                  Accede a clientes que buscan específicamente joyas de plata de calidad
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-gold-600" />
                </div>
                <h4 className="font-semibold text-silver-800 mb-2">
                  Transacciones Seguras
                </h4>
                <p className="text-sm text-silver-600">
                  Sistema de pagos protegido que garantiza la seguridad de todas las transacciones
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-gold-600" />
                </div>
                <h4 className="font-semibold text-silver-800 mb-2">
                  Comisiones Competitivas
                </h4>
                <p className="text-sm text-silver-600">
                  Solo 5% de comisión por venta, una de las más bajas del mercado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>¿Necesitas ayuda?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-silver-600 mb-4">
              Si tienes alguna pregunta durante el proceso de configuración, no dudes en contactarnos.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" data-testid="button-help">
                <FileText className="w-4 h-4 mr-2" />
                Ver Guía
              </Button>
              <Button variant="outline" data-testid="button-support">
                Contactar Soporte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps for Completed */}
        {profile?.kycStatus === 'approved' && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                ¡Verificación completada!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-4">
                ¡Felicidades! Tu cuenta ha sido verificada y ya puedes empezar a vender en PlataMX.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => window.location.href = '/seller'}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-go-dashboard"
                >
                  Ir al Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/products/create'}
                  data-testid="button-create-product"
                >
                  Crear Primer Producto
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}