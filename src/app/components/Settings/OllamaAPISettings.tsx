import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {ClaudeAPIModel, OllamaAPIModel, UserConfig} from '~services/user-config'
import { Input } from '../Input'
import Select from '../Select'

interface Props {
  userConfig: UserConfig
  updateConfigValue: (update: Partial<UserConfig>) => void
}

const OllamaAPISettings: FC<Props> = ({ userConfig, updateConfigValue }) => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <p className="font-medium text-sm">API Host({t('Make sure your Ollama server has `export OLLAMA_ORIGINS="*"` configured')})</p>
        <Input
          className="w-[300px]"
          placeholder="http://xxxx:xxxx/api/chat"
          value={userConfig.ollamaApi}
          onChange={(e) => updateConfigValue({ ollamaApi: e.currentTarget.value })}
          type="input"
        />
      </div>
      <div className="flex flex-col gap-1 w-[300px]">
        <p className="font-medium text-sm">{t('Model')}</p>
        <Select
          options={Object.entries(OllamaAPIModel).map(([k, v]) => ({ name: k, value: v }))}
          value={userConfig.ollamaModel}
          onChange={(v) => updateConfigValue({ ollamaModel: v })}
        />
      </div>
    </div>
  )
}

export default OllamaAPISettings
