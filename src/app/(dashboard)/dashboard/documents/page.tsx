"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Upload,
  FileText,
  File,
  Download,
  Eye,
  Trash2,
  FolderOpen,
  MoreVertical,
  Clock,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentUpload } from "@/components/dashboard/document-upload";
import { toast } from "sonner";
import { formatDateShort } from "@/lib/utils/date";

interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  title: string | null;
  description: string | null;
  category: string;
  status: string;
  case_id: string | null;
  created_at: string;
}

const fileIcons: Record<string, string> = {
  pdf: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  docx: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  doc: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  xlsx: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  default: "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "Черновик", color: "bg-yellow-500" },
  uploaded: { label: "Загружен", color: "bg-blue-500" },
  sent: { label: "Отправлен", color: "bg-green-500" },
  signed: { label: "Подписан", color: "bg-purple-500" },
};

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [cases, setCases] = useState<Array<{ id: string; title: string; count: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadDocuments();
    loadCases();
  }, [selectedCase]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedCase) params.append("case_id", selectedCase);
      
      const res = await fetch(`/api/dashboard/documents?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setDocuments(data.data || []);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCases = async () => {
    try {
      const res = await fetch("/api/cases?active=true");
      const data = await res.json();
      
      if (res.ok && data.data) {
        const casesWithCount = await Promise.all(
          (data.data || []).map(async (caseItem: any) => {
            const docsRes = await fetch(`/api/dashboard/documents?case_id=${caseItem.id}`);
            const docsData = await docsRes.json();
            return {
              id: caseItem.id,
              title: caseItem.title,
              count: docsData.count || 0,
            };
          })
        );
        setCases(casesWithCount);
      }
    } catch (error) {
      console.error("Error loading cases:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить документ?")) return;
    
    try {
      const res = await fetch(`/api/dashboard/documents/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        toast.success("Документ удален");
        loadDocuments();
      } else {
        toast.error("Ошибка удаления");
      }
    } catch (error) {
      toast.error("Ошибка удаления");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || 'file';
  };

  const filteredDocs = documents.filter((doc) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      doc.original_filename.toLowerCase().includes(searchLower) ||
      doc.title?.toLowerCase().includes(searchLower) ||
      doc.description?.toLowerCase().includes(searchLower);
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Документы</h1>
          <p className="text-muted-foreground mt-1">
            Все документы по вашим делам
          </p>
        </div>
        <Button className="rounded-full gap-2" onClick={() => setShowUpload(!showUpload)}>
          <Upload className="h-4 w-4" />
          Загрузить документ
        </Button>
      </div>

      {/* Upload Area */}
      {showUpload && (
        <Card>
          <CardContent className="p-6">
            <DocumentUpload
              onUploadComplete={(doc) => {
                setShowUpload(false);
                loadDocuments();
              }}
              caseId={selectedCase || undefined}
            />
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-light">{documents.length}</p>
                <p className="text-sm text-muted-foreground">Всего документов</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-light">{cases.length}</p>
                <p className="text-sm text-muted-foreground">Дел</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-light">
                  {documents.filter((d) => d.status === "draft").length}
                </p>
                <p className="text-sm text-muted-foreground">Черновиков</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Cases Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Дела</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => setSelectedCase(null)}
                className={`w-full p-3 rounded-lg text-left transition-colors flex items-center justify-between ${
                  !selectedCase ? "bg-secondary" : "hover:bg-secondary/50"
                }`}
              >
                <span className="text-sm">Все документы</span>
                <Badge variant="secondary">{documents.length}</Badge>
              </button>
              {cases.map((caseItem) => (
                <button
                  key={caseItem.id}
                  onClick={() => setSelectedCase(caseItem.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors flex items-center justify-between ${
                    selectedCase === caseItem.id
                      ? "bg-secondary"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{caseItem.title}</span>
                  </div>
                  <Badge variant="secondary">{caseItem.count}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск документов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-full"
            />
          </div>

          {/* Documents Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocs.map((doc, index) => {
                const fileExt = getFileExtension(doc.original_filename);
                const iconClass = fileIcons[fileExt] || fileIcons.default;
                const status = statusLabels[doc.status];
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:border-foreground/20 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl ${iconClass} flex items-center justify-center`}
                          >
                            <File className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">{doc.title || doc.original_filename}</p>
                              <Badge variant="secondary" className="gap-1">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${status.color}`}
                                />
                                {status.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{fileExt.toUpperCase()}</span>
                              <span>•</span>
                              <span>{formatFileSize(doc.file_size)}</span>
                              <span>•</span>
                              <span>{formatDateShort(doc.created_at)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => window.open(doc.file_url, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = doc.file_url;
                                link.download = doc.original_filename;
                                link.click();
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => window.open(doc.file_url, '_blank')}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Просмотреть
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = doc.file_url;
                                  link.download = doc.original_filename;
                                  link.click();
                                }}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Скачать
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDelete(doc.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Удалить
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {!isLoading && filteredDocs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "Документы не найдены" : "Нет документов. Загрузите первый документ."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

