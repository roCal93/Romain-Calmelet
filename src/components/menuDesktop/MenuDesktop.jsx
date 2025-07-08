import styles from './menuDesktop.module.scss'
import { NavLink } from 'react-router-dom'

const menuItems = [
  { path: 'presentation', label: 'PRÉSENTATION' },
  { path: 'portfolio', label: 'PORTFOLIO' },
  { path: 'contact', label: 'CONTACT' },
]

const MenuDesktop = () => {
  return (
    <nav aria-label="Menu principal">
      <ul className={styles.menu}>
        {menuItems.map((item, index) => (
          <li
            key={item.path}
            style={{ '--animation-delay': `${0.9 - index * 0.1}s` }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default MenuDesktop
