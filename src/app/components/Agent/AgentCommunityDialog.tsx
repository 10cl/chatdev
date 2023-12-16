import { ChatMessageModel } from '~types'
import Dialog from '../Dialog'
import AgentCommunity from "~app/components/Agent/AgentCommunity";
import {useTranslation} from "react-i18next";

interface Props {
    open: boolean
    onClose: () => void
    messages: ChatMessageModel[]
}

const AgentCommunityDialog = (props: Props) => {
    const { t } = useTranslation()

    return (
        <Dialog
            title={t('GPTs')}
            open={props.open}
            onClose={props.onClose}
            className="w-[800px] min-h-[400px]"
        >
            <div className="p-5 overflow-auto">
                <AgentCommunity />
            </div>
        </Dialog>
    )
}

export default AgentCommunityDialog
