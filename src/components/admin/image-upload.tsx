"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.details 
          ? `${result.error}: ${result.details}` 
          : result.error || "Ошибка загрузки";
        throw new Error(errorMsg);
      }

      onChange(result.url);
      toast.success("Изображение загружено");
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
      if (file && file.type.startsWith("image/")) {
        handleUpload(file);
      } else {
        toast.error("Пожалуйста, загрузите изображение");
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

  const handleRemove = () => {
    onChange(null);
  };

  if (value) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-border">
        <img
          src={value}
          alt="Uploaded"
          className="w-full aspect-video object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span className="ml-2">Заменить</span>
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

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
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Перетащите изображение или кликните
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WebP до 5MB
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
}

