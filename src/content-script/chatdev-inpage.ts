import Browser from "webextension-polyfill";

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

chrome.runtime.sendMessage({action: "getCode"});
Browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action == "html"){
        const pendingText = document.getElementById('pending_text');
        if (pendingText){
            pendingText.innerHTML = request.code
        }
    }
})