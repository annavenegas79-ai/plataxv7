import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gem, Star, CheckCircle, Clock, TrendingUp, Flame } from "lucide-react";
import { motion } from "framer-motion";
import ProductGrid from "@/components/product/product-grid";
import type { Product, Category } from "@shared/schema";

export default function Home() {
  const { data: featuredProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { limit: 8 }],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-silver-100 via-white to-silver-200 py-12" 
        data-testid="hero-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold">
                <span className="bg-gradient-to-r from-silver-600 to-silver-800 bg-clip-text text-transparent">
                  Plata Premium
                </span>
                <br />
                <span className="text-gold-500">Auténtica</span>
              </h1>
              <p className="text-xl text-silver-600" data-testid="text-hero-description">
                Descubre la colección más exclusiva de joyas y accesorios de plata mexicana. 
                Vendedores verificados, calidad garantizada.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button className="bg-gold-500 hover:bg-gold-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors" data-testid="button-explore-catalog">
                    Explorar Catálogo
                  </Button>
                </Link>
                <Link href="/seller">
                  <Button 
                    variant="outline"
                    className="border-2 border-silver-300 hover:border-gold-400 text-silver-700 px-8 py-3 rounded-lg font-semibold transition-colors"
                    data-testid="button-sell-products"
                  >
                    Vender mis Productos
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                alt="Elegant silver jewelry collection"
                className="rounded-2xl shadow-2xl w-full h-auto"
                data-testid="img-hero"
              />
              <Badge className="absolute top-4 right-4 bg-gold-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                ¡Nuevo!
              </Badge>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Collection Carousels */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-12 bg-white" 
        data-testid="collections-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-silver-800" data-testid="text-collections-title">
            Colecciones Exclusivas
          </h2>
          
          {/* Taxco Collection */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-silver-700">Tradición Taxco</h3>
              <Badge className="badge-premium">Edición Limitada</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <motion.div
                  key={item}
                  whileHover={{ y: -5 }}
                  className="card-elevated p-6"
                >
                  <img
                    src={`https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&w=400&h=300&fit=crop`}
                    alt="Tradición Taxco"
                    className="w-full h-48 object-cover rounded-xl mb-4 blur-up"
                  />
                  <h4 className="font-semibold text-silver-800 mb-2">Anillo Tradicional Taxco</h4>
                  <p className="text-silver-600 text-sm mb-3">Diseño ancestral con técnicas de martillado</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gold-600">$2,450</span>
                    <Button size="sm" className="bg-gold-500 hover:bg-gold-600">Ver</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Flash Sale Timer */}
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl p-6 text-white mb-12"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2 flex items-center">
                  <Flame className="w-6 h-6 mr-2" />
                  Flash Sale - ¡Solo por hoy!
                </h3>
                <p className="opacity-90">Hasta 40% de descuento en joyas seleccionadas</p>
              </div>
              <div className="text-center">
                <div className="flex items-center space-x-2 text-2xl font-bold">
                  <div className="bg-white bg-opacity-20 rounded-lg px-3 py-2">
                    <span>05</span>
                    <div className="text-xs opacity-75">HORAS</div>
                  </div>
                  <span>:</span>
                  <div className="bg-white bg-opacity-20 rounded-lg px-3 py-2">
                    <span>24</span>
                    <div className="text-xs opacity-75">MIN</div>
                  </div>
                  <span>:</span>
                  <div className="bg-white bg-opacity-20 rounded-lg px-3 py-2">
                    <span>18</span>
                    <div className="text-xs opacity-75">SEG</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Categories */}
      <section className="py-12 bg-silver-50" data-testid="categories-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-silver-800" data-testid="text-categories-title">
            Categorías Destacadas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="group cursor-pointer" 
              data-testid="category-anillos"
            >
              <Link href="/products?category=anillos">
                <div className="card-modern p-8 text-center hover:shadow-xl">
                  <div className="w-16 h-16 mx-auto mb-4 gradient-gold rounded-full flex items-center justify-center">
                    <Gem className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-silver-800">Anillos</h3>
                  <p className="text-sm text-silver-600 mt-1">1,240+ productos</p>
                </div>
              </Link>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="group cursor-pointer" 
              data-testid="category-collares"
            >
              <Link href="/products?category=collares">
                <div className="card-modern p-8 text-center hover:shadow-xl">
                  <div className="w-16 h-16 mx-auto mb-4 gradient-gold rounded-full flex items-center justify-center">
                    <Gem className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-silver-800">Collares</h3>
                  <p className="text-sm text-silver-600 mt-1">890+ productos</p>
                </div>
              </Link>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="group cursor-pointer" 
              data-testid="category-aretes"
            >
              <Link href="/products?category=aretes">
                <div className="card-modern p-8 text-center hover:shadow-xl">
                  <div className="w-16 h-16 mx-auto mb-4 gradient-gold rounded-full flex items-center justify-center">
                    <Gem className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-silver-800">Aretes</h3>
                  <p className="text-sm text-silver-600 mt-1">650+ productos</p>
                </div>
              </Link>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="group cursor-pointer" 
              data-testid="category-relojes"
            >
              <Link href="/products?category=relojes">
                <div className="card-modern p-8 text-center hover:shadow-xl">
                  <div className="w-16 h-16 mx-auto mb-4 gradient-gold rounded-full flex items-center justify-center">
                    <Gem className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-silver-800">Relojes</h3>
                  <p className="text-sm text-silver-600 mt-1">320+ productos</p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-silver-50" data-testid="products-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-silver-800" data-testid="text-products-title">
              Productos Destacados
            </h2>
            <Link href="/products">
              <Button 
                variant="outline"
                className="border-silver-300 hover:border-gold-400 text-silver-700"
                data-testid="button-view-all"
              >
                Ver todos
              </Button>
            </Link>
          </div>

          <ProductGrid products={featuredProducts} isLoading={productsLoading} />
        </div>
      </section>

      {/* Trusted Sellers */}
      <section className="py-12 bg-white" data-testid="sellers-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-silver-800 mb-2" data-testid="text-sellers-title">
              Vendedores Verificados
            </h2>
            <p className="text-silver-600" data-testid="text-sellers-description">
              Artesanos y comerciantes certificados con garantía de calidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow border border-silver-200" data-testid="seller-platamaestra">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-silver-300 to-silver-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">PM</span>
              </div>
              <div className="flex items-center justify-center mb-2">
                <h3 className="font-semibold text-silver-800">PlataMaestra</h3>
                <CheckCircle className="w-5 h-5 text-silver-400 ml-2" />
              </div>
              <p className="text-sm text-silver-600 mb-3">
                Artesano tradicional con 15 años de experiencia
              </p>
              <div className="flex items-center justify-center mb-3">
                <div className="flex text-gold-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-silver-600 ml-2">4.9 (1,250 reseñas)</span>
              </div>
              <Button className="w-full bg-gold-500 hover:bg-gold-600 text-white py-2 rounded-lg font-medium transition-colors" data-testid="button-view-store-pm">
                Ver Tienda
              </Button>
            </div>

            <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow border border-silver-200" data-testid="seller-joyasancestral">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-silver-300 to-silver-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">JA</span>
              </div>
              <div className="flex items-center justify-center mb-2">
                <h3 className="font-semibold text-silver-800">JoyasAncestral</h3>
                <CheckCircle className="w-5 h-5 text-silver-400 ml-2" />
              </div>
              <p className="text-sm text-silver-600 mb-3">
                Diseños únicos inspirados en culturas prehispánicas
              </p>
              <div className="flex items-center justify-center mb-3">
                <div className="flex text-gold-400">
                  {[1, 2, 3, 4].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-current" />
                  ))}
                  <Star className="w-4 h-4" />
                </div>
                <span className="text-sm text-silver-600 ml-2">4.7 (890 reseñas)</span>
              </div>
              <Button className="w-full bg-gold-500 hover:bg-gold-600 text-white py-2 rounded-lg font-medium transition-colors" data-testid="button-view-store-ja">
                Ver Tienda
              </Button>
            </div>

            <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow border border-silver-200" data-testid="seller-silvermoderno">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-silver-300 to-silver-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">SM</span>
              </div>
              <div className="flex items-center justify-center mb-2">
                <h3 className="font-semibold text-silver-800">SilverModerno</h3>
                <CheckCircle className="w-5 h-5 text-silver-400 ml-2" />
              </div>
              <p className="text-sm text-silver-600 mb-3">
                Diseños contemporáneos para el estilo moderno
              </p>
              <div className="flex items-center justify-center mb-3">
                <div className="flex text-gold-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-silver-600 ml-2">4.8 (567 reseñas)</span>
              </div>
              <Button className="w-full bg-gold-500 hover:bg-gold-600 text-white py-2 rounded-lg font-medium transition-colors" data-testid="button-view-store-sm">
                Ver Tienda
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
