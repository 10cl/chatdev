# ChatDev: Visualize Your AI Agent

[English](README.md) **|** [简体中文](README_CN.md) **|** [繁體中文](README_TC.md)

* * *
![chatdev.png](/screenshots/chatdev.png)

**ChatDev** is a powerful **Chrome extension** that integrates multiple large language model interfaces to provide diverse conversational experiences. With visual customization of Prompt-Flow task sequences, you can not only explore the performance of different large models in games but also create your own task execution flows. Interact with virtual NPCs to enrich your experiences, and craft your unique memories in the AI town by selecting your preferred large models.

https://github.com/10cl/chatdev/assets/6964022/2cbdb313-e0e5-49d8-bd03-58c5b710ca72


## Key Features

* **No coding required, freely customize prompts**
* Gamified player interactions
* Visual customization of NPC profiles
* Custom prompts for behaviors and plans
* Visual customization of task sequences (Prompt Flow)
* With Prompt Flow enabled, simply express your needs in a sentence, and the system will automatically select NPCs to form a team, execute tasks, and present them in a gamified manner.

## Develop Your Own Language Model Prompt Flow

![prompt-edit.png](/screenshots/prompt-edit.png)

## Execute According to Your Defined Flow Within the Game

![prompt-flow.jpg](/screenshots/prompt-flow.jpg)

## Customize Your Prompt Actions and NPC Profiles

![prompt.png](/screenshots/prompt.png)

## Game Controls

* Upon entering the town for the first time, the large language model will ask for your **name** based on your language context. Simply input your name in the text field, and the large language model will address you by it in subsequent conversations.
* Use the keyboard's **arrow keys** (up, down, left, right) to control the player's movement. When the player approaches an NPC, the NPC will initiate a new conversation based on the current context and past dialogue history (the player will automatically follow).
* When the player moves a certain distance away from the NPC, the NPC will summarize the current conversation and store it in the browser's `LocalStorage` for later use.
* When the player approaches different areas (e.g., gym, university) or different locations within an area (e.g., tables, computers, bookshelves), the large language model will inquire whether you want to record your activities at the current location. You can choose to record, and these records will be automatically **summarized and stored** in `LocalStorage` when you leave the location.
* With the Prompt Flow panel on the right open, simply express your needs in a sentence, and the system will automatically select NPCs to form a team, execute tasks, and present them in a gamified manner. After completing tasks, you can engage in conversations with NPCs to further refine the project status.

## System Requirements

* You need to install the plugin in the Chrome or Edge browser and log in with your official account for the corresponding large language model.

### Supported Large Language Models

* ChatGPT
* iFlytek Spark
* Bing
* Bard
* Claude
* ChatGLM
* Alpaca
* Vicuna
* Koala
* Dolly
* LLaMA
* StableLM
* OpenAssistant
* ChatRWKV
* ...

## Installation Methods

### 1. Install from Chrome Web Store

Search for [ChatDev](https://chrome.google.com/webstore/detail/chatdev/dopllopmmfnghbahgbdejnkebfcmomej) in the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions) and click "Install."

### 2. Manual Installation

1. Download `chatdev1.1.0.zip` from the Releases page.
2. Extract the files.
3. In Chrome/Edge, open the extensions page (`chrome://extensions` or `edge://extensions`).
4. Enable developer mode.
5. Drag and drop the extracted folder onto the page to import it (do not delete the folder after importing).

### 3. Build from Source Code

* Clone the source code.
* Run `yarn install` to install dependencies.
* Run `yarn build` to build the plugin.
* Follow the steps in "Manual Installation" to load the `dist` folder into your browser.

## Changelog

* v1.1.0 (Upcoming Release)

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

## Acknowledgments

We sincerely thank the following projects for providing inspiration and reference:

* [https://github.com/joonspk-research/generative_agents](https://github.com/joonspk-research/generative_agents)
* [https://github.com/chathub-dev/chathub](https://github.com/chathub-dev/chathub)

Whether you want to explore the wonders of different large language models or create your own virtual town life, ChatDev will be your reliable assistant. Install it now and start exploring!
