import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  FlatList,
  FlatListProps,
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  RefreshControl,
  ViewStyle,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getPerformanceSettings } from '../utils/performance';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  renderItem: (item: T, index: number) => React.ReactElement;
  isLoading?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  emptyText?: string;
  footerLoadingText?: string;
  headerComponent?: React.ReactElement;
  footerComponent?: React.ReactElement;
  containerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  optimizationsEnabled?: boolean;
}

function OptimizedFlatList<T>({
  data,
  renderItem,
  isLoading = false,
  onRefresh,
  onEndReached,
  emptyText = 'No hay elementos para mostrar',
  footerLoadingText = 'Cargando más elementos...',
  headerComponent,
  footerComponent,
  containerStyle,
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  optimizationsEnabled = true,
  ...rest
}: OptimizedFlatListProps<T>): React.ReactElement {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);
  const onEndReachedCalledDuringMomentum = useRef(false);
  const performanceSettings = getPerformanceSettings();
  
  // Reset footer loading state when data changes
  useEffect(() => {
    setFooterLoading(false);
  }, [data]);
  
  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  }, [onRefresh]);
  
  // Handle end reached
  const handleEndReached = useCallback(() => {
    if (!onEndReachedCalledDuringMomentum.current && onEndReached && !footerLoading) {
      setFooterLoading(true);
      onEndReachedCalledDuringMomentum.current = true;
      onEndReached();
    }
  }, [onEndReached, footerLoading]);
  
  // Optimized render item function
  const optimizedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => renderItem(item, index),
    [renderItem]
  );
  
  // Key extractor
  const keyExtractor = useCallback(
    (item: any, index: number) => {
      if (item.id) return item.id.toString();
      if (item._id) return item._id.toString();
      return index.toString();
    },
    []
  );
  
  // Empty component
  const EmptyComponent = useCallback(() => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          {emptyText}
        </Text>
      </View>
    );
  }, [isLoading, emptyText, theme.colors.text]);
  
  // Footer component
  const ListFooterComponent = useCallback(() => {
    if (footerLoading) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.footerText, { color: theme.colors.text }]}>
            {footerLoadingText}
          </Text>
        </View>
      );
    }
    
    return footerComponent || null;
  }, [footerLoading, footerLoadingText, footerComponent, theme.colors]);
  
  // Performance optimizations
  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: 100, // Approximate height of each item
      offset: 100 * index,
      index,
    }),
    []
  );
  
  // Main loading indicator
  if (isLoading && (!data || data.length === 0)) {
    return (
      <View style={[styles.loadingContainer, containerStyle]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <FlatList
      data={data}
      renderItem={optimizedRenderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={EmptyComponent}
      ListHeaderComponent={headerComponent}
      ListFooterComponent={ListFooterComponent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        ) : undefined
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      onMomentumScrollBegin={() => {
        onEndReachedCalledDuringMomentum.current = false;
      }}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      contentContainerStyle={[
        styles.contentContainer,
        !data || data.length === 0 ? styles.emptyContentContainer : null,
      ]}
      // Performance optimizations
      ...(optimizationsEnabled
        ? {
            removeClippedSubviews: Platform.OS === 'android', // Can cause issues on iOS
            maxToRenderPerBatch: performanceSettings.maxToRenderPerBatch,
            windowSize: performanceSettings.windowSize,
            initialNumToRender: performanceSettings.initialNumToRender,
            updateCellsBatchingPeriod: 50,
            getItemLayout: getItemLayout,
          }
        : {})
      }
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  emptyContentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  footerText: {
    fontSize: 14,
    marginLeft: 10,
  },
});

export default OptimizedFlatList;