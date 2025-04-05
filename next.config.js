/** @type {import('next').NextConfig} */
const nextConfig = {
  // Autres configurations existantes...

  // Optimisation des polices
  optimizeFonts: false,

  // Si vous avez besoin de précharger des polices spécifiques
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Link",
            value: "", // Supprime les préchargements automatiques
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
