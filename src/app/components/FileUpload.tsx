import React from "react";

const FileUpload = ({ onChange }) => {
  return (
    <input type="file" accept=".gpx" onChange={onChange} className="mb-4" />
  );
};

export default FileUpload;
