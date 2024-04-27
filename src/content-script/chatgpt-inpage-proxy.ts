import Browser from 'webextension-polyfill'
import {ProxyFetchRequestMessage} from "~types/messaging";
import {streamAsyncIterable} from "~utils/stream-async-iterable";
import {uint8Array2String} from "~utils/encoding";

async function main() {
  Browser.runtime.onMessage.addListener(async (request) => {
    console.log("chatgpt content-script: ", request)
    if (request === 'url') {
      return location.href
    }else if (request.action === "proxyFetch") {
      const message = request.code as ProxyFetchRequestMessage
      console.debug('proxy fetch', message.url, message.options)
      const resp = await fetch(message.url, {
        ...message.options,
        signal: null,
      })
      await chrome.runtime.sendMessage({
        action: "proxyFetch_chatgpt", code: {
          type: 'PROXY_RESPONSE_METADATA',
          metadata: {
            status: resp.status,
            statusText: resp.statusText,
            headers: Object.fromEntries(resp.headers.entries()),
          },
        }
      });
      for await (const chunk of streamAsyncIterable(resp.body!)) {
        await chrome.runtime.sendMessage({
          action: "proxyFetch_chatgpt", code: {
            type: 'PROXY_RESPONSE_BODY_CHUNK',
            value: uint8Array2String(chunk),
            done: false
          }
        });
      }
      await chrome.runtime.sendMessage({action: "proxyFetch_chatgpt", code: {type: 'PROXY_RESPONSE_BODY_CHUNK', done: true}});
    }
  })
  if ((window as any).__NEXT_DATA__) {
    await Browser.runtime.sendMessage({ event: 'PROXY_TAB_READY' })
  }
}
main().catch(console.error)
