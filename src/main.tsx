import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import './styles/index.css'

document.documentElement.classList.add('dark')
document.documentElement.style.height = '100%'
document.body.style.height = '100%'
document.body.style.overflow = 'hidden'
document.body.style.margin = '0'

const rootElement = document.getElementById('root')!
rootElement.style.height = '100%'
const root = ReactDOM.createRoot(rootElement)

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
