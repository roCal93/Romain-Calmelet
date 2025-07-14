// GameMenu.jsx
import styles from './gameMenu.module.scss'

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

  return (
    <div className={styles.gameMenuWrapper}>
      {/* Main navigation container with accessibility attributes */}
      <div
        className={styles.gameMenu}
        role="navigation"
        aria-label="Menu de jeu"
      >
        {/* Instructions list */}
        <ul role="list">
          <li>
            <strong>Mode simple :</strong> Cliquez directement sur les logos en
            bas à droite
          </li>
          <li>
            <strong>Mode jeu :</strong> Réussissez les deux jeux pour accéder à
            mes infos !
          </li>
        </ul>

        {/* Games selection container */}
        <div
          className={styles.gameButtons}
          role="group"
          aria-label="Choix de jeux"
        >
          {/* Contact game card */}
          <article className={styles.gameCard}>
            <h3 id="game-contact">La chasse aux profils</h3>
            <p id="desc-contact">
              Guidez un logo dans une zone pour ouvrir un lien vers mon profil
              LinkedIn ou GitHub.
            </p>
            <button
              onClick={() => handleGameStart('contact')}
              className={styles.gameButton}
              aria-labelledby="game-contact" // Associates button with title
              aria-describedby="desc-contact" // Associates button with description
              disabled={isLoading}
              aria-busy={isLoading} // Indicates loading state to screen readers
            >
              {isLoading ? 'Chargement...' : "C'est parti !"}
            </button>
          </article>

          {/* Phone game card */}
          <article className={styles.gameCard}>
            <h3 id="game-phone">Séquence Mécanique</h3>
            <p id="desc-phone">
              Placez les 3 roues dans le bon ordre pour révéler mon numéro de
              téléphone.
            </p>
            <button
              onClick={() => handleGameStart('phone')}
              className={styles.gameButton}
              aria-labelledby="game-phone"
              aria-describedby="desc-phone"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Chargement...' : "C'est parti !"}
            </button>
          </article>
        </div>
      </div>
    </div>
  )
}

export default GameMenu
