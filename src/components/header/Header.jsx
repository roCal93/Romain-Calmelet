import styles from './header.module.scss'
import LogoDesktop from '../logoDesktop/LogoDesktop'
import LogoMobile from '../logoMobile/LogoMobile'
import { useMediaQuery } from 'react-responsive'
import MenuDesktop from '../menuDesktop/MenuDesktop'
import MenuMobile from '../menuMobile/MenuMobile'

const Header = () => {
  const isMobileLogo = useMediaQuery({ query: '(max-width: 768px)' })
  const isMobileMenu = useMediaQuery({ query: '(max-width: 1250px)' })
  return (
    <header>
      <nav className={styles.nav}>
        {isMobileLogo ? <LogoMobile /> : <LogoDesktop />}
        {isMobileMenu ? <MenuMobile /> : <MenuDesktop />}
      </nav>
    </header>
  )
}

export default Header
