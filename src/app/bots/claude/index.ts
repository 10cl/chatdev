import {ClaudeMode, getUserConfig} from '~/services/user-config'
import {AsyncAbstractBot, MessageParams} from '../abstract-bot'
import {ClaudeApiBot} from '../claude-api'
import {ClaudeWebBot} from '../claude-web'

export class ClaudeBot extends AsyncAbstractBot {
  async initializeBot() {
    const {claudeMode, ...config} = await getUserConfig()
    if (claudeMode === ClaudeMode.API) {
      if (!config.claudeApiKey) {
        throw new Error('Claude API key missing')
      }
      return new ClaudeApiBot({
        claudeApiKey: config.claudeApiKey,
        claudeApiModel: config.claudeApiModel,
      })
    } else {
      return new ClaudeWebBot()
    }
  }
}
