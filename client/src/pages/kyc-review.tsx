import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  User,
  Store,
  Phone,
  MapPin,
  Hash
} from "lucide-react";

interface SellerProfile {
  id: number;
  userId: number;
  storeName: string;
  bio?: string;
  silverCheck: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected';
  kycDocs?: {
    businessName: string;
    taxId: string;
    address: string;
    phone: string;
    documents: string[];
  };
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isVerified: boolean;
  };
}

export default function KYCReview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<SellerProfile | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  // Get pending KYC requests
  const { data: pendingRequests, isLoading } = useQuery<SellerProfile[]>({
    queryKey: ["/api/admin/kyc/pending"]
  });

  // Update KYC status mutation
  const updateKycMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: string }) => {
      return apiRequest(`/api/admin/kyc/${userId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc/stats"] });
      setSelectedRequest(null);
      setReviewNote("");
      toast({
        title: "Estado actualizado",
        description: "El estado de verificación ha sido actualizado exitosamente."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el estado",
        variant: "destructive"
      });
    }
  });

  const handleApprove = (userId: number) => {
    updateKycMutation.mutate({ userId, status: 'approved' });
  };

  const handleReject = (userId: number) => {
    updateKycMutation.mutate({ userId, status: 'rejected' });
  };

  const getStatusBadge = (status: string) => {
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
            Pendiente
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-silver-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-silver-200 rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-silver-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-silver-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-gold-500" />
          <div>
            <h1 className="text-3xl font-bold text-silver-800" data-testid="heading-kyc-review">
              Revisión de Documentos KYC
            </h1>
            <p className="text-silver-600 mt-1">
              Revisa y aprueba las solicitudes de verificación de vendedores
            </p>
          </div>
        </div>

        {!pendingRequests || pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-silver-800 mb-2">
                No hay solicitudes pendientes
              </h3>
              <p className="text-silver-600">
                Todas las solicitudes de verificación han sido procesadas.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Store className="w-5 h-5" />
                      {request.storeName}
                    </CardTitle>
                    {getStatusBadge(request.kycStatus)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-silver-500" />
                      <span className="text-silver-600">
                        {request.user.firstName} {request.user.lastName}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-silver-500" />
                      <span className="text-silver-600">
                        {request.kycDocs?.taxId || 'RFC no proporcionado'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-silver-500" />
                      <span className="text-silver-600">
                        {request.kycDocs?.phone || 'Teléfono no proporcionado'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-silver-500" />
                      <span className="text-silver-600 text-xs">
                        {request.kycDocs?.address || 'Dirección no proporcionada'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-silver-500">
                    Solicitado: {formatDate(request.createdAt)}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                      className="flex-1"
                      data-testid={`button-review-${request.userId}`}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Revisar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Revisar Solicitud de Verificación
              </DialogTitle>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-6">
                {/* User Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información del Usuario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-silver-600">Nombre completo</Label>
                        <p className="text-silver-800">
                          {selectedRequest.user.firstName} {selectedRequest.user.lastName}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-silver-600">Email</Label>
                        <p className="text-silver-800">{selectedRequest.user.email}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-silver-600">Usuario</Label>
                        <p className="text-silver-800">{selectedRequest.user.username}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-silver-600">Estado actual</Label>
                        <div className="mt-1">
                          {getStatusBadge(selectedRequest.kycStatus)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Comercial</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-silver-600">Nombre de la tienda</Label>
                        <p className="text-silver-800">{selectedRequest.storeName}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-silver-600">Nombre del negocio</Label>
                        <p className="text-silver-800">
                          {selectedRequest.kycDocs?.businessName || 'No proporcionado'}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-silver-600">RFC</Label>
                        <p className="text-silver-800">
                          {selectedRequest.kycDocs?.taxId || 'No proporcionado'}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-silver-600">Teléfono</Label>
                        <p className="text-silver-800">
                          {selectedRequest.kycDocs?.phone || 'No proporcionado'}
                        </p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-silver-600">Dirección</Label>
                        <p className="text-silver-800">
                          {selectedRequest.kycDocs?.address || 'No proporcionada'}
                        </p>
                      </div>
                      
                      {selectedRequest.bio && (
                        <div className="md:col-span-2">
                          <Label className="text-sm font-medium text-silver-600">Descripción de la tienda</Label>
                          <p className="text-silver-800">{selectedRequest.bio}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Documentos Subidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedRequest.kycDocs?.documents && selectedRequest.kycDocs.documents.length > 0 ? (
                      <div className="space-y-2">
                        {selectedRequest.kycDocs.documents.map((doc, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-silver-50 rounded">
                            <FileText className="w-4 h-4 text-silver-500" />
                            <span className="text-sm text-silver-700">{doc}</span>
                            <Badge variant="outline" className="ml-auto">
                              Subido
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-silver-600 text-sm">No se han subido documentos</p>
                    )}
                  </CardContent>
                </Card>

                {/* Review Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notas de Revisión</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label htmlFor="reviewNote">Agregar notas (opcional)</Label>
                    <Textarea
                      id="reviewNote"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Agregar comentarios sobre la revisión..."
                      rows={3}
                      className="mt-2"
                      data-testid="textarea-review-note"
                    />
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => handleApprove(selectedRequest.userId)}
                    disabled={updateKycMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    data-testid={`button-approve-${selectedRequest.userId}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprobar Verificación
                  </Button>
                  
                  <Button
                    onClick={() => handleReject(selectedRequest.userId)}
                    disabled={updateKycMutation.isPending}
                    variant="destructive"
                    data-testid={`button-reject-${selectedRequest.userId}`}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar Solicitud
                  </Button>
                  
                  <Button
                    onClick={() => setSelectedRequest(null)}
                    variant="outline"
                    disabled={updateKycMutation.isPending}
                    data-testid="button-cancel-review"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}