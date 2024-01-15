import { zip } from 'lodash-es'
import Browser from 'webextension-polyfill'
import { BotId } from '~app/bots'
import { ChatMessageModel } from '~types'
import {
  getStore,
  getRealYaml,
  setRealYaml,
  setRealYamlKey,
  setStore
} from "~services/storage/memory-store";
/**
 * conversations:$botId => Conversation[]
 * conversation:$botId:$cid:messages => ChatMessageModel[]
 */

interface Conversation {
  id: string
  createdAt: number
}

type ConversationWithMessages = Conversation & { messages: ChatMessageModel[] }

async function loadHistoryConversations(botId: BotId): Promise<Conversation[]> {
  const key = `conversations:${botId}`
  const { [key]: value } = await Browser.storage.local.get(key)
  return value || []
}

async function deleteHistoryConversation(botId: BotId, cid: string) {
  const conversations = await loadHistoryConversations(botId)
  const newConversations = conversations.filter((c) => c.id !== cid)
  await Browser.storage.local.set({ [`conversations:${botId}`]: newConversations })
}

async function loadConversationMessages(botId: BotId, cid: string): Promise<ChatMessageModel[]> {
  const key = `conversation:${botId}:${cid}:messages`
  const { [key]: value } = await Browser.storage.local.get(key)
  return value || []
}

export async function setConversationMessages(botId: BotId, cid: string, messages: ChatMessageModel[]) {
  const conversations = await loadHistoryConversations(botId)
  if (!conversations.some((c) => c.id === cid)) {
    conversations.unshift({ id: cid, createdAt: Date.now() })
    await Browser.storage.local.set({ [`conversations:${botId}`]: conversations })
  }

  function getValidMark(message: ChatMessageModel) {
    const isGameMode = getStore("gameModeEnable", true)
    if (message.mark != undefined){
      return message.mark
    }

    if (!isGameMode){
      return ""
    }

    const playerPos = getStore("player_mark", "")
    if (playerPos != ""){
      return playerPos
    }

    return message.mark || "";
  }

  messages = messages.map((message) => ({
    ...message,
    mark: getValidMark(message)
  }));

  const key = `conversation:${botId}:${cid}:messages`
  await Browser.storage.local.set({ [key]: messages })
}

export async function loadHistoryMessages(botId: BotId): Promise<ConversationWithMessages[]> {
  const promptEditValue = getStore("prompt_edit", "")
  console.log("loadHistoryMessages: " + promptEditValue)
  const conversations = await loadHistoryConversations(botId)
  const messagesList = await Promise.all(conversations.map((c) => promptEditValue == "" ? loadConversationMessages(botId, c.id) : loadHistoryMessagesByMark(botId, c.id, promptEditValue)))
  return zip(conversations, messagesList).map(([c, messages]) => ({
    id: c!.id,
    createdAt: c!.createdAt,
    messages: messages!,
  }))
}

export async function loadAllMessageByMark(botId: BotId, mark: string): Promise<ConversationWithMessages[]> {
  const conversations = await loadHistoryConversations(botId)
  const messagesList = await Promise.all(conversations.map((c) => loadHistoryMessagesByMark(botId, c.id, mark)))
  return zip(conversations, messagesList).map(([c, messages]) => ({
    id: c!.id,
    createdAt: c!.createdAt,
    messages: messages!,
  }))
}

export async function loadHistoryMessagesByMark(botId: BotId, cid: string, mark: string): Promise<ChatMessageModel[]> {
  console.log("loadHistoryMessagesByMark " + mark)
  const messages = await loadConversationMessages(botId, cid);
  console.log(messages)
  return messages.filter((message) => message.mark === mark);
}

export async function deleteHistoryMessage(botId: BotId, conversationId: string, messageId: string) {
  const messages = await loadConversationMessages(botId, conversationId)
  const newMessages = messages.filter((m) => m.id !== messageId)
  await setConversationMessages(botId, conversationId, newMessages)
  if (!newMessages.length) {
    await deleteHistoryConversation(botId, conversationId)
  }
}
