import TurndownService from 'turndown'

const turndownService = new TurndownService()

export function html2md(html: string) {
  html = html.replace('<span class=\\"cursor\\"></span> ', "")
  return turndownService.turndown(html)
}
