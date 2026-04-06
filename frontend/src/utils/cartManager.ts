import { apiFetch } from "../lib/api";

export interface CartItem {
  id: string;
  productId: string; 
  name: string;
  size: string; // Size variant
  material: string; // Material variant
  price: number;
  quantity: number;
  image: string;
}

interface ServerCartItem {
  product: {
    _id: string;
    name: string;
    images?: Array<{ url?: string }>;
  };
  size?: string;
  material?: string;
  price: number;
  quantity: number;
}

interface ServerCartData {
  items?: ServerCartItem[];
}

let globalCartItems: CartItem[] = [];
let globalCartListeners: ((items: CartItem[]) => void)[] = [];

const notifyListeners = () => {
  globalCartListeners.forEach(listener => listener([...globalCartItems]));
};

const getCommonHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};


const mapServerCartToClientCart = (serverCartData: ServerCartData | null | undefined): CartItem[] => {
  if (!serverCartData || !serverCartData.items) return [];

  return serverCartData.items.map((item) => ({
    id: item.product._id, 
    productId: item.product._id,
    name: item.product.name,
    image: item.product.images?.[0]?.url || 'https://placehold.co/100x100/A0A0A0/ffffff?text=No+Image', 
    size: item.size || 'N/A', 
    material: item.material || 'N/A', 
    price: item.price,
    quantity: item.quantity,
  }));
};


export const fetchCart = async (): Promise<void> => {
  try {

    const response = await apiFetch('/cart', {
      method: 'GET',
      headers: getCommonHeaders(),
    });

    if (response.status === 401 || response.status === 403) {
      console.warn("User is not authenticated. Cart data not loaded.");
      globalCartItems = [];
    } else if (!response.ok) {
      throw new Error('Failed to fetch cart on server.');
    } else {
      const result = await response.json();
      globalCartItems = mapServerCartToClientCart(result.data);
    }
    
    notifyListeners();
  } catch (error) {
    console.error('Error fetching cart:', error);
  }
};


export interface AddToCartPayload {
  productId: string;
  quantity: number;
  size: string;
  material: string;
}

export const addToCart = async (payload: AddToCartPayload): Promise<void> => {
  try {
    const response = await apiFetch('/cart/items', {
      method: 'POST',
      headers: getCommonHeaders(),
      json: payload,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Bad Request or Unauthorized' }));
      throw new Error(`Failed to add item to cart on server: ${errorData.message}`);
    }

    await fetchCart(); 
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};


export const updateCartItemQuantity = async (
    productId: string, 
    size: string, 
    material: string,
    delta: number
): Promise<void> => {
    try {
        const payload = { size, material, delta }; 
        
        const response = await apiFetch(`/cart/items/${productId}`, {
            method: 'PUT',
            headers: getCommonHeaders(),
            json: payload,
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Failed to update cart item quantity on server: ${response.status} ${response.statusText}`;
            try {

              const errorData = JSON.parse(errorText);
                errorMessage = `Failed to update cart item quantity on server: ${errorData.message || errorData.error || errorData.reason}`;
            } catch {

              errorMessage = `Failed to update cart item quantity on server: ${errorText}`;
            }
            throw new Error(errorMessage);
        }

        await fetchCart();

    } catch (error) {
        console.error('Error updating item quantity:', error);

        throw error;
    }
};

export const removeFromCart = async (
  productId: string,
  size: string,
  material: string
) => {
  try {
    const response = await apiFetch(`/cart/items/${productId}`, {
      method: 'DELETE',
      headers: {
        ...getCommonHeaders(),
        'Content-Type': 'application/json',
      },
      json: { size, material },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Bad Request or Unauthorized' }));
      throw new Error(`Failed to remove item from cart on server: ${errorData.message}`);
    }

    await fetchCart();
  } catch (error) {
    console.error('Error removing item from cart:', error);
  }
};


export const getCartItems = (): CartItem[] => {
  return [...globalCartItems];
};


export const getCartCount = (): number => {
  return globalCartItems.reduce((sum, item) => sum + item.quantity, 0);
};

export const getCartSubtotal = (): number => {
  return globalCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

export const subscribeToCart = (listener: (items: CartItem[]) => void): (() => void) => {
  globalCartListeners.push(listener);
  

  return () => {
    globalCartListeners = globalCartListeners.filter(l => l !== listener);
  };
};

fetchCart();
