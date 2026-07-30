import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import {router} from './routes/AppRouter.tsx'
import { store } from './app/store.ts'
import { Toaster } from '@/components/ui/sonner'
import { SESSION_EXPIRED_EVENT } from '@/lib/api/client'
import { bootstrapAuth, sessionExpired } from '@/features/authentication/slices/authSlice'

// Attempt to restore a session from a persisted refresh token before the app renders.
store.dispatch(bootstrapAuth())

// The axios client (src/lib/api/client.ts) can't import the store directly without
// risking a circular import, so it signals unrecoverable auth failures via a DOM event.
window.addEventListener(SESSION_EXPIRED_EVENT, () => {
  store.dispatch(sessionExpired())
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster />
    </Provider>
  </StrictMode>,
)
