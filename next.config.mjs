/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "harlequin-giant-panda-964.mypinata.cloud",
          },
        ],
      },
};

export default nextConfig;
