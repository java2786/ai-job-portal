import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.js'

const el = document.getElementById("root");
if (!el) throw new Error("No element with id='root' found");
createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
