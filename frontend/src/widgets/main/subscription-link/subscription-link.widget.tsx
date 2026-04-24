import {
    IconBrandDiscord,
    IconBrandTelegram,
    IconBrandVk,
    IconCopy,
    IconLink,
    IconMessageChatbot
} from '@tabler/icons-react'
import { ActionIcon, Group } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { useState } from 'react'

import { constructSubscriptionUrl } from '@shared/utils/construct-subscription-url'
import { useSubscription } from '@entities/subscription-info-store'
import { QrTiles } from '@shared/ui'
import { vibrate } from '@shared/utils/vibrate'
import { useTranslation } from '@shared/hooks'

import classes from './subscription-link.module.css'

interface IProps {
    hideGetLink: boolean
    supportUrl: string
}

const CopyLinkButton = ({ value }: { value: string }) => {
    const { copy } = useClipboard()
    const [copied, setCopied] = useState(false)

    const handleClick = () => {
        vibrate('drop')
        copy(value)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 5400)
    }

    return (
        <button className={classes.copyLinkBtn} onClick={handleClick} type="button">
            <IconCopy size={18} />
            {copied ? 'Link copied' : 'Copy link'}
        </button>
    )
}

const LinkModalContent = ({ subscriptionUrl, title }: { subscriptionUrl: string; title: string }) => {
    const { t, baseTranslations } = useTranslation()

    return (
        <div className={classes.modalBody}>
            <div className={classes.head}>
                <span className={classes.headLabel}>{t(baseTranslations.getLink)}</span>
                <span className={classes.headName}>{title}</span>
            </div>

            <div className={classes.qrSection}>
                <div className={classes.qrBox}>
                    <QrTiles value={subscriptionUrl} gradientId="qrSunsetGetLink" />
                </div>
                <span className={classes.qrCaption}>
                    {t(baseTranslations.scanQrCodeDescription)}
                </span>
            </div>

            <CopyLinkButton value={subscriptionUrl} />
        </div>
    )
}

export const SubscriptionLinkWidget = ({ supportUrl, hideGetLink }: IProps) => {
    const { t, baseTranslations } = useTranslation()
    const subscription = useSubscription()

    const subscriptionUrl = constructSubscriptionUrl(
        window.location.href,
        subscription.user.shortUuid
    )

    const renderSupportLink = (supportUrl: string) => {
        const iconConfig = {
            't.me': IconBrandTelegram,
            'discord.com': IconBrandDiscord,
            'vk.com': IconBrandVk
        }

        const matchedPlatform = Object.entries(iconConfig).find(([domain]) =>
            supportUrl.includes(domain)
        )

        const Icon = matchedPlatform ? matchedPlatform[1] : IconMessageChatbot

        return (
            <ActionIcon
                className={classes.actionIcon}
                component="a"
                href={supportUrl}
                radius="md"
                rel="noopener noreferrer"
                size="xl"
                target="_blank"
                variant="default"
            >
                <Icon />
            </ActionIcon>
        )
    }

    const handleGetLink = () => {
        vibrate('tap')
        modals.open({
            centered: true,
            withCloseButton: true,
            title: null,
            padding: 0,
            size: 480,
            classNames: {
                content: classes.modalContent,
                header: classes.modalHeader,
                body: classes.modalBodyWrap,
                close: classes.modalClose,
                overlay: classes.modalOverlay
            },
            overlayProps: {
                backgroundOpacity: 0.35,
                blur: 10
            },
            children: (
                <LinkModalContent
                    subscriptionUrl={subscriptionUrl}
                    title={subscription.user.username}
                />
            )
        })
    }

    return (
        <Group gap="xs" ml="auto" wrap="nowrap">
            {!hideGetLink && (
                <ActionIcon
                    className={classes.actionIcon}
                    onClick={handleGetLink}
                    radius="md"
                    size="xl"
                    variant="default"
                >
                    <IconLink />
                </ActionIcon>
            )}

            {supportUrl !== '' && renderSupportLink(supportUrl)}
        </Group>
    )
}
