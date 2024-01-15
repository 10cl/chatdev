import {TimeWeightedVectorStoreRetriever} from "langchain/retrievers/time_weighted";
import {Document} from "@langchain/core/documents";
import {
    getEmbeddingDocs,
    getEmbeddingUrl,
    getStore,
    setRealYaml,
    setRealYamlKey, setResponseStream,
    setStore
} from "~services/storage/memory-store";
import {ChatDevLocalTransformersEmbeddings} from "~embedding/chatdev_local_transformers";
import {JSONLoader} from "langchain/document_loaders/fs/json";
import Browser from "webextension-polyfill";
import {ChatMessageModel} from "~types";
import {MemoryVectorStore} from "langchain/vectorstores/memory";
import {ChatTimeWeightedVectorStoreRetriever} from "~embedding/chat_time_weighted";
import {CheerioWebBaseLoader} from "langchain/document_loaders/web/cheerio";
import {toBase64} from "js-base64";

interface Window {
    retriever?: TimeWeightedVectorStoreRetriever;
    chat_retriever?: ChatTimeWeightedVectorStoreRetriever;
    movement?: JSON;
}

export async function retrieveDocs(query: string) {
    const docs = getEmbeddingDocs() as  Document[]
    console.log("query: " + query + " doc len: " + docs.length)
    const win = window as Window
    const retriever = win.retriever
    if (retriever){
        // embedding will cost lost of times.
        await embeddingDocument(getEmbeddingUrl(), docs)
        setResponseStream(await getRetrieveUrlDocument(getEmbeddingUrl(), query))
    }
}

export async function initChatEmbedding(enable: boolean){
    const win = window as Window

    /* for chat embedding */
    const embeddingChat = new ChatDevLocalTransformersEmbeddings({
        modelName: "Xenova/all-MiniLM-L6-v2",
    });
    const vectorStore = new MemoryVectorStore(embeddingChat)
    win.chat_retriever = new ChatTimeWeightedVectorStoreRetriever({
        vectorStore,
        memoryStream: [],
        searchKwargs: 2,
        k: 2,
    });

    /* Init Load & embedding */
    if (enable){
        const loader = new CheerioWebBaseLoader("https://chatdev.toscl.com/");
        const docs = await loader.load();
        await win.chat_retriever.addDocuments(docs)
        const retrievedDocs = await win.chat_retriever.getRelevantDocuments("ChatDev");
        let documentRetrieveAll = ""
        for (const retrievedDoc of retrievedDocs) {
            if (documentRetrieveAll.length < 4000) {
                documentRetrieveAll += retrievedDoc.pageContent
            }
        }
        console.log("return doc: " + documentRetrieveAll)
    }
}

export async function embeddingMessage(messages: ChatMessageModel[]){
    const embeddingIdList = getStore("embedding_msg_list", []) as string[]

    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i]
        if (msg.mark !== "" && msg.author != "user" && embeddingIdList.indexOf(msg.id) === -1) {
            const embeddings = new ChatDevLocalTransformersEmbeddings();
            const res = await embeddings.embedDocuments([msg.text]);

            const key = `embedding:${msg.mark}:${msg.id}`
            console.log("embedding doc: " + msg.text + " id: " + msg.id)

            embeddingIdList.push(msg.id)
            await Browser.storage.local.set({[key]: res[0]})
        }
    }
}

export async function getMarkDocument(marks: string[], query: string) {
    const win = window as Window
    const retriever = win.chat_retriever
    let documentRetrieveAll = ""
    if (retriever) {
        await retriever.addChatHistoryDataSet(marks)
        const retrievedDocs = await retriever.getRelevantDocuments(
            query
        )
        for (const retrievedDoc of retrievedDocs) {
            documentRetrieveAll += retrievedDoc.pageContent + "\n"
        }
    }
    console.log("documentRetrieveAll: " + documentRetrieveAll)
    return documentRetrieveAll
}

export async function embeddingDocument(url: string, docs : Document[]){
    const embeddingIdList = getStore("embedding_doc_list", []) as string[]
    const embeddingDocs = []
    const cacheDocs = []
    if (embeddingIdList.indexOf(url) === -1) {
        for (let i = 0; i < docs.length; i++) {
            const msg = docs[i]
            if (embeddingIdList.indexOf(url) === -1) {
                const embeddings = new ChatDevLocalTransformersEmbeddings();
                const res = await embeddings.embedDocuments([msg.pageContent]);
                embeddingDocs.push(res[0])
                cacheDocs.push(new Document({pageContent: msg.pageContent}))
            }
        }

        const embeddingKey = `embedding:${toBase64(url)}}`
        const docKey = `embedding_doc:${toBase64(url)}}`
        console.log("embedding doc: " + url)
        embeddingIdList.push(url)

        await Browser.storage.local.set({[embeddingKey]: embeddingDocs})
        await Browser.storage.local.set({[docKey]: cacheDocs})
    }
}

export async function getRetrieveUrlDocument(url: string, query: string) {
    const win = window as Window
    const retriever = win.chat_retriever
    let documentRetrieveAll = ""
    if (retriever) {
        await retriever.addDataSet(url)
        const retrievedDocs = await retriever.getRelevantDocuments(
            query
        )
        for (const retrievedDoc of retrievedDocs) {
            documentRetrieveAll += retrievedDoc.pageContent + "\n"
        }
    }
    console.log("documentRetrieveAll: " + documentRetrieveAll)
    return documentRetrieveAll
}
