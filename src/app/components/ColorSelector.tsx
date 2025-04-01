import React from "react";

const ColorSelector = ({ backgroundColor, setBackgroundColor }) => {
  const colors = ["bg-white", "bg-slate-900", "#A3C2D1", "#E8D3C7"];

  return (
    <div className="flex space-x-2 mb-4">
      {colors.map((color) => (
        <button
          key={color}
          style={{ backgroundColor: color }}
          className="w-10 h-10 rounded-full border-2 border-gray-300"
          onClick={() => setBackgroundColor(color)}
        />
      ))}
    </div>
  );
};

export default ColorSelector;
