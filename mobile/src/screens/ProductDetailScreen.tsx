import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';

import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product } = route.params || {};
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  
  // Mock multiple images
  const productImages = [
    product?.image,
    'https://http2.mlstatic.com/D_NQ_NP_2X_652973-MLA54851200190_042023-F.webp',
    'https://http2.mlstatic.com/D_NQ_NP_2X_601013-MLA54851200189_042023-F.webp',
  ];
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Mira este producto en PlataMX! ${product?.title} - $${product?.price}`,
        url: 'https://platamx.com/product/' + product?.id,
      });
    } catch (error) {
      console.log(error);
    }
  };
  
  const handleAddToCart = () => {
    // Add to cart logic would go here
    navigation.navigate('Cart');
  };
  
  const handleBuyNow = () => {
    // Buy now logic would go here
    navigation.navigate('Cart');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.silver700} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Icon name="share-2" size={20} color={colors.silver700} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="search" size={20} color={colors.silver700} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="shopping-cart" size={20} color={colors.silver700} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="more-vertical" size={20} color={colors.silver700} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(newIndex);
            }}
          >
            {productImages.map((image, index) => (
              <Image 
                key={index}
                source={{ uri: image }} 
                style={styles.productImage} 
                resizeMode="contain"
              />
            ))}
          </ScrollView>
          
          <View style={styles.imagePagination}>
            {productImages.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.paginationDot, 
                  index === currentImageIndex && styles.paginationDotActive
                ]} 
              />
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Icon 
              name={isFavorite ? "heart" : "heart"} 
              size={24} 
              color={isFavorite ? colors.error : colors.silver300} 
              solid={isFavorite}
            />
          </TouchableOpacity>
        </View>
        
        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{product?.seller || 'Vendedor Oficial'}</Text>
          </View>
          
          <Text style={styles.productTitle}>{product?.title}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon 
                  key={star}
                  name="star" 
                  size={16} 
                  color={star <= Math.floor(product?.rating || 0) ? '#FFD700' : colors.silver300} 
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {product?.rating?.toFixed(1) || '4.5'} ({product?.reviews || '120'})
            </Text>
          </View>
          
          <View style={styles.priceContainer}>
            {product?.discount > 0 && (
              <View style={styles.originalPriceContainer}>
                <Text style={styles.originalPrice}>$ {product?.originalPrice?.toLocaleString()}</Text>
                <Text style={styles.discountBadge}>{product?.discount}% OFF</Text>
              </View>
            )}
            <Text style={styles.price}>$ {product?.price?.toLocaleString()}</Text>
            {product?.installments && (
              <Text style={styles.installments}>
                en {product?.installments?.months}x $ {product?.installments?.amount?.toFixed(2)} sin interés
              </Text>
            )}
          </View>
          
          <View style={styles.shippingInfo}>
            <Icon name="truck" size={16} color={colors.mercadoGreen} />
            <View style={styles.shippingTextContainer}>
              <Text style={styles.freeShippingText}>Envío gratis</Text>
              <Text style={styles.shippingDescription}>Llega entre el jueves y el viernes</Text>
            </View>
          </View>
          
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Cantidad:</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => selectedQuantity > 1 && setSelectedQuantity(selectedQuantity - 1)}
                disabled={selectedQuantity <= 1}
              >
                <Icon 
                  name="minus" 
                  size={16} 
                  color={selectedQuantity <= 1 ? colors.silver300 : colors.silver700} 
                />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{selectedQuantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setSelectedQuantity(selectedQuantity + 1)}
              >
                <Icon name="plus" size={16} color={colors.silver700} />
              </TouchableOpacity>
            </View>
            <Text style={styles.stockInfo}>
              ({product?.stock || '10'} disponibles)
            </Text>
          </View>
        </View>
        
        {/* Product Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Características principales</Text>
          <View style={styles.detailsTable}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Marca</Text>
              <Text style={styles.detailValue}>{product?.brand || 'New Balance'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Modelo</Text>
              <Text style={styles.detailValue}>{product?.model || 'Serie 574'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Color</Text>
              <Text style={styles.detailValue}>{product?.color || 'Gris'}</Text>
            </View>
            {product?.year && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Año</Text>
                <Text style={styles.detailValue}>{product.year}</Text>
              </View>
            )}
            {product?.km && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Kilometraje</Text>
                <Text style={styles.detailValue}>{product.km} km</Text>
              </View>
            )}
            {product?.location && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ubicación</Text>
                <Text style={styles.detailValue}>{product.location}</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>
            {product?.description || 
              'Las zapatillas New Balance 574 son un modelo clásico que combina estilo y comodidad. ' +
              'Diseñadas con materiales de alta calidad, estas zapatillas ofrecen un soporte excepcional ' +
              'y una amortiguación superior para el uso diario. Su diseño versátil las hace perfectas ' +
              'tanto para actividades casuales como deportivas.\n\n' +
              'Características:\n' +
              '- Parte superior de gamuza y malla\n' +
              '- Entresuela ENCAP para mayor soporte y durabilidad\n' +
              '- Suela de goma para tracción y durabilidad\n' +
              '- Plantilla acolchada para mayor comodidad\n' +
              '- Diseño retro inspirado en los años 80'
            }
          </Text>
        </View>
        
        {/* Similar Products */}
        <View style={styles.similarProductsSection}>
          <Text style={styles.sectionTitle}>Productos similares</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.similarProductsList}
          >
            {[1, 2, 3].map((item) => (
              <TouchableOpacity key={item} style={styles.similarProductItem}>
                <Image 
                  source={{ uri: 'https://http2.mlstatic.com/D_NQ_NP_2X_652973-MLA54851200190_042023-F.webp' }} 
                  style={styles.similarProductImage} 
                />
                <View style={styles.similarProductInfo}>
                  <Text style={styles.similarProductPrice}>$ 1,399</Text>
                  <Text style={styles.similarProductTitle} numberOfLines={2}>
                    Zapatillas Deportivas Estilo Retro
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>Agregar al carrito</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.buyNowButton}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyNowText}>Comprar ahora</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.silver50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  imageGallery: {
    backgroundColor: 'white',
    position: 'relative',
  },
  productImage: {
    width,
    height: 300,
  },
  imagePagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 16,
    width: '100%',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.silver300,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.mercadoBlue,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    backgroundColor: 'white',
    padding: 16,
  },
  sellerInfo: {
    marginBottom: 8,
  },
  sellerName: {
    fontSize: 14,
    color: colors.silver600,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.silver800,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: colors.silver600,
  },
  priceContainer: {
    marginBottom: 16,
  },
  originalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 14,
    color: colors.silver500,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    fontSize: 14,
    color: colors.mercadoGreen,
    fontWeight: '500',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.silver800,
    marginBottom: 4,
  },
  installments: {
    fontSize: 14,
    color: colors.mercadoGreen,
  },
  shippingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.silver50,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  shippingTextContainer: {
    marginLeft: 12,
  },
  freeShippingText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mercadoGreen,
    marginBottom: 2,
  },
  shippingDescription: {
    fontSize: 14,
    color: colors.silver600,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 14,
    color: colors.silver700,
    marginRight: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.silver300,
    borderRadius: 4,
  },
  quantityButton: {
    padding: 8,
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.silver800,
    paddingHorizontal: 12,
  },
  stockInfo: {
    fontSize: 14,
    color: colors.silver600,
    marginLeft: 12,
  },
  detailsSection: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.silver800,
    marginBottom: 16,
  },
  detailsTable: {
    borderWidth: 1,
    borderColor: colors.silver200,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.silver200,
  },
  detailRow: {
    flexDirection: 'row',
  },
  detailLabel: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.silver50,
    fontSize: 14,
    color: colors.silver700,
    borderRightWidth: 1,
    borderRightColor: colors.silver200,
  },
  detailValue: {
    flex: 2,
    padding: 12,
    fontSize: 14,
    color: colors.silver800,
  },
  descriptionSection: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 16,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.silver700,
  },
  similarProductsSection: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 16,
  },
  similarProductsList: {
    paddingBottom: 8,
  },
  similarProductItem: {
    width: 160,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.silver200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  similarProductImage: {
    width: '100%',
    height: 160,
  },
  similarProductInfo: {
    padding: 8,
  },
  similarProductPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.silver800,
    marginBottom: 4,
  },
  similarProductTitle: {
    fontSize: 12,
    color: colors.silver700,
  },
  bottomSpacer: {
    height: 80,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: colors.silver200,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.mercadoBlue,
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  addToCartText: {
    color: colors.mercadoBlue,
    fontSize: 14,
    fontWeight: '500',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: colors.mercadoBlue,
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buyNowText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProductDetailScreen;