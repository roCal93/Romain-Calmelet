// GameMenu.jsx
import styles from './gameMenu.module.scss'
import { useTranslation } from '../../hooks/useTranslation'
/**
 * GameMenu Component
 * Displays game selection menu with two mini-games options
 * @param {Function} startGame - Callback function to start a specific game
 * @param {boolean} isLoading - Loading state to disable interactions
 */
const GameMenu = ({ startGame, isLoading = false }) => {
  /**
   * Handles game start action
   * Prevents starting a game while loading
   * @param {string} gameType - Type of game to start ('contact' or 'phone')
   */
  const handleGameStart = (gameType) => {
    if (!isLoading) {
      startGame(gameType)
    }
  }
  const { t } = useTranslation()

  return (
    <div className={styles.gameMenuWrapper}>
      {/* Main navigation container with accessibility attributes */}
      <div className={styles.gameMenu} role="navigation" aria-label="Game Menu">
        {/* Instructions list */}
        <ul role="list">
          <li>
            <strong>{t('gameMenu.mode1')}</strong>
            {t('gameMenu.instructions1')}
          </li>
          <li>
            <strong>{t('gameMenu.mode2')}</strong>
            {t('gameMenu.instructions2')}
          </li>
        </ul>

        {/* Games selection container */}
        <div
          className={styles.gameButtons}
          role="group"
          aria-label="Game Choices"
        >
          {/* Contact game card */}
          <article className={styles.gameCard}>
            <h3 id="game-contact">{t('gameMenu.game1')}</h3>
            <p id="desc-contact">{t('gameMenu.infoGame1')}</p>
            <button
              onClick={() => handleGameStart('contact')}
              className={styles.gameButton}
              aria-labelledby="game-contact" // Associates button with title
              aria-describedby="desc-contact" // Associates button with description
              disabled={isLoading}
              aria-busy={isLoading} // Indicates loading state to screen readers
              tabIndex={0}
            >
              {isLoading ? t('gameMenu.loading') : t('gameMenu.gameButton')}
            </button>
          </article>

          {/* Phone game card */}
          <article className={styles.gameCard}>
            <h3 id="game-phone">{t('gameMenu.game2')}</h3>
            <p id="desc-phone">{t('gameMenu.infoGame2')}</p>
            <button
              onClick={() => handleGameStart('phone')}
              className={styles.gameButton}
              aria-labelledby="game-phone"
              aria-describedby="desc-phone"
              disabled={isLoading}
              aria-busy={isLoading}
              tabIndex={0}
            >
              {isLoading ? t('gameMenu.loading') : t('gameMenu.gameButton')}
            </button>
          </article>
        </div>
      </div>
    </div>
  )
}

export default GameMenu
