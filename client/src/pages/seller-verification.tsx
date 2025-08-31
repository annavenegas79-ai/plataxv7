import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, Clock, XCircle, Store } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

export default function SellerVerification() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [documents, setDocuments] = useState<{[key: string]: File}>({});
  const [formData, setFormData] = useState({
    storeName: "",
    bio: "",
    businessName: "",
    taxId: "",
    address: "",
    phone: ""
  });

  // Get seller profile
  const { data: profile, isLoading: profileLoading } = useQuery<SellerProfile>({
    queryKey: ["/api/seller/profile"],
    retry: false
  });

  // Create seller profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/seller/profile", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/profile"] });
      toast({
        title: "Perfil creado",
        description: "Tu perfil de vendedor ha sido creado exitosamente."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear el perfil",
        variant: "destructive"
      });
    }
  });

  // Update seller profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/seller/profile", {
        method: "PUT",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/profile"] });
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada exitosamente."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el perfil",
        variant: "destructive"
      });
    }
  });

  const handleFileChange = (documentType: string, file: File | null) => {
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [documentType]: file
      }));
    } else {
      const newDocs = { ...documents };
      delete newDocs[documentType];
      setDocuments(newDocs);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      // Create new profile
      const profileData = {
        storeName: formData.storeName,
        bio: formData.bio,
        kycDocs: {
          businessName: formData.businessName,
          taxId: formData.taxId,
          address: formData.address,
          phone: formData.phone,
          documents: Object.keys(documents) // In a real app, you'd upload files to storage
        }
      };
      createProfileMutation.mutate(profileData);
    } else {
      // Update existing profile
      const updateData = {
        storeName: formData.storeName,
        bio: formData.bio,
        kycDocs: {
          ...profile.kycDocs,
          businessName: formData.businessName,
          taxId: formData.taxId,
          address: formData.address,
          phone: formData.phone,
          documents: Object.keys(documents)
        }
      };
      updateProfileMutation.mutate(updateData);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800" data-testid="badge-approved">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobado
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800" data-testid="badge-pending">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800" data-testid="badge-rejected">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazado
          </Badge>
        );
      default:
        return null;
    }
  };

  if (profileLoading) {
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

  // Initialize form data with existing profile data
  if (profile && !formData.storeName) {
    setFormData({
      storeName: profile.storeName || "",
      bio: profile.bio || "",
      businessName: profile.kycDocs?.businessName || "",
      taxId: profile.kycDocs?.taxId || "",
      address: profile.kycDocs?.address || "",
      phone: profile.kycDocs?.phone || ""
    });
  }

  return (
    <div className="min-h-screen bg-silver-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Store className="w-8 h-8 text-gold-500" />
          <div>
            <h1 className="text-3xl font-bold text-silver-800" data-testid="heading-verification">
              Verificación de Vendedor
            </h1>
            <p className="text-silver-600 mt-1">
              Completa tu verificación para empezar a vender en PlataMX
            </p>
          </div>
        </div>

        {profile && (
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              Estado actual de verificación: {getStatusBadge(profile.kycStatus)}
              {profile.kycStatus === 'approved' && (
                <span className="text-green-600">¡Ya puedes empezar a vender!</span>
              )}
              {profile.kycStatus === 'rejected' && (
                <span className="text-red-600">Revisa y actualiza tu información</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de la tienda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Información de tu Tienda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="storeName">Nombre de la tienda *</Label>
                <Input
                  id="storeName"
                  value={formData.storeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, storeName: e.target.value }))}
                  placeholder="Mi Tienda de Plata"
                  required
                  data-testid="input-store-name"
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Descripción de tu tienda</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Describe tu tienda, especialidades, años de experiencia..."
                  rows={3}
                  data-testid="textarea-bio"
                />
              </div>
            </CardContent>
          </Card>

          {/* Información comercial */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Información Comercial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Nombre del negocio *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Nombre legal del negocio"
                    required
                    data-testid="input-business-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="taxId">RFC *</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                    placeholder="ABCD123456789"
                    required
                    data-testid="input-tax-id"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Dirección del negocio *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Calle, número, colonia, ciudad, estado"
                  required
                  data-testid="input-address"
                />
              </div>

              <div>
                <Label htmlFor="phone">Teléfono de contacto *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+52 55 1234 5678"
                  required
                  data-testid="input-phone"
                />
              </div>
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Documentos Requeridos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-silver-600">
                Sube los siguientes documentos para completar tu verificación:
              </p>

              {[
                { key: "cedula", label: "Cédula de identidad o INE", required: true },
                { key: "rfc", label: "Constancia de situación fiscal", required: true },
                { key: "comprobante", label: "Comprobante de domicilio", required: true },
                { key: "banco", label: "Estado de cuenta bancario", required: false }
              ].map((doc) => (
                <div key={doc.key} className="border border-silver-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">
                      {doc.label} {doc.required && "*"}
                    </Label>
                    {documents[doc.key] && (
                      <Badge variant="outline" className="text-green-600">
                        Archivo seleccionado
                      </Badge>
                    )}
                  </div>
                  
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(doc.key, e.target.files?.[0] || null)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100"
                    data-testid={`input-file-${doc.key}`}
                  />
                  
                  {documents[doc.key] && (
                    <p className="text-sm text-green-600 mt-1">
                      Archivo: {documents[doc.key].name}
                    </p>
                  )}
                </div>
              ))}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Los documentos deben estar en formato PDF, JPG o PNG. 
                  Tamaño máximo: 5MB por archivo.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="bg-gold-500 hover:bg-gold-600 text-white"
              disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
              data-testid="button-submit-verification"
            >
              {createProfileMutation.isPending || updateProfileMutation.isPending ? (
                "Procesando..."
              ) : profile ? (
                "Actualizar Información"
              ) : (
                "Enviar Verificación"
              )}
            </Button>
            
            {profile?.kycStatus === 'approved' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
                data-testid="button-go-dashboard"
              >
                Ir al Dashboard
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}