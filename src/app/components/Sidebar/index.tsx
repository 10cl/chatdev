import { Link } from '@tanstack/react-router'
import cx from 'classnames'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import allInOneIcon from '~/assets/all-in-one.svg'
import collapseIcon from '~/assets/icons/collapse.svg'
import feedbackIcon from '~/assets/icons/feedback.svg'
import discordIcon from '~/assets/icons/discord.svg'
import githubIcon from '~/assets/icons/github.svg'
import settingIcon from '~/assets/icons/setting.svg'
import themeIcon from '~/assets/icons/theme.svg'
import logo from '~/assets/logo.svg'
import minimalLogo from '~/assets/minimal-logo.svg'
import { useEnabledBots } from '~app/hooks/use-enabled-bots'
import { sidebarCollapsedAtom } from '~app/state'
import CommandBar from '../CommandBar'
import GuideModal from '../GuideModal'
import ThemeSettingModal from '../ThemeSettingModal'
import Tooltip from '../Tooltip'
import NavLink from './NavLink'
import PremiumEntry from './PremiumEntry'

function IconButton(props: { icon: string; onClick?: () => void }) {
  return (
    <div
      className="p-[6px] rounded-[10px] w-fit cursor-pointer hover:opacity-80 bg-secondary bg-opacity-20"
      onClick={props.onClick}
    >
      <img src={props.icon} className="w-6 h-6" />
    </div>
  )
}

function Sidebar() {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useAtom(sidebarCollapsedAtom)
  const [themeSettingModalOpen, setThemeSettingModalOpen] = useState(false)
  const enabledBots = useEnabledBots()
  return (
    <aside
      className={cx(
        'flex flex-col bg-primary-background bg-opacity-40 overflow-hidden',
        collapsed ? 'items-center px-[15px]' : 'w-[230px] px-4',
      )}
    >
      <img
        src={collapseIcon}
        className={cx('w-6 h-6 cursor-pointer my-5', collapsed ? 'rotate-180' : 'self-end')}
        onClick={() => setCollapsed((c) => !c)}
      />
      <div className="flex flex-col gap-3 overflow-y-auto scrollbar-none">
        {enabledBots.map(({ botId, bot }) => (
          <NavLink
            key={botId}
            to="/chat/$botId"
            params={{ botId }}
            text={bot.name}
            icon={bot.avatar}
            iconOnly={collapsed}
          />
        ))}
      </div>
      <div className="mt-auto pt-2">
        {!collapsed && <hr className="border-[#ffffff4d]" />}
        <div className={cx('flex mt-5 gap-[10px] mb-4', collapsed ? 'flex-col' : 'flex-row ')}>
          {!collapsed && (
              <Tooltip content={t('Feedback')}>
                <a href="mailto:notice@toscl.com" rel="noreferrer">
                  <IconButton icon={feedbackIcon} />
                </a>
              </Tooltip>
          )}
          {!collapsed && (
              <Tooltip content={t('Github Issues')}>
                <a href="https://github.com/10cl/chatdev/issues" target="_blank" rel="noreferrer">
                <IconButton icon={githubIcon} />
                </a>
              </Tooltip>
          )}
          <Tooltip content={t('Discord')}>
            <a href="https://discord.gg/fdjWfgGPjb" target="_blank" rel="noreferrer">
              <IconButton icon={discordIcon} />
            </a>
          </Tooltip>
        </div>
      </div>
      <CommandBar />
      <GuideModal />
      {themeSettingModalOpen && <ThemeSettingModal open={true} onClose={() => setThemeSettingModalOpen(false)} />}
    </aside>
  )
}

export default Sidebar
