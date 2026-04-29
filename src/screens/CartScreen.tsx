import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initiatePayment,
  PaymentProvider,
  formatPhoneNumber,
  validatePhoneNumber,
  generateOrderRef,
} from '../services/kpayService';

interface CartScreenProps {
  navigation: any;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

// Product images mapping
const PRODUCT_IMAGES: { [key: string]: any } = {
  '1': require('../../assets/products/milk.jpeg'),
  '2': require('../../assets/products/cheese.jpeg'),
  '3': require('../../assets/products/yogurt.jpeg'),
  '4': require('../../assets/products/bread.jpeg'),
  '5': require('../../assets/products/croissant.jpeg'),
  '6': require('../../assets/products/cake.jpeg'),
  '7': require('../../assets/products/rice.jpeg'),
  '8': require('../../assets/products/pasta.jpeg'),
  '9': require('../../assets/products/yogurt.jpeg'),
  '10': require('../../assets/products/fruitop.jpeg'),
  '11': require('../../assets/products/ricoffy.jpeg'),
  '12': require('../../assets/products/quickbrew.jpeg'),
  '13': require('../../assets/products/chipsy.jpeg'),
  '14': require('../../assets/products/cookies.jpeg'),
  '15': require('../../assets/products/popcorns.jpeg'),
  '16': require('../../assets/products/nivea.jpeg'),
  '17': require('../../assets/products/colgate.jpeg'),
  '18': require('../../assets/products/imperial.jpeg'),
  '19': require('../../assets/products/gain.jpeg'),
  '20': require('../../assets/products/tissue.jpeg'),
  '21': require('../../assets/products/poa.jpeg'),
  '22': require('../../assets/products/chicken.jpeg'),
  '23': require('../../assets/products/ham.jpeg'),
  '24': require('../../assets/products/chips.jpeg'),
};

export default function CartScreen({ navigation }: CartScreenProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadCart();
    const unsubscribe = navigation.addListener('focus', () => {
      loadCart();
    });
    return unsubscribe;
  }, [navigation]);

  const loadCart = async () => {
    try {
      const saved = await AsyncStorage.getItem('cart');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async (items: CartItem[]) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    saveCart(updated);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      const updated = cartItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      setCartItems(updated);
      saveCart(updated);
    }
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart');
      return;
    }
    // Show payment method selection modal
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedProvider) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (!customerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid Zambian phone number (e.g., +260 76 123 4567 or 0761234567)'
      );
      return;
    }

    setIsProcessing(true);

    try {
      const orderRef = generateOrderRef();
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const paymentResponse = await initiatePayment({
        amount: totalAmount,
        phoneNumber: formattedPhone,
        provider: selectedProvider,
        orderRef: orderRef,
        customerName: customerName,
        description: `Grocery Purchase - ${cartItems.length} items`,
      });

      if (paymentResponse.success) {
        Alert.alert(
          'Payment Initiated',
          `A payment prompt has been sent to ${formattedPhone}.\n\nPlease confirm the payment on your phone.\n\nTransaction Reference: ${orderRef}`,
          [
            {
              text: 'OK',
              onPress: async () => {
                // Clear cart and form
                const emptyCart: CartItem[] = [];
                setCartItems(emptyCart);
                await saveCart(emptyCart);
                setShowPaymentModal(false);
                setPhoneNumber('');
                setCustomerName('');
                setSelectedProvider(null);

                // Show success message
                Alert.alert(
                  'Order Placed',
                  `Thank you for your purchase!\n\nTotal: $${totalAmount.toFixed(2)}\n\nOrder Reference: ${orderRef}`
                );
              },
            },
          ]
        );
      } else {
        Alert.alert('Payment Error', paymentResponse.message);
      }
    } catch (error: any) {
      Alert.alert('Error', `Payment initiation failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItemContainer}>
      <Image
        source={PRODUCT_IMAGES[item.id]}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
          style={styles.quantityButton}
        >
          <Ionicons name="remove" size={16} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
          style={styles.quantityButton}
        >
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => removeItem(item.id)}>
        <Ionicons name="trash" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Add items from the home screen
          </Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.continueShoppingText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.itemCount}>{cartItems.length} items</Text>
      </View>

      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Ionicons name="card" size={20} color="#fff" />
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !isProcessing && setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Method</Text>
              <TouchableOpacity
                onPress={() => !isProcessing && setShowPaymentModal(false)}
                disabled={isProcessing}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Total Amount */}
              <View style={styles.totalSummary}>
                <Text style={styles.totalLabel}>Order Total:</Text>
                <Text style={styles.totalAmount}>
                  ${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                </Text>
              </View>

              {/* Customer Name Input */}
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your full name"
                value={customerName}
                onChangeText={setCustomerName}
                editable={!isProcessing}
                placeholderTextColor="#999"
              />

              {/* Phone Number Input */}
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., +260 761 234 567 or 0761234567"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                editable={!isProcessing}
                placeholderTextColor="#999"
              />

              {/* Payment Provider Selection */}
              <Text style={styles.inputLabel}>Select Payment Method</Text>

              {/* MTN Momo Option */}
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedProvider === PaymentProvider.MTN_MOMO && styles.paymentOptionSelected,
                ]}
                onPress={() => !isProcessing && setSelectedProvider(PaymentProvider.MTN_MOMO)}
                disabled={isProcessing}
              >
                <View style={styles.paymentOptionContent}>
                  <Ionicons
                    name={selectedProvider === PaymentProvider.MTN_MOMO ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={selectedProvider === PaymentProvider.MTN_MOMO ? '#FFD700' : '#999'}
                  />
                  <View style={[styles.paymentBadge, styles.mtnBadge]}>
                    <Text style={styles.badgeText}>MTN</Text>
                  </View>
                  <View style={styles.paymentOptionText}>
                    <Text style={styles.paymentOptionName}>MTN Momo</Text>
                    <Text style={styles.paymentOptionDesc}>Fast and secure mobile money payment</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Airtel Money Option */}
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedProvider === PaymentProvider.AIRTEL_MONEY && styles.paymentOptionSelected,
                ]}
                onPress={() => !isProcessing && setSelectedProvider(PaymentProvider.AIRTEL_MONEY)}
                disabled={isProcessing}
              >
                <View style={styles.paymentOptionContent}>
                  <Ionicons
                    name={selectedProvider === PaymentProvider.AIRTEL_MONEY ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={selectedProvider === PaymentProvider.AIRTEL_MONEY ? '#FF0000' : '#999'}
                  />
                  <View style={[styles.paymentBadge, styles.airtelBadge]}>
                    <Text style={styles.badgeText}>AIRTEL</Text>
                  </View>
                  <View style={styles.paymentOptionText}>
                    <Text style={styles.paymentOptionName}>Airtel Money</Text>
                    <Text style={styles.paymentOptionDesc}>Convenient airtel money transfers</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Info Text */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>
                  A payment prompt will be sent to your phone. Please confirm the payment to complete your order.
                </Text>
              </View>
            </ScrollView>

            {/* Payment Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => !isProcessing && setShowPaymentModal(false)}
                disabled={isProcessing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.payButton, isProcessing && styles.payButtonDisabled]}
                onPress={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="card" size={20} color="#fff" />
                    <Text style={styles.payButtonText}>Pay Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  itemCount: {
    fontSize: 14,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  cartItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 8,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    backgroundColor: '#4CAF50',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  continueShoppingButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  totalSummary: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  paymentOption: {
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f7f0',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  paymentBadge: {
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  mtnBadge: {
    backgroundColor: '#FFD700',
  },
  airtelBadge: {
    backgroundColor: '#FF0000',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  paymentOptionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentOptionDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f7f0',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  payButton: {
    backgroundColor: '#4CAF50',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
});
