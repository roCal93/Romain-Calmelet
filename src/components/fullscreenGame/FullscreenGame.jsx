import { useState, useEffect } from 'react'
import ContactGame from '../contactGame/ContactGame'
import PhoneGame from '../phoneGame/PhoneGame'
import styles from './fullscreenGame.module.scss'

const FullscreenGame = ({ gameType, backToMenu }) => {
  const [shouldShowMessage, setShouldShowMessage] = useState(false)

  // Gérer la taille de l'écran
  useEffect(() => {
    const checkScreenSize = () => {
      const heightTooSmall = window.innerHeight < 600
      setShouldShowMessage(heightTooSmall)
    }

    // Vérifier la taille initiale
    checkScreenSize()

    // Écouter les changements de taille
    window.addEventListener('resize', checkScreenSize)
    window.addEventListener('orientationchange', checkScreenSize)

    return () => {
      window.removeEventListener('resize', checkScreenSize)
      window.removeEventListener('orientationchange', checkScreenSize)
    }
  }, [])

  return (
    <div className={`${styles.fullGame} allowScroll`}>
      <button
        onClick={backToMenu}
        className={styles.backButton}
        title="Retour au menu (Échap)"
      >
        ← Retour
      </button>

      {shouldShowMessage ? (
        <div className={styles.orientationMessage}>
          <div className={styles.messageContent}>
            <span className={styles.rotateIcon}>📱</span>
            <h2>Veuillez tourner votre appareil</h2>
            <p>Ce jeu a été optimisé pour le mode portrait</p>
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
