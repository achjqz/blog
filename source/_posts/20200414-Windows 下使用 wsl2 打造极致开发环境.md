---
title: Windows 下使用 wsl2 打造极致开发环境
date: 2020-04-14 09:09:44
urlname: windows-wsl2-env
tags: 
- windows
- wsl2
categories:
- tutorial
desc: '自Windows Terminal发布后一直用得很爽, 我也一直在关注着另一个神器wsl2的到来. Windows 2004 RTM版出来后我便立即重装了系统, 感受到了wsl2的强大. 本文的主要内容就是如何配置wsl2并解决它带来的一些问题'
---

自Windows Terminal发布后一直用得很爽, 我也一直在关注着另一个'神器'wsl2的到来. Windows 2004 RTM版出来后我便立即重装了系统, 感受到了wsl2的强大. 本文的主要内容就是如何配置wsl2并解决它带来的一些问题

<!--more-->

#### 为什么需要wsl2

如果你是一个开发人员, 一定有以下几个痛点

1. 安装软件麻烦, c++应该下哪个? python应该下哪个? vscode对应的配置怎么配?
2. 残缺的`Git bash`,  `wget` 命令去哪了?  `md5sum`在哪?
3. 巨慢的`git clone`, ssh怎么不走代理啊? 怎么配置?
4. 乱码问题, 我使用`UTF-8`编码, 怎么运行到命令行就乱码?

`Windows`下还有很多问题就不一一列举了

#### wsl2能解决的问题

1. 真实`Linux`内核, 带来了完整的`Linux`体验
2. 优化后的IO速度, 读写速度快
3. 内存回收技术, 避免占用过多内存不释放
4. 自动挂载Windows磁盘, 无缝访问Windows文件

#### wsl2安装

具体安装请看[官方文档](https://docs.microsoft.com/en-us/windows/wsl/wsl2-install)

大致的步骤是

1. 打开可选功能的`适用于Linux的Windows子系统`和`虚拟机平台`
2. 重启计算机
3. 在`Windows Store`中下载`Linux`发行版, 如`Ubuntu`
4. 启动`Ubuntu`, 设置用户名, 密码(此时默认是`wsl`而不是`wsl2`)
5. 在`powershell`中根据文档切换成`wsl2`
6. 若提示切换失败, 可能需要手动安装内核, 去[官网](https://docs.microsoft.com/en-us/windows/wsl/wsl2-kernel)下载安装

#### Windows Terminal配置

1. 主题配置 这里贴一份我自己的配置, 有需要的可以[下载](
https://objectstorage.ap-tokyo-1.oraclecloud.com/n/nrnfoiwu5i48/b/anan/o/settings.json)修改
    ![windows-terminal](https://pic.rmb.bdstatic.com/3a62a32f090a8aed6fb9caa0af0019eb.png)
2. 右键-在此文件夹中打开 这个功能需要添加注册表, 有需要可以[下载](
https://objectstorage.ap-tokyo-1.oraclecloud.com/n/nrnfoiwu5i48/b/anan/o/right.reg), 运行

#### wsl2简单配置

1. 使用`zsh`作为默认`bash`(可选, 这里不做过多介绍)
2. 当使用`Windows Search` 打开`Windows Terminal`时, 默认进入用户目录`~`

    ``` bash
    if [[ "$(pwd)" == *"Windows"* ]] ; then
        cd ~
    fi
    ```

    > 由于我使用了oh-my-zsh, 每次安装会覆盖原有的.zshrc, 所以我的所有关于bash配置都写在~/.profile下, 并在.zshrc中使用source .profile加载, 更多配置可以参考[.profile文件](https://objectstorage.ap-tokyo-1.oraclecloud.com/n/nrnfoiwu5i48/b/anan/o/.profile)
3. 配置默认使用`vim`作为可视化编辑器

    ```bash
    export VISUAL=vim
    export EDITOR="$VISUAL"
    ```

#### wsl2代理设置

`wsl2`采用的网络模式是`Nat`模式, 在`wsl2`中如果想使用`Windows`下的代理会比较麻烦, 不能直接通过`localhost`访问

> 但Windows却可以使用localhost访问wsl2中的服务, 很便于程序的调试

首先需要安装`proxychains4`

``` bash
sudo apt install proxychains4
```

复制一份配置文件到用户目录

``` bash
sudo cp /etc/proxychains4.conf ~/.proxychains.conf
```

配置bash设置(.profile中)

``` bash
# 找到windows ip
export WIN_IP=`cat /etc/resolv.conf | grep nameserver | awk '{print $2}'`
# 删除原有socks5配置
sed -i '/socks5/d' ~/.proxychains.conf
# 添加新的socks5配置
sed -i '$a socks5 '${WIN_IP}' 7891' ~/.proxychains.conf
alias pc='proxychains4 -q -f ~/.proxychains.conf'
```

这样每次启动都会寻找正确的ip地址, 并设置好给`proxychains4`

#### vscode设置

还是由于网络问题, `remote server`继承了主`vscode`的配置, 代理会默认被设为`127.0.0.1:7890`, 会出现无法下载插件, 或无法使用插件等问题

经过测试, 即使在`wsl2`设置了`http_proxy`环境变量也没办法生效(主配置已检测到代理), 需要手动设置才能生效
![vscode-config](https://pic.rmb.bdstatic.com/ff4e30a30dd6be1ee200ef58054b83e9.png)

#### 其他配置

大多数软件都能使用`wsl2`替代, 如`git`, `c++`, `python`, `golang`等

但还是有些依赖图形化的软件只能在`Windows`下运行, 如`IDEA`, `Android Studio`等

这些软件也依赖于`git`, 但又不想在`Windows`又装一个重量级的`git bash`, 于是我找到两种解决方案, 一种是`git`映射到`wsl2`中的`git`, 第二种是额外下载一个轻量级的`git`--[MinGit](https://github.com/git-for-windows/git/releases)

这里推荐第二种方法, 简单, 最小只有20M左右, 而且无需安装

#### 坑

`wsl2`唯一的缺点是无法自动缩进磁盘空间, 当突然下载大文件后又删除后, 虚拟机占用空间并不会减少, 只会持续扩张. 目前解决办法是磁盘分区, 后续官方应该有更好的解决方法

#### 总结

总得来说, `wsl2`的体验很不错, 有种在`Linux`中使用`Windows`的感觉, 既可以享受`Windows`众多图形化软件带来的优势, 也可以方便快捷使用`Linux`做程序开发, 这点就比原生`Linux`强很多了, 和`mac`的差距也没那么大了
