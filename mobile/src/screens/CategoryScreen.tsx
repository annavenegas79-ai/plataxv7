import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { mockProducts } from '../services/api';

const CategoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params || {};
  
  const [selectedFilter, setSelectedFilter] = useState('relevance');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  
  const filters = [
    { id: 'relevance', name: 'Más relevantes' },
    { id: 'price_asc', name: 'Menor precio' },
    { id: 'price_desc', name: 'Mayor precio' },
    { id: 'newest', name: 'Más recientes' },
  ];
  
  const handleFilterSelect = (filterId) => {
    setSelectedFilter(filterId);
    setShowFilterOptions(false);
    
    // Here you would normally sort the products based on the selected filter
    // For this demo, we'll just use the mock data as is
  };
  
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
            en {item.installments.months}x $ {item.installments.amount.toFixed(2)} sin interés
          </Text>
        )}
        <View style={styles.shippingContainer}>
          <Icon name="truck" size={14} color={colors.mercadoGreen} />
          <Text style={styles.freeShippingText}>Envío gratis</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.silver700} />
        </TouchableOpacity>
        <Text style={styles.title}>{category?.name || 'Categoría'}</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" size={20} color={colors.silver700} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartButton}>
          <Icon name="shopping-cart" size={20} color={colors.silver700} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabs}
        >
          <TouchableOpacity style={styles.filterTab}>
            <Icon name="sliders" size={16} color={colors.silver700} />
            <Text style={styles.filterTabText}>Filtrar</Text>
          </TouchableOpacity>
          
          <View style={styles.filterDivider} />
          
          <TouchableOpacity 
            style={styles.filterTab}
            onPress={() => setShowFilterOptions(!showFilterOptions)}
          >
            <Text style={styles.filterTabText}>
              {filters.find(f => f.id === selectedFilter)?.name}
            </Text>
            <Icon 
              name={showFilterOptions ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={colors.silver700} 
              style={styles.filterIcon}
            />
          </TouchableOpacity>
          
          <View style={styles.filterDivider} />
          
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterTabText}>Envío gratis</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterTabText}>Precio</Text>
            <Icon name="chevron-down" size={16} color={colors.silver700} style={styles.filterIcon} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterTabText}>Condición</Text>
            <Icon name="chevron-down" size={16} color={colors.silver700} style={styles.filterIcon} />
          </TouchableOpacity>
        </ScrollView>
        
        {showFilterOptions && (
          <View style={styles.filterOptionsContainer}>
            {filters.map(filter => (
              <TouchableOpacity 
                key={filter.id}
                style={[
                  styles.filterOption,
                  selectedFilter === filter.id && styles.selectedFilterOption
                ]}
                onPress={() => handleFilterSelect(filter.id)}
              >
                <Text 
                  style={[
                    styles.filterOptionText,
                    selectedFilter === filter.id && styles.selectedFilterOptionText
                  ]}
                >
                  {filter.name}
                </Text>
                {selectedFilter === filter.id && (
                  <Icon name="check" size={16} color={colors.mercadoBlue} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
      <FlatList
        data={mockProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.productsList}
      />
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.mercadoYellow,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.silver800,
  },
  searchButton: {
    padding: 8,
    marginRight: 8,
  },
  cartButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.silver200,
  },
  filterTabs: {
    paddingHorizontal: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  filterTabText: {
    fontSize: 14,
    color: colors.silver700,
  },
  filterIcon: {
    marginLeft: 4,
  },
  filterDivider: {
    width: 1,
    height: '60%',
    backgroundColor: colors.silver300,
    alignSelf: 'center',
    marginHorizontal: 4,
  },
  filterOptionsContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: colors.silver200,
    paddingVertical: 8,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedFilterOption: {
    backgroundColor: colors.silver50,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.silver700,
  },
  selectedFilterOptionText: {
    color: colors.mercadoBlue,
    fontWeight: '500',
  },
  productsList: {
    padding: 12,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 4,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
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
    marginBottom: 4,
  },
  shippingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freeShippingText: {
    fontSize: 12,
    color: colors.mercadoGreen,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default CategoryScreen;