import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRODUCTS_DATA } from '../data/productsData';

interface ProductDetailsScreenProps {
  route: any;
  navigation: any;
}

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen({
  route,
  navigation,
}: ProductDetailsScreenProps) {
  const { productId } = route.params;
  const product = PRODUCTS_DATA[productId];
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<{
    [key: string]: any;
  }>({});

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  const handleVariantSelect = (variantKey: string, variant: any) => {
    setSelectedVariants({
      ...selectedVariants,
      [variantKey]: variant,
    });
  };

  const calculatePrice = () => {
    let basePrice = product.price;
    const variantKeys = Object.keys(selectedVariants);
    if (variantKeys.length > 0) {
      const lastVariant = selectedVariants[variantKeys[variantKeys.length - 1]];
      return lastVariant?.price || basePrice;
    }
    return basePrice;
  };

  const finalPrice = calculatePrice();
  const totalPrice = (finalPrice * quantity).toFixed(2);

  const handleAddToCart = async () => {
    try {
      const saved = await AsyncStorage.getItem('cart');
      const cart = saved ? JSON.parse(saved) : [];

      const cartItem = {
        id: product.id,
        name: product.name,
        price: finalPrice,
        emoji: product.emoji,
        quantity: quantity,
        variants: selectedVariants,
      };

      const existingItem = cart.find((item: any) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.variants = selectedVariants;
      } else {
        cart.push(cartItem);
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Alert.alert('Success', `${quantity} × ${product.name} added to cart!`);
      setQuantity(1);
      setSelectedVariants({});
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigation.navigate('CartTab');
  };

  const renderVariantGroup = (
    variantKey: string,
    variants: Array<{ id: string; label: string; price: number }>
  ) => (
    <View key={variantKey} style={styles.variantGroup}>
      <Text style={styles.variantLabel}>
        {variantKey.charAt(0).toUpperCase() + variantKey.slice(1)}
      </Text>
      <View style={styles.variantOptions}>
        {variants.map((variant) => (
          <TouchableOpacity
            key={variant.id}
            style={[
              styles.variantButton,
              selectedVariants[variantKey]?.id === variant.id &&
                styles.variantButtonSelected,
            ]}
            onPress={() => handleVariantSelect(variantKey, variant)}
          >
            <Text
              style={[
                styles.variantButtonText,
                selectedVariants[variantKey]?.id === variant.id &&
                  styles.variantButtonTextSelected,
              ]}
            >
              {variant.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={product.image} style={styles.productImage} />
          <Text style={styles.productEmoji}>{product.emoji}</Text>
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <View style={styles.productHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.category}>{product.category}</Text>
            </View>
            <Text style={styles.price}>${finalPrice.toFixed(2)}</Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4].map((i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={16}
                  color="#FFC107"
                  style={{ marginRight: 4 }}
                />
              ))}
              <Ionicons name="star-half" size={16} color="#FFC107" />
            </View>
            <Text style={styles.ratingText}>(4.5/5) 128 reviews</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            {product.features.map((feature: string, index: number) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#4CAF50"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Variants */}
          {product.variants && Object.keys(product.variants).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Options</Text>
              {Object.entries(product.variants).map(
                ([variantKey, variants]: [string, any]) =>
                  renderVariantGroup(variantKey, variants)
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(-1)}
          >
            <Ionicons name="remove" size={20} color="#4CAF50" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(1)}
          >
            <Ionicons name="add" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Price and Buttons */}
        <View style={styles.actionContainer}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>${totalPrice}</Text>
          </View>

          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={handleAddToCart}
          >
            <Ionicons name="cart" size={20} color="white" />
            <Text style={styles.btnText}>Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
            <Text style={styles.btnText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: 220,
    height: 220,
    borderRadius: 12,
    resizeMode: 'contain',
  },
  productEmoji: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 40,
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#999',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4CAF50',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 12,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'justify',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  variantGroup: {
    marginBottom: 16,
  },
  variantLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  variantOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  variantButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  variantButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  variantButtonTextSelected: {
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 12,
    backgroundColor: '#fff',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 8,
    marginBottom: 12,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  totalSection: {
    marginRight: 8,
  },
  totalLabel: {
    fontSize: 11,
    color: '#999',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
