/** @type {import('next').NextConfig} */
const nextConfig = {
  // Necessário pro build Docker (self-hosted na VPS) — gera .next/standalone
  // com só o runtime necessário, sem precisar copiar node_modules inteiro.
  output: "standalone",
};

module.exports = nextConfig;
