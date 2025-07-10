import { memo } from 'react'
import LogoSocial from '../logoSocial/LogoSocial'
import AlternatingContactLogo from '../alternatingContactLogo/AlternatingContactLogo'
import styles from './StaticLogos.module.scss'

const StaticLogos = memo(({ activeGame, handleLogoClick }) => {
  if (activeGame) return null

  return (
    <div className={styles.logosContainer}>
      <LogoSocial type="linkedin" onClick={handleLogoClick} />
      <LogoSocial type="github" onClick={handleLogoClick} />
      <AlternatingContactLogo onClick={() => handleLogoClick('phone')} />
    </div>
  )
})

StaticLogos.displayName = 'StaticLogos'

export default StaticLogos
