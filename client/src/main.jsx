import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { registerSW } from "virtual:pwa-register"

import { ThemeProvider } from "./context/ThemeContext"
import { AuthProvider } from "./context/AuthContext"
import { ToastProvider } from "./context/ToastContext"
import store from "./redux/store"
import App from "./App"
import "./index.css"

registerSW({ immediate: true })

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <ToastProvider>
              <App />
            </ToastProvider>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>
)
