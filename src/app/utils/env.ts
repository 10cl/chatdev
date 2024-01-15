import {env} from "@xenova/transformers";

function isArcBrowser() {
  return getComputedStyle(document.documentElement).getPropertyValue('--arc-palette-background')
}

export function initEnv() {

  // Disable the loading of remote models from the Hugging Face Hub:
  env.allowRemoteModels = true;
  env.localModelPath = './assets/models/';

  // Set location of .wasm files. Defaults to use a CDN.
  // env.backends.onnx.wasm.wasmPaths = './assets/';

  env.backends.onnx.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/@xenova/transformers@2.5.4/dist/`;
  env.allowRemoteModels = true
  env.remoteHost = 'https://huggingface.co/'
  env.remotePathTemplate = '{model}/resolve/{revision}/'
}

export {isArcBrowser}
