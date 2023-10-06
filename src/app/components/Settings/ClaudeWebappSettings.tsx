import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { UserConfig } from '~services/user-config'
import Select from '../Select'

interface Props {
  userConfig: UserConfig
  updateConfigValue: (update: Partial<UserConfig>) => void
}

const ClaudeWebappSettings: FC<Props> = () => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-1">
      <p className="font-medium text-sm">{t('Model')}</p>
      <div className="w-[250px] mb-1">
        <Select options={[{ name: 'Claude 2', value: 'claude-2' }]} value="claude-2" onChange={console.log} />
      </div>
      <p className="text-sm mt-1 text-secondary-text">{t('Available in the US and UK')}</p>
    </div>
  )
}

export default ClaudeWebappSettings
