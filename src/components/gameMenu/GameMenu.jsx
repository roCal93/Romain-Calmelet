import styles from './gameMenu.module.scss'

const GameMenu = ({ startGame }) => (
  <div className={styles.gameMenu}>
    <h2>Mon contact</h2>
    <ul>
      <li>
        <strong>Mode simple :</strong> Cliquez directement sur les logos en bas
        à droite
      </li>
      <li>
        <strong>Mode jeu :</strong> Réussissez les deux jeux pour accéder à mes
        infos !
      </li>
    </ul>
    <div className={styles.gameButtons}>
      <div className={styles.gameCard}>
        <h3>La chasse aux profils</h3>
        <p>
          Guidez un logo dans une zone pour ouvrir un lien vers mon profil
          LinkedIn ou GitHub.
        </p>
        <button
          onClick={() => startGame('contact')}
          className={styles.gameButton}
        >
          C'est parti !
        </button>
      </div>

      <div className={styles.gameCard}>
        <h3>Séquence Mécanique</h3>
        <p>
          Placez les 3 roues dans le bon ordre pour révéler mon numéro de
          téléphone.
        </p>
        <button
          onClick={() => startGame('phone')}
          className={styles.gameButton}
        >
          C'est parti !
        </button>
      </div>
    </div>
  </div>
)

export default GameMenu
