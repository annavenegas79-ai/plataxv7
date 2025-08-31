import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { mockProducts } from '../services/api';

const FavoritesScreen = () => {
  const navigation = useNavigation();

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productItem}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.productPrice}>$ {item.price.toLocaleString()}</Text>
        {item.discount > 0 && (
          <View style={styles.discountContainer}>
            <Text style={styles.discountText}>{item.discount}% OFF</Text>
          </View>
        )}
        {item.installments && (
          <Text style={styles.installmentsText}>
            6 meses sin intereses de $ {item.installments.amount.toFixed(2)}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.favoriteButton}>
        <Icon name="heart" size={20} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
      </View>

      <FlatList
        data={mockProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
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
    padding: 16,
    backgroundColor: colors.mercadoYellow,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.silver800,
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
    position: 'relative',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productTitle: {
    fontSize: 14,
    color: colors.silver800,
    marginBottom: 4,
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
  installmentsText: {
    fontSize: 12,
    color: colors.mercadoGreen,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
});

export default FavoritesScreen;