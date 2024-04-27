import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest(async (env) => {
  return {
    manifest_version: 3,
    name: '__MSG_appName__',
    description: '__MSG_appDesc__',
    default_locale: 'en',
    version: '1.5.1',
    icons: {
      '16': 'src/assets/icon.png',
      '32': 'src/assets/icon.png',
      '48': 'src/assets/icon.png',
      '128': 'src/assets/icon.png',
    },
    background: {
      service_worker: 'src/background/index.ts',
      type: 'module',
    },
    action: {},
    host_permissions: [
      'https://*.bing.com/',
      'https://*.openai.com/',
      'https://*.xfyun.cn/',
      'https://*.llama2.ai/',
      'https://*.plausible.io/',
      'https://gemini.google.com/',
      'https://*.toscl.com/',
      'https://*.aliyun.com/',
      'https://*.pi.ai/',
      'https://*.anthropic.com/',
      'https://*.claude.ai/',
      'https://*.lmsys.org/',
    ],
    "content_security_policy": {
      "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
    },
    optional_host_permissions: ['https://*/*', 'wss://*/*'],
    permissions: ['storage', 'unlimitedStorage', 'sidePanel', 'declarativeNetRequestWithHostAccess'],
    content_scripts: [
      {
        matches: ['https://chat.openai.com/*'],
        js: ['src/content-script/chatgpt-inpage-proxy.ts'],
      },
      {
        "matches": ['https://*.toscl.com/*'],
        "js": ["src/content-script/chatdev-inpage.tsx"]
      }
    ],
    commands: {
      'open-app': {
        suggested_key: {
          default: 'Alt+L',
          windows: 'Alt+L',
          linux: 'Alt+L',
          mac: 'Command+L',
        },
        description: 'Open ChatDev app',
      },
    },
    side_panel: {
      default_path: 'sidepanel.html',
    },
    declarative_net_request: {
      rule_resources: [
        {
          id: 'ruleset_chatgpt',
          enabled: true,
          path: 'src/rules/chatgpt.json',
        },
        {
          id: 'ruleset_lmsys',
          enabled: true,
          path: 'src/rules/lmsys.json',
        },
        {
          id: 'ruleset_bing',
          enabled: true,
          path: 'src/rules/bing.json',
        },
        {
          id: 'ruleset_ddg',
          enabled: true,
          path: 'src/rules/ddg.json',
        },
        {
          id: 'ruleset_qianwen',
          enabled: true,
          path: 'src/rules/qianwen.json',
        },
        {
          id: 'ruleset_baichuan',
          enabled: true,
          path: 'src/rules/baichuan.json',
        },
      ],
    },
  }
})
