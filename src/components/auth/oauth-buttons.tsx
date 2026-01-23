"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

export function OAuthButtons() {
  const [isLoadingVK, setIsLoadingVK] = useState(false);
  const [isLoadingYandex, setIsLoadingYandex] = useState(false);

  const handleVKLogin = async () => {
    setIsLoadingVK(true);
    try {
      await signIn("vk", { callbackUrl: "/dashboard" });
    } catch {
      toast.error("Ошибка входа через VK");
      setIsLoadingVK(false);
    }
  };

  const handleYandexLogin = async () => {
    setIsLoadingYandex(true);
    try {
      await signIn("yandex", { callbackUrl: "/dashboard" });
    } catch {
      toast.error("Ошибка входа через Яндекс");
      setIsLoadingYandex(false);
    }
  };

  // Проверяем, настроены ли провайдеры
  const hasOAuthProviders = false; // Пока OAuth не настроен

  if (!hasOAuthProviders) {
    return null; // Не показываем кнопки если OAuth не настроен
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Или войдите через
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {/* Yandex Login */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 rounded-full"
          onClick={handleYandexLogin}
          disabled={isLoadingYandex || isLoadingVK}
        >
          {isLoadingYandex ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Подключение...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm9.5-7h-1.3l-4.2 14h2.1l1.1-3.5h4.6l1.1 3.5h2.1L12.8 5h-1.3zm-.3 8.5l1.8-6 1.8 6h-3.6z"/>
              </svg>
              Войти через Яндекс
            </>
          )}
        </Button>

        {/* VK Login */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 rounded-full"
          onClick={handleVKLogin}
          disabled={isLoadingVK || isLoadingYandex}
        >
          {isLoadingVK ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Подключение...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.553-1.497c.568-.19 1.3 1.264 2.073 1.822.586.422.992.328.992.328l1.99-.028s1.04-.064.547-.878c-.04-.067-.287-.605-1.478-1.71-1.247-1.157-1.078-.97.422-2.97.914-1.218 1.28-1.962 1.166-2.28-.11-.302-.787-.222-.787-.222l-2.24.014s-.166-.023-.29.05c-.121.073-.2.243-.2.243s-.36.965-.84 1.785c-1.01 1.73-1.416 1.822-1.58 1.716-.382-.247-.286-.992-.286-1.52 0-1.653.25-2.34-.49-2.52-.246-.058-.426-.097-1.053-.103-.805-.008-1.486.003-1.872.193-.256.127-.454.409-.334.426.15.02.49.093.67.34.232.318.224 1.034.224 1.034s.134 1.945-.312 2.185c-.305.166-.727-.173-1.627-1.72-.46-.793-.808-1.67-.808-1.67s-.066-.163-.186-.253c-.145-.108-.347-.143-.347-.143l-2.127.014s-.319.008-.436.147c-.104.123-.008.378-.008.378s1.69 3.96 3.602 5.953c1.752 1.827 3.744 1.707 3.744 1.707h.902z"/>
              </svg>
              Войти через VK
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
