"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DocumentUploadProps {
  onUploadComplete: (document: any) => void;
  disabled?: boolean;
  caseId?: string;
}

export function DocumentUpload({ onUploadComplete, disabled, caseId }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    try {
      // Сначала загружаем файл
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || "Ошибка загрузки файла");
      }

      // Затем создаем запись в БД
      const docResponse = await fetch("/api/dashboard/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: uploadResult.filename,
          original_filename: file.name,
          file_url: uploadResult.url,
          file_type: file.type || file.name.split('.').pop() || 'unknown',
          file_size: file.size,
          title: file.name,
          case_id: caseId || null,
          category: 'other',
          status: 'uploaded',
        }),
      });

      const docResult = await docResponse.json();

      if (!docResponse.ok) {
        throw new Error(docResult.error || "Ошибка сохранения документа");
      }

      onUploadComplete(docResult.data);
      toast.success("Документ загружен");
    } catch (error: any) {
      toast.error(error.message || "Ошибка загрузки");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleUpload(file);
      }
    },
    [disabled, isUploading]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && !isUploading && inputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-foreground/20"}
        ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-muted">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Перетащите документ или кликните
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, DOC, DOCX, XLSX до 10MB
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xlsx,.xls,.txt,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
}

