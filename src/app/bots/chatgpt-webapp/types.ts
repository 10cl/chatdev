export type ResponsePayload = {
  conversation_id: string
  message: {
    id: string
    author: { role: 'assistant' | 'tool' | 'user' }
    content: ResponseContent
    recipient: 'all' | string
  }
  error: null
}

export type ResponseContent =
  | {
      content_type: 'text'
      parts: string[]
    }
  | {
      content_type: 'code'
      text: string
    }
  | {
      content_type: 'tether_browsing_display'
      result: string
    }
  | {
      content_type: 'multimodal_text'
      parts: ({ content_type: 'image_asset_pointer' } & ImageContent)[]
    }

export type ResponseCitation = {
  start_ix: number
  end_ix: number
  metadata: {
    title: string
    url: string
    text: string
  }
}

export interface ImageContent {
  asset_pointer: string // file-service://file-5JUtfsLd8O0GEZzjtFmWvZr8
  size_bytes: number
  width: number
  height: number
}
