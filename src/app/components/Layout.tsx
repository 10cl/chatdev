import { Outlet } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import {followArcThemeAtom, themeColorAtom, workFlowingDisableAtom} from '~app/state'
import Sidebar from './Sidebar'
import PromptFlow from './Sidebar/PromptFlow'
import {useAtom} from "jotai/index";

function Layout() {
  const themeColor = useAtomValue(themeColorAtom)
  const followArcTheme = useAtomValue(followArcThemeAtom)
  const [workFlowingDisable, setWorkFlowingDisable] = useAtom(workFlowingDisableAtom)

  return (
    <main
      className="h-screen grid grid-cols-[auto_1fr_auto]"
      style={{ backgroundColor: followArcTheme ? 'var(--arc-palette-foregroundPrimary)' : themeColor }}
    >
      <Sidebar />
      <div className="px-[15px] py-3 h-full overflow-hidden">
        <Outlet />
      </div>
      <PromptFlow />
    </main>
  )
}

export default Layout
