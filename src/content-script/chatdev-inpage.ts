import Browser from "webextension-polyfill";
import {getUserConfig} from "~services/user-config";
/// <reference path="../types/chrome.d.ts" />

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

const in_chatdev = document.getElementById('in_chatdev')
const in_chatdev_tips = document.getElementById('in_chatdev_tips')
if (in_chatdev) {
    in_chatdev.classList.remove("hidden");
    if (in_chatdev_tips){
        in_chatdev_tips.classList.add("hidden");
    }
    in_chatdev.onclick = async function () {
        const match = window.location.href.match(/s\/(.*)/);
        if (match) {
            const share = match[1];
            chrome.runtime.sendMessage({action: "openExtension", share: share});
        }
    }
}

Browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action == "openExtension") {
        openSharePage(request.share)
    }
})