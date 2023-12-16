import React, { FC, useCallback, useState } from 'react'
import { trackEvent } from '~app/plausible'
import { ChatMessageModel } from '~types'
import Button from '../Button'
import {Input, Textarea} from '../Input'
import {useTranslation} from "react-i18next";
import {uploadToShareGPT} from "~services/prompts";

interface Props {
  messages: ChatMessageModel[]
}

const AgentUploadView: FC<Props> = ({ messages }) => {
  const [uploading, setUploading] = useState(false)
  const [resultId, setResultId] = useState<string | undefined>(undefined)
  const [copied, setCopied] = useState(false)

  // const upload = useCallback(async () => {
  //   setUploading(true)
  //   trackEvent('share_gpts')
  //   try {
  //     const id = await uploadToShareGPT(messages)
  //     setResultId(id)
  //   } finally {
  //     setUploading(false)
  //   }
  // }, [messages])

  const copy = useCallback(() => {
    navigator.clipboard.writeText(`https://chatdev.toscl.com/s/${resultId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 500)
  }, [resultId])
  const { t } = useTranslation()

  const upload = useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        e.stopPropagation()
        const formdata = new FormData(e.currentTarget)
        const json = Object.fromEntries(formdata.entries())
        if (json.title && json.intro) {
          setUploading(true)
          trackEvent('share_gpts')
          try {
            // `title`, `intro`, `author`, `yaml`
            const share = await uploadToShareGPT(json)
            setResultId(share)
          } finally {
            setUploading(false)
          }
        }
      },
      [messages],
  )

  return (
    <div className="p-5 flex flex-col gap-5 h-full">
      <p className="text-center text-primary-text">
        This will generate a public link for this Agent.
      </p>
      {resultId ? (
        <div className="flex flex-row gap-3">
          <Input value={`https://chatdev.toscl.com/s/${resultId}`} readOnly className="grow" />
          <Button size="small" color="primary" text={copied ? 'Copied' : 'Copy'} onClick={copy} />
        </div>
      ) : (
          <form className="flex flex-col gap-2 w-full" onSubmit={upload}>
            <div className="w-full">
              <span className="text-sm font-semibold block mb-1 text-primary-text">Title:</span>
              <Input className="w-full" name="title" defaultValue=""/>
            </div>
            <div className="w-full">
              <span className="text-sm font-semibold block mb-1 text-primary-text">Description:</span>
              <Textarea className="w-full" name="intro"/>
            </div>
            <div className="flex flex-row gap-3">
              <Button text="Share" size="small" color="primary" type="submit" isLoading={uploading}/>
            </div>
          </form>
      )}
    </div>
  )
}

export default AgentUploadView
