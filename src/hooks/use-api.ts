"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface UseApiOptions<T> {
  url: string;
  initialData?: T[];
  autoFetch?: boolean;
}

export function useApi<T extends { id: string }>({
  url,
  initialData = [],
  autoFetch = true,
}: UseApiOptions<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получить все
  const fetchData = useCallback(async (params?: Record<string, string>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const searchParams = new URLSearchParams(params);
      const response = await fetch(`${url}?${searchParams}`);
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);
      
      setData(result.data || []);
      return result.data;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Ошибка загрузки данных");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  // Создать
  const create = async (item: Partial<T>) => {
    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);
      
      setData((prev) => [result.data, ...prev]);
      toast.success("Успешно создано");
      return result.data;
    } catch (err: any) {
      toast.error(err.message || "Ошибка создания");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Обновить
  const update = async (id: string, updates: Partial<T>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${url}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);
      
      setData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...result.data } : item))
      );
      toast.success("Успешно обновлено");
      return result.data;
    } catch (err: any) {
      toast.error(err.message || "Ошибка обновления");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Удалить
  const remove = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${url}/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);
      
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success("Успешно удалено");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Ошибка удаления");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Получить один
  const getOne = async (id: string) => {
    try {
      const response = await fetch(`${url}/${id}`);
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);
      
      return result.data;
    } catch (err: any) {
      toast.error(err.message || "Ошибка загрузки");
      throw err;
    }
  };

  // Автозагрузка при монтировании
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    setData,
    isLoading,
    error,
    fetchData,
    create,
    update,
    remove,
    getOne,
  };
}

// Хук для настроек (singleton)
export function useSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/settings");
      const result = await response.json();
      setSettings(result.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = async (updates: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, ...updates }),
      });
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);
      
      setSettings(result.data);
      toast.success("Настройки сохранены");
      return result.data;
    } catch (err: any) {
      toast.error(err.message || "Ошибка сохранения");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, isLoading, updateSettings, refetch: fetchSettings };
}

