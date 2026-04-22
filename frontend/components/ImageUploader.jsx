"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { RingLoader } from "react-spinners";

export default function ImageUploader({ onImageSelect, loading }) {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      onImageSelect(file);
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
    noClick: true,
    noKeyboard: true,
  });

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onDrop([file]);
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const clearImage = () => {
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // Preview Mode
  if (preview) {
    return (
      <div
        className="relative w-full rounded-2xl overflow-hidden border-2 border-stone-200 bg-stone-100"
        style={{ minHeight: "220px", maxHeight: "420px", aspectRatio: "16/9" }}
      >
        <Image
          src={preview}
          alt="Pantry preview"
          fill
          className="object-contain sm:object-cover"
        />
        {!loading && (
          <button
            onClick={clearImage}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700" />
          </button>
        )}
        {loading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <RingLoader color="white" />
          </div>
        )}
      </div>
    );
  }

  // Upload Mode
  return (
    <>
      <div
        {...getRootProps()}
        className={`relative w-full border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
          isDragActive
            ? "border-orange-600 bg-orange-50 scale-[1.02]"
            : "border-stone-300 bg-stone-50 hover:border-orange-400 hover:bg-orange-50/50"
        }`}
        style={{ minHeight: "280px" }}
      >
        <input {...getInputProps()} />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-4 p-5 sm:p-8 text-center">
          {/* Icon */}
          <div
            className={`p-3 sm:p-4 rounded-full transition-all ${
              isDragActive ? "bg-orange-600 scale-110" : "bg-orange-100"
            }`}
          >
            {isDragActive ? (
              <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            ) : (
              <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" />
            )}
          </div>

          {/* Text */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-1 sm:mb-2">
              {isDragActive ? "Drop your image here" : "Scan Your Pantry"}
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm max-w-xs sm:max-w-sm">
              {isDragActive
                ? "Release to upload"
                : "Take a photo or drag & drop an image of your fridge/pantry"}
            </p>
          </div>

          {/* Buttons */}
          {!isDragActive && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full max-w-xs sm:w-auto">
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCameraCapture();
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white gap-2 w-full sm:w-auto text-sm"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
                className="border-orange-200 text-orange-700 hover:bg-orange-50 gap-2 w-full sm:w-auto text-sm"
              >
                <Upload className="w-4 h-4" />
                Browse Files
              </Button>
            </div>
          )}

          {/* Helper Text */}
          <p className="text-xs text-stone-400">JPG, PNG, WebP • Max 10MB</p>
        </div>
      </div>

      {/* Hidden file input for Browse Files */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Hidden camera input - rear camera on mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </>
  );
}