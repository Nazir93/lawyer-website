// Автоматический выбор хранилища:
// - Если настроен YANDEX_S3_ACCESS_KEY → используем Yandex S3
// - Иначе → используем локальное хранилище

import {
  uploadFile as uploadS3,
  deleteFile as deleteS3,
  type UploadResult,
} from "./yandex-s3";

import {
  uploadFileLocal,
  deleteFileLocal,
  type LocalUploadResult,
} from "./local";

// Определяем, настроен ли S3
const useS3 = !!(
  process.env.YANDEX_S3_ACCESS_KEY &&
  process.env.YANDEX_S3_SECRET_KEY &&
  process.env.YANDEX_S3_BUCKET
);

/**
 * Универсальная функция загрузки файла
 * Автоматически выбирает хранилище (S3 или локальное)
 */
export async function uploadFile(
  file: Buffer,
  originalFilename: string,
  mimeType: string,
  subfolder?: string
): Promise<UploadResult | LocalUploadResult> {
  if (useS3) {
    console.log("📦 Uploading to Yandex S3...");
    return uploadS3(file, originalFilename, mimeType, subfolder);
  } else {
    console.log("📁 Uploading to local storage...");
    return uploadFileLocal(file, originalFilename, mimeType, subfolder);
  }
}

/**
 * Универсальная функция удаления файла
 */
export async function deleteFile(pathOrKey: string): Promise<boolean> {
  if (useS3) {
    return deleteS3(pathOrKey);
  } else {
    return deleteFileLocal(pathOrKey);
  }
}

// Реэкспорт для обратной совместимости
export {
  getSignedDownloadUrl,
  listFiles,
  extractKeyFromUrl,
  uploadFromFormData,
  s3Client,
  BUCKET_NAME,
} from "./yandex-s3";

export {
  uploadFileLocal,
  deleteFileLocal,
  listFilesLocal,
  uploadFromFormDataLocal,
} from "./local";

export type { UploadResult } from "./yandex-s3";
export type { LocalUploadResult } from "./local";

// Статус хранилища
export const storageType = useS3 ? "yandex-s3" : "local";
