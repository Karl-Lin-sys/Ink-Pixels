import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";

interface ImageUploaderProps {
  onImageSelected: (base64: string, mimeType: string) => void;
}

export default function ImageUploader({ onImageSelected }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageSelected(result, file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-2xl mx-auto p-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
          Begin Your Story
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Upload an image to inspire the world, the mood, and the opening lines.
        </p>
      </div>

      <div
        className={`w-full border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[250px]
          ${
            isDragging
              ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10"
              : "border-neutral-300 dark:border-neutral-700 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
          }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-full shadow-sm mb-4">
          <UploadCloud className="w-8 h-8 text-neutral-600 dark:text-neutral-400" />
        </div>
        <p className="text-neutral-800 dark:text-neutral-200 font-medium mb-1">
          Click to upload or drag and drop
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-500">
          JPG, PNG, WebP
        </p>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />
      </div>
    </motion.div>
  );
}
