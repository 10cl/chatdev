import { useState } from 'react'
import cx from 'classnames'
import { ChatMessageModel } from '~types'
import Dialog from '../Dialog'
import MarkdownView from './MarkdownView'
import store from "store2";

interface Props {
  open: boolean
  onClose: () => void
  messages: ChatMessageModel[]
}

const ShareDialog = (props: Props) => {
  const [mode, setMode] = useState<'markdown' | undefined>()

  return (
    <Dialog
      title="Share Prompt Library"
      open={props.open}
      onClose={props.onClose}
      className={cx('rounded-xl', mode ? 'w-[800px] h-[400px]' : 'w-[600px] h-[350px]')}
    >
      <MarkdownView text={"```json\n" + JSON.stringify(store.get("prompts"), null, 2) + "\n```"} />
    </Dialog>
  )
}

export default ShareDialog
