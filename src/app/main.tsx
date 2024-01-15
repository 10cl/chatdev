import { RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'
import '../services/sentry'
import './base.scss'
import './i18n'
import { plausible } from './plausible'
import { router } from './router'
import {initForWinStore} from "~services/storage/window-store";

const container = document.getElementById('app')!
const root = createRoot(container)
initForWinStore().then(() => root.render(<RouterProvider router={router} />))

plausible.enableAutoPageviews()
