import { createContext, useContext, useEffect, useState } from 'react';

export const CartContext = createContext(); // <-- export here

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, loading]);

  const value = {
    cart,
    cartCount: cart.reduce((count, item) => count + item.quantity, 0),
    cartTotal: cart.reduce(
      (total, item) => total + (item.offerPrice || item.standardPrice) * item.quantity,
      0
    ),
    addToCart: (product, quantity = 1) => {
      if (quantity < 1) return;
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id);
        if (existingItem) {
          return prevCart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevCart, { ...product, quantity }];
      });
    },
    removeFromCart: (productId) => {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
    },
    updateQuantity: (productId, newQuantity) => {
      setCart(prevCart => {
        if (newQuantity < 1) {
          // Remove item if quantity is set to 0 or less
          return prevCart.filter(item => item.id !== productId);
        }
        return prevCart.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        );
      });
    },
    clearCart: () => setCart([])
  };

  return (
    <CartContext.Provider value={value}>
      {!loading && children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}