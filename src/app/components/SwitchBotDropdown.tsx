import { Menu, Transition } from '@headlessui/react'
import { FC, Fragment, useCallback } from 'react'
import {BotId, ChatPage} from '~app/bots'
import { useEnabledBots } from '~app/hooks/use-enabled-bots'

interface Props {
  type: ChatPage
  selectedBotId: BotId
  onChange: (botId: BotId) => void
}

const SwitchBotDropdown: FC<Props> = (props) => {
  const enabledBots = useEnabledBots(props.type)

  const onSelect = useCallback(
    (botId: BotId) => {
      props.onChange(botId)
    },
    [props],
  )

  return (
    <Menu as="div" className="relative inline-block text-left h-5">
      <Menu.Button>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.85355 8.85355C5.53857 8.53857 5.76165 8 6.20711 8H13.7929C14.2383 8 14.4614 8.53857 14.1464 8.85355L10.3536 12.6464C10.1583 12.8417 9.84171 12.8417 9.64645 12.6464L5.85355 8.85355Z" fill="#D8D8D8"/>
        </svg>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-10 mt-2 rounded-md bg-secondary shadow-lg focus:outline-none">
          {enabledBots.map(({ botId, bot }) => {
            if (botId === props.selectedBotId) {
              return null
            }
            return (
              <Menu.Item key={botId}>
                <div
                  className="px-4 py-2 ui-active:bg-primary-blue ui-active:text-white ui-not-active:text-secondary-text cursor-pointer flex flex-row items-center gap-3 pr-8"
                  onClick={() => onSelect(botId)}
                >
                  {props.type != "page" && (<div className="w-4 h-4">
                    <img src={bot.avatar} className="w-4 h-4" />
                  </div>)}
                  <p className="text-sm whitespace-nowrap">{bot.name}</p>
                </div>
              </Menu.Item>
            )
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default SwitchBotDropdown
