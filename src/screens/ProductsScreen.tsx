import React, { useState } from 'react';
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

interface ProductsScreenProps {
  navigation: any;
}

// Product images mapping - require local PNG files
const PRODUCT_IMAGES: { [key: string]: any } = {
  '1': require('../../assets/products/milk.jpeg'),
  '2': require('../../assets/products/cheese.jpeg'),
  '3': require('../../assets/products/yogurt.jpeg'),
  '4': require('../../assets/products/bread.jpeg'),
  '5': require('../../assets/products/croissant.jpeg'),
  '6': require('../../assets/products/cake.jpeg'),
  '7': require('../../assets/products/rice.jpeg'),
  '8': require('../../assets/products/pasta.jpeg'),
  '9': require('../../assets/products/bread.jpeg'),
  '10': require('../../assets/products/fruitop.jpeg'),
  '11': require('../../assets/products/ricoffy.jpeg'),
  '12': require('../../assets/products/ricoffy.jpeg'),
};

const PRODUCTS = [
  { id: '1', name: 'Pamarat Milk', price: 3.99, category: '1', emoji: '🥛' },
  { id: '2', name: 'Cheese', price: 4.5, category: '1', emoji: '🧀' },
  { id: '3', name: 'Yogurt', price: 2.5, category: '1', emoji: '🍨' },
  { id: '4', name: 'Bread', price: 2.5, category: '2', emoji: '🍞' },
  { id: '5', name: 'Croissant', price: 3.0, category: '2', emoji: '🥐' },
  { id: '6', name: 'Piece of Choclate Cake', price: 5.99, category: '2', emoji: '🎂' },
  { id: '7', name: 'Nakonde Rice Per kg', price: 2.0, category: '3', emoji: '🍚' },
  { id: '8', name: 'Pasta', price: 1.5, category: '3', emoji: '🍝' },
  { id: '9', name: 'Cereal', price: 3.5, category: '3', emoji: '🥣' },
  { id: '10', name: 'Orange Juice', price: 3.99, category: '4', emoji: '🧃' },
  { id: '11', name: 'Coffee', price: 4.5, category: '4', emoji: '☕' },
  { id: '12', name: 'Tea', price: 2.99, category: '4', emoji: '🫖' },
];

export default function ProductsScreen({ navigation }: ProductsScreenProps) {
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
      style={styles.productItem}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
      activeOpacity={0.9}
    >
      <Image
        source={PRODUCT_IMAGES[item.id]}
        style={styles.productImage}
      />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 Products</Text>
      </View>
      <FlatList
        data={PRODUCTS}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        scrollEnabled={true}
        contentContainerStyle={styles.productsList}
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
  productsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    resizeMode: 'contain',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 8,
  },
});
