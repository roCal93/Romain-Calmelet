import styles from './menuDesktop.module.scss'
import { Link } from 'react-router'

const MenuDesktop = () => {
  return (
    <div>
      <ul className={styles.menu}>
        <li>
          <Link className={styles.link}>PRESENTATION</Link>
        </li>
        <li>
          <Link className={styles.link}>COMPETENCES</Link>
        </li>
        <li>
          <Link className={styles.link}>FORMATION</Link>
        </li>
        <li>
          <Link className={styles.link}>PORTFOLIO</Link>
        </li>
        <li>
          <Link className={styles.link}>CONTACT</Link>
        </li>
      </ul>
    </div>
  )
}

export default MenuDesktop
