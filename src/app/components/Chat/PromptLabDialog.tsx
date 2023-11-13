import { ChatMessageModel } from '~types'
import Dialog from '../Dialog'
import PromptLab from "~app/components/PromptLibrary/PromptLab";

interface Props {
    open: boolean
    onClose: () => void
    messages: ChatMessageModel[]
}

const PromptLabDialog = (props: Props) => {

    return (
        <Dialog
            title="GPTs"
            open={props.open}
            onClose={props.onClose}
            className="w-[800px] min-h-[400px]"
        >
            <div className="p-5 overflow-auto">
                <PromptLab />
            </div>
        </Dialog>
    )
}

export default PromptLabDialog
