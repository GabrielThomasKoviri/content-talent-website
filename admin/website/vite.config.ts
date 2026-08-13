import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load environment variables based on current mode (e.g. .env file)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: env.BACKEND_API_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
