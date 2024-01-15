import { ChatMessageModel } from '~types'
import Dialog from '../Dialog'
import {useTranslation} from "react-i18next";
import DataSetView from "~app/components/Agent/DataSetView";

interface Props {
    open: boolean
    onClose: () => void
    messages: ChatMessageModel[]
}

const DataSetDialog = (props: Props) => {
    const { t } = useTranslation()

    return (
        <Dialog
            title={t('Knowledge')}
            open={props.open}
            onClose={props.onClose}
            className="w-[800px] min-h-[400px]"
        >
            <div className="p-5 overflow-auto">
                <DataSetView />
            </div>
        </Dialog>
    )
}

export default DataSetDialog
