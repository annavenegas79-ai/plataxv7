import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertVendorSchema } from "@shared/schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import { Store, Building, UserCheck, Shield } from "lucide-react";

const createVendorFormSchema = insertVendorSchema.omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true,
  totalSales: true,
  totalOrders: true,
  averageRating: true,
  verifiedAt: true 
}).extend({
  businessName: z.string().min(2, "El nombre del negocio debe tener al menos 2 caracteres"),
  businessType: z.enum(["artisan", "distributor", "manufacturer"], {
    required_error: "Debes seleccionar un tipo de negocio"
  }),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").optional().or(z.literal("")),
  email: z.string().email("Ingresa un email válido").optional().or(z.literal("")),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos").optional().or(z.literal("")),
  website: z.string().url("Ingresa una URL válida").optional().or(z.literal("")),
});

type CreateVendorForm = z.infer<typeof createVendorFormSchema>;

export default function CreateVendor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const form = useForm<CreateVendorForm>({
    resolver: zodResolver(createVendorFormSchema),
    defaultValues: {
      businessName: "",
      businessType: "artisan",
      description: "",
      email: "",
      phone: "",
      website: "",
      taxId: "",
      businessRegistration: "",
      commissionRate: "5.00",
      subscriptionTier: "basic",
      monthlyFee: 0,
      status: "pending",
      verificationLevel: "basic",
      responseTime: 24,
      autoAcceptOrders: false,
      shippingPolicy: "",
      returnPolicy: ""
    },
  });

  const createVendorMutation = useMutation({
    mutationFn: async (data: CreateVendorForm) => {
      return await apiRequest("POST", "/api/vendors", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors/me"] });
      toast({
        title: "¡Perfil creado exitosamente!",
        description: "Tu perfil de vendedor ha sido enviado para revisión. Te notificaremos cuando sea aprobado.",
      });
      navigate("/vendor/dashboard");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el perfil de vendedor. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateVendorForm) => {
    createVendorMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Store className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-create-vendor-title">
            Únete como Vendedor
          </h1>
          <p className="text-muted-foreground" data-testid="text-create-vendor-description">
            Comparte tus productos de plata mexicana con miles de clientes
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">1. Registro</h3>
            <p className="text-sm text-muted-foreground">
              Completa tu información empresarial
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">2. Verificación</h3>
            <p className="text-sm text-muted-foreground">
              Revisamos tu documentación
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">3. Venta</h3>
            <p className="text-sm text-muted-foreground">
              Comienza a vender tus productos
            </p>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Business Information */}
            <Card data-testid="card-business-info">
              <CardHeader>
                <CardTitle>Información del Negocio</CardTitle>
                <CardDescription>
                  Datos básicos de tu empresa o negocio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Negocio *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: Joyería Azteca" 
                            {...field} 
                            data-testid="input-business-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Negocio *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-business-type">
                              <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="artisan">Artesano/a</SelectItem>
                            <SelectItem value="distributor">Distribuidor</SelectItem>
                            <SelectItem value="manufacturer">Fabricante</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción del Negocio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe tu negocio, tus productos y lo que te hace único..."
                          className="min-h-[100px]"
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormDescription>
                        Esta información será visible para los compradores
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card data-testid="card-contact-info">
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
                <CardDescription>
                  Datos para comunicarnos contigo y que los clientes te contacten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email del Negocio</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="contacto@mipagina.com" 
                            {...field} 
                            data-testid="input-business-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="55 1234 5678" 
                            {...field} 
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sitio Web</FormLabel>
                      <FormControl>
                        <Input 
                          type="url"
                          placeholder="https://www.mipagina.com" 
                          {...field} 
                          data-testid="input-website"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Legal Information */}
            <Card data-testid="card-legal-info">
              <CardHeader>
                <CardTitle>Información Legal</CardTitle>
                <CardDescription>
                  Documentación para verificar tu negocio (opcional pero recomendada)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RFC</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ABCD123456EFG" 
                            {...field} 
                            data-testid="input-tax-id"
                          />
                        </FormControl>
                        <FormDescription>
                          Registro Federal de Contribuyentes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessRegistration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registro Empresarial</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Número de registro mercantil" 
                            {...field} 
                            data-testid="input-business-registration"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Policies */}
            <Card data-testid="card-policies">
              <CardHeader>
                <CardTitle>Políticas de Venta</CardTitle>
                <CardDescription>
                  Define tus políticas de envío y devoluciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="shippingPolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Política de Envíos</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe tus opciones de envío, tiempos de entrega, costos, etc."
                          className="min-h-[80px]"
                          {...field}
                          data-testid="textarea-shipping-policy"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="returnPolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Política de Devoluciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe tus condiciones para devoluciones y reembolsos"
                          className="min-h-[80px]"
                          {...field}
                          data-testid="textarea-return-policy"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="px-12 py-3"
                disabled={createVendorMutation.isPending}
                data-testid="button-submit-vendor-application"
              >
                {createVendorMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-background border-t-transparent rounded-full mr-2" />
                    Creando perfil...
                  </>
                ) : (
                  "Enviar Solicitud"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}