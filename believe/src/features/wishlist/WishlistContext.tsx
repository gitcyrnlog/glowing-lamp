import { createContext, useContext, ReactNode, useReducer, useEffect } from 'react';

export interface WishlistItem {
  id: string;
  title: string;
  price: string;
  image: string;
  category: string;
}

interface WishlistState {
  items: WishlistItem[];
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'LOAD_WISHLIST'; payload: WishlistItem[] };

const initialState: WishlistState = {
  items: [],
};

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Check if item already exists in wishlist
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return state; // Item already exists, no change needed
      }
      
      const newItems = [...state.items, action.payload];
      return {
        items: newItems,
      };
    }
    
    case 'REMOVE_ITEM': {
      return {
        items: state.items.filter(item => item.id !== action.payload),
      };
    }
    
    case 'CLEAR_WISHLIST':
      return initialState;
    
    case 'LOAD_WISHLIST':
      return {
        items: action.payload,
      };
    
    default:
      return state;
  }
}

interface WishlistContextType {
  state: WishlistState;
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'wishlist_items';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Load wishlist from localStorage on initial render
  useEffect(() => {
    const storedItems = localStorage.getItem(STORAGE_KEY);
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems);
        dispatch({ type: 'LOAD_WISHLIST', payload: parsedItems });
      } catch (error) {
        console.error('Failed to parse wishlist from localStorage:', error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: WishlistItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  };

  const isInWishlist = (id: string) => {
    return state.items.some(item => item.id === id);
  };
  
  // Toggle item in wishlist (add if not present, remove if present)
  const toggleWishlist = (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      removeItem(item.id);
    } else {
      addItem(item);
    }
  };

  return (
    <WishlistContext.Provider value={{ 
      state, 
      addItem, 
      removeItem, 
      clearWishlist, 
      isInWishlist,
      toggleWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
