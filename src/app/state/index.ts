import { atomWithImmer } from 'jotai-immer'
import { atomWithStorage } from 'jotai/utils'
import { atomFamily } from 'jotai/utils'
import { createBotInstance, BotId } from '~app/bots'
import { getDefaultThemeColor } from '~app/utils/color-scheme'
import { ChatMessageModel } from '~types'
import {getVersion, uuid} from '~utils'

type Param = { botId: BotId; page: string }

export const chatFamily = atomFamily(
  (param: Param) => {
    return atomWithImmer({
      botId: param.botId,
      bot: createBotInstance(param.botId),
      messages: [] as ChatMessageModel[],
      generatingMessageId: '',
      abortController: undefined as AbortController | undefined,
      conversationId: uuid(),
    })
  },
  (a, b) => a.botId === b.botId && a.page === b.page,
)

export const licenseKeyAtom = atomWithStorage('licenseKey', '', undefined, { unstable_getOnInit: true })
export const sidebarCollapsedAtom = atomWithStorage('sidebarCollapsed', true)
export const seminarDisableAtom = atomWithStorage('sidebarRightCollapsed', true)
export const workFlowingDisableAtom = atomWithStorage('workFlowingDisable', false)
export const fpHashAtom = atomWithStorage('fpHash', "")
export const gameModeEnable = atomWithStorage('gameModeEnable', true)
export const themeColorAtom = atomWithStorage('themeColor', getDefaultThemeColor())
export const followArcThemeAtom = atomWithStorage('followArcTheme', false)
export const showEditorAtom = atomWithStorage('showEditor', false)
export const showGptsDialogAtom = atomWithStorage('showGptsDialog', false)
export const showDdataSetsAtom = atomWithStorage('showDdataSets', false)
export const showShareAtom = atomWithStorage('showShare', false)
export const isNewAgentShowAtom = atomWithStorage('isNewAgentShow', false)
export const showHistoryAtom = atomWithStorage('showHistory', false)
export const generateEnableAtom = atomWithStorage('generateEnable', false)
export const showSettingsAtom = atomWithStorage('showSettings', true)
export const editorPromptAtom = atomWithStorage('editorPrompt', "Action_Prompt_Template")
export const editorYamlTimesAtom = atomWithStorage<number>('editorYamlTimes', 0)
export const messageTimesTimesAtom = atomWithStorage<number>('messageTimes', 0)
export const editorPromptTimesAtom = atomWithStorage<number>('editorPromptTimes', 0)
export const agentLocalDialogOpen = atomWithStorage('agentLocalDialogOpen', false)
export const yamlExceptionAtom = atomWithStorage('yaml_exception', "")
export const floatTipsOpen = atomWithStorage('floatTipsOpen', false)

export const sidePanelBotAtom = atomWithStorage<BotId>('sidePanelBot', 'chatgpt')
export const editorRightAtom = atomWithStorage('editorRight', false)
export const embeddingEnableAtom = atomWithStorage<boolean>('embeddingEnable', false)
