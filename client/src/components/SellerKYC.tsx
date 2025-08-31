import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Building,
  CreditCard,
  Phone
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface KYCStatus {
  status: 'not_started' | 'pending' | 'approved' | 'rejected';
  completionPercentage: number;
  documents: {
    identification: boolean;
    proofOfAddress: boolean;
    businessLicense: boolean;
    bankStatement: boolean;
  };
  verificationBadges: {
    silverCheck: boolean;
    artisanVerified: boolean;
    businessVerified: boolean;
  };
}

export function SellerKYC() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // Fetch KYC status
  const { data: kycStatus, isLoading } = useQuery<KYCStatus>({
    queryKey: ['/api/seller/kyc/status'],
    retry: false
  });

  // Document upload mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ type, file }: { type: string; file: File }) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);
      
      const response = await fetch('/api/seller/kyc/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error uploading document');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/kyc/status'] });
      toast({
        title: "Documento subido",
        description: `${getDocumentName(variables.type)} se subió correctamente`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo subir el documento",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploadingDoc(null);
    }
  });

  // Submit KYC for review mutation
  const submitKYCMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/seller/kyc/submit');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/kyc/status'] });
      toast({
        title: "KYC Enviado",
        description: "Tu solicitud de verificación ha sido enviada para revisión",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la solicitud",
        variant: "destructive",
      });
    }
  });

  const handleDocumentUpload = (type: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El archivo debe ser menor a 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato no válido",
        description: "Solo se permiten archivos JPG, PNG o PDF",
        variant: "destructive",
      });
      return;
    }

    setUploadingDoc(type);
    uploadDocumentMutation.mutate({ type, file });
  };

  const getDocumentName = (type: string): string => {
    const names = {
      identification: 'Identificación Oficial',
      proofOfAddress: 'Comprobante de Domicilio',
      businessLicense: 'Licencia de Negocio',
      bankStatement: 'Estado de Cuenta'
    };
    return names[type as keyof typeof names] || type;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const canSubmitForReview = kycStatus && 
    Object.values(kycStatus.documents).every(doc => doc) &&
    kycStatus.status === 'not_started';

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="kyc-loading">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!kycStatus) {
    return (
      <div className="container mx-auto px-4 py-8 text-center" data-testid="kyc-error">
        <p className="text-gray-600 dark:text-gray-400">No se pudo cargar el estado de verificación.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="seller-kyc">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Verificación de Vendedor (KYC)
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Verifica tu identidad para obtener el badge de vendedor verificado
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(kycStatus.status)}
            <Badge className={getStatusColor(kycStatus.status)} data-testid="kyc-status-badge">
              {kycStatus.status === 'approved' ? 'Aprobado' : 
               kycStatus.status === 'pending' ? 'En Revisión' : 
               kycStatus.status === 'rejected' ? 'Rechazado' : 'No Iniciado'}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Progreso de Verificación</span>
              <span className="text-2xl font-bold text-primary" data-testid="completion-percentage">
                {kycStatus.completionPercentage}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={kycStatus.completionPercentage} className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className={`w-5 h-5 ${kycStatus.verificationBadges.silverCheck ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-sm">Badge de Plata Verificada</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`w-5 h-5 ${kycStatus.verificationBadges.artisanVerified ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-sm">Artesano Certificado</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`w-5 h-5 ${kycStatus.verificationBadges.businessVerified ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-sm">Negocio Verificado</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Messages */}
        {kycStatus.status === 'approved' && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    ¡Verificación Completada!
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mt-1">
                    Tu cuenta ha sido verificada exitosamente. Ahora tienes acceso a todas las funcionalidades
                    de vendedor verificado, incluyendo el badge de plata verificada y mayor visibilidad en el marketplace.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {kycStatus.status === 'pending' && (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Verificación en Proceso
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                    Tu solicitud está siendo revisada por nuestro equipo. Este proceso puede tomar de 2-5 días hábiles.
                    Te notificaremos por email cuando tengamos una respuesta.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {kycStatus.status === 'rejected' && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200">
                    Verificación Rechazada
                  </h3>
                  <p className="text-red-700 dark:text-red-300 mt-1">
                    Tu solicitud de verificación fue rechazada. Por favor, revisa los documentos requeridos
                    y asegúrate de que sean legibles y válidos. Puedes volver a solicitar la verificación
                    subiendo nuevos documentos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Required Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Documentos Requeridos</span>
              </CardTitle>
              <CardDescription>
                Sube los siguientes documentos para verificar tu identidad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Identification */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Identificación Oficial</span>
                  </Label>
                  {kycStatus.documents.identification && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  INE, Pasaporte, Cédula Profesional (ambos lados)
                </p>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => handleDocumentUpload('identification', e)}
                    disabled={uploadingDoc === 'identification' || kycStatus.documents.identification}
                    data-testid="upload-identification"
                  />
                  {uploadingDoc === 'identification' && (
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Proof of Address */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>Comprobante de Domicilio</span>
                  </Label>
                  {kycStatus.documents.proofOfAddress && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recibo de luz, agua, gas o teléfono (no mayor a 3 meses)
                </p>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => handleDocumentUpload('proofOfAddress', e)}
                    disabled={uploadingDoc === 'proofOfAddress' || kycStatus.documents.proofOfAddress}
                    data-testid="upload-proof-address"
                  />
                  {uploadingDoc === 'proofOfAddress' && (
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Business License */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>Licencia de Negocio (Opcional)</span>
                  </Label>
                  {kycStatus.documents.businessLicense && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  RFC, Licencia Municipal, Registro de Artesano
                </p>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => handleDocumentUpload('businessLicense', e)}
                    disabled={uploadingDoc === 'businessLicense' || kycStatus.documents.businessLicense}
                    data-testid="upload-business-license"
                  />
                  {uploadingDoc === 'businessLicense' && (
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Bank Statement */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Estado de Cuenta</span>
                  </Label>
                  {kycStatus.documents.bankStatement && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Estado de cuenta bancario (no mayor a 3 meses)
                </p>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => handleDocumentUpload('bankStatement', e)}
                    disabled={uploadingDoc === 'bankStatement' || kycStatus.documents.bankStatement}
                    data-testid="upload-bank-statement"
                  />
                  {uploadingDoc === 'bankStatement' && (
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Beneficios de Verificación</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Badge de Plata Verificada</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Muestra tu autenticidad con un badge especial en todos tus productos
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Mayor Visibilidad</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tus productos aparecen primero en los resultados de búsqueda
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Confianza del Cliente</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Los compradores prefieren vendedores verificados
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Acceso Prioritario</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Soporte prioritario y nuevas funcionalidades primero
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Certificado de Autenticidad</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Certificados digitales para tus productos de plata mexicana
                    </p>
                  </div>
                </div>
              </div>

              {canSubmitForReview && (
                <div className="pt-4 border-t">
                  <Button 
                    onClick={() => submitKYCMutation.mutate()}
                    disabled={submitKYCMutation.isPending}
                    className="w-full"
                    data-testid="submit-kyc"
                  >
                    {submitKYCMutation.isPending ? 'Enviando...' : 'Enviar para Revisión'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200">
                  Seguridad y Privacidad
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Todos tus documentos están protegidos con encriptación de nivel bancario. Solo son accesibles
                  por nuestro equipo de verificación certificado y se eliminan automáticamente después de 
                  completar el proceso de verificación.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}