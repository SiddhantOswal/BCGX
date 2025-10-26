import { apiService } from './api';

export interface Product {
  id: string;
  name: string;
  category: string;
  cost_price: number;
  selling_price: number;
  description?: string;
  stock_available: number;
  units_sold: number;
  created_at: string;
}

export interface ProductCreate {
  name: string;
  category: string;
  cost_price: number;
  selling_price: number;
  description?: string;
  stock_available?: number;
  units_sold?: number;
}

export interface ProductUpdate {
  name?: string;
  category?: string;
  cost_price?: number;
  selling_price?: number;
  description?: string;
  stock_available?: number;
  units_sold?: number;
}

export interface ForecastPoint {
  price: number;
  demand: number;
}

export interface ForecastSummary {
  product_id: string;
  product_name: string;
  category: string;
  forecast_demand: number;
  cost_price: number;
  selling_price: number;
}

export interface OptimizedProduct {
  id: string;
  name: string;
  category: string;
  description?: string;
  cost_price: number;
  selling_price: number;
  optimized_price: number;
}

export const productService = {
  async getProducts(search?: string, category?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    const response = await apiService.get<Product[]>(`/products?${params.toString()}`);
    return response.data || [];
  },

  async getProduct(id: string): Promise<Product | null> {
    const response = await apiService.get<Product>(`/products/${id}`);
    return response.data || null;
  },

  async createProduct(product: ProductCreate): Promise<Product | null> {
    const response = await apiService.post<Product>('/products', product);
    return response.data || null;
  },

  async updateProduct(id: string, product: ProductUpdate): Promise<Product | null> {
    const response = await apiService.put<Product>(`/products/${id}`, product);
    return response.data || null;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const response = await apiService.delete(`/products/${id}`);
    return response.data !== undefined && !response.error;
  },

  async getForecast(productId: string): Promise<ForecastPoint[]> {
    const response = await apiService.get<ForecastPoint[]>(`/forecast/${productId}`);
    return response.data || [];
  },

  async getForecastSummary(): Promise<ForecastSummary[]> {
    const response = await apiService.get<ForecastSummary[]>('/forecast/summary');
    return response.data || [];
  },

  async getOptimizedPrices(): Promise<OptimizedProduct[]> {
    const response = await apiService.get<OptimizedProduct[]>('/optimize/optimize');
    return response.data || [];
  },
};
