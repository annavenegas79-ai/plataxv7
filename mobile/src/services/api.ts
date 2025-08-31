import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://api.platamx.com', // Replace with your actual API URL
});

// Mock data for development
export const mockProducts = [
  {
    id: 1,
    title: 'Nuevas Zapatillas Para Correr New Balance Serie',
    price: 1443.05,
    originalPrice: 1519,
    discount: 5,
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_601013-MLA54851200189_042023-F.webp',
    rating: 4.5,
    reviews: 120,
    seller: 'New Balance Official',
    installments: {
      months: 6,
      amount: 245.26,
    },
  },
  {
    id: 2,
    title: 'Ktm 250 Te Era Generación, Color Naranja Con Blanco',
    price: 93000,
    originalPrice: 93000,
    discount: 0,
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_745258-MLM71571361005_092023-F.webp',
    rating: 4.8,
    reviews: 45,
    seller: 'KTM Motos',
    year: 2024,
    km: 6600,
    location: 'Comalcalco - Tabasco',
  },
  {
    id: 3,
    title: 'La Nueva Versión De Las Zapatillas Deportivas 1906 Tiene Un Estilo Retro',
    price: 1462,
    originalPrice: 1539,
    discount: 5,
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_652973-MLA54851200190_042023-F.webp',
    rating: 4.3,
    reviews: 89,
    seller: 'Deportes Online',
    installments: {
      months: 6,
      amount: 243.68,
    },
  },
  {
    id: 4,
    title: 'Zapatillas Deportivas Casuales Para Correr De Estilo Retro De Caña Baja',
    price: 1452,
    originalPrice: 1529,
    discount: 5,
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_652973-MLA54851200190_042023-F.webp',
    rating: 4.1,
    reviews: 67,
    seller: 'Deportes Express',
    installments: {
      months: 6,
      amount: 242.09,
    },
  },
];

export const mockCategories = [
  { id: 1, name: 'Todo', icon: 'grid' },
  { id: 2, name: 'Celulares', icon: 'smartphone' },
  { id: 3, name: 'Moda', icon: 'shopping-bag' },
  { id: 4, name: 'Belleza', icon: 'star' },
  { id: 5, name: 'Vehículos', icon: 'truck' },
  { id: 6, name: 'Televisores', icon: 'tv' },
  { id: 7, name: 'Electro', icon: 'zap' },
];

export const mockClips = [
  {
    id: 1,
    title: 'Colchoneta Impermeable De Camping y excursiones',
    thumbnail: 'https://http2.mlstatic.com/D_NQ_NP_2X_601013-MLA54851200189_042023-F.webp',
    views: 12500,
  },
  {
    id: 2,
    title: 'Mate Imperial Premium Uruguay',
    thumbnail: 'https://http2.mlstatic.com/D_NQ_NP_2X_745258-MLM71571361005_092023-F.webp',
    views: 8900,
  },
  {
    id: 3,
    title: '3*3 Metro Impermeable',
    thumbnail: 'https://http2.mlstatic.com/D_NQ_NP_2X_652973-MLA54851200190_042023-F.webp',
    views: 5600,
  },
];

export const mockPromotions = [
  {
    id: 1,
    title: 'Jueves de Neumáticos',
    description: 'Hasta 40% de descuento y hasta 15 meses sin intereses',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_601013-MLA54851200189_042023-F.webp',
  },
  {
    id: 2,
    title: 'Ofertas del Día',
    description: 'Hasta 50% de descuento',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_745258-MLM71571361005_092023-F.webp',
  },
];