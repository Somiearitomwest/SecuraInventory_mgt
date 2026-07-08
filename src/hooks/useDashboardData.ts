"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchRecentPreOrders } from "@/api/pre-orders";
import { fetchProducts } from "@/api/products";
import { createSupabaseClient } from "@/supabase/client";
import { hasSupabaseConfig } from "@/supabase/config";
import type { RecentPreOrder } from "@/types/pre-orders";
import type { Product } from "@/types/products";

export function useDashboardData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [preOrders, setPreOrders] = useState<RecentPreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const hasSupabaseCredentials = hasSupabaseConfig();

  const loadDashboardData = useCallback(async () => {
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
        setPreOrders([]);
        setIsLoading(false);
        return;
      }

      const [nextProducts, nextPreOrders] = await Promise.all([
        fetchProducts(supabase),
        fetchRecentPreOrders(supabase),
      ]);

      setProducts(nextProducts);
      setPreOrders(nextPreOrders);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unknown Supabase error");
    } finally {
      setIsLoading(false);
    }
  }, [hasSupabaseCredentials]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  return {
    error,
    hasSupabaseCredentials,
    isLoading,
    preOrders,
    products,
    reloadDashboardData: loadDashboardData,
  };
}
