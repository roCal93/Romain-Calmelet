import { useState, useEffect } from 'react'
import ContactGame from '../contactGame/ContactGame'
import PhoneGame from '../phoneGame/PhoneGame'
import styles from './fullscreenGame.module.scss'

const FullscreenGame = ({ gameType, backToMenu }) => {
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight)
    }

    // Vérifier l'orientation initiale
    checkOrientation()

    // Écouter les changements d'orientation
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  return (
    <div className={`${styles.fullGame} allowScroll`}>
      <button onClick={backToMenu} className={styles.backButton}>
        ← Retour
      </button>

      {isLandscape ? (
        <div className={styles.orientationMessage}>
          <div className={styles.messageContent}>
            <span className={styles.rotateIcon}>📱</span>
            <h2>Veuillez tourner votre appareil</h2>
            <p>Ce jeu est optimisé pour le mode portrait</p>
          </div>
        </div>
      ) : (
        <>
          {gameType === 'contact' && <ContactGame />}
          {gameType === 'phone' && <PhoneGame backButton={backToMenu} />}
        </>
      )}
    </div>
  )
}

export default FullscreenGame
