import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import store from './store'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            className: 'border-2 border-black dark:border-white font-mono text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] rounded-none uppercase bg-white text-black dark:bg-black dark:text-white px-4 py-3 select-none',
            success: {
              iconTheme: {
                primary: '#D90429',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#D90429',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
