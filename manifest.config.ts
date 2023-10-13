import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest(async (env) => {
  return {
    manifest_version: 3,
    name: '__MSG_appName__',
    description: '__MSG_appDesc__',
    default_locale: 'en',
    version: '1.1.1',
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
      'https://bard.google.com/',
      'https://*.chatdev.toscl.com/',
    ],
    optional_host_permissions: ['https://*/*'],
    permissions: ['storage', 'unlimitedStorage', 'sidePanel'],
    content_scripts: [
      {
        matches: ['https://chat.openai.com/*'],
        js: ['src/content-script/chatgpt-inpage-proxy.ts'],
      },
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
  }
})
