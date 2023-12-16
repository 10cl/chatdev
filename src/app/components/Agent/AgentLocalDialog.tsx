import AgentLocal from './AgentLocal'
import Dialog from '../Dialog'
import {useTranslation} from "react-i18next";

interface Props {
  isOpen: boolean
  onClose: () => void
  insertPrompt: (text: string) => void
}

const AgentLocalDialog = (props: Props) => {
    const { t } = useTranslation()

    return (
    <Dialog title={t("Open Prompt Library")} open={props.isOpen} onClose={props.onClose} className="w-[800px] min-h-[400px]">
      <div className="p-5 overflow-auto">
        <AgentLocal insertPrompt={props.insertPrompt} />
      </div>
    </Dialog>
  )
}

export default AgentLocalDialog
