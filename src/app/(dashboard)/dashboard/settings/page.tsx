"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Shield,
  Smartphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  });

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light tracking-tight">Настройки</h1>
        <p className="text-muted-foreground mt-1">
          Управление вашим профилем и настройками аккаунта
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 rounded-full bg-secondary/50">
          <TabsTrigger value="profile" className="rounded-full py-2">
            Профиль
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-full py-2">
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-full py-2">
            Безопасность
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-full py-2">
            Оплата
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Личные данные</CardTitle>
                <CardDescription>
                  Обновите вашу личную информацию
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-medium">
                      ИП
                    </div>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <p className="font-medium">Фото профиля</p>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG или GIF. Максимум 2MB.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Form */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Имя</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        defaultValue="Иван"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input id="lastName" defaultValue="Петров" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        defaultValue="ivan@example.com"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        defaultValue="+7 (900) 123-45-67"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="rounded-full">
                    Отмена
                  </Button>
                  <Button className="rounded-full">Сохранить изменения</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Уведомления</CardTitle>
                <CardDescription>
                  Настройте способы получения уведомлений
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Email уведомления</p>
                        <p className="text-sm text-muted-foreground">
                          Получать уведомления на почту
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, email: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">SMS уведомления</p>
                        <p className="text-sm text-muted-foreground">
                          Получать SMS о важных событиях
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, sms: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Push уведомления</p>
                        <p className="text-sm text-muted-foreground">
                          Уведомления в браузере
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, push: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Маркетинговые рассылки</p>
                        <p className="text-sm text-muted-foreground">
                          Новости и специальные предложения
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, marketing: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Пароль</CardTitle>
                <CardDescription>Измените ваш пароль</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Текущий пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      className="pl-9 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Новый пароль</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Подтверждение</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button className="rounded-full">Изменить пароль</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Двухфакторная аутентификация</CardTitle>
                <CardDescription>
                  Добавьте дополнительный уровень защиты
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">2FA</p>
                      <p className="text-sm text-muted-foreground">
                        Не настроено
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-full">
                    Настроить
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Удаление аккаунта</CardTitle>
                <CardDescription>
                  Это действие невозможно отменить. Все ваши данные будут удалены.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="rounded-full">
                  Удалить аккаунт
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Способы оплаты</CardTitle>
                <CardDescription>Управление платёжными методами</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">
                        Истекает 12/25
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Удалить
                  </Button>
                </div>
                <Button variant="outline" className="w-full rounded-full">
                  Добавить карту
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>История платежей</CardTitle>
                <CardDescription>Ваши недавние транзакции</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      date: "20 января 2024",
                      description: "Консультация по семейному праву",
                      amount: "5 000 ₽",
                    },
                    {
                      date: "15 декабря 2023",
                      description: "Подготовка документов",
                      amount: "15 000 ₽",
                    },
                  ].map((payment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.date}
                        </p>
                      </div>
                      <span className="font-medium">{payment.amount}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

