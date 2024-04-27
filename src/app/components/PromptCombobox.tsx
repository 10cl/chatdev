import { useInteractions, useListItem } from '@floating-ui/react'
import cx from 'classnames'
import { FC, createContext, useContext } from 'react'
import {useAtom} from "jotai/index";
import {promptFlowTips} from "~app/state";
import {getEditorStatus} from "~services/storage/memory-store";

export interface ComboboxContextValue {
  activeIndex: number | null
  getItemProps: ReturnType<typeof useInteractions>['getItemProps']
  handleSelect: (prompt: string) => void
  setIsComboboxOpen: (open: boolean) => void
}

export const ComboboxContext = createContext<ComboboxContextValue>({} as ComboboxContextValue)

const PromptItem: FC<{ prompt: string }> = ({ prompt }) => {
  const context = useContext(ComboboxContext)
  const { ref, index } = useListItem()
  const isActive = index === context.activeIndex
  return (
    <div
      ref={ref}
      tabIndex={isActive ? 0 : -1}
      className={cx(
        'cursor-default select-none py-2 px-4',
        isActive ? 'bg-primary-blue text-white' : 'text-secondary-text',
      )}
      {...context.getItemProps({
        onClick: () => {
          context.handleSelect(prompt)
        },
        onKeyDown: (e) => {
          if (e.keyCode === 13) {
            context.handleSelect(prompt)
            e.preventDefault()
          } else if (e.key === 'Backspace' || e.key === 'Delete') {
            context.setIsComboboxOpen(false)
          }
        },
      })}
    >
      {prompt}
    </div>
  )
}

const PromptCombobox: FC = () => {
  const [tips, setTips] = useAtom(promptFlowTips);

  if (getEditorStatus() || !tips || tips.length <= 0) {
    return null
  }
  return (
    <div className="overflow-auto rounded-md py-1 shadow-lg ring-1 ring-primary-border focus:outline-none text-sm min-w-[150px] bg-primary-background">
      {!getEditorStatus() && tips && tips.length > 0 && tips.map((item: string, index: any) => {
        return <PromptItem key={index} prompt={item} />
      })}
    </div>
  )
}

export default PromptCombobox
