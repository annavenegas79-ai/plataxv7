import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth-store";
import { login } from "@/lib/auth";
import { useLocation } from "wouter";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setAuth } = useAuthStore();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(email, password);
      setAuth(response.user); // Solo pasamos el usuario, las cookies se manejan automáticamente
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Error de autenticación",
        description: error.message || "Credenciales inválidas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-login">
      <div>
        <Label htmlFor="email" className="block text-sm font-medium text-silver-700 mb-2">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-silver-200 rounded-lg focus:border-gold-400 focus:outline-none transition-colors"
          placeholder="tu@email.com"
          required
          data-testid="input-email"
        />
      </div>
      
      <div>
        <Label htmlFor="password" className="block text-sm font-medium text-silver-700 mb-2">
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-silver-200 rounded-lg focus:border-gold-400 focus:outline-none transition-colors"
          placeholder="••••••••"
          required
          data-testid="input-password"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input 
            type="checkbox" 
            className="rounded border-silver-300 text-gold-500 focus:ring-gold-400"
            data-testid="checkbox-remember"
          />
          <span className="ml-2 text-sm text-silver-600">Recordarme</span>
        </label>
        <a href="#" className="text-sm text-gold-500 hover:text-gold-600 transition-colors" data-testid="link-forgot-password">
          ¿Olvidaste tu contraseña?
        </a>
      </div>
      
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gold-500 hover:bg-gold-600 text-white py-3 rounded-lg font-semibold transition-colors"
        data-testid="button-login"
      >
        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
      </Button>
    </form>
  );
}
