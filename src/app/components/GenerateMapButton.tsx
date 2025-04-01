import React from "react";

const GenerateMapButton = ({ onClick }) => {
  return (
    <button
      className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
      onClick={onClick}
    >
      Générer map
    </button>
  );
};

export default GenerateMapButton;
