import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3-совместимое хранилище (Reg.ru Cloud / Yandex Cloud)
const s3Client = new S3Client({
  region: "ru-1", // Reg.ru region
  endpoint: process.env.S3_ENDPOINT || "https://s3.regru.cloud",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
  forcePathStyle: true, // Важно для S3-совместимых хранилищ
});

const BUCKET_NAME = process.env.S3_BUCKET || "gasanov-lawyer-files";

// Типы файлов и их папки
const FILE_FOLDERS: Record<string, string> = {
  image: "images",
  document: "documents",
  video: "videos",
  audio: "audio",
  other: "files",
};

// Определяем тип файла по MIME типу
function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("word") ||
    mimeType.includes("excel") ||
    mimeType.includes("spreadsheet")
  ) {
    return "document";
  }
  return "other";
}

// Генерируем уникальное имя файла
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop() || "";
  const baseName = originalName
    .replace(/\.[^/.]+$/, "") // Удаляем расширение
    .replace(/[^a-zA-Z0-9а-яА-Я]/g, "-") // Заменяем спецсимволы
    .substring(0, 50); // Ограничиваем длину
  
  return `${baseName}-${timestamp}-${randomString}.${extension}`;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  filename?: string;
  error?: string;
}

/**
 * Загрузить файл в Yandex Object Storage
 */
export async function uploadFile(
  file: Buffer,
  originalFilename: string,
  mimeType: string,
  subfolder?: string
): Promise<UploadResult> {
  try {
    const category = getFileCategory(mimeType);
    const folder = FILE_FOLDERS[category];
    const uniqueFilename = generateUniqueFilename(originalFilename);
    
    // Формируем путь к файлу
    const key = subfolder
      ? `${folder}/${subfolder}/${uniqueFilename}`
      : `${folder}/${uniqueFilename}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: mimeType,
      // Публичный доступ для чтения
      ACL: "public-read",
    });

    await s3Client.send(command);

    // Формируем URL файла (Reg.ru path-style)
    const endpoint = process.env.S3_ENDPOINT || "https://s3.regru.cloud";
    const url = `${endpoint}/${BUCKET_NAME}/${key}`;

    return {
      success: true,
      url,
      key,
      filename: uniqueFilename,
    };
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Удалить файл из Yandex Object Storage
 */
export async function deleteFile(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    return false;
  }
}

/**
 * Получить подписанный URL для приватного доступа
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600 // 1 час по умолчанию
): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return null;
  }
}

/**
 * Получить список файлов в папке
 */
export async function listFiles(prefix: string): Promise<string[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
    return response.Contents?.map((item) => item.Key || "") || [];
  } catch (error) {
    console.error("Error listing files:", error);
    return [];
  }
}

/**
 * Извлечь ключ из публичного URL
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // URL формата: https://bucket.storage.yandexcloud.net/path/to/file.ext
    return urlObj.pathname.substring(1); // Убираем первый слеш
  } catch {
    return null;
  }
}

/**
 * Загрузить файл из FormData
 */
export async function uploadFromFormData(
  formData: FormData,
  fieldName: string = "file",
  subfolder?: string
): Promise<UploadResult> {
  const file = formData.get(fieldName) as File | null;
  
  if (!file) {
    return {
      success: false,
      error: "No file provided",
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadFile(buffer, file.name, file.type, subfolder);
}

export { s3Client, BUCKET_NAME };

