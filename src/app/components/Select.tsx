import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import cx from 'classnames'
import { Fragment, useMemo } from 'react'

interface Props<T> {
  options: { value: T; name: string }[]
  value: T
  onChange: (value: T) => void
  size?: 'normal' | 'small'
  disabled?: boolean
}

function Select<T extends string>(props: Props<T>) {
  const { options, value, onChange, size = 'normal', disabled } = props
  const selectedName = useMemo(() => options.find((o) => o.value === value)!.name, [options, value])
  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button
              className={cx(
                'relative w-full cursor-default rounded-md bg-white pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none leading-6',
                size === 'normal' ? 'text-sm py-1.5' : 'text-xs py-1',
                disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <span className="block truncate">{selectedName}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>
            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                className={cx(
                  'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
                  size === 'normal' ? 'text-sm' : 'text-xs',
                )}
              >
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      cx(
                        active ? 'bg-primary-blue text-white' : 'text-[#303030]',
                        'relative cursor-default select-none py-2 pl-3 pr-9',
                      )
                    }
                    value={option.value}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={cx(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                          {option.name}
                        </span>
                        {selected ? (
                          <span
                            className={cx(
                              active ? 'text-white' : 'text-[#303030]',
                              'absolute inset-y-0 right-0 flex items-center pr-4',
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}

export default Select
