import Browser from "webextension-polyfill";
import { createRoot } from 'react-dom/client'
import SidePanelPage from '../app/pages/SidePanelPage'
import '../app/base.scss'
import '../app/sidepanel.css'
// import "../app/theme.ts"
import {initForWinStoreOfWeb} from "~services/storage/window-store";

// for chatdev.toscl.com, web page: Agent view
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

// for chatdev.toscl.com, web page: Generate WebSite View.
const pendingText = document.getElementById('pending_text')
if (pendingText){
  chrome.runtime.sendMessage({action: "getCode"});
  Browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log("content-script: ", request)
    if (request.action == "html"){
      const pendingText = document.getElementById('pending_text');
      if (pendingText){
        pendingText.innerHTML = request.code
      }
    }
  })
}

// for chatdev.toscl.com, web page: ASK
setTimeout(function (){
  const chatdev_container = document.getElementById('chatdev_container');
  console.log("find side panel page container")

  if (chatdev_container){
    console.log("create side panel page")
    const chat_button = document.getElementById('chat_button');
    if (chat_button)
      chat_button.style.display = 'block';

    const root = createRoot(chatdev_container)
    initForWinStoreOfWeb().then(() => root.render(<SidePanelPage type="page"/>))
  }
}, 4000)
