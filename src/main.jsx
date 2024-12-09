import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginDashboard from './Components/auth/loginDashboard.jsx'
import GPSTracker from './Components/GPSTracker.jsx'
const router = createBrowserRouter([
  {
    element: <App />, path: '/', children: [
    {element:<GPSTracker/>, path: 'GPS-tracker/' },
    {element:<LoginDashboard/>, path: 'GPS-tracker33/' }
  ]}
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}>

    <App />
    </RouterProvider>
  </StrictMode>,
)
