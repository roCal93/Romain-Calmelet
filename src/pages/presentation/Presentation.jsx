import { useEffect, useState } from 'react'

function Presentation() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animation d'entrée
    setIsVisible(true)

    return () => {
      setIsVisible(false)
    }
  }, [])

  return (
    <div
      className={`page-container ${
        isVisible ? 'page-enter-active' : 'page-enter'
      }`}
    >
      <h1>Presentation</h1>
      <p>Contenu de votre page de presentation</p>
      <p>
        Utilisez la molette de la souris ou les flèches du clavier pour naviguer
      </p>
    </div>
  )
}

export default Presentation
