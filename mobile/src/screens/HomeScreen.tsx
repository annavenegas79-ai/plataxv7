import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { mockCategories, mockProducts, mockPromotions, mockClips } from '../services/api';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [postalCode, setPostalCode] = useState('');

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryItem}
      onPress={() => navigation.navigate('Category', { category: item })}
    >
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity style={styles.serviceItem}>
      <View style={[styles.serviceIconContainer, item.badge && styles.serviceBadge]}>
        <Icon name={item.icon} size={24} color={colors.silver700} />
      </View>
      <Text style={styles.serviceText}>{item.name}</Text>
      {item.badge && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productItem}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productPrice}>$ {item.price.toLocaleString()}</Text>
        {item.discount > 0 && (
          <View style={styles.discountContainer}>
            <Text style={styles.discountText}>{item.discount}% OFF</Text>
          </View>
        )}
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        {item.installments && (
          <Text style={styles.installmentsText}>
            6 meses sin intereses de $ {item.installments.amount.toFixed(2)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderClipItem = ({ item }) => (
    <TouchableOpacity style={styles.clipItem}>
      <Image source={{ uri: item.thumbnail }} style={styles.clipThumbnail} />
      <Text style={styles.clipTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.silver500} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar en Mercado Libre"
            placeholderTextColor={colors.silver500}
            onFocus={() => navigation.navigate('Search')}
          />
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="bell" size={24} color={colors.silver700} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.locationContainer}>
        <Icon name="map-pin" size={16} color={colors.silver700} />
        <Text style={styles.locationText}>Ingresa tu código postal</Text>
        <Icon name="chevron-right" size={16} color={colors.silver700} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {mockCategories.map((category) => (
            <TouchableOpacity 
              key={category.id} 
              style={styles.categoryItem}
              onPress={() => navigation.navigate('Category', { category })}
            >
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Promotions Carousel */}
        <View style={styles.promotionsContainer}>
          <Image 
            source={{ uri: 'https://http2.mlstatic.com/D_NQ_NP_2X_601013-MLA54851200189_042023-F.webp' }} 
            style={styles.promotionImage} 
            resizeMode="cover"
          />
          <View style={styles.promotionOverlay}>
            <View style={styles.promotionContent}>
              <Text style={styles.promotionTitle}>¡POR POCAS HORAS!</Text>
              <Text style={styles.promotionSubtitle}>JUEVES DE</Text>
              <Text style={styles.promotionHighlight}>NEUMÁTICOS</Text>
              <View style={styles.promotionDiscount}>
                <Text style={styles.discountLabel}>HASTA</Text>
                <Text style={styles.discountValue}>40%</Text>
                <Text style={styles.discountLabel}>DE DESCUENTO</Text>
              </View>
              <View style={styles.promotionMonths}>
                <Text style={styles.monthsLabel}>HASTA</Text>
                <Text style={styles.monthsValue}>15 MESES</Text>
                <Text style={styles.monthsLabel}>SIN INTERESES</Text>
              </View>
              <Text style={styles.termsText}>*Aplican T&C.</Text>
            </View>
          </View>
        </View>

        {/* Free Shipping Banner */}
        <View style={styles.shippingBanner}>
          <Icon name="truck" size={20} color="#00A650" />
          <Text style={styles.shippingText}>Envío gratis</Text>
          <Text style={styles.shippingDescription}>en millones de productos desde $299.</Text>
        </View>

        {/* Services */}
        <FlatList
          data={[
            { id: 1, name: 'Ofertas', icon: 'tag' },
            { id: 2, name: 'Series y pelis', icon: 'film', badge: 'GRATIS' },
            { id: 3, name: 'Mercado Pago', icon: 'credit-card', badge: 'TARJETA' },
            { id: 4, name: 'Supermercado', icon: 'shopping-bag' },
            { id: 5, name: 'Farmacia', icon: 'plus-circle', badge: 'NUEVO' },
          ]}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.servicesContainer}
        />

        {/* Daily Offers */}
        <View style={styles.dailyOffersContainer}>
          <Image 
            source={{ uri: 'https://http2.mlstatic.com/D_NQ_NP_2X_745258-MLM71571361005_092023-F.webp' }} 
            style={styles.dailyOffersImage} 
            resizeMode="cover"
          />
          <View style={styles.dailyOffersOverlay}>
            <Text style={styles.dailyOffersTitle}>OFERTAS DEL DÍA</Text>
            <View style={styles.dailyOffersDiscount}>
              <Text style={styles.dailyOffersDiscountText}>HASTA</Text>
              <Text style={styles.dailyOffersDiscountValue}>50%</Text>
              <Text style={styles.dailyOffersDiscountText}>DE DESCUENTO</Text>
            </View>
          </View>
        </View>

        {/* Recommended Products */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Porque te interesa</Text>
          <View style={styles.productsGrid}>
            {mockProducts.slice(0, 2).map((product) => (
              <TouchableOpacity 
                key={product.id} 
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { product })}
              >
                <Image source={{ uri: product.image }} style={styles.productCardImage} />
                <View style={styles.productCardInfo}>
                  <Text style={styles.productCardTitle} numberOfLines={2}>{product.title}</Text>
                  <Text style={styles.productCardPrice}>$ {product.price.toLocaleString()}</Text>
                  {product.discount > 0 && (
                    <View style={styles.productCardDiscount}>
                      <Text style={styles.productCardDiscountText}>{product.discount}% OFF</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
            <View style={styles.locationCard}>
              <Icon name="map-pin" size={40} color={colors.mercadoBlue} style={styles.locationIcon} />
              <Text style={styles.locationCardTitle}>Ingresa tu ubicación</Text>
              <Text style={styles.locationCardDescription}>Consulta costos y tiempos de entrega.</Text>
              <TouchableOpacity style={styles.locationButton}>
                <Text style={styles.locationButtonText}>Ingresar ubicación</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recently Viewed */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Visto recientemente</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BrowsingHistory')}>
              <Text style={styles.seeAllText}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={mockProducts.slice(0, 1)}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentProductsContainer}
          />
        </View>

        {/* Create Account Banner */}
        <View style={styles.createAccountBanner}>
          <Text style={styles.createAccountTitle}>¡Crea una cuenta y mejora tu experiencia!</Text>
          <TouchableOpacity style={styles.createAccountButton}>
            <Text style={styles.createAccountButtonText}>Crear cuenta</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.signInText}>Ingresar a mi cuenta</Text>
          </TouchableOpacity>
        </View>

        {/* Clips Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.clipsHeader}>
            <Icon name="zap" size={20} color="#FF4E4E" />
            <Text style={styles.clipsTitle}>Descubre clips de productos</Text>
          </View>
          <FlatList
            data={mockClips}
            renderItem={renderClipItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.clipsContainer}
          />
          <TouchableOpacity style={styles.seeAllClips}>
            <Text style={styles.seeAllClipsText}>Ver todos</Text>
            <Icon name="chevron-right" size={16} color={colors.mercadoBlue} />
          </TouchableOpacity>
        </View>

        {/* Inspired By Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Inspirado en lo último que viste</Text>
          <View style={styles.inspiredProduct}>
            <Image 
              source={{ uri: 'https://http2.mlstatic.com/D_NQ_NP_2X_745258-MLM71571361005_092023-F.webp' }} 
              style={styles.inspiredProductImage} 
            />
            <View style={styles.inspiredProductInfo}>
              <Text style={styles.inspiredProductTitle}>Yamaha Fz-s Fi 2.0 Mod. 2025</Text>
              <Text style={styles.inspiredProductPrice}>$ 56,999</Text>
              <Text style={styles.inspiredProductDetails}>2025 | 0</Text>
            </View>
          </View>
        </View>

        {/* Spacer for bottom tab navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mercadoYellow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.silver800,
    fontSize: 16,
  },
  notificationButton: {
    marginLeft: 12,
    padding: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  locationText: {
    flex: 1,
    marginLeft: 8,
    color: colors.silver800,
    fontSize: 14,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.mercadoYellow,
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  categoryText: {
    color: colors.silver800,
    fontSize: 14,
    fontWeight: '500',
  },
  promotionsContainer: {
    width: '100%',
    height: 260,
    position: 'relative',
  },
  promotionImage: {
    width: '100%',
    height: '100%',
  },
  promotionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotionContent: {
    alignItems: 'center',
  },
  promotionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promotionSubtitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  promotionHighlight: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  promotionDiscount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mercadoYellow,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
  },
  discountLabel: {
    color: colors.silver800,
    fontSize: 12,
    fontWeight: 'bold',
  },
  discountValue: {
    color: colors.silver800,
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  promotionMonths: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  monthsLabel: {
    color: colors.silver800,
    fontSize: 12,
    fontWeight: 'bold',
  },
  monthsValue: {
    color: colors.silver800,
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  termsText: {
    color: 'white',
    fontSize: 12,
    marginTop: 8,
  },
  shippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  shippingText: {
    color: '#00A650',
    fontWeight: 'bold',
    marginLeft: 8,
    marginRight: 4,
  },
  shippingDescription: {
    color: colors.silver800,
  },
  servicesContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  serviceItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 80,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceBadge: {
    borderWidth: 2,
    borderColor: colors.mercadoGreen,
  },
  serviceText: {
    color: colors.silver800,
    fontSize: 12,
    textAlign: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 45,
    backgroundColor: colors.mercadoGreen,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dailyOffersContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
    marginBottom: 16,
  },
  dailyOffersImage: {
    width: '100%',
    height: '100%',
  },
  dailyOffersOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(220,60,60,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dailyOffersTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dailyOffersDiscount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'black',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dailyOffersDiscountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dailyOffersDiscountValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.silver800,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seeAllText: {
    color: colors.mercadoBlue,
    fontSize: 14,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  productCard: {
    width: (width - 32) / 2,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  productCardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productCardInfo: {
    padding: 8,
  },
  productCardTitle: {
    fontSize: 14,
    color: colors.silver700,
    marginBottom: 4,
  },
  productCardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.silver800,
  },
  productCardDiscount: {
    marginTop: 2,
  },
  productCardDiscountText: {
    color: colors.mercadoGreen,
    fontSize: 12,
    fontWeight: '500',
  },
  locationCard: {
    width: (width - 32) / 2,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 8,
    padding: 12,
    alignItems: 'center',
  },
  locationIcon: {
    marginBottom: 8,
  },
  locationCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.silver800,
    textAlign: 'center',
    marginBottom: 4,
  },
  locationCardDescription: {
    fontSize: 12,
    color: colors.silver600,
    textAlign: 'center',
    marginBottom: 12,
  },
  locationButton: {
    backgroundColor: colors.mercadoBlue,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  recentProductsContainer: {
    paddingHorizontal: 12,
  },
  productItem: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.silver800,
    marginBottom: 2,
  },
  discountContainer: {
    marginBottom: 4,
  },
  discountText: {
    color: colors.mercadoGreen,
    fontSize: 12,
    fontWeight: '500',
  },
  productTitle: {
    fontSize: 14,
    color: colors.silver700,
    marginBottom: 4,
  },
  installmentsText: {
    fontSize: 12,
    color: colors.mercadoGreen,
  },
  createAccountBanner: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 24,
  },
  createAccountTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.silver800,
    marginBottom: 12,
    textAlign: 'center',
  },
  createAccountButton: {
    backgroundColor: colors.mercadoBlue,
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  createAccountButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  signInText: {
    color: colors.mercadoBlue,
    fontSize: 14,
    textAlign: 'center',
  },
  clipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  clipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.silver800,
    marginLeft: 8,
  },
  clipsContainer: {
    paddingHorizontal: 12,
  },
  clipItem: {
    width: 140,
    marginRight: 12,
  },
  clipThumbnail: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  clipTitle: {
    fontSize: 14,
    color: colors.silver800,
  },
  seeAllClips: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  seeAllClipsText: {
    color: colors.mercadoBlue,
    fontSize: 14,
    marginRight: 4,
  },
  inspiredProduct: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  inspiredProductImage: {
    width: 120,
    height: 120,
  },
  inspiredProductInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  inspiredProductTitle: {
    fontSize: 14,
    color: colors.silver800,
    marginBottom: 8,
  },
  inspiredProductPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.silver800,
    marginBottom: 4,
  },
  inspiredProductDetails: {
    fontSize: 12,
    color: colors.silver600,
  },
  bottomSpacer: {
    height: 80,
  },
});

export default HomeScreen;