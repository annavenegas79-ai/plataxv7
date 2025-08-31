import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { mockProducts } from '../services/api';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    'zapatillas', 'celular', 'laptop', 'auriculares'
  ]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setLoading(true);
      // Simulate API call delay
      const timer = setTimeout(() => {
        const filteredResults = mockProducts.filter(product => 
          product.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filteredResults);
        setLoading(false);
        setShowResults(true);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setShowResults(false);
    }
  }, [searchQuery]);
  
  const handleSearch = () => {
    if (searchQuery.trim().length > 0) {
      // Add to recent searches if not already there
      if (!recentSearches.includes(searchQuery.trim())) {
        setRecentSearches([searchQuery.trim(), ...recentSearches.slice(0, 4)]);
      }
    }
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
  };
  
  const handleSelectRecentSearch = (search) => {
    setSearchQuery(search);
  };
  
  const handleRemoveRecentSearch = (search) => {
    setRecentSearches(recentSearches.filter(item => item !== search));
  };
  
  const renderSearchResult = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image source={{ uri: item.image }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.resultPrice}>$ {item.price.toLocaleString()}</Text>
        {item.discount > 0 && (
          <View style={styles.discountContainer}>
            <Text style={styles.discountText}>{item.discount}% OFF</Text>
          </View>
        )}
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
  
  const renderRecentSearch = ({ item }) => (
    <View style={styles.recentSearchItem}>
      <TouchableOpacity 
        style={styles.recentSearchContent}
        onPress={() => handleSelectRecentSearch(item)}
      >
        <Icon name="clock" size={16} color={colors.silver500} />
        <Text style={styles.recentSearchText}>{item}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveRecentSearch(item)}
      >
        <Icon name="x" size={16} color={colors.silver500} />
      </TouchableOpacity>
    </View>
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
        
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.silver500} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar en Mercado Libre"
            placeholderTextColor={colors.silver500}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClearSearch}
            >
              <Icon name="x" size={20} color={colors.silver500} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.mercadoBlue} />
        </View>
      ) : showResults ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            <View style={styles.emptyResultsContainer}>
              <Icon name="search" size={48} color={colors.silver300} />
              <Text style={styles.emptyResultsText}>
                No encontramos resultados para "{searchQuery}"
              </Text>
              <Text style={styles.emptyResultsSuggestion}>
                Revisa la ortografía o intenta con términos más generales
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.recentSearchesContainer}>
          <Text style={styles.recentSearchesTitle}>Búsquedas recientes</Text>
          <FlatList
            data={recentSearches}
            renderItem={renderRecentSearch}
            keyExtractor={(item) => item}
          />
          
          {recentSearches.length > 0 && (
            <TouchableOpacity 
              style={styles.clearAllButton}
              onPress={() => setRecentSearches([])}
            >
              <Text style={styles.clearAllText}>Borrar historial</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    padding: 12,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    fontSize: 14,
    color: colors.silver800,
    marginBottom: 4,
  },
  resultPrice: {
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
  recentSearchesContainer: {
    flex: 1,
    padding: 16,
  },
  recentSearchesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.silver800,
    marginBottom: 16,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver200,
  },
  recentSearchContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentSearchText: {
    fontSize: 14,
    color: colors.silver700,
    marginLeft: 12,
  },
  removeButton: {
    padding: 4,
  },
  clearAllButton: {
    alignSelf: 'center',
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearAllText: {
    color: colors.mercadoBlue,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyResultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.silver700,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyResultsSuggestion: {
    fontSize: 14,
    color: colors.silver600,
    textAlign: 'center',
  },
});

export default SearchScreen;