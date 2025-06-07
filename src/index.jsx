import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import App from './app/App.jsx'
import NotFound from './pages/not-found/NotFound.jsx'
import Presentation from './pages/presentation/Presentation.jsx'
import Home from './pages/home/Home.jsx'
import Portfolio from './pages/portfolio/Portfolio.jsx'
import Contact from './pages/contact/contact.jsx'

// Creating a browser router with defined routes
const router = createBrowserRouter([
  {
    path: '/Romain-Calmelet/',
    element: <App />,
    children: [
      {
        index: true, // This makes it the default child route
        element: <Home />,
      },
      {
        path: 'presentation', // Relative path (no leading slash)
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
    path: '*', // Catch-all route at the root level
    element: <NotFound />,
  },
])

// Rendering the application into the root HTML node
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
