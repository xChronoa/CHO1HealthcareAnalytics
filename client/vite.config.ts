import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Uncomment if firebase will be used in development
  // server: {
  //   host: '127.0.0.1',
  //   port: 5173, // Customize the port if needed
  // },
  base: '/',
})
