import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { mockProducts } from '../services/api';

const BrowsingHistoryScreen = () => {
  const navigation = useNavigation();
  
  const renderHistoryItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>
          {index === 0 ? 'Hoy' : index === 2 ? 'Ayer' : 'Hace 3 días'}
        </Text>
      </View>
      <View style={styles.productContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.productPrice}>$ {item.price.toLocaleString()}</Text>
          {item.discount > 0 && (
            <View style={styles.discountContainer}>
              <Text style={styles.discountText}>{item.discount}% OFF</Text>
            </View>
          )}
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
        <Text style={styles.title}>Historial de navegación</Text>
        <TouchableOpacity style={styles.clearButton}>
          <Text style={styles.clearText}>Borrar</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={mockProducts}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.historyList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearText: {
    color: colors.mercadoBlue,
    fontSize: 14,
    fontWeight: '500',
  },
  historyList: {
    padding: 12,
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dateHeader: {
    backgroundColor: colors.silver100,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.silver700,
  },
  productContainer: {
    flexDirection: 'row',
    padding: 12,
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
    marginBottom: 8,
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
  separator: {
    height: 12,
  },
});

export default BrowsingHistoryScreen;