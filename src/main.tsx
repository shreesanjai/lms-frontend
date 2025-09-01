import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from "./components/ui/theme-provider.tsx"

import '@fontsource/geist/400.css'
import '@fontsource/geist/500.css'
import '@fontsource/geist/600.css'
import '@fontsource/geist/700.css'
import '@fontsource/geist-mono/400.css'


import { Provider } from 'react-redux'
import { store } from './store/store.ts'
import { BrowserRouter } from 'react-router-dom'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
