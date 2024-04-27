import {
  ProxyFetchResponseBodyChunkMessage,
  ProxyFetchResponseMetadataMessage,
  RequestInitSubset
} from "~types/messaging";
import Browser, {Runtime} from "webextension-polyfill";
import {string2Uint8Array} from "~utils/encoding";
import {Requester} from "~app/bots/chatgpt-webapp/requesters";

export class GlobalFetchRequester implements Requester {
  fetch(url: string, options?: RequestInitSubset): Promise<Response> {
    return new Promise((resolve, reject) => {
      const body = new ReadableStream({
        start(controller) {
          const listener = async function (message: any, sender: Runtime.MessageSender) {
            console.log('result fetch', message)
            const messageResult = message.code as ProxyFetchResponseBodyChunkMessage | ProxyFetchResponseMetadataMessage
            if (message.action === 'fetch_result') {
              clearTimeout(timer)
              if (messageResult.type === 'PROXY_RESPONSE_METADATA') {
                const response = new Response(body, messageResult.metadata)
                resolve(response)
              } else if (messageResult.type === 'PROXY_RESPONSE_BODY_CHUNK') {
                if (messageResult.done) {
                  controller.close()
                  Browser.runtime.onMessage.removeListener(listener)
                } else {
                  const chunk = string2Uint8Array(messageResult.value)
                  controller.enqueue(chunk)
                }
              }
            }
          }
          const timer = setTimeout(() => {
            Browser.runtime.onMessage.removeListener(listener)
            const messageResult = {
              type: 'PROXY_RESPONSE_METADATA',
              metadata: {
                status: 403,
                statusText: ""
              }
            }
            console.log("fetch timeout 403")
            const response = new Response(body, messageResult.metadata)
            resolve(response)
          }, 10 * 1000)
          chrome.runtime.sendMessage({action: "fetch", code: { url, options }});
          Browser.runtime.onMessage.addListener(listener)
        },
        cancel(_reason: string) {
          console.log("cancel")
        },
      })
    })
  }
}
