import React from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
import App from './app/App.jsx'
import NotFound from './pages/not-found/NotFound.jsx'
import Presentation from './pages/presentation/Presentation.jsx'
import Home from './pages/home/Home.jsx'
import Portfolio from './pages/portfolio/Portfolio.jsx'
import Contact from './pages/contact/contact.jsx'

// Replace createBrowserRouter with createHashRouter
// This creates a router that uses hash-based routing (URLs with #)
const router = createHashRouter([
  {
    path: '/', // Note: no need for basename with HashRouter
    element: <App />, // Main app component that serves as the layout
    children: [
      // Nested routes that will render inside App component
      {
        index: true, // This route renders when the parent route matches exactly
        element: <Home />, // Home page component
      },
      {
        path: 'presentation', // Route for the presentation page
        element: <Presentation />,
      },
      {
        path: 'portfolio', // Route for the portfolio page
        element: <Portfolio />,
      },
      {
        path: 'contact', // Route for the contact page
        element: <Contact />,
      },
    ],
  },
  {
    path: '*', // Catch-all route for any unmatched paths
    element: <NotFound />, // 404 Not Found page component
  },
])

// Mount the React application to the DOM element with id 'root'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      {/* Enables additional checks and warnings in development */}
      <RouterProvider router={router} />
    </LanguageProvider>
    {/* Provides routing context to the app */}
  </React.StrictMode>
)
