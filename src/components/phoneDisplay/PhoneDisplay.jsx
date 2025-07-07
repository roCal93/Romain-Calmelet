import styles from './phoneDisplay.module.scss'

const PhoneDisplay = ({ showPhoneNumber, setShowPhoneNumber }) => {
  if (!showPhoneNumber) return null

  return (
    <div className={styles.phoneDisplay}>
      {/* Ajoutez l'overlay ici */}
      <div
        className={styles.overlay}
        onClick={() => setShowPhoneNumber(false)}
      />

      <div className={styles.phoneModal}>
        <div className={styles.phoneContent}>
          <h3> Mes coordonnées</h3>
          <p className={styles.phoneNumber}>
            📞
            <br /> 07 45 22 96 97
          </p>
          <p className={styles.phoneNumber}>
            ✉️
            <br /> romaincalmelet@gmail.com
          </p>
          <button
            onClick={() => setShowPhoneNumber(false)}
            className={styles.closeButton}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default PhoneDisplay
