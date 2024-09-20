# JavaScript

## 使用方法

要想执行一个 JavaScript 脚本，首先需要 [安装Node.js](https://nodejs.org/zh-cn)

键入以下命令执行一个 JavaScript 脚本文件：

```bash
node test.js
```

嵌入在HTML中的JavaScript必须在`<script></script>`中间，可放在`body`和`head`的任意位置，通常是放到`head`中或者页面底部，不干扰页面内容，数量不限

如果使用外部的script文件，则在HTML中使用`<script src="test.js"></script>`来引用（外部脚本文件中不能包含`<script>`标签）

## 在浏览器中调试

1. 打开浏览器，按`F12`进入开发者工具
2. 选择Console选项卡
3. 输入JavaScript代码，按`Enter`键执行

或者进入source选项卡中新增Snippets，输入JavaScript代码，按`Ctrl+Enter`键执行, 如下图所示：

![snippets中编写代码段](https://image-host.pages.dev/learn/2024_09_20_202409201343791.png)