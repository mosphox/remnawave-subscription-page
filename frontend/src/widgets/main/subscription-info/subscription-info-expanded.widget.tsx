import { Box } from '@mantine/core'
import clsx from 'clsx'

import { formatDate, getExpirationTextUtil } from '@shared/utils/config-parser'
import { useSubscription } from '@entities/subscription-info-store'
import { useTranslation } from '@shared/hooks'

import classes from './subscription-info-cards.module.css'

interface IProps {
    isMobile: boolean
}

const parseTrafficBytes = (value: string): number => {
    if (!value || value === '0') return 0
    const match = value.match(/^([\d.,]+)\s*([A-Za-zµ]+)?/)
    if (!match) return 0
    const num = parseFloat(match[1].replace(',', '.'))
    const unit = (match[2] || 'B').toUpperCase()
    const scale: Record<string, number> = {
        B: 1,
        KB: 1024,
        KIB: 1024,
        MB: 1024 ** 2,
        MIB: 1024 ** 2,
        GB: 1024 ** 3,
        GIB: 1024 ** 3,
        TB: 1024 ** 4,
        TIB: 1024 ** 4
    }
    return num * (scale[unit] ?? 1)
}

export const SubscriptionInfoExpandedWidget = ({ isMobile: _ }: IProps) => {
    const { t, currentLang, baseTranslations } = useTranslation()
    const subscription = useSubscription()

    const { user } = subscription
    const isActive = user.userStatus === 'ACTIVE'
    const statusText = isActive ? t(baseTranslations.active) : t(baseTranslations.inactive)

    const unlimited = user.trafficLimit === '0'
    const used = parseTrafficBytes(user.trafficUsed)
    const limit = unlimited ? 0 : parseTrafficBytes(user.trafficLimit)
    const usagePercent = unlimited ? 100 : limit > 0 ? Math.min(100, (used / limit) * 100) : 0

    const expiresFormatted = formatDate(user.expiresAt, currentLang, baseTranslations)
    const remainingText = getExpirationTextUtil(
        user.expiresAt,
        currentLang,
        baseTranslations
    )

    return (
        <Box className={classes.hero}>
            <div className={classes.heroInner}>
                <div className={classes.usernameRow}>
                    <div className={classes.usernameWrap}>
                        <div className={classes.username}>
                            <span className={classes.usernameAccent}>{user.username}</span>
                        </div>
                        {remainingText && (
                            <div className={classes.expiresLine}>{remainingText}</div>
                        )}
                    </div>

                    <div
                        className={clsx(
                            classes.statusBadge,
                            isActive ? classes.statusActive : classes.statusInactive
                        )}
                    >
                        <span className={classes.statusDot} />
                        {statusText}
                    </div>
                </div>

                <div className={classes.divider} />

                <div className={classes.metaGrid}>
                    <div className={classes.metaCell}>
                        <span className={classes.metaLabel}>
                            {t(baseTranslations.expires)}
                        </span>
                        <span className={classes.metaValue}>{expiresFormatted}</span>
                    </div>

                    <div className={classes.metaCell}>
                        <span className={classes.metaLabel}>
                            {t(baseTranslations.bandwidth)}
                        </span>
                        <span className={clsx(classes.metaValue, classes.metaValueMono)}>
                            {user.trafficUsed} <span style={{ opacity: 0.5 }}>/</span>{' '}
                            {unlimited ? '∞' : user.trafficLimit}
                        </span>
                        <div className={classes.bandwidthBar}>
                            <div
                                className={clsx(
                                    classes.bandwidthFill,
                                    unlimited && classes.bandwidthInfinity
                                )}
                                style={unlimited ? undefined : { width: `${usagePercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Box>
    )
}
