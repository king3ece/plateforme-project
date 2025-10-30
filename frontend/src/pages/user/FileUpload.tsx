// import React from 'react';

// interface Props {
//   onFilesChange: (files: File[]) => void;
// }

// export function FileUpload({ onFilesChange }: Props) {
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files ? Array.from(e.target.files) : [];
//     onFilesChange(files);
//   };

//   return (
//     <div>
//       <input type="file" multiple onChange={handleChange} />
//     </div>
//   );
// }

// export default FileUpload;

import React, { useRef, useState } from "react";
import { Upload, X, File as FileIcon } from "lucide-react";
import { Button } from "../../components/ui/button";

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  initialFiles?: File[];
}

export function FileUpload({
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  initialFiles = [],
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    addFiles(selectedFiles);
    // Reset input pour permettre de sélectionner le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const addFiles = (newFiles: File[]) => {
    setError("");

    // Vérifier le nombre de fichiers
    if (files.length + newFiles.length > maxFiles) {
      setError(`Vous ne pouvez télécharger que ${maxFiles} fichiers maximum`);
      return;
    }

    // Vérifier la taille et le type
    const validFiles: File[] = [];
    for (const file of newFiles) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`${file.name} dépasse la taille maximale de ${maxSizeMB}MB`);
        continue;
      }

      if (!acceptedTypes.includes(file.type)) {
        setError(
          `${file.name} n'est pas un type de fichier accepté. Types acceptés: PDF, DOCX, XLS, JPG, PNG`
        );
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0 && newFiles.length > 0) {
      return; // Tous les fichiers ont été rejetés
    }

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    setError("");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    const icons: Record<string, string> = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      xls: "📊",
      xlsx: "📊",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
    };
    return icons[extension || ""] || "📎";
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-700 mb-1">
          Cliquez pour sélectionner ou glissez-déposez vos fichiers
        </p>
        <p className="text-xs text-gray-500">
          PDF, DOCX, XLS, JPG, PNG (max {maxSizeMB}MB par fichier, {maxFiles}{" "}
          fichiers max)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          ⚠️ {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Fichiers sélectionnés ({files.length}/{maxFiles})
          </p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">
                    {getFileIcon(file.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="flex-shrink-0 ml-2 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
