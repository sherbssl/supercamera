import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

function serverlessApiPlugin() {
  return {
    name: 'serverless-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url) return next();
        const pathname = req.url.split('?')[0];

        if (pathname === '/api/health') {
          try {
            const { default: healthHandler } = await server.ssrLoadModule('./api/health.ts');
            return healthHandler(req, res);
          } catch (err) {
            console.error('Error handling /api/health:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal Server Error', details: String(err) }));
            return;
          }
        }

        if (pathname === '/api/trafficimages' || pathname === '/api/traffic-images') {
          try {
            const { default: trafficHandler } = await server.ssrLoadModule('./api/trafficimages.ts');
            return trafficHandler(req, res);
          } catch (err) {
            console.error('Error handling /api/trafficimages:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal Server Error', details: String(err) }));
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serverlessApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/traffic-images': {
          target: 'https://api.data.gov.sg',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/traffic-images/, '/v1/transport/traffic-images'),
        },
      },
    },
  };
});
