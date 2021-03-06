# Padda

Padda是一个可以在里面编写JSX脚本代码的插件

![demo](./res/demo.gif)

当我们在做Ps插件/脚本开发的时候，经常需要在PS里头测试某些代码能否正确运行，之前一般都用Adobe Extensions Toolkit这个工具，但是这个工具已经不再升级了，它目前在最新的Mac 64位系统上已经无法运行了，同时也经常遇到连不上Ps的情况。

所以，为了快速验证脚本效果，我写了这个小插件

## 功能特性

### 1. 编写代码

没错，你可以在插件面板中编写代码！

内置的代码编辑器，可以让你即时编写JSX脚本代码，也可以随手复制一段AM进去，然后点运行，即可看到结果输出。

编辑器支持代码高亮，自动缩进等

![editor](./res/Snip20210909_4.png)

![success output](./res/Snip20210909_1.png)

当脚本运行错误，它也会将错误的行号，错误信息进行输出，方便你定位问题

![success output](./res/Snip20210909_2.png)


> 注意！ 目前还不支持单步调试代码

### 2. 执行本地jsx文件

你可以方便的选择一个本地jsx文件，进行允许，它有自动记忆功能，不用每次都挑文件


### 3. 图层信息

当你选中了某个图层，它会将此图层的所有属性，以JSON的格式呈现出来

![success output](./res/Snip20210909_3.png)


### 4. 代码快照

代码快照是一个非常实用的功能，你可以将某一段代码临时保存下来， 便于后续调用，这样在测试多功能的时候，就不用一直注释来注释去了


## 使用方法

从最新的发布界面下载安装包 [release page](https://github.com/cutterman-cn/padda/releases)

解压，双击安装，下一步，下一步……

安装完成后，重启PS，菜单栏 ->  扩展程序 -> Padda - devtool


## 意见和建议

如果有遇到bug，或者有更好的想法，欢迎提issue


