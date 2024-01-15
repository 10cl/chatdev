import {ofetch} from "ofetch";
import {CSVLoader} from "langchain/document_loaders/fs/csv";
import {JSONLoader} from "langchain/document_loaders/fs/json";
import {YoutubeLoader} from "langchain/document_loaders/web/youtube";
import {IMSDBLoader} from "langchain/document_loaders/web/imsdb";
import {HNLoader} from "langchain/document_loaders/web/hn";
import {GitbookLoader} from "langchain/document_loaders/web/gitbook";
import {CheerioWebBaseLoader} from "langchain/document_loaders/web/cheerio";
import {
    getNodeType,
    setAgentReset,
    setEmbeddingDocs,
    setEmbeddingUrl,
    setResponseType
} from "~services/storage/memory-store";
import {TextLoader} from "langchain/document_loaders/fs/text";
import {WebPDFLoader} from "langchain/document_loaders/web/pdf";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import {requestHostPermission} from "~app/utils/permissions";

export async function loadDocuments(url: string) {
    const extension = extractFileExtension(url)
    try {
        let loader;
        if (extension == "pdf") {
            const blob = await ofetch(url, {responseType: "blob"});
            loader = new WebPDFLoader(blob);
        } /*else if (extension == "csv") {
            const blob = await ofetch(url, {responseType: "blob"});
            loader = new CSVLoader(blob);
        } else if (extension == "json") {
            const blob = await ofetch(url, {responseType: "blob"});
            loader = new JSONLoader(blob);
        } else if (extension == "txt") {
            const blob = await ofetch(url, {responseType: "blob"});
            loader = new TextLoader(blob);
        } else if (isIMSDbLink(url)) {
            loader = new IMSDBLoader(url);
        }else if (isHackerNewsLink(url)){
            loader = new HNLoader(url);
        } else if (isGitBookLink(url)){
            loader = new GitbookLoader(url, {
                shouldLoadAllPaths: true,
            });
        }*//* else if (isYouTubeLink(url)){
            loader = YoutubeLoader.createFromUrl(url, {
                language: "en",
                addVideoInfo: true,
            });
        } */else {
            loader = new CheerioWebBaseLoader(url);
            const docs = await loader.load();
            const splitter = RecursiveCharacterTextSplitter.fromLanguage("html");
            const resultDocs = await splitter.splitDocuments(docs)
            // cache the doc loader.
            setEmbeddingDocs(resultDocs)
            setEmbeddingUrl(url)

            return resultDocs
        }

        const docs = await loader.load()
        // cache the doc loader.
        setEmbeddingDocs(docs)
        setEmbeddingUrl(url)

        return docs
    } catch (err) {
        console.error(err)
        alert('Document error: ' + err)
    }
    return undefined
}

export async function loadDocument(url: string) {
    console.log("load document: " + url)
    const docs = await loadDocuments(url)
    if (docs){
        let documents = ""
        for (const retrievedDoc of docs) {
            documents += retrievedDoc.pageContent + "\n"
        }
        return documents
    }
    return ""
}

export async function loadUrl(url : string) {
    try {
        console.log("load url: " + url)
        const urlObj = new URL(url);
        if (!(await requestHostPermission(urlObj.protocol + '//*.' + urlObj.hostname + "/"))) {
            alert("Please allow the host permission to load the url.")
            setAgentReset(true)
            return ""
        }
        setResponseType("url")

        const loadType = getNodeType()
        if (loadType == "url"){
            return ofetch<string>(url).catch((err) => {
                alert('Failed to load remote html:' + err)
                return ""
            })
        }else if (loadType == "doc"){
            return loadDocument(url)
        }
    }catch (e){
        alert("loadUrl exception: " + e)
    }
}

export function isURLWithFileExtension(str: string) {
    const fileExtensions = /\.(pdf|csv|txt|json)$/i;

    return fileExtensions.test(str);
}

export function extractFileExtension(url: string) {
    const regex = /\.([a-z0-9]+)(?:[\?#]|$)/i;
    const match = url.match(regex);
    return match ? match[1] : null;
}

export function isYouTubeLink(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(embed\/|v\/|watch\?v=)|youtu\.be\/)([^"&?\/\s]{11})$/;
    return youtubeRegex.test(url);
}

export function isIMSDbLink(url: string): boolean {
    return url.startsWith('https://imsdb.com');
}

export function isHackerNewsLink(url: string): boolean {
    const hackerNewsDomain = 'news.ycombinator.com';
    const normalizedUrl = new URL(url);
    return normalizedUrl.hostname === hackerNewsDomain;
}

export function isGitBookLink(url: string): boolean {
    const hackerNewsDomain = 'docs.gitbook.com';
    const normalizedUrl = new URL(url);
    return normalizedUrl.hostname === hackerNewsDomain;
}