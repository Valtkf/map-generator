import React, { useState } from "react";
import { GeoJson, parseGpxFile } from "../../utils/gpx";

interface FileUploadProps {
  onChange: (geoJson: GeoJson) => void;
}

const FileUpload = ({ onChange }: FileUploadProps) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".gpx")) {
      setFileName(file.name);
      try {
        const geoJson = await parseGpxFile(file);
        onChange(geoJson);
      } catch (error) {
        console.error("Erreur lors du parsing du fichier GPX:", error);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".gpx")) {
      setFileName(file.name);
      try {
        const geoJson = await parseGpxFile(file);
        onChange(geoJson);
      } catch (error) {
        console.error("Erreur lors du parsing du fichier GPX:", error);
      }
    }
  };

  return (
    <div
      className={`w-full max-w-md mb-6 p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-blue-400"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById("file-upload")?.click()}
    >
      <div className="flex flex-col items-center justify-center">
        <svg
          className="w-10 h-10 mb-3 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="mb-2 text-sm text-gray-700">
          <span className="font-semibold">Cliquez pour ajouter</span> ou
          glissez-déposez
        </p>
        <p className="text-xs text-gray-500">Fichier GPX uniquement</p>
        {fileName && (
          <div className="mt-2 text-sm text-green-600 font-medium">
            Fichier chargé : {fileName}
          </div>
        )}
      </div>
      <input
        id="file-upload"
        type="file"
        accept=".gpx"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;
