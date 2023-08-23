# ChatDev - 背景以AI小鎮為大模型整合插件

[English](README.md) **|** [簡體中文](README_CN.md) **|** [繁體中文](README_TC.md)

* * *

![ai_talk_xunfei.png](/screenshots/ai_talk_xunfei.png)

**ChatDev** 是一個整合多種大模型接口的**Chrome擴展程式**，主體以AI小鎮為背景，然後透過大模型的接口賦予每個NPC互動能力。

您可以使用它來研究不同大模型在遊戲中的不同體驗，也可以透過選擇自己喜歡的大模型在AI小鎮中建立一套自己的生活記憶。

## 使用方法

* 首次進入小鎮時，大模型會根據您的語言環境詢問您的**稱呼**，您只需在輸入框中輸入您的稱呼，大模型將在後續對話中使用它來稱呼您。
* 使用鍵盤的**方向鍵**（上下左右）來控制玩家的移動。當玩家靠近NPC時，NPC會根據當前情景和歷史對話信息，發起新的對話（玩家會自動跟隨）。
* 當控制玩家離開NPC一定距離後，NPC會總結當前的對話信息並將其存儲到瀏覽器的`LocalStorage`中，以供後續聊天時使用。
* 當玩家靠近不同的區域（如健身房、大學等）或不同的位置（區域內的桌子、電腦、書架等），大模型會詢問您是否要記錄當前位置。您可以回答以記錄，記錄將在您離開該位置後**總結存儲**到`LocalStorage`中。

## 系統要求

* 您需要在Chrome或Edge瀏覽器中安裝擴展程式，並在相應的大模型官網上登錄您的帳號。

### 支持的大模型

* ChatGPT
* 訊飛星火認知大模型
* ...

## 安裝方式

### 1. 從Chrome Web Store安裝

在 [Chrome Web Store](https://chrome.google.com/webstore/category/extensions) 中搜索 [ChatDev](https://chrome.google.com/webstore/detail/chatdev/dopllopmmfnghbahgbdejnkebfcmomej) 並點擊安裝。

### 2. 手動安裝

1. 從Releases中下載 `chatdev1.0.1.zip`。
2. 解壓文件。
3. 在Chrome/Edge中，打開擴展程式頁面（`chrome://extensions` 或 `edge://extensions` ）。
4. 啟用開發者模式。
5. 將解壓後的文件夾拖到頁面上以導入（導入後請不要刪除文件夾）。

### 3. 從源代碼構建

* 克隆源代碼
* 使用 `yarn install` 安裝依賴
* 使用 `yarn build` 構建擴展程式
* 按照“手動安裝”中的步驟將 `dist` 文件夾加載到瀏覽器

## 更新日誌

* v1.0.1
  * 新增訊飛星火認知大模型支持
* v1.0.0
  * 基於ChatGPT的AI小鎮插件首次發布

## 鳴謝

我們衷心感謝以下項目，它們為我們提供了靈感和參考：

* [https://github.com/joonspk-research/generative_agents](https://github.com/joonspk-research/generative_agents)
* [https://github.com/chathub-dev/chathub](https://github.com/chathub-dev/chathub)

無論您想探索不同大模型的奇妙之處，還是想打造自己的虛擬小鎮生活，ChatDev都將是您的得力助手。立即安裝並開始探索吧！