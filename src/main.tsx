import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import {router} from './routes/AppRouter.tsx'
import { AppDataProvider } from './store/AppDataProvider.tsx'
import { Toaster } from '@/components/ui/sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppDataProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AppDataProvider>
  </StrictMode>,
)
