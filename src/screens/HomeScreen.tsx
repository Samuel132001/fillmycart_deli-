import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';

interface HomeScreenProps {
  navigation: any;
}

// Product images mapping - require local PNG files
const PRODUCT_IMAGES: { [key: string]: any } = {
  // Dairy & Refrigerated - milk image
  '1': require('../../assets/products/milk.jpeg'),
  '2': require('../../assets/products/cheese.jpeg'),
  '3': require('../../assets/products/yogurt.jpeg'),
  
  // Bakery - bread image
  '4': require('../../assets/products/bread.jpeg'),
  '5': require('../../assets/products/croissant.jpeg'),
  '6': require('../../assets/products/cake.jpeg'),
  
  // Pantry/Dry Goods - yogurt as substitute
  '7': require('../../assets/products/rice.jpeg'),
  '8': require('../../assets/products/pasta.jpeg'),
  '9': require('../../assets/products/yogurt.jpeg'),
  
  // Beverages - milk image
  '10': require('../../assets/products/fruitop.jpeg'),
  '11': require('../../assets/products/ricoffy.jpeg'),
  '12': require('../../assets/products/quickbrew.jpeg'),
  
  // Snacks - bread image
  '13': require('../../assets/products/chipsy.jpeg'),
  '14': require('../../assets/products/cookies.jpeg'),
  '15': require('../../assets/products/popcorns.jpeg'),
  
  // Health & Beauty - yogurt image
  '16': require('../../assets/products/nivea.jpeg'),
  '17': require('../../assets/products/colgate.jpeg'),
  '18': require('../../assets/products/imperial.jpeg'),
  
  // Household Supplies - milk image
  '19': require('../../assets/products/gain.jpeg'),
  '20': require('../../assets/products/tissue.jpeg'),
  '21': require('../../assets/products/poa.jpeg'),
  
  // Deli & Prepared Food - bread image
  '22': require('../../assets/products/chicken.jpeg'),
  '23': require('../../assets/products/ham.jpeg'),
  '24': require('../../assets/products/chips.jpeg'),
};

const CATEGORIES = [
  { id: '1', name: 'Dairy & Refrigerated', emoji: '🥛' },
  { id: '2', name: 'Bakery', emoji: '🍞' },
  { id: '3', name: 'Pantry/Dry Goods', emoji: '🥫' },
  { id: '4', name: 'Beverages', emoji: '🧃' },
  { id: '5', name: 'Snacks', emoji: '🍪' },
  { id: '6', name: 'Health & Beauty', emoji: '🧴' },
  { id: '7', name: 'Household Supplies', emoji: '🧹' },
  { id: '8', name: 'Deli & Prepared Food', emoji: '🍖' },
];

const PRODUCTS = [
  // Dairy & Refrigerated
  { id: '1', name: 'Pamarat Milk', price: 3.99, category: '1', emoji: '🥛' },
  { id: '2', name: 'Cheese', price: 4.5, category: '1', emoji: '🧀' },
  { id: '3', name: 'Yogurt', price: 2.5, category: '1', emoji: '🍨' },
  
  // Bakery
  { id: '4', name: 'Bread', price: 2.5, category: '2', emoji: '🍞' },
  { id: '5', name: 'Croissant', price: 3.0, category: '2', emoji: '🥐' },
  { id: '6', name: '1 Piece of Choclate Cake', price: 5.99, category: '2', emoji: '🎂' },
  
  // Pantry/Dry Goods
  { id: '7', name: 'Nakonde Rice Per kg', price: 2.0, category: '3', emoji: '🍚' },
  { id: '8', name: 'Pasta', price: 1.5, category: '3', emoji: '🍝' },
  { id: '9', name: 'Cereal', price: 3.5, category: '3', emoji: '🥣' },
  
  // Beverages
  { id: '10', name: 'Fruitop Juice', price: 3.99, category: '4', emoji: '🧡' },
  { id: '11', name: 'Coffee', price: 4.5, category: '4', emoji: '☕' },
  { id: '12', name: 'Quick Brew Black Tea Bags', price: 2.99, category: '4', emoji: '🫖' },
  
  // Snacks
  { id: '13', name: 'Chips', price: 1.99, category: '5', emoji: '🍟' },
  { id: '14', name: 'Cookies', price: 2.5, category: '5', emoji: '🍪' },
  { id: '15', name: 'Popcorn', price: 2.0, category: '5', emoji: '🍿' },
  
  // Health & Beauty
  { id: '16', name: 'Shampoo', price: 5.99, category: '6', emoji: '🧴' },
  { id: '17', name: 'Toothpaste', price: 3.5, category: '6', emoji: '🪥' },
  { id: '18', name: 'Soap', price: 2.99, category: '6', emoji: '🧼' },
  
  // Household Supplies
  { id: '19', name: 'Dish Soap', price: 2.5, category: '7', emoji: '🍽️' },
  { id: '20', name: 'Paper Towels', price: 3.99, category: '7', emoji: '🧻' },
  { id: '21', name: 'Laundry Detergent', price: 4.99, category: '7', emoji: '🧺' },
  
  // Deli & Prepared Food
  { id: '22', name: 'Rotisserie Chicken', price: 8.99, category: '8', emoji: '🍖' },
  { id: '23', name: 'Ham', price: 6.99, category: '8', emoji: '🍗' },
  { id: '24', name: 'Salad', price: 4.5, category: '8', emoji: '🥗' },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
    loadAvatar();
  }, []);

  const loadAvatar = async () => {
    try {
      const savedAvatar = await AsyncStorage.getItem('userAvatar');
      if (savedAvatar) {
        setAvatar(savedAvatar);
      }
    } catch (error) {
      console.error('Error loading avatar:', error);
    }
  };

  let filteredProducts = selectedCategory
    ? PRODUCTS.filter((p) => p.category === selectedCategory)
    : PRODUCTS;

  // Apply search filter
  if (searchQuery.trim()) {
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handleAddToCart = async (product: any) => {
    try {
      const saved = await AsyncStorage.getItem('cart');
      const cart = saved ? JSON.parse(saved) : [];

      const existingItem = cart.find((item: any) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          emoji: product.emoji,
          quantity: 1,
        });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Alert.alert('Added to Cart', `${product.name} has been added to your cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
      activeOpacity={0.9}
    >
      <Image
        source={PRODUCT_IMAGES[item.id]}
        style={styles.productImage}
      />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.categoryTextActive,
        ]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.avatarSection}>
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person-circle" size={40} color="#4CAF50" />
            )}
          </TouchableOpacity>

          <View style={styles.greetingSection}>
            <Text style={styles.greetingLabel}>Welcome back,</Text>
            <Text style={styles.greetingName}>
              {user?.displayName ? user.displayName.split(' ')[0] : 'User'}
            </Text>
          </View>

          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color="#4CAF50" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groceries"
            placeholderTextColor="#ccc"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="funnel" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
      </View>
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />

      <View style={styles.productsHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory
            ? CATEGORIES.find((c) => c.id === selectedCategory)?.name
            : 'All Products'}
        </Text>
        {selectedCategory && (
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={true}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.productsGrid}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 45,
    backgroundColor: '#fff',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarSection: {
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  greetingSection: {
    flex: 1,
  },
  greetingLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2c3e50',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2c3e50',
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  categoryButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    width: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#45a049',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productsGrid: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    resizeMode: 'contain',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});
