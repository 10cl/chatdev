import cx from 'classnames'
import {useAtom} from 'jotai'
import {FC, useCallback, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import clearIcon from '~/assets/icons/clear.svg'
import Button from '~app/components/Button'
import ChatMessageInput from '~app/components/Chat/ChatMessageInput'
import ChatMessageList from '~app/components/Chat/ChatMessageList'
import SwitchBotDropdown from '~app/components/SwitchBotDropdown'
import {CHATBOTS} from '~app/consts'
import {ConversationContext, ConversationContextValue} from '~app/context'
import {useChat} from '~app/hooks/use-chat'
import {gameModeEnable, promptFlowDesc, promptFlowTips, sidePanelBotAtom} from '~app/state'
import {PromptFlowDag, PromptFlowNode, promptflowx, PromptLib} from "promptflowx"
import {
  getPromptLib,
  getRealYaml,
  getResponseStream,
  isChatMode,
} from "~services/storage/memory-store";
import Browser, {Runtime} from "webextension-polyfill";
import * as yamlParser from "js-yaml";
import {BotId, ChatPage} from "~app/bots";
import useSWR from "swr";
interface Props {
  type: ChatPage
}

const SidePanelPage: FC<Props> = (props) => {
  const {t} = useTranslation()
  // const bot = useSWR('local-botId', () => getBotId(), {suspense: true}).data
  const [botId, setBotId] = useState('chatgpt' as BotId)

  const botInfo = CHATBOTS[botId]
  const chat = useChat(botId)

  const yaml = "AdbShellAuto"
  let yamlLib: PromptLib;
  const [, setGameModeEnable] = useAtom(gameModeEnable)
  const [desc, setDesc] = useAtom(promptFlowDesc);
  const [tips, setTips] = useAtom(promptFlowTips);

  async function nodeRequest(node: PromptFlowNode, prompt: string): Promise<string> {

    console.log("request prompt: " + prompt)
    await chat.sendMessage(prompt)
    console.log("response: " + getResponseStream())

    return getResponseStream()
  }

  async function nodeCallback(node: PromptFlowNode) {
    console.log('=> node handled:', node);

    if (node.shell){
      const shellxEle = document.getElementById("chatdev_shellx")
      if (shellxEle){
        shellxEle.textContent = node.shell
      }
    }
  }
  const onSubmit = useCallback(
    async (input: string) => {
      if (props.type != "page"){
        chat.sendMessage(input)
      }else{
        new Promise((resolve, reject) => {
          const listener = async function (message: any, sender: Runtime.MessageSender) {
            console.log('promptflowx_shellx', message)

            if (message.action === 'promptflowx_shellx') {
              Browser.runtime.onMessage.removeListener(listener)
              clearTimeout(timer)
              yamlLib = message.code

              console.log(yaml)
              console.log(yamlLib)

              const dag = yamlParser.load(yamlLib[yaml]) as PromptFlowDag
              if (dag.desc) {
                setDesc(dag.desc)
              } else {
                setDesc("")
              }
              if (!isChatMode() && dag.tips) {
                setTips(dag.tips)
              } else {
                setTips([])
              }

              promptflowx.execute(yamlLib[yaml], yamlLib, nodeRequest, nodeCallback, input);
            }
          }
          const timer = setTimeout(() => {
            Browser.runtime.onMessage.removeListener(listener)
            console.error('promptflowx_shellx Timeout waiting for ChatGPT tab')
          }, 10 * 1000)
          chrome.runtime.sendMessage({action: "promptflowx_shellx"});
          Browser.runtime.onMessage.addListener(listener)
        })
      }
    },
    [chat],
  )

  const resetConversation = useCallback(() => {
    if (!chat.generating) {
      chat.resetConversation()
    }
  }, [chat])

  async function getBotId() {
    let {botId} = await Browser.storage.sync.get('botId')
    if (!botId) {
      botId = "claude"
    }
    return botId as BotId;
  }

  async function setBotIds(botid: BotId) {
    setBotId(botid)
    // await Browser.storage.sync.set({botId: botid})
  }

  function updateYaml() {
    new Promise((resolve, reject) => {
      const listener = async function (message: any, sender: Runtime.MessageSender) {
        console.log('promptflowx_shellx', message)

        if (message.action === 'promptflowx_shellx') {
          Browser.runtime.onMessage.removeListener(listener)
          clearTimeout(timer)
          yamlLib = message.code
          const dag = yamlParser.load(yamlLib[yaml]) as PromptFlowDag
          if (dag.desc) {
            setDesc(dag.desc)
          } else {
            setDesc("")
          }
          if (!isChatMode() && dag.tips) {
            setTips(dag.tips)
          } else {
            setTips([])
          }
        }
      }
      const timer = setTimeout(() => {
        Browser.runtime.onMessage.removeListener(listener)
        console.error('promptflowx_shellx Timeout waiting for ChatGPT tab')
      }, 10 * 1000)
      chrome.runtime.sendMessage({action: "promptflowx_shellx"});
      Browser.runtime.onMessage.addListener(listener)
    })
  }

  useEffect(() => {
    console.log("side panel update botid: " + botId)
    setGameModeEnable(false)
    updateYaml()
  }, [])

  const context: ConversationContextValue = useMemo(() => {
    return {
      reset: resetConversation,
    }
  }, [resetConversation])

  return (
    <ConversationContext.Provider value={context}>
      <div className="flex flex-col overflow-hidden bg-primary-background h-full">
        <div
          className="border-b border-solid border-primary-border flex flex-row items-center justify-between gap-2 py-3 mx-3">
          <div className="flex flex-row items-center gap-2">
            <span className="font-semibold text-primary-text text-xs">{botInfo.name}</span>
            <SwitchBotDropdown selectedBotId={botId} onChange={setBotIds} type={props.type}/>
          </div>
          <div className="flex flex-row items-center gap-3">
            <img
              src={clearIcon}
              className={cx('w-4 h-4', chat.generating ? 'cursor-not-allowed' : 'cursor-pointer')}
              onClick={resetConversation}
            />
          </div>
        </div>
        <ChatMessageList botId={botId} messages={chat.messages} className="mx-3"/>
        <div className="flex flex-col mx-3 my-3 gap-3">
          <hr className="grow border-primary-border"/>
          <ChatMessageInput
            mode="compact"
            disabled={chat.generating}
            autoFocus={true}
            placeholder="Ask me anything..."
            onSubmit={onSubmit}
            actionButton={
              chat.generating ? (
                <Button text={t('Stop')} color="flat" size="small" onClick={chat.stopGenerating}/>
              ) : (
                <Button text={t('Send')} color="primary" type="submit" size="small"/>
              )
            }
          />
        </div>
      </div>
    </ConversationContext.Provider>
  )
}

export default SidePanelPage
