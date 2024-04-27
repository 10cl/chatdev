import {ChatDevRemoteTransformersEmbeddings} from "../embedding/chatdev_remote_transformers.js";
import { test, expect } from "@jest/globals";

test("Test ChatDev.main", async () => {
  expect(true).toBe(true);
});

test("Test ChatDev.embedQuery", async () => {
    const embeddings =  new ChatDevRemoteTransformersEmbeddings({
        Bearer: "jina_e1ce58cea399477997f642fca44085b6b2qtxWDwbWBIsnZ_T2IiGdgsKsqh",
        batchSize: 512, // Default value if omitted is 512. Max is 2048
        model: "jina-embeddings-v2-base-en"
    });
    const res = await embeddings.embedQuery("Hello ChatDev IDE");
    expect(typeof res[0]).toBe("number");
});

test("Test ChatDev.embedDocuments", async () => {
    const embeddings =  new ChatDevRemoteTransformersEmbeddings({
        Bearer: "jina_e1ce58cea399477997f642fca44085b6b2qtxWDwbWBIsnZ_T2IiGdgsKsqh",
        batchSize: 512, // Default value if omitted is 512. Max is 2048
        model: "jina-embeddings-v2-base-en"
    });
    const res = await embeddings.embedDocuments(["Hello ChatDev", "Bye bye"]);
    expect(res).toHaveLength(2);
    expect(typeof res[0][0]).toBe("number");
    expect(typeof res[1][0]).toBe("number");
});


test("Test ChatDev concurrency", async () => {
    const embeddings =  new ChatDevRemoteTransformersEmbeddings({
        Bearer: "jina_e1ce58cea399477997f642fca44085b6b2qtxWDwbWBIsnZ_T2IiGdgsKsqh",
        batchSize: 512, // Default value if omitted is 512. Max is 2048
        model: "jina-embeddings-v2-base-en"
    });
    const res = await embeddings.embedDocuments([
        "Hello world",
        "Bye bye",
        "Hello ChatDev",
        "Bye bye",
        "Hello Panda",
        "Bye bye",
    ]);
    expect(res).toHaveLength(6);
    expect(res.find((embedding) => typeof embedding[0] !== "number")).toBe(
        undefined
    );
});
