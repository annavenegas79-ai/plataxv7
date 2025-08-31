import { Link } from "wouter";
import { Gem, Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-silver-800 text-silver-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-silver-400 to-silver-600 rounded-lg flex items-center justify-center">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">PlataMX</span>
            </div>
            <p className="text-sm mb-4">
              La plataforma líder en México para productos de plata auténtica. 
              Conectamos artesanos con clientes que valoran la calidad.
            </p>
            <div className="flex space-x-4">
              <button className="text-silver-400 hover:text-white transition-colors" data-testid="button-facebook">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="text-silver-400 hover:text-white transition-colors" data-testid="button-twitter">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="text-silver-400 hover:text-white transition-colors" data-testid="button-instagram">
                <Instagram className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Comprar</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=anillos" className="hover:text-white transition-colors" data-testid="link-footer-rings">
                  Anillos
                </Link>
              </li>
              <li>
                <Link href="/products?category=collares" className="hover:text-white transition-colors" data-testid="link-footer-necklaces">
                  Collares
                </Link>
              </li>
              <li>
                <Link href="/products?category=aretes" className="hover:text-white transition-colors" data-testid="link-footer-earrings">
                  Aretes
                </Link>
              </li>
              <li>
                <Link href="/products?category=pulseras" className="hover:text-white transition-colors" data-testid="link-footer-bracelets">
                  Pulseras
                </Link>
              </li>
              <li>
                <Link href="/products?category=relojes" className="hover:text-white transition-colors" data-testid="link-footer-watches">
                  Relojes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Vender</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/seller" className="hover:text-white transition-colors" data-testid="link-footer-start-selling">
                  Comenzar a vender
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-verification">
                  Verificación KYC
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-fees">
                  Tarifas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-seller-resources">
                  Recursos para vendedores
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-help-center">
                  Centro de ayuda
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-help">
                  Centro de ayuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-live-chat">
                  Chat en vivo
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-returns">
                  Política de devoluciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-authenticity">
                  Garantía de autenticidad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-contact">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-silver-700 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; 2025 PlataMX. Todos los derechos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-terms">
              Términos y Condiciones
            </a>
            <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-privacy">
              Política de Privacidad
            </a>
            <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-cookies">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
