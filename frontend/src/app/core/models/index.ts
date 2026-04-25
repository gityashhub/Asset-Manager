export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  address?: Address;
  createdAt?: string;
}

export interface Address {
  line1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Product {
  _id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  stock: number;
  category: string;
  movement: string;
  caseMaterial: string;
  caseSize: string;
  waterResistance: string;
  featured: boolean;
  rating: number;
  reviewCount: number;
  createdAt?: string;
}

export interface ProductListResponse {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id?: string;
  user: string;
  items: CartItem[];
}

export interface ShippingAddress {
  fullName: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderItem {
  product: string;
  name: string;
  brand: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  user: string | { _id: string; name: string; email: string };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  status:
    | 'pending_payment'
    | 'paid'
    | 'failed'
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  payment: {
    method: string;
    transactionId?: string;
    status: 'unpaid' | 'success' | 'failure' | 'pending';
    paidAt?: string;
  };
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  recentOrders: Order[];
  lowStock: Product[];
}
