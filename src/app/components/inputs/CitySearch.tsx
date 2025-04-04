import React, { useState } from "react";

interface CitySearchProps {
  onCitySelect: (center: [number, number]) => void;
}

const CitySearch = ({ onCitySelect }: CitySearchProps) => {
  const [cityName, setCityName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!cityName.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      // Utiliser l'API Mapbox Geocoding pour rechercher la ville
      const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          cityName
        )}.json?access_token=${accessToken}&types=place`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        // Récupérer les coordonnées de la première correspondance
        const [lng, lat] = data.features[0].center;
        onCitySelect([lng, lat]);

        // Afficher le nom complet de la ville trouvée
        const placeName = data.features[0].place_name;
        console.log(`Ville trouvée: ${placeName}`);
      } else {
        setError("Aucune ville trouvée avec ce nom");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de la ville:", error);
      setError("Erreur lors de la recherche");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Rechercher une ville</h2>
      <div className="flex">
        <input
          type="text"
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          placeholder="Nom de la ville"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !cityName.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {isSearching ? "..." : "Rechercher"}
        </button>
      </div>
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
      <p className="mt-1 text-xs text-gray-500">
        Entrez le nom d&apos;une ville pour centrer la carte sur cette
        localisation
      </p>
    </div>
  );
};

export default CitySearch;
