import { NextResponse } from "next/server";

/** Единый ответ для ошибок auth в API routes */
export function authErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Error";
  if (message === "Unauthorized") {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  if (message === "Forbidden") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  return null;
}

/** Публичные поля SiteSettings (без секретов) */
export function publicSiteSettings<T extends Record<string, unknown>>(data: T) {
  const {
    telegramBotToken: _t,
    telegramChatId: _c,
    ...safe
  } = data as T & {
    telegramBotToken?: unknown;
    telegramChatId?: unknown;
  };
  return {
    ...safe,
    hasTelegramBot: Boolean(_t),
    hasTelegramChat: Boolean(_c),
  };
}
