import { useState, useEffect } from 'react';
import { productService, Product, ProductCreate, ProductUpdate, ForecastPoint, ForecastSummary, OptimizedProduct } from '../services/productService';

export const useProducts = (search?: string, category?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProducts(search, category);
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category]);

  const createProduct = async (product: ProductCreate) => {
    try {
      const newProduct = await productService.createProduct(product);
      if (newProduct) {
        setProducts(prev => [...prev, newProduct]);
        return newProduct;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    }
    return null;
  };

  const updateProduct = async (id: string, product: ProductUpdate) => {
    try {
      const updatedProduct = await productService.updateProduct(id, product);
      if (updatedProduct) {
        setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
        return updatedProduct;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    }
    return null;
  };

  const deleteProduct = async (id: string) => {
    try {
      const success = await productService.deleteProduct(id);
      if (success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
    return false;
  };

  const refreshProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts(search, category);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
  };
};

export const useForecast = (productId?: string) => {
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getForecast(id);
      setForecast(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forecast');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchForecast(productId);
    }
  }, [productId]);

  return { forecast, loading, error, fetchForecast };
};

export const useForecastSummary = () => {
  const [summary, setSummary] = useState<ForecastSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getForecastSummary();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch forecast summary');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return { summary, loading, error };
};

export const useOptimizedPrices = () => {
  const [optimizedProducts, setOptimizedProducts] = useState<OptimizedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptimizedPrices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getOptimizedPrices();
        setOptimizedProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch optimized prices');
      } finally {
        setLoading(false);
      }
    };

    fetchOptimizedPrices();
  }, []);

  return { optimizedProducts, loading, error };
};
