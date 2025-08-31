import { dynamicImport, createPreloadableComponents } from '../utils/dynamicImport';
import LoadingFallback from './LoadingFallback';

// Define dynamic component imports
const dynamicComponents = {
  // Product components
  ProductCard: () => import('./product/ProductCard'),
  ProductDetail: () => import('./product/ProductDetail'),
  ProductGallery: () => import('./product/ProductGallery'),
  ProductReviews: () => import('./product/ProductReviews'),
  RelatedProducts: () => import('./product/RelatedProducts'),
  
  // Category components
  CategoryList: () => import('./category/CategoryList'),
  CategoryCard: () => import('./category/CategoryCard'),
  
  // Cart components
  CartSummary: () => import('./cart/CartSummary'),
  CartItem: () => import('./cart/CartItem'),
  
  // Checkout components
  CheckoutForm: () => import('./checkout/CheckoutForm'),
  PaymentMethods: () => import('./checkout/PaymentMethods'),
  ShippingOptions: () => import('./checkout/ShippingOptions'),
  
  // User components
  UserProfile: () => import('./user/UserProfile'),
  AddressList: () => import('./user/AddressList'),
  OrderHistory: () => import('./user/OrderHistory'),
  
  // Home page components
  FeaturedProducts: () => import('./home/FeaturedProducts'),
  PromotionBanner: () => import('./home/PromotionBanner'),
  CategoryShowcase: () => import('./home/CategoryShowcase'),
  
  // Search components
  SearchResults: () => import('./search/SearchResults'),
  FilterPanel: () => import('./search/FilterPanel'),
  
  // Authentication components
  LoginForm: () => import('./auth/LoginForm'),
  RegisterForm: () => import('./auth/RegisterForm'),
  
  // UI components
  Modal: () => import('./ui/Modal'),
  Carousel: () => import('./ui/Carousel'),
  Accordion: () => import('./ui/Accordion'),
  Tabs: () => import('./ui/Tabs'),
};

// Create preloadable versions of all components
export const preloadComponents = createPreloadableComponents(dynamicComponents);

// Create the actual dynamic components with loading fallbacks
export const DynamicProductCard = dynamicImport(dynamicComponents.ProductCard, { loading: LoadingFallback });
export const DynamicProductDetail = dynamicImport(dynamicComponents.ProductDetail, { loading: LoadingFallback });
export const DynamicProductGallery = dynamicImport(dynamicComponents.ProductGallery, { loading: LoadingFallback });
export const DynamicProductReviews = dynamicImport(dynamicComponents.ProductReviews, { loading: LoadingFallback });
export const DynamicRelatedProducts = dynamicImport(dynamicComponents.RelatedProducts, { loading: LoadingFallback });

export const DynamicCategoryList = dynamicImport(dynamicComponents.CategoryList, { loading: LoadingFallback });
export const DynamicCategoryCard = dynamicImport(dynamicComponents.CategoryCard, { loading: LoadingFallback });

export const DynamicCartSummary = dynamicImport(dynamicComponents.CartSummary, { loading: LoadingFallback });
export const DynamicCartItem = dynamicImport(dynamicComponents.CartItem, { loading: LoadingFallback });

export const DynamicCheckoutForm = dynamicImport(dynamicComponents.CheckoutForm, { loading: LoadingFallback });
export const DynamicPaymentMethods = dynamicImport(dynamicComponents.PaymentMethods, { loading: LoadingFallback });
export const DynamicShippingOptions = dynamicImport(dynamicComponents.ShippingOptions, { loading: LoadingFallback });

export const DynamicUserProfile = dynamicImport(dynamicComponents.UserProfile, { loading: LoadingFallback });
export const DynamicAddressList = dynamicImport(dynamicComponents.AddressList, { loading: LoadingFallback });
export const DynamicOrderHistory = dynamicImport(dynamicComponents.OrderHistory, { loading: LoadingFallback });

export const DynamicFeaturedProducts = dynamicImport(dynamicComponents.FeaturedProducts, { loading: LoadingFallback });
export const DynamicPromotionBanner = dynamicImport(dynamicComponents.PromotionBanner, { loading: LoadingFallback });
export const DynamicCategoryShowcase = dynamicImport(dynamicComponents.CategoryShowcase, { loading: LoadingFallback });

export const DynamicSearchResults = dynamicImport(dynamicComponents.SearchResults, { loading: LoadingFallback });
export const DynamicFilterPanel = dynamicImport(dynamicComponents.FilterPanel, { loading: LoadingFallback });

export const DynamicLoginForm = dynamicImport(dynamicComponents.LoginForm, { loading: LoadingFallback });
export const DynamicRegisterForm = dynamicImport(dynamicComponents.RegisterForm, { loading: LoadingFallback });

export const DynamicModal = dynamicImport(dynamicComponents.Modal, { loading: LoadingFallback });
export const DynamicCarousel = dynamicImport(dynamicComponents.Carousel, { loading: LoadingFallback });
export const DynamicAccordion = dynamicImport(dynamicComponents.Accordion, { loading: LoadingFallback });
export const DynamicTabs = dynamicImport(dynamicComponents.Tabs, { loading: LoadingFallback });