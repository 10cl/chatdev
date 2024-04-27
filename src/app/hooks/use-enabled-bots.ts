import useSWR from 'swr/immutable'
import {BotId, ChatPage} from '~app/bots'
import { CHATBOTS } from '~app/consts'
import { getUserConfig } from '~services/user-config'

export function useEnabledBots(type="extension") {

  const query = useSWR('enabled-bots', async () => {
    let enabledBots = Object.keys(CHATBOTS)
    if (type == "page"){
      enabledBots = ['chatgpt', "llama", "vicuna", "mistral", "gemma", "yi"]
    }
    return Object.keys(CHATBOTS)
      .filter((botId) => enabledBots.includes(botId as BotId))
      .map((botId) => {
        const bid = botId as BotId
        return { botId: bid, bot: CHATBOTS[bid] }
      })
  })
  return query.data || []
}
