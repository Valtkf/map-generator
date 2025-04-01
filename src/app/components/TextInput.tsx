import React from "react";

const TextInput = ({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Nom de la course"
      value={value}
      onChange={onChange}
      className="border border-gray-300 p-2 mb-4 w-full max-w-md"
    />
  );
};

export default TextInput;
