import React from "react";

interface FileUploadProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUpload = ({ onChange }: FileUploadProps) => {
  return (
    <input
      type="file"
      accept=".gpx"
      onChange={onChange}
      className="justify-center mb-4 border-[1px]"
    />
  );
};

export default FileUpload;
