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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HomeScreenProps {
  navigation: any;
}

// Product images mapping - require local PNG files
const PRODUCT_IMAGES: { [key: string]: any } = {
  // Dairy & Refrigerated - milk image
  '1': require('../../assets/products/milk.jpeg'),
  '2': require('../../assets/products/milk.jpeg'),
  '3': require('../../assets/products/yogurt.jpeg'),
  
  // Bakery - bread image
  '4': require('../../assets/products/bread.jpeg'),
  '5': require('../../assets/products/bread.jpeg'),
  '6': require('../../assets/products/bread.jpeg'),
  
  // Pantry/Dry Goods - yogurt as substitute
  '7': require('../../assets/products/yogurt.jpeg'),
  '8': require('../../assets/products/yogurt.jpeg'),
  '9': require('../../assets/products/yogurt.jpeg'),
  
  // Beverages - milk image
  '10': require('../../assets/products/milk.jpeg'),
  '11': require('../../assets/products/milk.jpeg'),
  '12': require('../../assets/products/milk.jpeg'),
  
  // Snacks - bread image
  '13': require('../../assets/products/bread.jpeg'),
  '14': require('../../assets/products/bread.jpeg'),
  '15': require('../../assets/products/bread.jpeg'),
  
  // Health & Beauty - yogurt image
  '16': require('../../assets/products/yogurt.jpeg'),
  '17': require('../../assets/products/yogurt.jpeg'),
  '18': require('../../assets/products/yogurt.jpeg'),
  
  // Household Supplies - milk image
  '19': require('../../assets/products/milk.jpeg'),
  '20': require('../../assets/products/milk.jpeg'),
  '21': require('../../assets/products/milk.jpeg'),
  
  // Deli & Prepared Food - bread image
  '22': require('../../assets/products/bread.jpeg'),
  '23': require('../../assets/products/bread.jpeg'),
  '24': require('../../assets/products/yogurt.jpeg'),
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
  { id: '6', name: 'Cake', price: 5.99, category: '2', emoji: '🎂' },
  
  // Pantry/Dry Goods
  { id: '7', name: 'Rice', price: 2.0, category: '3', emoji: '🍚' },
  { id: '8', name: 'Pasta', price: 1.5, category: '3', emoji: '🍝' },
  { id: '9', name: 'Cereal', price: 3.5, category: '3', emoji: '🥣' },
  
  // Beverages
  { id: '10', name: 'Orange Juice', price: 3.99, category: '4', emoji: '🧡' },
  { id: '11', name: 'Coffee', price: 4.5, category: '4', emoji: '☕' },
  { id: '12', name: 'Tea', price: 2.99, category: '4', emoji: '🫖' },
  
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

  const filteredProducts = selectedCategory
    ? PRODUCTS.filter((p) => p.category === selectedCategory)
    : PRODUCTS;

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
    <View style={styles.productCard}>
      <Image
        source={PRODUCT_IMAGES[item.id]}
        style={styles.productImage}
      />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
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
        <Text style={styles.headerTitle}>🛒 Fresh Groceries</Text>
      </View>

      <Text style={styles.sectionTitle}>Categories</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoryButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    width: 100,
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#fff',
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
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
