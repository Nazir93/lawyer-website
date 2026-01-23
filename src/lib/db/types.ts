// Реэкспорт типов из Prisma Client
export type {
  User,
  Account,
  Session,
  VerificationToken,
  SiteSettings,
  Category,
  Service,
  Case,
  News,
  Lead,
  Review,
  FAQ,
  Pricing,
  Media,
  HeroSection,
  ClientDocument,
  Message,
  UserCase,
  Appointment,
  UserRole,
  CategoryType,
  ServiceGroup,
  LeadStatus,
  HeroContentType,
  VideoType,
  TextPosition,
  DocumentCategory,
  DocumentStatus,
  UploadedBy,
  ConversationType,
  CaseRole,
  CaseUserStatus,
  AppointmentType,
  AppointmentStatus,
} from "@prisma/client";

// Тип Json для совместимости
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

