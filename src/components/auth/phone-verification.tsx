"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

interface PhoneVerificationProps {
  phone: string;
  onVerified: () => void;
  onBack: () => void;
}

export function PhoneVerification({ phone, onVerified, onBack }: PhoneVerificationProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = async () => {
    setIsLoading(true);
    try {
      // Отправляем запрос на отправку SMS
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Ошибка отправки SMS");
      }
      
      toast.success("SMS код отправлен на ваш телефон");
      setCodeSent(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ошибка отправки SMS";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast.error("Введите 6-значный код");
      return;
    }

    setIsLoading(true);
    try {
      // Для демонстрации - просто логиним по паролю, если SMS не настроен
      // В продакшене нужно проверить код через API
      const result = await signIn("phone", {
        phone,
        password: code, // Временно используем код как пароль
        redirect: false,
      });
      
      if (result?.error) {
        toast.error("Неверный код");
        return;
      }
      
      toast.success("Вход выполнен!");
      onVerified();
    } catch {
      toast.error("Ошибка входа");
    } finally {
      setIsLoading(false);
    }
  };

  if (!codeSent) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            На номер <span className="font-medium text-foreground">{phone}</span> будет отправлен SMS код
          </p>
        </div>
        <Button
          type="button"
          className="w-full h-11 rounded-full"
          onClick={handleSendCode}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Отправка...
            </>
          ) : (
            "Отправить код"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBack}
        >
          Назад
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code" className="text-sm text-muted-foreground">
          Введите код из SMS
        </Label>
        <Input
          id="code"
          type="text"
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="h-11 rounded-xl text-center text-2xl tracking-widest"
          maxLength={6}
          autoFocus
        />
        <p className="text-xs text-muted-foreground text-center">
          Код отправлен на {phone}
        </p>
      </div>

      <Button
        type="button"
        className="w-full h-11 rounded-full"
        onClick={handleVerifyCode}
        disabled={isLoading || code.length !== 6}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Проверка...
          </>
        ) : (
          "Подтвердить"
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setCodeSent(false);
            setCode("");
          }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Отправить код повторно
        </button>
      </div>
    </div>
  );
}
