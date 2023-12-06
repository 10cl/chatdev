<p align="center">
    <img src="./screenshots/chatgpt_architecture.svg">
</p>
<h1 align="center">ChatDev IDE：构建你的AI代理</h1>

<div align="center">

[![author][author-image]][author-url]
[![license][license-image]][license-url]
[![release][release-image]][release-url]
[![last commit][last-commit-image]][last-commit-url]
[![discord][discord-image]][discord-url]

[英语](README.md) &nbsp;&nbsp;|&nbsp;&nbsp; 简体中文 &nbsp;&nbsp;|&nbsp;&nbsp; 

<a href="https://chromewebstore.google.com/detail/chatdev-ide-%E6%9E%84%E5%BB%BA%E4%BD%A0%E7%9A%84%E6%99%BA%E8%83%BD%E4%BD%93/dopllopmmfnghbahgbdejnkebfcmomej?hl=zh"><img src="./screenshots/chrome-logo.png" width="200" alt="为Chromium获取ChatDev"></a>
<a href="https://microsoftedge.microsoft.com/addons/detail/ceoneifbmcdiihmgfjeodiholmbpmibm?utm_source=github"><img src="./screenshots/edge-logo.png" width="160" alt="为Microsoft Edge获取ChatDev"></a>


[截图](#-截图) &nbsp;&nbsp;|&nbsp;&nbsp; [游戏模式](#-游戏模式) &nbsp;&nbsp;|&nbsp;&nbsp; [聊天模式](#-聊天模式) &nbsp;&nbsp;|&nbsp;&nbsp; [PromptIDE](#-prompt-ide) &nbsp;&nbsp;|&nbsp;&nbsp; [机器人](#-机器人) &nbsp;&nbsp;|&nbsp;&nbsp; [安装](#-安装) &nbsp;&nbsp;

[author-image]: https://img.shields.io/badge/作者-10cl-blue.svg
[author-url]: https://github.com/10cl
[license-image]: https://img.shields.io/github/license/10cl/chatdev?color=blue
[license-url]: https://github.com/10cl/chatdev/blob/main/LICENSE
[release-image]: https://img.shields.io/github/v/release/10cl/chatdev?color=blue
[release-url]: https://github.com/10cl/chatdev/releases/latest
[last-commit-image]: https://img.shields.io/github/last-commit/10cl/chatdev?label=最后提交
[last-commit-url]: https://github.com/10cl/chatdev/commits
[discord-image]: https://img.shields.io/discord/977885982579884082?logo=discord
[discord-url]: https://discord.gg/fdjWfgGPjb

</div>

ChatDev IDE是一个用于构建AI代理的工具，无论是在游戏中的NPC还是强大的代理工具，您都可以在这个平台上设计您想要的内容。

它通过支持JavaScript实现了**JavaScript Support**，从而加速了提示工程。

[https://www.bilibili.com/video/BV1eN411L7LF/](https://www.bilibili.com/video/BV1eN411L7LF/) 

## 📷 截图
![gpts_talk_business.png](./screenshots/gpts_talk_business.png) 
![chatdev.gif](./screenshots/chatdev.gif)


## 📢 简介
* 游戏模式：在AI镇社会模拟中，您可以自定义这些NPC和位置标记。
* GPTs支持：从GPTs社区导入或自定义您的GPT。
* PromptIDE：自动完成，双屏显示，可视化PromptFlow，JavaScript节点支持
* 不仅仅是ChatGpt，还有Bing Chat，Google Bard，Claude，千问，讯飞等超过10种开源模型。

## ✨ 游戏模式
这是最令人兴奋的部分，您可以自定义所有角色，您可以设计数学家，心理分析专家为您解决各种问题，您只需要定义合理的提示角色定义，地图的丰富度将完全由您控制，如果您对设计感到满意，您也可以与我们分享，我们会将其推荐给其他用户。
在游戏模式中，您可以在左侧选择您喜欢的大型模型，在地图上，通过方向键或鼠标控制NPC的动作，当您靠近NPC或到达标记位置时，NPC会主动触发冷启动响应，或在下方输入框中主动输入您的聊天内容。
游戏基于模拟的AI镇社会环境，您可以靠近NPC或走到特定位置，通过输入与NPC交流或在特定位置与自己聊天。

### 社会模拟
![social_simulation.png](./screenshots/social_simulation.png)

这是一个模拟的AI镇社会环境，由25个具有独立意识的NPC和一个受控玩家组成，地图大小为180x100，单个网格的大小定义为32。25个NPC有预定义的日常生活轨迹。您可以通过自定义NPC的提示描述来接近NPC进行聊天输入，或者您可以为标记位置自定义您的提示描述，并在您走到标记位置时与自己聊天。
当玩家与NPC的距离<100时，NPC将根据预定义的角色描述触发主动问候。当玩家与NPC的距离>200时，聊天区域将自动结束。
当您将鼠标移动到标记位置时，当前标记的提示描述将弹出。您可以点击“编辑”按钮来描述您指定的位置的提示。当您靠近这个标记或直接在这个位置交谈时，提示将被用作背景知识，并且您将进行对话。

### 自定义您自己的地图

![custom_map](./screenshots/custom_map.png) 将`chatdev/src/assets/ex_assets/chatdev_main_map.json`拖到 `TILED` 应用程序中。

### GPTs

GPTs是一个大型语言模型，您可以从社区导入GPTs或在PromptIDE中自定义Prompt Flow以实现新的GPTs，运行GPTs让NPC实现多人自我协作完成任务。 在GPTs中，如果GPTs的Prompt Flow定义了角色(`npc`，详情见[流程](#flows))，并将地图中的NPC分配给该角色，那么它们将在地图上聚集在一起举行研讨会并执行GPTs的完整过程。如果没有定义角色，您可以在聊天模式中查看完整的执行过程，并以通常的LLM方式进行对话。

## ✨ 聊天模式

当您选择聊天模式，并关闭右上角的`GPTs`，在左侧选择您喜欢的大型模型时，聊天模式将是一个常规的LLM用户界面，并且所有的输入都将通过正常的LLM界面，输出大型模型的回复。

![chat_mode.png](./screenshots/chat_mode.png)

### GPTs社区

您可以从社区导入GPTs，您也可以与他人分享您的GPTs。 ![gpts_community.png](./screenshots/gpts_community.png)

### 聊天历史

您的聊天将被本地存储，您可以通过悬停鼠标查看标记位置或NPC的历史聊天记录。 ![chat_history.png](./screenshots/chat_history.png)

### 聊天链

在聊天模式中，如果您处于聊天模式，那么Prompt Flow的执行将以聊天链的形式进行，聊天框中的Prompt Flow的执行也将以聊天链的形式进行。 右键单击右上角打开GPT，输入您的一句需求，您的输入将作为`Chat Chain`中的输入变量`${inputs.input}`，并且`Chat Chain`将根据您的输入执行相应的节点。节点的执行顺序是从上到下。如果节点的输入变量满足条件，则执行该节点，否则跳过该节点并执行下一个节点。 ![chat-prompt-flow.gif](./screenshots/chat-prompt-flow.gif)

## ✨ Prompt IDE

Prompt流是一套旨在简化LLM为基础的AI应用的端到端开发周期的开发工具，从构思，原型，测试，评估。它使提示工程变得更容易，并使您能够构建具有生产质量的LLM应用。

![prompt_ide.png](./screenshots/prompt_ide.png)

* **Prompt Flow 编辑器**：用于编辑`Prompt Flow`的YAML文件以及节点的提示内容和JavaScript脚本
* **Prompt Flow 可视化**：通过Prompt Flow节点的执行过程的可视化，当执行到某个节点时，节点的颜色会改变
* **JavaScript 支持**：通过JavaScript脚本，您可以发挥您的创造力，实现不同NPC之间的协作，以实现您的GPTs
* **导出 & 导入**：您可以导入其他优秀的GPTs或分享您的GPTs

### PromptFow 编辑器

* YAML语法高亮显示
* NPC名称和Prompt库的自动完成。
* 双屏显示

使用PromptFow编辑器创建和迭代开发流程

* 创建可执行的流程，将LLM、提示、**JavaScript**代码和其他工具链接在一起。
* 轻松调试并迭代您的流程，尤其是与LLM的互动。

左边的编辑器是PromptFlow的YAML文件，其中`path`和`func`被高亮显示，表示引用了自定义的Prompt。您可以移动鼠标并点击`path`或`func`上的节点，右侧将显示您在节点上自定义的Prompt。最右侧的折叠界面是可视化的Prompt Flow。您也可以通过双击节点来编辑节点的Prompt内容。 当您在左侧修改YAML文件时，右侧的可视化Prompt Flow将实时更新。


### PromptFlow 可视化

尽管大多数开发者可能对LLMs的工作方式感到难以理解，但LLM应用程序的工作方式并不复杂 - 它们基本上涉及一系列对外部服务的调用，如LLMs/数据库/搜索引擎，或者涉及中间数据处理，所有这些都通过连接在一起。因此，LLM应用程序只是函数调用的有向无环图（DAG）。这些DAGs是prompt flow中的流程。

通过观察许多内部用例，我们了解到深入了解执行细节是至关重要的。建立一种系统跟踪与外部系统交互的方法是设计的优先级之一。因此，我们采用了一种非常规的方法 - prompt flow有一个YAML文件，描述了函数调用（我们称之为Tools）如何执行并连接成有向无环图（DAG）。

### 流程

PromptFlow中的流程是由提示/函数的DAG（有向无环图）组成，称为节点。

这些节点通过输入/输出依赖关系连接，并根据拓扑结构由PromptFlow执行器执行。

流程表示为YAML文件，并可以在我们的IDE中进行可视化。

以下是一个示例：

#### 编写GPTs/Agent

表示当前节点输出内容的定义。`${TestModification}` 引用节点的名称，表示当前节点的输出是 `TestModification` 节点（`output` 变量）的输出。这是一种标准格式，您需要确保在地图中使用 'desc' 节点来描述您的GPTs，定义 'outputs' 节点下的 'reference'，以表示最终节点，并确保所有节点都连接在一起。

```yaml
# 必需
desc: '您的GPTs描述' # 在游戏地图中，将鼠标悬停在GPTs显示的描述上

# 必需
outputs:
  overview:
    reference: ${Chatting} # 最终节点

# 单个节点的定义支持文本类型和URL类型。以下是文本类型的示例
nodes:
  - name: Chatting
    type: prompt
    source:
      path: Action_Prompt_Template # prompt的路径
    inputs:
      input_text: ${inputs.input_text} # `${inputs.input}` 代表输入框中输入的完整内容。
      intro: 'xxx'
```

在提示中：

* `{intro}` 将被 'xxx' 替换
    
* `{input_text}` 将被输入框中输入的内容替换
    
* 完整的概括Twitter内容的GPTs如下：
    

```yaml
desc: '概括elonmusk最新的Twitter'

outputs:
  overview:
    reference: ${summary_twitter}

nodes:
  - name: elonmusk
    speak: '获取elonmusk最新的Twitter' # speak代表地图中显示的游戏角色的内容，不会导致大量HTML显示
    type: url
    source:
      path: 'https://chatdev.toscl.com/rattibha/user/elonmusk'
      func: Func_twitter # 可选地，func定义了用于解析返回的HTML内容的JavaScript的路径
    inputs:
      task: ${inputs.input_text}

  - name: summary_twitter
    source:
      path: Planning_Prompt_Twitter
    inputs:
      info: ${elonmusk.output} # `${elonmusk.output}` 是对elonmusk节点返回内容的引用
      task: ${inputs.input_text}
```

#### 编写提示

在YAML中，`source.path` 用于编写提示。选择要表示为提示/函数的突出部分，然后可以进行编辑。

例如，在 `inputs` 中将 `task` 定义为输入变量，例如：`task: ${elonmusk.output}`，`${elonmusk.output}` 将替换提示中的字符串：`{task}`。

#### 编写Func

在YAML中，`source.func` 用于编写JavaScript，这是可选的。 节点对象的范围对于 `window` 是全局的，因此您可以在 `func` 中使用任何JS代码。 JQuery也在此预设，您可以直接使用 `$` 处理文本，例如，您可以使用 `new DOMParser()` 或 `$('div#xml')`。 使用 `node.xxx`：表示引用当前节点的变量，例如：`node.output` 使用 `node_name.xxx`：表示引用另一个节点的变量

### 导出与导入

您可以将您的提示流导出为JSON文件，并导入到另一个设备中。它包含有关提示流的所有信息，包括提示、JavaScript函数和YAML文件。

### GPTs示例

我们的示例还应该给您一个如何使用它的想法：

#### 与NPC聊天

* YAML

```yaml
desc: "与NPC聊天"

inputs:
  input_text:
    type: string
    default: "你好"
  auto: true

outputs:
  overview:
    reference: ${ChattingWith_Eddy_Lin}

nodes:
  - name: ChattingWith_Eddy_Lin
    source:
      path: Action_Target_Dialogue_Npc
    inputs:
      input_text: ${inputs.input_text}
      intro: "姓名：Eddy Lin，年龄：19岁
天赋倾向：好奇，分析，音乐
学到的倾向：Eddy Lin是Oak Hill College的学生，学习音乐理论和作曲。他喜欢探索不同的音乐风格，并始终寻找扩展知识的方法。
当前情况：Eddy Lin正在为大学课程进行作曲项目。他还在上课学习更多关于音乐理论的知识。
生活方式：Eddy Lin晚上11点左右上床睡觉，早上7点左右起床，晚上5点左右吃晚饭。"
```

* Action_Target_Dialogue_Npc

```text
{intro}

现在是 {now_time}，我们正在聊天。
我对你说：{input_text}。你可能会说什么？
1. 无需输出您的分析过程
2. 输出语言：{lang}
```

#### 与Twitter聊天

* YAML

```yaml
desc: "与BillGates聊天"

inputs:
  input_text:
    type: string
    default: "我最近在做什么"
  auto: true

outputs:
  overview:
    type: string
    reference: ${ask_twitter}

nodes:
  - name: get_BillGates_twitter
    speak: "获取BillGates最新的Twitter"
    type: url
    source:
      path: "https://chatdev.toscl.com/rattibha/user/BillGates"
      func: Func_twitter
    inputs:
      task: ${inputs.input_text}

  - name: ask_twitter
    source:
      path: Planning_Prompt_Twitter
    inputs:
      info: ${get_BillGates_twitter.output}
      task: ${inputs.input_text}
```

* Func_twitter

```js
const xmlText = node.output
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
node.output = ""
const items = xmlDoc.querySelectorAll('item');
items.forEach(item => {
  const description = item.querySelector('description').textContent;
  const pubDate = item.querySelector('pubDate').textContent;
  const temp = node.output + description + " \n 发布时间：" + pubDate + "\n"
  if(temp.length <= 4000){
    node.output += temp
    console.log("长度：" + node.output.length);
  }
});
console.log("长度：" + node.output.length);
```

* Planning_Prompt_Twitter

```text
这是我最近发推的内容：
########
{info}
########
请根据上面的内容尽量简单地回答我的问题。
现在，我说：{task}
```

#### 与任意URL聊天

* YAML

```yaml
desc: "url文本正文提取"

outputs:
  overview:
    reference: ${ask_textbody}

nodes:
  - name: get_url_text_extract
    type: url
    source:
      path: "https://chatdev.toscl.com/"
      func: FUNC_Text_Extraction
    inputs:
      task: ${inputs.input_text}

  - name: ask_textbody
    source:
      path: Planning_Text_Ask
    inputs:
      info: ${get_url_text_extract.output}
      task: ${inputs.input_text}
```

* FUNC_Text_Extraction

使用 `Readability` 从HTML中提取文本。

```js
console.log("提取文本")
const parser = new DOMParser();
const doc = parser.parseFromString(node.output, "text/html");

var article = new Readability(doc).parse();
console.log(article);
node.output = article.textContent
```

* Planning_Prompt_Twitter

```text
这是我最近发推的内容：
########
{info}
########
请根据上面的内容尽量简单地回答我的问题。
现在，我说：{task}
```

#### 一句话生成一个网站

```yaml
desc: "单个GPTs - 生成网页 - 多角色协作呈现"

outputs:
  overview:
    type: html
    reference: ${TestModification}

roles:
  - name: "首席产品官"
    npc: "Mei Lin"
    source:
      path: Role_Chief_Product_Officer
  - name: "顾问"
    npc: "Jennifer Moore"
    source:
      path: Role_Counselor
  - name: "首席技术官"
    npc: "Ryan Park"
    source:
      path: Role_Chief_Technology_Officer
  - name: "首席人力资源官"
    npc: "Adam Smith"
    source:
      path: Role_Chief_Human_Resource_Officer
  - name: "程序员"
    npc: "Carmen Ortiz"
    source:
      path: Role_Programmer
  - name: "代码审查员"
    npc: "Francisco Lopez"
    source:
      path: Role_Code_Reviewer
  - name: "软件测试工程师"
    npc: "Latoya Williams"
    source:
      path: Role_Software_Test_Engineer
  - name: "首席创意官"
    npc: "Klaus Mueller"
    source:
      path: Role_Chief_Creative_Officer

nodes:
  - name: DemandUnderstand
    speak: "优化您的需求..."
    source:
      path: Planning_Prompt_Enhance
      func: Func_Prompt_Enhance
    inputs:
      task: ${inputs.input_text}

  - name: Coding
    role: "首席技术官"
    source:
      path: Planning_Coding
      func: Func_Coding
    inputs:
      assistant_role: "程序员"
      gui: ${DemandUnderstand.gui}
      ideas: ${DemandUnderstand.ideas}
      language: ${DemandUnderstand.language}
      modality: ${DemandUnderstand.modality}
      task: ${DemandUnderstand.task}

  - name: CodeComplete
    role: "首席技术官"
    speak: "代码完成..."
    source:
      path: Planning_CodeComplete
      func: Func_Coding
    inputs:
      assistant_role: "程序员"
      unimplemented_file: ${Coding.unimplemented_file}
      codes: ${Coding.output}
      language: ${DemandUnderstand.language}
      modality: ${DemandUnderstand.modality}
      task: ${DemandUnderstand.task}

  - name: CodeReviewComment
    speak: "代码审查..."
    role: "程序员"
    source:
      path: Planning_CodeReviewComment
    inputs:
      assistant_role: "代码审查员"
      codes: ${CodeComplete.output}
      ideas: ${DemandUnderstand.ideas}
      language: ${DemandUnderstand.language}
      modality: ${DemandUnderstand.modality}
      task: ${DemandUnderstand.task}

  - name: CodeReviewModification
    speak: "代码审查修改..."
    role: "程序员"
    source:
      path: Planning_CodeReviewModification
      func: Func_Coding
    inputs:
      assistant_role: "代码审查员"
      comments: ${CodeReviewComment.output}
      codes: ${CodeComplete.output}
      ideas: ${DemandUnderstand.ideas}
      language: ${DemandUnderstand.language}
      modality: ${DemandUnderstand.modality}
      task: ${DemandUnderstand.task}

  - name: TestErrorSummary
    speak: "测试总结..."
    role: "软件测试工程师"
    source:
      path: Planning_TestErrorSummary
    inputs:
      assistant_role: "程序员"
      test_reports: "js & css应该内联在index.html中"
      codes: ${CodeReviewModification.output}
      language: ${DemandUnderstand.language}
```


## 🤖 机器人

### ChatGpt

### 必应

### Bard

### Claude

### LLama 2

### Vicuna

### Falcon

### 千问

### 讯飞

## 🔨 安装

### 1. 从网上商店安装

1. 在[Chrome网上应用店](https://chrome.google.com/webstore/category/extensions)搜索[ChatDev](https://chrome.google.com/webstore/detail/chatdev/dopllopmmfnghbahgbdejnkebfcmomej)，点击“安装”。
2. 在[Microsoft-Edge-Extensions](https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home)搜索[ChatDev](https://microsoftedge.microsoft.com/addons/detail/chatdev-visualize-your-a/ceoneifbmcdiihmgfjeodiholmbpmibm)，点击“获取”。

### 2. 手动安装

1. 从发布页面下载`chatdev1.3.0.zip`。
2. 解压文件。
3. 在Chrome/Edge中，打开扩展页面（`chrome://extensions` 或 `edge://extensions`）。
4. 启用开发者模式。
5. 将解压后的文件夹拖放到页面上以导入（导入后不要删除该文件夹）。

### 3. 从源代码构建

* 克隆源代码。
* 运行`yarn install`安装依赖项。
* 运行`yarn build`构建插件。
* 按照“手动安装”的步骤将`dist`文件夹加载到你的浏览器中。
