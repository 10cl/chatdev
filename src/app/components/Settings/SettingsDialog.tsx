import Dialog from '../Dialog'
import SettingPage from "~app/pages/SettingPage";
import {useTranslation} from "react-i18next";

interface Props {
    open: boolean
    onClose: () => void
}
import { getVersion } from '~utils'

const SettingsDialog = (props: Props) => {
    const { t } = useTranslation()

    return (
        <Dialog
            title={`${t('Settings')} (v${getVersion()})`}
            open={props.open}
            onClose={props.onClose}
            className="w-[800px] min-h-[400px]"
        >
            <div className="p-5 overflow-auto">
                <SettingPage/>
            </div>
        </Dialog>
    )
}

export default SettingsDialog
