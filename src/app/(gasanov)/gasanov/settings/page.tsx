"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Bell,
  MessageSquare,
  Loader2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-api";

export default function AdminSettingsPage() {
  const { settings, isLoading: isFetching, updateSettings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);

  const [profile, setProfile] = useState({
    lawyer_name: "",
    lawyer_position: "",
    lawyer_bio: "",
    lawyer_experience_years: 15,
    phone: "",
    email: "",
    address: "",
    whatsapp: "",
    telegram: "",
  });

  const [notifications, setNotifications] = useState({
    telegram_bot_token: "",
    telegram_chat_id: "",
  });

  const [seo, setSeo] = useState({
    site_title: "",
    site_description: "",
    google_analytics_id: "",
    yandex_metrika_id: "",
  });

  // Заполняем формы из настроек
  useEffect(() => {
    if (settings) {
      setProfile({
        lawyer_name: settings.lawyer_name || "",
        lawyer_position: settings.lawyer_position || "",
        lawyer_bio: settings.lawyer_bio || "",
        lawyer_experience_years: settings.lawyer_experience_years || 15,
        phone: settings.phone || "",
        email: settings.email || "",
        address: settings.address || "",
        whatsapp: settings.whatsapp || "",
        telegram: settings.telegram || "",
      });
      setNotifications({
        telegram_bot_token: settings.telegram_bot_token || "",
        telegram_chat_id: settings.telegram_chat_id || "",
      });
      setSeo({
        site_title: settings.site_title || "",
        site_description: settings.site_description || "",
        google_analytics_id: settings.google_analytics_id || "",
        yandex_metrika_id: settings.yandex_metrika_id || "",
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateSettings({
        ...profile,
        ...notifications,
        ...seo,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testTelegram = async () => {
    if (!notifications.telegram_bot_token || !notifications.telegram_chat_id) {
      toast.error("Заполните токен бота и Chat ID");
      return;
    }

    setTestingTelegram(true);
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${notifications.telegram_bot_token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: notifications.telegram_chat_id,
            text: "✅ Тестовое сообщение от сайта!\n\nУведомления настроены корректно.",
            parse_mode: "HTML",
          }),
        }
      );

      if (response.ok) {
        toast.success("Тестовое сообщение отправлено!");
      } else {
        toast.error("Ошибка отправки. Проверьте токен и Chat ID");
      }
    } catch (error) {
      toast.error("Ошибка подключения к Telegram");
    } finally {
      setTestingTelegram(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Настройки</h1>
          <p className="text-muted-foreground">Управление настройками сайта</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Сохранить
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Информация о юристе
                  </CardTitle>
                  <CardDescription>
                    Эта информация отображается на сайте
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">ФИО</Label>
                      <Input
                        id="name"
                        value={profile.lawyer_name}
                        onChange={(e) =>
                          setProfile({ ...profile, lawyer_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Должность</Label>
                      <Input
                        id="position"
                        value={profile.lawyer_position}
                        onChange={(e) =>
                          setProfile({ ...profile, lawyer_position: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">О себе</Label>
                    <Textarea
                      id="bio"
                      value={profile.lawyer_bio}
                      onChange={(e) =>
                        setProfile({ ...profile, lawyer_bio: e.target.value })
                      }
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Лет опыта</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={profile.lawyer_experience_years}
                      onChange={(e) =>
                        setProfile({ ...profile, lawyer_experience_years: parseInt(e.target.value) || 0 })
                      }
                      className="w-32"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Контактные данные
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Адрес</Label>
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) =>
                        setProfile({ ...profile, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        placeholder="+79001234567"
                        value={profile.whatsapp}
                        onChange={(e) =>
                          setProfile({ ...profile, whatsapp: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telegram_username">Telegram</Label>
                      <Input
                        id="telegram_username"
                        placeholder="@username"
                        value={profile.telegram}
                        onChange={(e) =>
                          setProfile({ ...profile, telegram: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="grid gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Telegram уведомления
                  </CardTitle>
                  <CardDescription>
                    Получайте мгновенные уведомления о новых заявках в Telegram
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="botToken">Токен бота</Label>
                      <Input
                        id="botToken"
                        placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                        value={notifications.telegram_bot_token}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            telegram_bot_token: e.target.value,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Получите у @BotFather в Telegram
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chatId">Chat ID</Label>
                      <Input
                        id="chatId"
                        placeholder="-1001234567890"
                        value={notifications.telegram_chat_id}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            telegram_chat_id: e.target.value,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Получите у @userinfobot или @RawDataBot
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={testTelegram}
                      disabled={testingTelegram}
                    >
                      {testingTelegram ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Отправка...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Отправить тестовое сообщение
                        </>
                      )}
                    </Button>
                  </div>

                  <Separator />

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Как настроить:</h4>
                    <ol className="text-sm text-muted-foreground space-y-2">
                      <li>1. Найдите @BotFather в Telegram</li>
                      <li>2. Отправьте команду /newbot и следуйте инструкциям</li>
                      <li>3. Скопируйте полученный токен сюда</li>
                      <li>4. Найдите @userinfobot, отправьте /start и скопируйте ваш Chat ID</li>
                      <li>5. Нажмите "Отправить тестовое сообщение" для проверки</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <div className="grid gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    SEO настройки
                  </CardTitle>
                  <CardDescription>
                    Настройки для поисковых систем
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteTitle">Название сайта</Label>
                    <Input
                      id="siteTitle"
                      value={seo.site_title}
                      onChange={(e) =>
                        setSeo({ ...seo, site_title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Описание сайта</Label>
                    <Textarea
                      id="siteDescription"
                      value={seo.site_description}
                      onChange={(e) =>
                        setSeo({ ...seo, site_description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Аналитика</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ga">Google Analytics ID</Label>
                    <Input
                      id="ga"
                      placeholder="G-XXXXXXXXXX"
                      value={seo.google_analytics_id}
                      onChange={(e) =>
                        setSeo({ ...seo, google_analytics_id: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ym">Яндекс.Метрика ID</Label>
                    <Input
                      id="ym"
                      placeholder="12345678"
                      value={seo.yandex_metrika_id}
                      onChange={(e) =>
                        setSeo({ ...seo, yandex_metrika_id: e.target.value })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
