import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from "flowbite-react/plugin/vite";


export default defineConfig({
  plugins: [react(), flowbiteReact()],
  server: {
    port: 4000,
    host: true,
    allowedHosts:['hms.aryan-sharma.xyz'],
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Backend server
        changeOrigin: true,
        secure: false,
      
      },
    },
  },
});

