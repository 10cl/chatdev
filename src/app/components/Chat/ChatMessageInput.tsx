import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingList,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from '@floating-ui/react'
import cx from 'classnames'
import { FC, memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GoBook } from 'react-icons/go'
import { trackEvent } from '~app/plausible'
import { Prompt } from '~services/prompts'
import Button from '../Button'
import PromptCombobox, { ComboboxContext } from '../PromptCombobox'
import AgentLocalDialog from '~app/components/Agent/AgentLocalDialog'
import TextInput from './TextInput'
import {agentLocalDialogOpen, promptFlowTips} from "~app/state";
import {useAtom} from "jotai/index";
import {getEditorStatus, setHookedMessage} from "~services/storage/memory-store";

interface Props {
  mode: 'full' | 'compact'
  onSubmit: (value: string) => void
  className?: string
  disabled?: boolean
  placeholder?: string | null
  actionButton?: ReactNode | null
  autoFocus?: boolean
}

const ChatMessageInput: FC<Props> = (props) => {
  const { t } = useTranslation()

  const [value, setValue] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [isPromptLibraryDialogOpen, setIsPromptLibraryDialogOpen] = useAtom(agentLocalDialogOpen)

  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isComboboxOpen, setIsComboboxOpen] = useState(false)
  const [tips, setTips] = useAtom(promptFlowTips);

  const { refs, floatingStyles, context } = useFloating({
    whileElementsMounted: autoUpdate,
    middleware: [offset(15), flip(), shift()],
    placement: 'top-start',
    open: !getEditorStatus() && tips && tips.length > 0,
    onOpenChange: setIsComboboxOpen,
  })

  const floatingListRef = useRef([])

  const handleSelect = useCallback((prompt: string) => {
    // setValue(prompt)
    setTips([])
    inputRef.current?.focus()
    // trackEvent('use_prompt', { source: 'combobox' })

    setHookedMessage(prompt)
  }, [])

  const listNavigation = useListNavigation(context, {
    listRef: floatingListRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
    focusItemOnOpen: true,
    openOnArrowKeyDown: false,
  })

  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'listbox' })

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([role, dismiss, listNavigation])

  const comboboxContext = useMemo(
    () => ({
      activeIndex,
      getItemProps,
      handleSelect,
      setIsComboboxOpen: (open: boolean) => {
        setIsComboboxOpen(open)
        if (!open) {
          inputRef.current?.focus()
        }
      },
    }),
    [activeIndex, getItemProps, handleSelect],
  )

  const onFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (value.trim()) {
        props.onSubmit(value)
      }
      setValue('')
    },
    [props, value],
  )

  const onValueChange = useCallback((v: string) => {
    setValue(v)
    //setIsComboboxOpen(v === '/')
  }, [])

  useEffect(() => {
    setIsPromptLibraryDialogOpen(false)
    if (!getEditorStatus() && tips && tips.length > 0) {
      trackEvent('open_prompt_combobox')
    }
  }, [tips])

  const insertTextAtCursor = useCallback(
    (text: string) => {
      const cursorPosition = inputRef.current?.selectionStart || 0
      const textBeforeCursor = value.slice(0, cursorPosition)
      const textAfterCursor = value.slice(cursorPosition)
      setValue(`${textBeforeCursor}${text}${textAfterCursor}`)
      setIsPromptLibraryDialogOpen(false)
      inputRef.current?.focus()
    },
    [value],
  )

  return (
    <form className={cx('flex flex-row items-center gap-3', props.className)} onSubmit={onFormSubmit} ref={formRef}>
      {props.mode === 'full' && (
        <>
          {/*<GoBook size={22} color="#707070" className="cursor-pointer" onClick={openPromptLibrary} />*/}
          {isPromptLibraryDialogOpen && (
            <AgentLocalDialog
              isOpen={true}
              onClose={() => setIsPromptLibraryDialogOpen(false)}
              insertPrompt={insertTextAtCursor}
            />
          )}
          <ComboboxContext.Provider value={comboboxContext}>
            {!getEditorStatus() && tips && tips.length > 0 && (
              <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
                <div
                  ref={refs.setFloating}
                  style={{
                    ...floatingStyles,
                  }}
                  {...getFloatingProps()}
                >
                  <FloatingList elementsRef={floatingListRef}>
                    <PromptCombobox />
                  </FloatingList>
                </div>
              </FloatingFocusManager>
            )}
          </ComboboxContext.Provider>
        </>
      )}
      <div className="w-full flex flex-col justify-center" ref={refs.setReference} {...getReferenceProps()}>
        <TextInput
          ref={inputRef}
          formref={formRef}
          name="input"
          disabled={props.disabled}
          placeholder={props.placeholder as string}
          value={value}
          onValueChange={onValueChange}
          autoFocus={props.autoFocus}
        />
      </div>
      {props.actionButton || (
        <Button text="-" className="invisible" size={props.mode === 'full' ? 'normal' : 'small'} />
      )}
    </form>
  )
}

export default memo(ChatMessageInput)
