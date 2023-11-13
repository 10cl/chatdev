import { FC, PropsWithChildren } from 'react'

const PagePanel: FC<PropsWithChildren<{ title: string }>> = (props) => {
  return (
    <div className="flex flex-col overflow-hidden bg-primary-background dark:text-primary-text rounded-2xl h-full">
      <div className="px-10 h-full overflow-auto">{props.children}</div>
    </div>
  )
}

export default PagePanel
