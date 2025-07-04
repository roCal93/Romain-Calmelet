import { useEffect, useState } from 'react'
import styles from './phoneMessage.module.scss'
import Confetti from 'react-confetti'

const SuccessModal = ({ phoneNumber, onClose }) => {
  const [showContent, setShowContent] = useState(false)
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    // Afficher le contenu progressivement
    const timer = setTimeout(() => setShowContent(true), 100)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    // Détecter le redimensionnement de la fenêtre
    const detectSize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', detectSize)
    return () => window.removeEventListener('resize', detectSize)
  }, [])

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <Confetti
        width={windowDimension.width}
        height={windowDimension.height}
        recycle={true}
        numberOfPieces={100}
        gravity={0.05}
      />
      <div
        className={`${styles.modalContent} ${showContent ? styles.show : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.successIcon}>
          <span className={styles.checkmark}>✓</span>
        </div>
        <h2 className={styles.congratsTitle}>Félicitations !</h2>
        <p className={styles.congratsText}>
          Vous avez trouvé la bonne séquence !
        </p>
        <div className={styles.phoneReveal}>
          <span className={styles.phoneLabel}>Numéro déverrouillé :</span>
          <div className={styles.phoneNumberReveal}>{phoneNumber}</div>
        </div>
        <button className={styles.continueButton} onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  )
}

export default SuccessModal
