import { promises as fs } from "fs";
import path from "path";

// Директория для загрузки файлов
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/uploads";

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
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9а-яА-Я]/g, "-")
    .substring(0, 50);

  return `${baseName}-${timestamp}-${randomString}.${extension}`;
}

export interface LocalUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  filename?: string;
  error?: string;
}

/**
 * Проверяет и создаёт директорию если её нет
 */
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Загрузить файл в локальное хранилище
 */
export async function uploadFileLocal(
  file: Buffer,
  originalFilename: string,
  mimeType: string,
  subfolder?: string
): Promise<LocalUploadResult> {
  try {
    const category = getFileCategory(mimeType);
    const folder = FILE_FOLDERS[category];
    const uniqueFilename = generateUniqueFilename(originalFilename);

    // Формируем путь к файлу
    const relativePath = subfolder
      ? path.join(folder, subfolder, uniqueFilename)
      : path.join(folder, uniqueFilename);

    const fullDir = path.join(UPLOAD_DIR, folder, subfolder || "");
    const fullPath = path.join(UPLOAD_DIR, relativePath);

    // Создаём директорию если нужно
    await ensureDir(fullDir);

    // Записываем файл
    await fs.writeFile(fullPath, file);

    // URL для доступа (относительный от public/)
    const url = `/uploads/${relativePath.replace(/\\/g, "/")}`;

    return {
      success: true,
      url,
      path: fullPath,
      filename: uniqueFilename,
    };
  } catch (error) {
    console.error("Error uploading file locally:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Удалить файл из локального хранилища
 */
export async function deleteFileLocal(filePath: string): Promise<boolean> {
  try {
    // Если это URL, преобразуем в путь
    let fullPath = filePath;
    if (filePath.startsWith("/uploads/")) {
      fullPath = path.join("./public", filePath);
    }

    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}

/**
 * Получить список файлов в папке
 */
export async function listFilesLocal(folder: string): Promise<string[]> {
  try {
    const dirPath = path.join(UPLOAD_DIR, folder);
    const files = await fs.readdir(dirPath, { recursive: true });
    return files.map((f) => String(f));
  } catch (error) {
    console.error("Error listing files:", error);
    return [];
  }
}

/**
 * Загрузить файл из FormData
 */
export async function uploadFromFormDataLocal(
  formData: FormData,
  fieldName: string = "file",
  subfolder?: string
): Promise<LocalUploadResult> {
  const file = formData.get(fieldName) as File | null;

  if (!file) {
    return {
      success: false,
      error: "No file provided",
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadFileLocal(buffer, file.name, file.type, subfolder);
}

