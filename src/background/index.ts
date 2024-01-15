import Browser from 'webextension-polyfill'
import { ALL_IN_ONE_PAGE_ID } from '~app/consts'
import { getUserConfig } from '~services/user-config'
import { trackInstallSource } from './source'

async function openAppPage() {
  const tabs = await Browser.tabs.query({})
  const url = Browser.runtime.getURL('app.html')
  const tab = tabs.find((tab) => tab.url?.startsWith(url))
  if (tab) {
    await Browser.tabs.update(tab.id, { active: true })
    return
  }
  const { startupPage } = await getUserConfig()
  const hash = startupPage === ALL_IN_ONE_PAGE_ID ? '' : `#/chat/${startupPage}`
  await Browser.tabs.create({ url: `app.html${hash}` })
}

async function sendMessageToActiveTab(message: { code: any; action: string }) {
  const [tab] = await Browser.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab.id != null) {
    await Browser.tabs.sendMessage(tab.id, message);
  }
}

async function openSharePage(share: string) {
  const tabs = await Browser.tabs.query({})
  const url = Browser.runtime.getURL('app.html')
  const tab = tabs.find((tab) => tab.url?.startsWith(url))
  if (tab) {
    await Browser.tabs.update(tab.id, { active: true })
    return
  }
  const {startupPage} = await getUserConfig()
  const hash = `#/chat/${startupPage}?share=` + share;
  await Browser.tabs.create({url: `app.html${hash}`})
}

Browser.action.onClicked.addListener(() => {
  openAppPage()
})

Browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    openAppPage()
    trackInstallSource()
  }
})

Browser.commands.onCommand.addListener(async (command) => {
  console.debug(`Command: ${command}`)
  if (command === 'open-app') {
    openAppPage()
  }
})

Browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action == "openExtension") {
    openSharePage(request.share)
  }else if (request.action == "getCode"){
    const { task_html} = await Browser.storage.sync.get('task_html')
    sendMessageToActiveTab({action: "html", code: task_html})
  }
})