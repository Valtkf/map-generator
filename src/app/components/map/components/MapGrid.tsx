interface MapGridProps {
  visible: boolean;
}

export const MapGrid = ({ visible }: MapGridProps) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Lignes horizontales */}
      <div className="grid-lines-horizontal">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute w-full border-t border-dashed border-red-500 border-opacity-30"
            style={{ top: `${(i + 1) * 20}%`, left: 0, right: 0 }}
          />
        ))}
      </div>

      {/* ... reste du code de la grille ... */}
    </div>
  );
};
