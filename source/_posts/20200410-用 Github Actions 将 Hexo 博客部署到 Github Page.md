---
title: 用 Github Actions 将 Hexo 博客部署到 Github Page
date: 2020-04-10 10:43:08
urlname: zero-to-hexo2
tags: 
- blog
- hexo
categories:
- tutorial
desc: '上篇博客中已经实现在本地预览博客, 本篇会将本地博客部署到Github Page'
---

[上篇博客](https://blog.xhyh.tech/tutorial/zero-to-hexo1/)中已经实现在本地预览博客, 本篇会将本地博客部署到Github Page

<!--more-->

### 配置Github Actions

`Github Actions` 是 Github 推出的一款持续集成工具, 这里我们可以用来发布博客到 `Github Page`

1. 新建workflow文件

   只有当项目中`.github/workflows`目录下存在以`.yml`结尾的配置才会触发`Github Actions`

   ``` bash
   cd Blog
   mkdir -p .github/workflows
   touch .github/workflows/deploy.yml
   ```

2. 配置`deploy.yml`文件

   最新版可以查看[我的配置](https://github.com/achjqz/blog/blob/master/.github/workflows/deploy.yml)

3. 流程介绍

   根据上面的配置可以看到主要分为4步

- Checkout 拉取你的博客, 默认拉取本项目
- 安装Node环境
- 安装Hexo依赖
- 部署到Github Page

### 生成ssh私钥

有了ssh私钥可以实现免密码将博客推送到Github

具体配置可以参照[Linux下的ssh配置](https://blog.xhyh.tech/tutorial/linux-ssh/), 只用完成第一部分ssh生成

### 将公钥添加到Github

在 `push` 到Github时需要验证身份, 添加ssh公钥到Github, 本地使用私钥验证便有权限操控仓库

在Github账号设置中添加`ssh/id_rsa.pub`文件中的内容
![ssh](https://pic.rmb.bdstatic.com/6b5c9c8d97447ab0aad3da6af5439897.png)

### 生成ACCESS_SECRET

有了ACCESS_SECRET, `Github Actions` 才有权限写入仓库

可以在Github账户设置中生成一个
![token](https://pic.rmb.bdstatic.com/3e96456f3136c30e6daee91f21d00176.png)

至少必须给`read, write repo`的权限
保存好生成的一串数字字母

### 在Github上新建仓库

1. 进入[新建仓库页面](https://github.com/new)
2. 新建一个仓库, public和private均可, 但推荐public, 否则Github Page需要另外新建一个仓库
   ![new repo](https://pic.rmb.bdstatic.com/245f3c54feac8e15db0dae57ff18533c.png)
3. 在项目设置中添加`ACCESS_SECRET`, Value就是上面生成好的token
   ![secret](https://pic.rmb.bdstatic.com/5b364db983b09727ee07df2a9dc54a99.png)
4. 根据提示push项目

### 查看`Github Actions`工作情况

当 push 项目后, 在Actions选项中能看到已经自动运行部署
![workflow](https://pic.rmb.bdstatic.com/8cdc7826c558371149a5198b9fd6e43c.png)

如果有报错信息, 则根据信息修改

### 自定义域名设置

在项目Settings中可以[设置域名](https://help.github.com/en/github/working-with-github-pages/configuring-a-custom-domain-for-your-github-pages-site)并开启https
![setting](https://pic.rmb.bdstatic.com/2e181936fe576fb0f0cf484f87d538ad.png)

::: warning
注意若设置的是子域名, 则需要在DNS设置中加入CNAME规则, 使子域名指向`username.github.io`
:::

### 写作发布流程

至此, 应该能使用`username.github.io`访问你的博客了, 后续写作的流程是

1. `hexo new 'Hello world'` 生成新文章
2. 写作
3. `git add`,  `git commit`, `git push`
4. `Github Actions` 自动部署
