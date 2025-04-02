import React from "react";
import { GeoJson, parseGpxFile } from "../utils/gpx";

interface FileUploadProps {
  onChange: (geoJson: GeoJson) => void;
}

const FileUpload = ({ onChange }: FileUploadProps) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".gpx")) {
      try {
        const geoJson = await parseGpxFile(file);
        onChange(geoJson);
      } catch (error) {
        console.error("Erreur lors du parsing du fichier GPX:", error);
      }
    }
  };

  return (
    <input
      type="file"
      accept=".gpx"
      onChange={handleFileChange}
      className="justify-center mb-4 border-[1px]"
    />
  );
};

export default FileUpload;
