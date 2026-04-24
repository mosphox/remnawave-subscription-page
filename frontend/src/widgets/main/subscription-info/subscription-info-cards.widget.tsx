import { Box, Group, Stack } from '@mantine/core'
import clsx from 'clsx'

import { useSubscription } from '@entities/subscription-info-store'
import { formatDate } from '@shared/utils/config-parser'
import { useTranslation } from '@shared/hooks'

import classes from './subscription-info-cards.module.css'

interface IProps {
    isMobile: boolean
}

const humanizeRemaining = (expiresAt: string | Date): string | null => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return null
    const hours = Math.floor(diff / 3_600_000)
    const days = Math.floor(hours / 24)
    if (days >= 2) return `Expires in ${days} days`
    if (days === 1) return 'Expires in a day'
    if (hours >= 2) return `Expires in ${hours} hours`
    if (hours === 1) return 'Expires in an hour'
    const mins = Math.max(1, Math.floor(diff / 60_000))
    return `Expires in ${mins} min`
}

export const SubscriptionInfoCardsWidget = ({ isMobile: _ }: IProps) => {
    const { t, currentLang, baseTranslations } = useTranslation()
    const subscription = useSubscription()

    const { user } = subscription
    const isActive = user.userStatus === 'ACTIVE'
    const statusText = isActive ? t(baseTranslations.active) : t(baseTranslations.inactive)

    const bandwidthValue =
        user.trafficLimit === '0'
            ? `${user.trafficUsed} / ∞`
            : `${user.trafficUsed} / ${user.trafficLimit}`

    const remainingText = humanizeRemaining(user.expiresAt)
    const expiresFormatted = formatDate(user.expiresAt, currentLang, baseTranslations)

    return (
        <Box className={classes.hero}>
            <Stack className={classes.heroInner} gap={0}>
                <Group align="flex-start" justify="space-between" wrap="nowrap">
                    <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
                        <div className={classes.username}>{user.username}</div>
                        {remainingText && (
                            <div className={classes.expiresLine}>{remainingText}</div>
                        )}
                    </Stack>
                    <div
                        className={clsx(
                            classes.statusBadge,
                            isActive ? classes.statusActive : classes.statusInactive
                        )}
                    >
                        <span className={classes.statusDot} />
                        {statusText}
                    </div>
                </Group>

                <div className={classes.stats}>
                    <div className={classes.statCell}>
                        <span className={classes.statLabel}>
                            {t(baseTranslations.expires)}
                        </span>
                        <span className={classes.statValue}>{expiresFormatted}</span>
                    </div>
                    <div className={classes.statCell}>
                        <span className={classes.statLabel}>
                            {t(baseTranslations.bandwidth)}
                        </span>
                        <span className={clsx(classes.statValue, classes.statValueAccent)}>
                            {bandwidthValue}
                        </span>
                    </div>
                    <div className={classes.statCell}>
                        <span className={classes.statLabel}>
                            {t(baseTranslations.name)}
                        </span>
                        <span className={classes.statValue}>{user.username}</span>
                    </div>
                </div>
            </Stack>
        </Box>
    )
}
