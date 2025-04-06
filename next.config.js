/** @type {import('next').NextConfig} */
const nextConfig = {
  // Autres configurations existantes...

  // Si vous avez besoin de précharger des polices spécifiques
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Link",
            value: "",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
