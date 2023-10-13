<p align="center">
    <img src="./screenshots/chatgpt_architecture.svg">
</p>
<h1 align="center">ChatDev: Visualize Your AI Agent</h1>

<div align="center">

[![author][author-image]][author-url]
[![license][license-image]][license-url]
[![release][release-image]][release-url]
[![last commit][last-commit-image]][last-commit-url]

English &nbsp;&nbsp;|&nbsp;&nbsp; [Indonesia](README_IN.md) &nbsp;&nbsp;|&nbsp;&nbsp; [简体中文](README_ZH-CN.md) &nbsp;&nbsp;|&nbsp;&nbsp; [繁體中文](README_ZH-TW.md) &nbsp;&nbsp;|&nbsp;&nbsp; [日本語](README_JA.md)
##

### ⚡️ Install

<a href="https://chrome.google.com/webstore/detail/chatdev-visualize-your-ai/dopllopmmfnghbahgbdejnkebfcmomej?utm_source=github"><img src="https://user-images.githubusercontent.com/64502893/231991498-8df6dd63-727c-41d0-916f-c90c15127de3.png" width="200" alt="Get ChatDev for Chromium"></a>

##

[Screenshot](#-screenshot) &nbsp;&nbsp;|&nbsp;&nbsp; [Features](#-features) &nbsp;&nbsp;|&nbsp;&nbsp; [Bots](#-bots) &nbsp;&nbsp;|&nbsp;&nbsp; [Installation](#-installation) &nbsp;&nbsp;|&nbsp;&nbsp; [Changelog](#-changelog)

[author-image]: https://img.shields.io/badge/author-10cl-blue.svg
[author-url]: https://github.com/10cl
[license-image]: https://img.shields.io/github/license/10cl/chatdev?color=blue
[license-url]: https://github.com/10cl/chatdev/blob/main/LICENSE
[release-image]: https://img.shields.io/github/v/release/10cl/chatdev?color=blue
[release-url]: https://github.com/10cl/chatdev/releases/latest
[last-commit-image]: https://img.shields.io/github/last-commit/10cl/chatdev?label=last%20commit
[last-commit-url]: https://github.com/10cl/chatdev/commits

</div>

**ChatDev** is a powerful **Chrome extension** that integrates multiple large language model interfaces to provide diverse conversational experiences. With visual customization of Prompt-Flow task sequences, you can not only explore the performance of different large models in games but also create your own task execution flows. Interact with virtual NPCs to enrich your experiences, and craft your unique memories in the AI town by selecting your preferred large models.

## 📷 Screenshot
![game-prompt-flow.png](./screenshots/game-prompt-flow.png)
![chat-prompt-flow.gif](./screenshots/chat-prompt-flow.gif)

## ✨ Features
* Use different chatbots in one application, which currently supports ChatGPT, the new Bing Chat, Google Bard, Claude, and more than 10 open source models.
* Invoking large model interfaces in the browser in the form of Webapis requires no code capability
* Interact with NPCS in the form of games and discuss real needs
* Customize the role definition of NPCS
* Customize NPC behavior and plan Prompt
* Customize Prompt Flow
* Once Prompt Flow is enabled, express your needs in one sentence, and NPCS will be automatically selected to form teams, perform quests, and present them in an interactive gameplay style.

## 🤖 Bots
Supported ChatGPT & iFlytek Spark & Bing & Bard & Claude & ChatGLM & Alpaca & Vicuna & Koala & Dolly & LLaMA & StableLM & OpenAssistant & ChatRWKV...

## 🔨 Installation

### 1. Install from Chrome Web Store

Search for [ChatDev](https://chrome.google.com/webstore/detail/chatdev/dopllopmmfnghbahgbdejnkebfcmomej) in the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions) and click "Install."

### 2. Manual Installation

1. Download `chatdev1.1.1.zip` from the Releases page.
2. Extract the files.
3. In Chrome/Edge, open the extensions page (`chrome://extensions` or `edge://extensions`).
4. Enable developer mode.
5. Drag and drop the extracted folder onto the page to import it (do not delete the folder after importing).

### 3. Build from Source Code

* Clone the source code.
* Run `yarn install` to install dependencies.
* Run `yarn build` to build the plugin.
* Follow the steps in "Manual Installation" to load the `dist` folder into your browser.

## 📜 Changelog
* v1.1.1

  * prompt flow double-click the editable node
  * Import or export all configurations
  * prompt library sharing
* v1.1.0

  * Support for multiple large language models
  * Customization of user roles
  * Support for custom prompts (actions, plans, etc.)
  * New visual editing for custom Prompt Flow
  * Support for switching between chat view and game view
  * Predefined Prompt Flows, enabling one-sentence requests to automatically select NPCs, form teams, execute tasks, and gamify presentations
  * Settings button for customizing APIs and selecting preferred models
  * Fixed API issues with iFlytek Spark model
* v1.0.1

  * Added support for iFlytek Spark cognitive large language model
* v1.0.0

  * Initial release of the AI town plugin based on ChatGPT

## 🤝 Acknowledgments

We sincerely thank the following projects for providing inspiration and reference: [generative_agents](https://github.com/joonspk-research/generative_agents)、[chathub](https://github.com/chathub-dev/chathub)

Whether you want to explore the wonders of different large language models or create your own virtual town life, ChatDev will be your reliable assistant. Install it now and start exploring!
