import { Embeddings, type EmbeddingsParams } from "@langchain/core/embeddings";
export interface ChatDevLLMInputs {
  /** Prompt processing batch size. */
  batchSize?: number;
  Bearer ?: string;
  input ?: string[];
  model ?: string;
}

export interface ChatDevEmbeddingsParams
    extends ChatDevLLMInputs,
        EmbeddingsParams {}

export class ChatDevRemoteTransformersEmbeddings extends Embeddings {
  _inputs: ChatDevEmbeddingsParams;

  constructor(inputs: ChatDevEmbeddingsParams) {
    super(inputs);
    this._inputs = inputs;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const tokensArray = [];

    for (const text of texts) {
      const response = await this.encode(this._inputs, text)
      const responseData = await response.json();
      const encodings = responseData.data[0].embedding
      tokensArray.push(encodings);
    }

    const embeddings: number[][] = [];

    for (const tokens of tokensArray) {
      const embedArray: number[] = [];

      for (let i = 0; i < tokens.length; i += 1) {
        const nToken: number = +tokens[i];
        embedArray.push(nToken);
      }

      embeddings.push(embedArray);
    }
    console.log(embeddings)
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    const tokens: number[] = [];
    const response = await this.encode(this._inputs, text)
    const responseData = await response.json();
    const encodings = responseData.data[0].embedding

    for (let i = 0; i < encodings.length; i += 1) {
      const token: number = +encodings[i];
      tokens.push(token);
    }

    return tokens;
  }
  async encode(inputs:ChatDevEmbeddingsParams, text: string) {
    const url = "https://api.jina.ai/v1/embeddings";

    const headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + inputs.Bearer,
    };

    const data = {
      input: text,
      model: inputs.model
    };

    return this.caller.call(async () => {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = new Error(
            `ChatDev LLM call failed with status code ${response.status}`
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response = response;
        throw error;
      }
      return response;
    });
  }
}