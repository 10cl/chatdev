import { AbstractBot, SendMessageParams } from '../abstract-bot'
import {streamAsyncIterable} from "~utils/stream-async-iterable";
import {GlobalFetchRequester} from "~app/bots/global-requester";
export class LlaMa2Bot extends AbstractBot {
  private conversationContext: { prompt: string }
  private initPrompt = "You are a helpful assistant.";

  constructor() {
    super();
    this.conversationContext = {prompt: ""}
  }


  buildRequestPrompt(prompt: string) {
    return this.conversationContext.prompt ?
      this.conversationContext.prompt + `<s>[INST] ${prompt} [/INST]\n` :
      `<s>[INST] <<SYS>>\n${this.initPrompt}\n<</SYS>>\n ${prompt} [/INST]\n`;
  }

  async doSendMessage(params: SendMessageParams) {
    const requestPrompt = this.buildRequestPrompt(params.prompt);
    const response = await globalFetchRequester.fetch("https://www.llama2.ai/api", {
      method: "POST",
      signal: params.signal,
      body: JSON.stringify({
        prompt: requestPrompt,
        model: "meta/meta-llama-3-70b-instruct",
        systemPrompt: this.initPrompt,
        temperature: 0.75,
        topP: 0.9,
        maxTokens: 1024,
        image: null,
        audio: null
      })
    });
    const decoder = new TextDecoder();
    let decodedText = "";
    for await (const uint8Array of streamAsyncIterable(response.body!)) {
      const text = decoder.decode(uint8Array, { stream: true })
      decodedText += text;
      if (decodedText) {
        params.onEvent({ type: "UPDATE_ANSWER", data: { text: decodedText } });
      }
    }
    this.conversationContext.prompt = requestPrompt + decodedText + "</s>";
    params.onEvent({ type: "DONE" });
  }

  resetConversation() {
    this.conversationContext = {prompt: ""}
  }

  get name() {
    return "Llama 3 70B";
  }

}
export const globalFetchRequester = new GlobalFetchRequester()

