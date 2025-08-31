import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import { colors } from '../theme/colors';
import { mockClips } from '../services/api';

const { width } = Dimensions.get('window');

const ClipsScreen = () => {
  const renderClipItem = ({ item }) => (
    <TouchableOpacity style={styles.clipItem}>
      <Image source={{ uri: item.thumbnail }} style={styles.clipThumbnail} />
      <View style={styles.clipOverlay}>
        <View style={styles.clipInfo}>
          <Text style={styles.clipTitle}>{item.title}</Text>
          <View style={styles.viewsContainer}>
            <Icon name="eye" size={14} color="white" />
            <Text style={styles.viewsText}>{item.views.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Duplicar los clips para tener más contenido
  const extendedClips = [...mockClips, ...mockClips, ...mockClips].map((clip, index) => ({
    ...clip,
    id: `${clip.id}-${index}`
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clips</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" size={20} color={colors.silver700} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Icon name="zap" size={16} color={colors.mercadoBlue} />
          <Text style={[styles.tabText, styles.activeTabText]}>Para ti</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Icon name="compass" size={16} color={colors.silver600} />
          <Text style={styles.tabText}>Explorar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Icon name="heart" size={16} color={colors.silver600} />
          <Text style={styles.tabText}>Favoritos</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={extendedClips}
        renderItem={renderClipItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.clipRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.clipsList}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.mercadoYellow,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.silver800,
  },
  searchButton: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver200,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.mercadoBlue,
  },
  tabText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.silver600,
  },
  activeTabText: {
    color: colors.mercadoBlue,
    fontWeight: '500',
  },
  clipsList: {
    padding: 8,
  },
  clipRow: {
    justifyContent: 'space-between',
  },
  clipItem: {
    width: (width - 24) / 2,
    height: 240,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  clipThumbnail: {
    width: '100%',
    height: '100%',
  },
  clipOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  clipInfo: {
    padding: 12,
  },
  clipTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewsText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
});

export default ClipsScreen;