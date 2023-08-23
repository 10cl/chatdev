# ChatDev - A Large Model Integration Plugin Set Against the Backdrop of an AI Town

[English](README.md) **|** [简体中文](README_CN.md) **|** [繁體中文](README_TC.md)

* * *

![ai_talk.jpg](/screenshots/ai_talk.jpg)

**ChatDev** is a Chrome plugin that integrates multiple large model interfaces, with its core set against the backdrop of an AI town. It empowers each NPC with interactive capabilities through these large model interfaces.

You can use it to explore different experiences of various large models in gaming or create a set of your own life memories in the AI town by selecting your favorite large model.

## How to Use

* When you first enter the town, the large model will ask for your **name** based on your language environment. Simply input your name in the text box, and the large model will use it to address you in future conversations.
* Use the **arrow keys** on your keyboard (up, down, left, right) to control the player's movements. When the player approaches an NPC, the NPC will initiate a new conversation based on the current situation and historical dialogue information (the player will automatically follow).
* When the player moves away from an NPC by a certain distance, the NPC will summarize the current conversation and store it in the browser's `LocalStorage` for use in future chats.
* As you approach different areas (e.g., gym, university) or different locations within those areas (e.g., tables, computers, bookshelves), the large model will ask if you want to record your current location. You can respond to record the location, and the record will be **summarily stored** in `LocalStorage` once you leave that location.

## System Requirements

* You need to install the plugin in the Chrome or Edge browser and log in to your account on the corresponding large model's website.

### Supported Large Models

* ChatGPT
* iFlyTek Starfire Cognitive Large Model
* ...

## Installation Options

### 1. Install from Chrome Web Store

Search for [ChatDev](https://chrome.google.com/webstore/detail/chatdev/dopllopmmfnghbahgbdejnkebfcmomej) in the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions) and click to install.

### 2. Manual Installation

1. Download `chatdev1.0.1.zip` from Releases.
2. Extract the files.
3. In Chrome/Edge, open the extensions page (`chrome://extensions` or `edge://extensions`).
4. Enable developer mode.
5. Drag the extracted folder onto the page to import (do not delete the folder after importing).

### 3. Build from Source Code

* Clone the source code.
* Use `yarn install` to install dependencies.
* Use `yarn build` to build the plugin.
* Follow the steps in "Manual Installation" to load the `dist` folder into your browser.

## Changelog

* v1.0.1
  * Added support for iFlyTek Starfire Cognitive Large Model.
* v1.0.0
  * Initial release of the AI Town plugin based on ChatGPT.

## Acknowledgments

We sincerely thank the following projects for providing us with inspiration and references:

* [https://github.com/joonspk-research/generative_agents](https://github.com/joonspk-research/generative_agents)
* [https://github.com/chathub-dev/chathub](https://github.com/chathub-dev/chathub)

Whether you want to explore the wonders of different large models or create your own virtual town life, ChatDev will be your invaluable assistant. Install it now and start exploring!