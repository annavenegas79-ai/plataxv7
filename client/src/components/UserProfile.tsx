import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { MapPin, CreditCard, Package, Star, Shield, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { User, Address, Wallet, SellerProfile } from '@shared/schema';

interface ExtendedUser extends User {
  addresses: Address[];
  wallet: Wallet;
  sellerProfile: SellerProfile | null;
}

export function UserProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch user profile with all related data
  const { data: userProfile, isLoading } = useQuery<ExtendedUser>({
    queryKey: ['/api/user/profile']
  });

  // Fetch user orders
  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ['/api/orders']
  });

  // Fetch user wishlist
  const { data: wishlist = [] } = useQuery<any[]>({
    queryKey: ['/api/wishlist']
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="profile-loading">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center" data-testid="profile-error">
        <p className="text-gray-600 dark:text-gray-400">No se pudo cargar el perfil del usuario.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="user-profile">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {userProfile.avatar ? (
                <img 
                  src={userProfile.avatar} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-full object-cover"
                  data-testid="user-avatar"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-silver-400 to-silver-600 flex items-center justify-center text-white text-xl font-bold">
                  {userProfile.firstName?.[0]}{userProfile.lastName?.[0]}
                </div>
              )}
              {userProfile.isVerified && (
                <CheckCircle 
                  className="absolute -bottom-1 -right-1 h-5 w-5 text-green-500 bg-white dark:bg-gray-900 rounded-full" 
                  data-testid="verified-badge"
                />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="user-name">
                {userProfile.firstName} {userProfile.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400" data-testid="user-email">
                @{userProfile.username}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={userProfile.role === 'admin' ? 'destructive' : userProfile.role === 'vendedor' ? 'secondary' : 'outline'}>
                  {userProfile.role === 'admin' ? 'Administrador' : 
                   userProfile.role === 'vendedor' ? 'Vendedor' : 'Cliente'}
                </Badge>
                {userProfile.sellerProfile?.silverCheck && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-silver-500 to-silver-600 text-white">
                    <Shield className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Wallet Balance */}
          {userProfile.wallet && (
            <Card className="w-64" data-testid="wallet-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Saldo</p>
                    <p className="text-xl font-bold text-green-600" data-testid="wallet-balance">
                      ${(userProfile.wallet.balanceCents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" data-testid="tab-profile">
              <MapPin className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="addresses" data-testid="tab-addresses">
              <MapPin className="w-4 h-4 mr-2" />
              Direcciones
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <Package className="w-4 h-4 mr-2" />
              Pedidos ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="wishlist" data-testid="tab-wishlist">
              <Star className="w-4 h-4 mr-2" />
              Favoritos ({wishlist.length})
            </TabsTrigger>
            {userProfile.sellerProfile && (
              <TabsTrigger value="seller" data-testid="tab-seller">
                <Shield className="w-4 h-4 mr-2" />
                Vendedor
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="addresses">
            <AddressesTab addresses={userProfile.addresses} />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTab orders={orders} />
          </TabsContent>

          <TabsContent value="wishlist">
            <WishlistTab wishlist={wishlist} />
          </TabsContent>

          {userProfile.sellerProfile && (
            <TabsContent value="seller">
              <SellerTab sellerProfile={userProfile.sellerProfile} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ userProfile }: { userProfile: ExtendedUser }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', '/api/user/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: "Perfil actualizado",
        description: "Tu información personal se ha actualizado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Personal</CardTitle>
        <CardDescription>
          Actualiza tu información personal y preferencias de cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="profile-form">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                data-testid="input-firstName"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                data-testid="input-lastName"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              data-testid="input-email"
            />
          </div>
          <Button 
            type="submit" 
            disabled={updateProfileMutation.isPending}
            data-testid="button-save-profile"
          >
            {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Placeholder tabs for addresses, orders, wishlist, and seller
function AddressesTab({ addresses }: { addresses: Address[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Direcciones de Envío</CardTitle>
        <CardDescription>
          Gestiona tus direcciones de entrega ({addresses.length} guardadas)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" data-testid="addresses-list">
          {addresses.map((address) => (
            <div key={address.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{address.line1}</p>
                  {address.line2 && <p className="text-sm text-gray-600">{address.line2}</p>}
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.zip}
                  </p>
                  <p className="text-sm text-gray-600">{address.country}</p>
                  {address.isDefault && (
                    <Badge variant="secondary" className="mt-2">Dirección Principal</Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" data-testid={`edit-address-${address.id}`}>
                  Editar
                </Button>
              </div>
            </div>
          ))}
          {addresses.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No tienes direcciones guardadas. Agrega una para facilitar tus compras.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function OrdersTab({ orders }: { orders: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Pedidos</CardTitle>
        <CardDescription>
          Revisa el estado de tus compras y pedidos anteriores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" data-testid="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Pedido #{order.id}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('es-MX')}
                  </p>
                  <p className="text-lg font-semibold">
                    ${(order.totalCents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </p>
                </div>
                <Badge variant={
                  order.status === 'delivered' ? 'default' : 
                  order.status === 'shipped' ? 'secondary' : 
                  order.status === 'paid' ? 'outline' : 'destructive'
                }>
                  {order.status === 'delivered' ? 'Entregado' : 
                   order.status === 'shipped' ? 'Enviado' : 
                   order.status === 'paid' ? 'Pagado' : 
                   order.status === 'created' ? 'Creado' : 'Cancelado'}
                </Badge>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              Aún no tienes pedidos. ¡Explora nuestro catálogo de plata mexicana!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function WishlistTab({ wishlist }: { wishlist: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Favoritos</CardTitle>
        <CardDescription>
          Productos que has guardado para comprar después
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="wishlist-grid">
          {wishlist.map((item) => (
            <div key={item.id} className="border p-4 rounded-lg">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-3"></div>
              <p className="font-medium">{item.product?.title || 'Producto'}</p>
              <p className="text-lg font-semibold text-primary">
                ${parseFloat(item.product?.price || '0').toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <Button className="w-full mt-2" size="sm" data-testid={`add-to-cart-${item.id}`}>
                Agregar al Carrito
              </Button>
            </div>
          ))}
          {wishlist.length === 0 && (
            <div className="col-span-full text-gray-500 text-center py-8">
              No tienes productos en tu lista de favoritos.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SellerTab({ sellerProfile }: { sellerProfile: SellerProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Perfil de Vendedor</span>
          {sellerProfile.silverCheck && (
            <Badge variant="secondary" className="bg-gradient-to-r from-silver-500 to-silver-600 text-white">
              Verificado ✓
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Gestiona tu tienda y productos de plata mexicana
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Nombre de la Tienda</Label>
          <p className="text-lg font-medium" data-testid="store-name">{sellerProfile.storeName}</p>
        </div>
        
        {sellerProfile.bio && (
          <div>
            <Label>Descripción</Label>
            <p className="text-gray-700 dark:text-gray-300" data-testid="store-bio">{sellerProfile.bio}</p>
          </div>
        )}

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">4.8</p>
              <p className="text-sm text-gray-600">Calificación</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">156</p>
              <p className="text-sm text-gray-600">Ventas</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">12</p>
              <p className="text-sm text-gray-600">Productos</p>
            </div>
          </Card>
        </div>

        <div className="flex items-center space-x-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">
              Estado de Verificación KYC
            </p>
            <p className="text-sm text-green-600 dark:text-green-300">
              {sellerProfile.kycStatus === 'approved' ? 'Aprobado - Cuenta verificada' :
               sellerProfile.kycStatus === 'pending' ? 'Pendiente de revisión' :
               sellerProfile.kycStatus === 'rejected' ? 'Rechazado - Contacta soporte' :
               'No iniciado'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}