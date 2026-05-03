import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  material: string;
  quantity: number;
  isCustom?: boolean;
  designData?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  deliveryDate: string;
  address: string;
  trackingNumber?: string;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

interface AppState {
  // Auth
  isLoggedIn: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, color: string, size: string) => void;
  updateQuantity: (id: number, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  cancelOrder: (orderId: string) => void;

  // Wishlist
  wishlist: number[];
  toggleWishlist: (id: number) => void;

  // Design Studio
  designColor: string;
  designText: string;
  designMaterial: string;
  setDesignColor: (color: string) => void;
  setDesignText: (text: string) => void;
  setDesignMaterial: (material: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      isLoggedIn: false,
      user: null,
      login: (user) => set({ isLoggedIn: true, user }),
      logout: () => set({ isLoggedIn: false, user: null, cart: [], orders: [], wishlist: [] }),

      // Cart
      cart: [],
      addToCart: (item) => {
        const { cart } = get();
        const existing = cart.find(
          (c) => c.id === item.id && c.color === item.color && c.size === item.size
        );
        if (existing) {
          set({
            cart: cart.map((c) =>
              c.id === item.id && c.color === item.color && c.size === item.size
                ? { ...c, quantity: c.quantity + item.quantity }
                : c
            ),
          });
        } else {
          set({ cart: [...cart, item] });
        }
      },
      removeFromCart: (id, color, size) => {
        set({ cart: get().cart.filter((c) => !(c.id === id && c.color === color && c.size === size)) });
      },
      updateQuantity: (id, color, size, quantity) => {
        if (quantity <= 0) {
          set({ cart: get().cart.filter((c) => !(c.id === id && c.color === color && c.size === size)) });
        } else {
          set({
            cart: get().cart.map((c) =>
              c.id === id && c.color === color && c.size === size ? { ...c, quantity } : c
            ),
          });
        }
      },
      clearCart: () => set({ cart: [] }),
      cartTotal: () => get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      cartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),

      // Orders
      orders: [
        {
          id: 'ORD-001',
          items: [
            {
              id: 1,
              name: 'Forest Leaf Organic Tee',
              price: 899,
              image: '/images/products/tshirt_01.jpg',
              color: '#2d5a3d',
              size: 'L',
              material: 'Organic Cotton',
              quantity: 1,
            },
          ],
          total: 899,
          status: 'delivered',
          date: '2026-03-15',
          deliveryDate: '2026-03-20',
          address: '123 Green Street, Pune, Maharashtra 411001',
          trackingNumber: 'ECO123456789',
        },
        {
          id: 'ORD-002',
          items: [
            {
              id: 4,
              name: 'Ocean Wave Recycled Tee',
              price: 1099,
              image: '/images/products/tshirt_04.jpg',
              color: '#1e5f8e',
              size: 'M',
              material: 'Recycled Polyester',
              quantity: 2,
            },
          ],
          total: 2198,
          status: 'shipped',
          date: '2026-04-20',
          deliveryDate: '2026-04-28',
          address: '123 Green Street, Pune, Maharashtra 411001',
          trackingNumber: 'ECO987654321',
        },
      ],
      addOrder: (order) => set({ orders: [order, ...get().orders] }),
      cancelOrder: (orderId) => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId ? { ...o, status: 'cancelled' as const } : o
          ),
        });
      },

      // Wishlist
      wishlist: [],
      toggleWishlist: (id) => {
        const { wishlist } = get();
        if (wishlist.includes(id)) {
          set({ wishlist: wishlist.filter((w) => w !== id) });
        } else {
          set({ wishlist: [...wishlist, id] });
        }
      },

      // Design Studio
      designColor: '#2d5a3d',
      designText: 'ECOLOOP',
      designMaterial: 'Organic Cotton',
      setDesignColor: (color) => set({ designColor: color }),
      setDesignText: (text) => set({ designText: text }),
      setDesignMaterial: (material) => set({ designMaterial: material }),
    }),
    {
      name: 'ecoloop-store',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        cart: state.cart,
        orders: state.orders,
        wishlist: state.wishlist,
      }),
    }
  )
);
