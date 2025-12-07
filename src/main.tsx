import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' 

// Garante que o elemento root existe antes de tentar renderizar
const root = document.getElementById('root')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
