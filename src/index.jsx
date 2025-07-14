import React from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import App from './app/App.jsx'
import NotFound from './pages/not-found/NotFound.jsx'
import Presentation from './pages/presentation/Presentation.jsx'
import Home from './pages/home/Home.jsx'
import Portfolio from './pages/portfolio/Portfolio.jsx'
import Contact from './pages/contact/contact.jsx'

// Remplacez createBrowserRouter par createHashRouter
const router = createHashRouter([
  {
    path: '/', // Notez : plus besoin du basename avec HashRouter
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'presentation',
        element: <Presentation />,
      },
      {
        path: 'portfolio',
        element: <Portfolio />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
