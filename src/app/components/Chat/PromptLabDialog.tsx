import { ChatMessageModel } from '~types'
import Dialog from '../Dialog'
import PromptLab from "~app/components/PromptLibrary/PromptLab";
import {useTranslation} from "react-i18next";

interface Props {
    open: boolean
    onClose: () => void
    messages: ChatMessageModel[]
}

const PromptLabDialog = (props: Props) => {
    const { t } = useTranslation()

    return (
        <Dialog
            title={t('GPTs')}
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
