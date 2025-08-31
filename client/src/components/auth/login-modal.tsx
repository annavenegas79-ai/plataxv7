import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X, Shield, Heart } from "lucide-react";
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiRequest("POST", "/api/auth/login", data),
    onSuccess: (user) => {
      setAuth(user);
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
      onClose();
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Credenciales inválidas. Verifica tu email y contraseña.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: { email: string; password: string; firstName: string; lastName: string }) =>
      apiRequest("POST", "/api/auth/register", data),
    onSuccess: (user) => {
      setAuth(user);
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta se ha creado exitosamente.",
      });
      onClose();
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la cuenta. El email puede estar ya registrado.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ email, password, firstName, lastName });
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setIsLogin(true);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-auto bg-white rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="relative p-6 pb-4 bg-gradient-to-r from-gold-50 to-silver-50">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-full transition-colors"
            data-testid="button-close-modal"
          >
            <X className="w-5 h-5 text-silver-600" />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-silver-800 mb-2" data-testid="heading-auth-modal">
              {isLogin ? "Inicia sesión" : "Registrate/Inicia sesión"}
            </h2>
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <Shield className="w-4 h-4" />
              <span>Tu información está protegida</span>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-2">
          {/* Promotional Message */}
          {!isLogin && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <Heart className="w-4 h-4" />
                <span className="font-medium">Los nuevos compradores obtienen hasta un -20% dto.</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" className="text-silver-700">Nombre</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="border-silver-200 focus:border-gold-500"
                    data-testid="input-first-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-silver-700">Apellido</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="border-silver-200 focus:border-gold-500"
                    data-testid="input-last-name"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-silver-700">Email o número de teléfono</Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-silver-200 focus:border-gold-500 h-12 text-base"
                data-testid="input-email"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-silver-700">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-silver-200 focus:border-gold-500 h-12 text-base"
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending || registerMutation.isPending}
              className="w-full h-12 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold rounded-lg text-base"
              data-testid="button-submit-auth"
            >
              {loginMutation.isPending || registerMutation.isPending 
                ? "Procesando..." 
                : "Continuar"
              }
            </Button>
          </form>

          {/* Toggle Login/Register */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gold-600 hover:text-gold-700 underline"
              data-testid="button-toggle-auth"
            >
              {isLogin 
                ? "¿Tienes problemas al iniciar sesión? Crear cuenta" 
                : "¿Ya tienes cuenta? Inicia sesión"
              }
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <Separator />
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-white px-4 text-sm text-silver-500 text-center">
              Acceso rápido con
            </span>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 border-silver-200 hover:bg-silver-50"
              data-testid="button-google-auth"
            >
              <FaGoogle className="w-5 h-5 text-red-500" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 border-silver-200 hover:bg-silver-50"
              data-testid="button-facebook-auth"
            >
              <FaFacebook className="w-5 h-5 text-blue-600" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 border-silver-200 hover:bg-silver-50"
              data-testid="button-apple-auth"
            >
              <FaApple className="w-5 h-5 text-black" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 border-silver-200 hover:bg-silver-50"
              data-testid="button-twitter-auth"
            >
              <FaXTwitter className="w-5 h-5 text-black" />
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-silver-500">
              Al continuar, confirmas ser mayor de edad y aceptas nuestro{" "}
              <a href="#" className="text-gold-600 hover:underline">
                Acuerdo de Membresía Gratuita de PlataMX
              </a>{" "}
              y{" "}
              <a href="#" className="text-gold-600 hover:underline">
                Políticas de Privacidad
              </a>
              . Tu información podrá utilizarse con fines promocionales, pero puedes rechazarla en cualquier momento.
            </p>
          </div>

          <div className="mt-4 text-center">
            <button className="text-xs text-silver-400 hover:text-silver-600 underline">
              ¿Por qué escoger una aplicación?
            </button>
          </div>

          {/* Location */}
          <div className="mt-4 text-center">
            <span className="text-xs text-silver-500">
              Localización: <span className="font-medium">México 🇲🇽</span>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}