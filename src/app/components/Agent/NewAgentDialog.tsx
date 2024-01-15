import { ChatMessageModel } from '~types'
import Dialog from '../Dialog'
import {useTranslation} from "react-i18next";
import NewAgentView from "~app/components/Agent/NewAgentView";
import {isHookedResponse} from "~services/storage/memory-store";
import {useEffect, useState} from "react";

interface Props {
    open: boolean
    onClose: () => void
    messages: ChatMessageModel[]
}

const NewAgentDialog = (props: Props) => {
    const { t } = useTranslation()
    const [isDuplicate, setDuplicate] = useState(false)

    useEffect(() => {
        setDuplicate(isHookedResponse("duplicate"))
    }, [])

    return (
        <Dialog
            title={t('Create New Agent')}
            open={props.open}
            onClose={props.onClose}
            className="w-[800px]"
        >
            <div className="p-5 overflow-auto">
                <NewAgentView messages={props.messages} duplicate={isDuplicate} />
            </div>
        </Dialog>
    )
}

export default NewAgentDialog
