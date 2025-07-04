import ContactGame from '../contactGame/ContactGame'
import PhoneGame from '../phoneGame/PhoneGame'
import styles from './fullscreenGame.module.scss'

const FullscreenGame = ({ gameType, backToMenu }) => (
  <div className={styles.fullGame}>
    <button onClick={backToMenu} className={styles.backButton}>
      ← Retour
    </button>
    {gameType === 'contact' && <ContactGame />}
    {gameType === 'phone' && <PhoneGame backButton={backToMenu} />}
  </div>
)

export default FullscreenGame
