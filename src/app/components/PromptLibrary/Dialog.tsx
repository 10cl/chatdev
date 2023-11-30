import PromptLibrary from './Library'
import Dialog from '../Dialog'
import {useTranslation} from "react-i18next";

interface Props {
  isOpen: boolean
  onClose: () => void
  insertPrompt: (text: string) => void
}

const PromptLibraryDialog = (props: Props) => {
    const { t } = useTranslation()

    return (
    <Dialog title={t("Open Prompt Library")} open={props.isOpen} onClose={props.onClose} className="w-[800px] min-h-[400px]">
      <div className="p-5 overflow-auto">
        <PromptLibrary insertPrompt={props.insertPrompt} />
      </div>
    </Dialog>
  )
}

export default PromptLibraryDialog
