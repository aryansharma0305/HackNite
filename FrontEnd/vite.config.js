import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from "flowbite-react/plugin/vite";


export default defineConfig({
  plugins: [react(), flowbiteReact()],
  server: {
    port: 80,
    host: true,
    allowedHosts:['aryan.centralindia.cloudapp.azure.com'],
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Backend server
        changeOrigin: true,
        secure: false,
      
      },
    },
  },
});

