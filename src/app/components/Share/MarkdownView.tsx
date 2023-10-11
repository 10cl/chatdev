import { FC, useCallback, useMemo, useState } from 'react'
import { trackEvent } from '~app/plausible'
import Button from '../Button'

interface Props {
  text: string
}

const MarkdownView: FC<Props> = ({ text }) => {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(() => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 500)
    trackEvent('share_chat_copy_markdown')
  }, [text])

  return (
    <div className="px-5 pt-3 pb-4 overflow-hidden flex flex-col h-full">
      <div className="mb-3">
        <Button size="small" text={copied ? 'Copied!' : 'Copy'} onClick={copy} />
      </div>
      <pre className="text-sm whitespace-pre-wrap text-primary-text p-2 rounded-md overflow-auto h-full bg-secondary">
        {text}
      </pre>
    </div>
  )
}

export default MarkdownView
