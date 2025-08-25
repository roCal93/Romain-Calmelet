import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
import App from './app/App.jsx'
import NotFound from './pages/not-found/NotFound.jsx'
import Presentation from './pages/presentation/Presentation.jsx'
import Home from './pages/home/Home.jsx'
import Portfolio from './pages/portfolio/Portfolio.jsx'
import Contact from './pages/contact/contact.jsx'

// On passe à createBrowserRouter pour avoir de vraies URLs SEO-friendly
const router = createBrowserRouter([
  {
    path: '/',
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
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  </React.StrictMode>
)
