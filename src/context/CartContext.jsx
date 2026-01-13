/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("jenta_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error recuperando carrito:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("jenta_cart", JSON.stringify(cart));
  }, [cart]);

  // Optimización: useCallback para que la función no cambie en cada render
  const addToCart = useCallback((product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);

      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  }, []);

  // Optimización: Cálculo memorizado del total
  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Optimización: El valor del contexto no cambia a menos que cambie el carrito
  const value = useMemo(
    () => ({
      cart,
      addToCart,
      cartCount,
    }),
    [cart, addToCart, cartCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook exportado en el mismo archivo (Seguro con la línea eslint-disable)
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
};
