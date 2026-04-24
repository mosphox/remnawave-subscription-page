import { useAppConfig, useAppConfigStoreActions, useCurrentLang } from '@entities/app-config-store'
import { LanguagePicker } from '@shared/ui/language-picker/language-picker.shared'

import { SubscriptionLinkWidget } from '../subscription-link/subscription-link.widget'
import classes from './header-card.module.css'

export const HeaderCardWidget = () => {
    const config = useAppConfig()
    const currentLang = useCurrentLang()
    const { setLanguage } = useAppConfigStoreActions()

    const brandName = config.brandingSettings.title

    return (
        <div className={classes.card}>
            <div className={classes.row}>
                <div className={classes.brand}>
                    <img
                        alt={brandName}
                        className={classes.logo}
                        src="/assets/logo.png"
                    />
                    <span className={classes.name}>{brandName}</span>
                </div>
                <div className={classes.actions}>
                    <LanguagePicker
                        currentLang={currentLang}
                        locales={config.locales}
                        onLanguageChange={setLanguage}
                    />
                    <SubscriptionLinkWidget
                        hideGetLink={config.baseSettings.hideGetLinkButton}
                        supportUrl={config.brandingSettings.supportUrl}
                    />
                </div>
            </div>
        </div>
    )
}
