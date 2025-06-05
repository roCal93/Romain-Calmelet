import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import App from './app/App.jsx'
import NotFound from './pages/not-found/NotFound.jsx'

// Creating a browser router with defined routes
const router = createBrowserRouter([
  {
    path: '/Portfolio/',
    element: <App />,
    children: [
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])

// Rendering the application into the root HTML node
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
