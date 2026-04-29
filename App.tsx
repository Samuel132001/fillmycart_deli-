import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, View, Text } from 'react-native';
import { auth } from './src/config/firebase';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function MainNavigator() {
  const [cartCount, setCartCount] = useState(0);

  const loadCartCount = async () => {
    try {
      const saved = await AsyncStorage.getItem('cart');
      const cart = saved ? JSON.parse(saved) : [];
      const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(totalItems);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  useEffect(() => {
    loadCartCount();
    const interval = setInterval(loadCartCount, 1000);
    return () => clearInterval(interval);
  }, []);

  function TabNavigator() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any = 'home';

            if (route.name === 'HomeTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'ProductsTab') {
              iconName = focused ? 'storefront' : 'storefront-outline';
            } else if (route.name === 'CartTab') {
              iconName = focused ? 'cart' : 'cart-outline';
            } else if (route.name === 'ProfileTab') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#999',
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 4,
          },
        })}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{
            title: 'Home',
          }}
          listeners={({ navigation }) => ({
            tabPress: () => {
              loadCartCount();
            },
          })}
        />
        <Tab.Screen
          name="ProductsTab"
          component={ProductsScreen}
          options={{
            title: 'Products',
          }}
          listeners={({ navigation }) => ({
            tabPress: () => {
              loadCartCount();
            },
          })}
        />
        <Tab.Screen
          name="CartTab"
          component={CartScreen}
          options={{
            title: 'Cart',
            tabBarBadge: cartCount > 0 ? cartCount : undefined,
          }}
          listeners={({ navigation }) => ({
            tabPress: () => {
              loadCartCount();
            },
          })}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            title: 'Profile',
          }}
        />
      </Tab.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Set a timeout to ensure we don't get stuck loading
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.warn('Firebase auth check timeout - proceeding without user');
          setLoading(false);
        }
      }, 5000);

      console.log('Initializing Firebase auth...');
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log('Auth state changed:', currentUser ? 'User logged in' : 'No user');
        setUser(currentUser);
        setLoading(false);
        clearTimeout(timeoutId);
      }, (error) => {
        console.error('Auth error:', error);
        setError(error.message);
        setLoading(false);
        clearTimeout(timeoutId);
      });

      return () => {
        unsubscribe();
        clearTimeout(timeoutId);
      };
    } catch (err: any) {
      console.error('Error in App useEffect:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);
  

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 16, color: '#d32f2f', textAlign: 'center', paddingHorizontal: 20 }}>
          Error initializing app: {error}
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      onReady={() => console.log('NavigationContainer ready')}
      onStateChange={(state) => console.log('Navigation state:', state)}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen 
            name="MainApp" 
            component={MainNavigator}
          />
        ) : (
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator}
          />
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
