import React, {FC, useCallback, useEffect, useState} from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { BiExport, BiImport } from 'react-icons/bi'
import Browser from 'webextension-polyfill'
import Button from '~app/components/Button'
import RadioGroup from '~app/components/RadioGroup'
import Select from '~app/components/Select'
import ChatGPTAPISettings from '~app/components/Settings/ChatGPTAPISettings'
import ChatGPTAzureSettings from '~app/components/Settings/ChatGPTAzureSettings'
import ChatGPTOpenRouterSettings from '~app/components/Settings/ChatGPTOpenRouterSettings'
import ChatGPTPoeSettings from '~app/components/Settings/ChatGPTPoeSettings'
import ChatGPWebSettings from '~app/components/Settings/ChatGPTWebSettings'
import ClaudeAPISettings from '~app/components/Settings/ClaudeAPISettings'
import ClaudeWebappSettings from '~app/components/Settings/ClaudeWebappSettings'
import EnabledBotsSettings from '~app/components/Settings/EnabledBotsSettings'
import KDB from '~app/components/Settings/KDB'
import { ALL_IN_ONE_PAGE_ID, CHATBOTS } from '~app/consts'
import { exportData, importData } from '~app/utils/export'
import {
  BingConversationStyle,
  ChatGPTMode,
  ClaudeMode,
  UserConfig,
  getUserConfig,
  updateUserConfig,
} from '~services/user-config'
import { getVersion } from '~utils'
import PagePanel from '../components/Page'
import {BotId} from "~app/bots";
import {useAtom} from "jotai/index";
import {showSettingsAtom} from "~app/state";
import {Input} from "~app/components/Input";
import {
  getStore,
  getRealYaml,
  setRealYaml,
  setRealYamlKey,
  setStore, getBotId
} from "~services/storage/memory-store";
import store from "store2";
import OllamaAPISettings from "~app/components/Settings/OllamaAPISettings";

const BING_STYLE_OPTIONS = [
  { name: 'Precise', value: BingConversationStyle.Precise },
  { name: 'Balanced', value: BingConversationStyle.Balanced },
  { name: 'Creative', value: BingConversationStyle.Creative },
]

const SettingPage = () => {
  const { t } = useTranslation()
  const [shortcuts, setShortcuts] = useState<string[]>([])
  const [userConfig, setUserConfig] = useState<UserConfig | undefined>(undefined)
  const [dirty, setDirty] = useState(false)
  const [showSettings, setShowSettings] = useAtom(showSettingsAtom)

  useEffect(() => {
    Browser.commands.getAll().then((commands) => {
      for (const c of commands) {
        if (c.name === 'open-app' && c.shortcut) {
          console.log(c.shortcut)
          setShortcuts(c.shortcut ? [c.shortcut] : [])
        }
      }
    })
    getUserConfig().then((config) => setUserConfig(config))
  }, [])

  const openShortcutPage = useCallback(() => {
    Browser.tabs.create({ url: 'chrome://extensions/shortcuts' })
  }, [])

  const updateConfigValue = useCallback(
    (update: Partial<UserConfig>) => {
      setUserConfig({ ...userConfig!, ...update })
      setDirty(true)
    },
    [userConfig],
  )

  const save = useCallback(async () => {
    const player_name = document.getElementById('player_name') as HTMLInputElement
    setStore("player_name", player_name?.value)
    store.set("player_name", player_name?.value)

    let apiHost = userConfig?.openaiApiHost
    if (apiHost) {
      apiHost = apiHost.replace(/\/$/, '')
      if (!apiHost.startsWith('http')) {
        apiHost = 'https://' + apiHost
      }
      // request host permission to prevent CORS issues
      try {
        await Browser.permissions.request({ origins: [apiHost + '/'] })
      } catch (e) {
        console.error(e)
      }
    } else {
      apiHost = undefined
    }
    await updateUserConfig({ ...userConfig!, openaiApiHost: apiHost })
    toast.success('Saved')
    setTimeout(() => {
      setShowSettings(false)
      location.reload()
    }, 500)
  }, [userConfig])

  if (!userConfig) {
    return null
  }

  return (
    <PagePanel title={`${t('Settings')} (v${getVersion()})`}>
      <div className="flex flex-col gap-5 mt-3">

        {getBotId() == "chatgpt" && (
        <div className="flex flex-col gap-1">
          <p className="font-bold text-lg">ChatGPT</p>
          <RadioGroup
            options={Object.entries(ChatGPTMode).map(([k, v]) => ({ label: `${k} ${t('Mode')}`, value: v }))}
            value={userConfig.chatgptMode}
            onChange={(v) => updateConfigValue({ chatgptMode: v as ChatGPTMode })}
          />
          {userConfig.chatgptMode === ChatGPTMode.API ? (
            <ChatGPTAPISettings userConfig={userConfig} updateConfigValue={updateConfigValue} />
          ) : (
            <ChatGPWebSettings userConfig={userConfig} updateConfigValue={updateConfigValue} />
          )}
        </div>)}
        {getBotId() == "claude" && (
        <div className="flex flex-col gap-1">
          <p className="font-bold text-lg">Claude</p>
          <RadioGroup
            options={Object.entries(ClaudeMode).map(([k, v]) => ({ label: `${k} ${t('Mode')}`, value: v }))}
            value={userConfig.claudeMode}
            onChange={(v) => updateConfigValue({ claudeMode: v as ClaudeMode })}
          />
          {userConfig.claudeMode === ClaudeMode.API ? (
            <ClaudeAPISettings userConfig={userConfig} updateConfigValue={updateConfigValue} />
          ) : <ClaudeWebappSettings userConfig={userConfig} updateConfigValue={updateConfigValue} />}
        </div>)}
        {getBotId() == "bing" && (
          <div className="flex flex-col gap-1">
          <p className="font-bold text-lg">Bing</p>
          <div className="flex flex-row gap-3 items-center justify-between w-[250px]">
            <p className="font-medium text-base">{t('Chat style')}</p>
            <div className="w-[150px]">
              <Select
                options={BING_STYLE_OPTIONS}
                value={userConfig.bingConversationStyle}
                onChange={(v) => updateConfigValue({ bingConversationStyle: v })}
              />
            </div>
          </div>
        </div>)}
        {getBotId() == "ollama" && (
          <OllamaAPISettings userConfig={userConfig} updateConfigValue={updateConfigValue} />)}
      </div>
      <Button color={dirty ? 'primary' : 'flat'} text={t('Save')} className="w-fit my-8" onClick={save} />
      <Toaster position="top-right" />
    </PagePanel>
  )
}

export default SettingPage
