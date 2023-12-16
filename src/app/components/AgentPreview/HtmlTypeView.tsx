
import { ChatMessageModel } from '~types'
import Dialog from '../Dialog'
interface Props {
  open: boolean
  onClose: () => void
  messages: ChatMessageModel[]
}

const HtmlTypeView = (props: Props) => {

  return (
    <Dialog
      title="Web Preview"
      open={props.open}
      onClose={props.onClose}
      className="w-[800px] min-h-[400px]"
    >
      <div className="p-5 overflow-auto">
        <iframe className="mx-auto bg-primary-background max-h-full overflow-hidden flex flex-col w-[800px] min-h-[400px]" src={'/app.html#/preview'}/>
      </div>
    </Dialog>
  )
}

export default HtmlTypeView
