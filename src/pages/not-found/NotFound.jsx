import { Link } from 'react-router-dom'
import styles from './notFound.module.scss'

const NotFound = () => {
  return (
    <div>
      <title>Argent Bank - Page Introuvable</title>
      <div className={styles.notFound}>
        <h2 className={styles.title}>404</h2>
        <h2>Oups! La page que vous demandez n'existe pas.</h2>
        <Link className={styles.link} to="/">
          Retourner sur la page d'accueil
        </Link>
      </div>
    </div>
  )
}

export default NotFound
