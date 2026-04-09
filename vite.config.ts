import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build-time guard: prevent production builds with demo mode enabled
function assertNoDemoModeInProduction(): void {
  if (process.env.NODE_ENV === 'production' && process.env.VITE_DEMO_MODE === 'true') {
    throw new Error(
      '\n\n🚨 BUILD ABORTED: VITE_DEMO_MODE=true in a production build.\n' +
      'Demo mode bypasses authentication and must never ship to production.\n' +
      'Set VITE_DEMO_MODE=false or remove it from your environment.\n'
    )
  }
}

assertNoDemoModeInProduction()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
