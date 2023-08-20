import { ofetch } from 'ofetch'

const plausibleApiHost = import.meta.env.VITE_PLAUSIBLE_API_HOST || 'https://plausible.io'

async function trackEvent(name: string, props: object) {
  await ofetch(`${plausibleApiHost}/api/event`, {
    method: 'POST',
    body: {
      domain: 'chatdev.toscl.com',
      name,
      url: location.href,
      props,
    },
    mode: 'no-cors',
  })
}

export async function trackInstallSource() {
  const { source } = await ofetch('https://chatdev.toscl.com/api/user/source', {
    credentials: 'include',
  })
  trackEvent('install', { source })
}
