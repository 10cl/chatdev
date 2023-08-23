# ChatDev - 以AI小镇为背景的大模型整合插件

[English](README.md) **|** [简体中文](README_CN.md) **|** [繁體中文](README_TC.md)

---
![ai_talk_xunfei.png](/screenshots/ai_talk_xunfei.png)


**ChatDev** 是一个整合多种大模型接口的**Chrome插件**，主体是以AI小镇为背景，然后通过大模型的接口给每个NPC赋予互动能力。

你可以用来研究不同大模型在游戏中的不同体验，也可以通过选择自己喜欢的大模型在AI小镇中建立一套自己的生活记忆。

## 使用
* 首次进入小镇时，大模型会根据您的语言环境询问您的**称呼**，您只需在输入框中输入您的称呼，大模型将在后续对话中使用它来称呼您。
* 使用键盘的**方向按键**（上下左右）来控制玩家的移动。当玩家靠近NPC时，NPC会根据当前情景和历史对话信息，发起新的对话（玩家会自动跟随）。
* 当控制玩家离开NPC一定距离后，NPC会总结当前的对话信息并将其存储到浏览器的`LocalStorage`中，以供后续聊天时使用。
* 当玩家靠近不同的区域（如健身房、大学等）或不同的位置（区域内的桌子、电脑、书架等），大模型会询问您是否在当前位置做记录，您可以回答以记录，记录将在您离开该位置后**总结存储**到`LocalStorage`中。

## 系统要求

* 您需要在Chrome或Edge浏览器中安装插件，并在对应的大模型官网上登录您的账号。

### 支持的大模型

* ChatGPT
* 讯飞星火认知大模型
* ...

## 安装方式

### 1. 从Chrome Web Store安装

在 [Chrome Web Store](https://chrome.google.com/webstore/category/extensions) 中搜索 [ChatDev](https://chrome.google.com/webstore/detail/chatdev/dopllopmmfnghbahgbdejnkebfcmomej) 并点击安装。

### 2. 手动安装

1. 从 Releases 中下载 `chatdev1.0.1.zip`。
2. 解压文件。
3. 在 Chrome/Edge 中，打开扩展页面（`chrome://extensions` 或 `edge://extensions` ）。
4. 启用开发者模式。
5. 将解压后的文件夹拖到页面上以导入（导入后请不要删除文件夹）。

### 3. 从源代码构建

* 克隆源代码
* 使用 `yarn install` 安装依赖
* 使用 `yarn build` 构建插件
* 按照“手动安装”中的步骤将 `dist` 文件夹加载到浏览器

## 更新日志

* v1.0.1

  * 新增讯飞星火认知大模型支持
* v1.0.0

  * 第一版基于ChatGPT的AI小镇插件发布

## 鸣谢

我们要衷心感谢以下项目，它们为我们提供了灵感和参考：

* [https://github.com/joonspk-research/generative_agents](https://github.com/joonspk-research/generative_agents)
* [https://github.com/chathub-dev/chathub](https://github.com/chathub-dev/chathub)

无论您是想探索不同大模型的奇妙之处，还是想打造自己的虚拟小镇生活，ChatDev都将是您的得力助手。立刻安装并开始探索吧！