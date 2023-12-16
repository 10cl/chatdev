import cx from 'classnames'
import { ChatMessageModel } from '~types'
import Dialog from '../Dialog'
import AgentUploadView from './AgentUploadView'

interface Props {
  open: boolean
  onClose: () => void
  messages: ChatMessageModel[]
}

const AgentUploadDialog = (props: Props) => {
  return (
    <Dialog
      title="Upload Your Agent"
      open={props.open}
      onClose={props.onClose}
      className={cx('rounded-xl', 'w-[800px] h-[400px]')}>
      {(() => {
          return <AgentUploadView messages={props.messages} />
      })()}
    </Dialog>
  )
}

export default AgentUploadDialog
