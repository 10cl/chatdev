import cx from 'classnames'
import { ChatMessageModel } from '~types'
import Dialog from '../Dialog'
import ShareGPTView from './ShareGPTView'

interface Props {
  open: boolean
  onClose: () => void
  messages: ChatMessageModel[]
}

const ShareGPTDialog = (props: Props) => {
  return (
    <Dialog
      title="Share GPTs"
      open={props.open}
      onClose={props.onClose}
      className={cx('rounded-xl', 'w-[800px] h-[400px]')}>
      {(() => {
          return <ShareGPTView messages={props.messages} />
      })()}
    </Dialog>
  )
}

export default ShareGPTDialog
