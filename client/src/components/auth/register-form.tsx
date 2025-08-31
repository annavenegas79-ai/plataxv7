import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth-store";
import { register } from "@/lib/auth";
import { useLocation } from "wouter";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "cliente",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setAuth } = useAuthStore();
  const [, setLocation] = useLocation();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await register(formData);
      setAuth(response.user); // Solo pasamos el usuario, las cookies se manejan automáticamente
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta se ha creado exitosamente.",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Error al registrarse",
        description: error.message || "No se pudo crear la cuenta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-register">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="block text-sm font-medium text-silver-700 mb-2">
            Nombre
          </Label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="w-full px-4 py-3 border border-silver-200 rounded-lg focus:border-gold-400 focus:outline-none transition-colors"
            placeholder="Juan"
            required
            data-testid="input-firstname"
          />
        </div>
        
        <div>
          <Label htmlFor="lastName" className="block text-sm font-medium text-silver-700 mb-2">
            Apellido
          </Label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="w-full px-4 py-3 border border-silver-200 rounded-lg focus:border-gold-400 focus:outline-none transition-colors"
            placeholder="Pérez"
            required
            data-testid="input-lastname"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="username" className="block text-sm font-medium text-silver-700 mb-2">
          Nombre de usuario
        </Label>
        <Input
          id="username"
          type="text"
          value={formData.username}
          onChange={(e) => handleChange("username", e.target.value)}
          className="w-full px-4 py-3 border border-silver-200 rounded-lg focus:border-gold-400 focus:outline-none transition-colors"
          placeholder="juanperez"
          required
          data-testid="input-username"
        />
      </div>
      
      <div>
        <Label htmlFor="email" className="block text-sm font-medium text-silver-700 mb-2">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full px-4 py-3 border border-silver-200 rounded-lg focus:border-gold-400 focus:outline-none transition-colors"
          placeholder="juan@email.com"
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
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          className="w-full px-4 py-3 border border-silver-200 rounded-lg focus:border-gold-400 focus:outline-none transition-colors"
          placeholder="••••••••"
          required
          data-testid="input-password"
        />
      </div>
      
      <div>
        <Label htmlFor="role" className="block text-sm font-medium text-silver-700 mb-2">
          Tipo de cuenta
        </Label>
        <Select onValueChange={(value) => handleChange("role", value)} defaultValue="cliente">
          <SelectTrigger data-testid="select-role">
            <SelectValue placeholder="Selecciona el tipo de cuenta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cliente">Cliente</SelectItem>
            <SelectItem value="vendedor">Vendedor</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gold-500 hover:bg-gold-600 text-white py-3 rounded-lg font-semibold transition-colors"
        data-testid="button-register"
      >
        {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
      </Button>
    </form>
  );
}
