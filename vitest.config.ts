import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    // Ambiente `node` por padrão (testes de lib); os de componente pedem
    // `// @vitest-environment jsdom` no topo do arquivo. Mesma convenção do
    // lecionario-web.
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    // Fixa `NODE_ENV=test` no worker, antes de qualquer import: sem isto a
    // suíte herda o ambiente do shell. Se `NODE_ENV=production` estiver
    // exportado (shell de Docker, passo de CI), o React resolve o build de
    // produção — onde `act()` não existe — e a suíte de componentes morre com
    // "act(...) is not supported in production builds of React", erro que não
    // aponta o ambiente como causa.
    //
    // Precisa ser `test.env` e não um pin dentro de setupFiles: num setupFile o
    // `import { ... } from 'react'` é hoisted e carrega o React antes da
    // atribuição (o pin chega tarde e não funciona).
    env: { NODE_ENV: 'test' },
  },
});
