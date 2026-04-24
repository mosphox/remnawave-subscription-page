import { IconChevronRight, IconCopy, IconCheck } from '@tabler/icons-react'
import { modals } from '@mantine/modals'
import { useClipboard } from '@mantine/hooks'
import { useState } from 'react'

import {
    parseConnectionLink,
    ParsedConfig,
    ParsedField,
    PROTOCOL_COLOR
} from '@shared/utils/parse-connection-link'
import { useSubscription } from '@entities/subscription-info-store'
import { QrTiles } from '@shared/ui'
import { vibrate } from '@shared/utils/vibrate'
import { useTranslation } from '@shared/hooks'

import classes from './raw-keys.module.css'

interface IProps {
    isMobile: boolean
}

const FieldRow = ({ field }: { field: ParsedField }) => {
    const { copy, copied } = useClipboard({ timeout: 1600 })

    return (
        <div className={classes.field}>
            <span className={classes.fieldLabel}>{field.label}</span>
            <span className={classes.fieldValue} title={field.value}>
                {field.value}
            </span>
            <button
                aria-label={`Copy ${field.label}`}
                className={`${classes.fieldCopy} ${copied ? classes.fieldCopyOk : ''}`}
                onClick={() => {
                    vibrate('drop')
                    copy(field.value)
                }}
                type="button"
            >
                {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
            </button>
        </div>
    )
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

const ConfigModalContent = ({ config }: { config: ParsedConfig }) => {
    const color = PROTOCOL_COLOR[config.protocolSlug]

    return (
        <div
            className={classes.modalBody}
            style={{ ['--proto-color' as string]: color } as React.CSSProperties}
        >
            <div className={classes.head}>
                <span className={classes.headProto}>{config.protocol}</span>
                <span className={classes.headName} title={config.name}>
                    {config.name}
                </span>
            </div>

            <div className={classes.fieldsGrid}>
                {config.fields.map((f, i) => (
                    <FieldRow field={f} key={`${f.label}-${i}`} />
                ))}
            </div>

            <div className={classes.qrSection}>
                <div className={classes.qrBox}>
                    <QrTiles value={config.fullLink} />
                </div>
                <span className={classes.qrCaption}>Scan to import</span>
            </div>

            <CopyLinkButton value={config.fullLink} />
        </div>
    )
}

export const RawKeysWidget = ({ isMobile: _ }: IProps) => {
    const { t, baseTranslations } = useTranslation()
    const subscription = useSubscription()

    if (subscription.links.length === 0) return null

    const parsed = subscription.links.map((link) => parseConnectionLink(link))

    const handleOpen = (config: ParsedConfig) => {
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
            children: <ConfigModalContent config={config} />
        })
    }

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <div className={classes.header}>
                    <h3 className={classes.title}>
                        {t(baseTranslations.connectionKeysHeader)}
                    </h3>
                    {parsed.length > 1 && (
                        <span className={classes.count}>{parsed.length} configs</span>
                    )}
                </div>

                <div className={classes.list}>
                    {parsed.map((cfg, i) => {
                        const color = PROTOCOL_COLOR[cfg.protocolSlug]
                        return (
                            <button
                                className={classes.item}
                                key={`${cfg.name}-${i}`}
                                onClick={() => handleOpen(cfg)}
                                style={{ ['--proto-color' as string]: color } as React.CSSProperties}
                                type="button"
                            >
                                <div className={classes.itemBody}>
                                    <span className={classes.itemName}>{cfg.name}</span>
                                    {cfg.host && (
                                        <span className={classes.itemHost}>{cfg.host}</span>
                                    )}
                                </div>
                                <span className={classes.itemProto}>{cfg.protocol}</span>
                                <IconChevronRight
                                    className={classes.itemChevron}
                                    size={18}
                                />
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
