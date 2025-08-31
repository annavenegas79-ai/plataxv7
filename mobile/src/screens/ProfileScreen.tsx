import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();

  const menuItems = [
    { id: 1, title: 'Mis compras', icon: 'shopping-bag', badge: '2' },
    { id: 2, title: 'Favoritos', icon: 'heart' },
    { id: 3, title: 'Ofertas', icon: 'tag' },
    { id: 4, title: 'Tiendas oficiales', icon: 'check-circle' },
    { id: 5, title: 'Vender', icon: 'dollar-sign' },
    { id: 6, title: 'Historial', icon: 'clock' },
  ];

  const accountItems = [
    { id: 1, title: 'Mis datos', icon: 'user' },
    { id: 2, title: 'Seguridad', icon: 'shield' },
    { id: 3, title: 'Direcciones', icon: 'map-pin' },
    { id: 4, title: 'Tarjetas', icon: 'credit-card' },
    { id: 5, title: 'Privacidad', icon: 'lock' },
    { id: 6, title: 'Configuración', icon: 'settings' },
    { id: 7, title: 'Ayuda', icon: 'help-circle' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi cuenta</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Icon name="settings" size={20} color={colors.silver700} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.userSection}>
          <Image 
            source={{ uri: user?.avatar || 'https://randomuser.me/api/portraits/women/68.jpg' }} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
            <Text style={styles.userLevel}>Nivel 3 - Mercado Puntos</Text>
            <TouchableOpacity style={styles.viewProfileButton}>
              <Text style={styles.viewProfileText}>Ver mi perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.levelProgress}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>$2,500 para nivel 4</Text>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Compras</Text>
          {menuItems.map(item => (
            <TouchableOpacity key={item.id} style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Icon name={item.icon} size={20} color={colors.silver700} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
              {item.badge && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <Icon name="chevron-right" size={20} color={colors.silver400} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Mi cuenta</Text>
          {accountItems.map(item => (
            <TouchableOpacity key={item.id} style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Icon name={item.icon} size={20} color={colors.silver700} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Icon name="chevron-right" size={20} color={colors.silver400} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={signOut}
        >
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Versión 1.0.0</Text>
        </View>
      </ScrollView>
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
  settingsButton: {
    padding: 4,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.silver800,
    marginBottom: 2,
  },
  userLevel: {
    fontSize: 14,
    color: colors.silver600,
    marginBottom: 8,
  },
  viewProfileButton: {
    alignSelf: 'flex-start',
  },
  viewProfileText: {
    color: colors.mercadoBlue,
    fontSize: 14,
  },
  levelProgress: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.silver200,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    width: '75%',
    height: '100%',
    backgroundColor: colors.mercadoBlue,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.silver600,
    textAlign: 'right',
  },
  menuSection: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.silver800,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.silver100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.silver800,
  },
  badgeContainer: {
    backgroundColor: colors.mercadoBlue,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  signOutButton: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '500',
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 12,
    color: colors.silver500,
  },
});

export default ProfileScreen;