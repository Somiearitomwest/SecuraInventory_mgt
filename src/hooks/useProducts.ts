"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct as apiDeleteProduct,
  fetchProducts,
  updateProduct as apiUpdateProduct,
} from "@/api/products";
import { createSupabaseClient } from "@/supabase/client";
import { hasSupabaseConfig } from "@/supabase/config";
import type { Product, ProductCreateInput, ProductUpdateInput } from "@/types/products";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const hasSupabaseCredentials = hasSupabaseConfig();

  const loadProducts = useCallback(async () => {
    setError("");

    if (!hasSupabaseCredentials) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createSupabaseClient();

      if (!supabase) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setProducts(await fetchProducts(supabase));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unknown Supabase error");
    } finally {
      setIsLoading(false);
    }
  }, [hasSupabaseCredentials]);

  async function addProduct(input: ProductCreateInput) {
    const supabase = createSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase environment variables are required.");
    }

    const nextProduct = await createProduct(supabase, input);
    setProducts((currentProducts) => [nextProduct, ...currentProducts]);
    return nextProduct;
  }

  async function updateProduct(id: string, input: ProductUpdateInput) {
    const supabase = createSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase environment variables are required.");
    }

    const updated = await apiUpdateProduct(supabase, id, input);
    setProducts((currentProducts) =>
      currentProducts.map((p) => (p.id === id ? updated : p)),
    );
    return updated;
  }

  async function deleteProduct(id: string) {
    const supabase = createSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase environment variables are required.");
    }

    await apiDeleteProduct(supabase, id);
    setProducts((currentProducts) =>
      currentProducts.filter((p) => p.id !== id),
    );
  }

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return {
    addProduct,
    deleteProduct,
    error,
    hasSupabaseCredentials,
    isLoading,
    products,
    reloadProducts: loadProducts,
    updateProduct,
  };
}

