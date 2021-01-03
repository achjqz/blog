---
title: docker 部署 nginx 和 UnblockNeteaseMusic
date: 2020-11-03 10:39:40
urlname: docker-unblock
tags: 
- docker
- nginx
categories:
- tutorial
desc: '每次配置 nginx 都是一件烦人的事，原来尝试用过 docker-compose-letsencrypt-nginx-proxy-companion, 一键生成证书，配置 nginx，反向代理服务。但用了后发现也没有那么方便，体量太重，也不好自己定制化修改配置，于是自己写了 docker-compose，方便配置 nginx，也方便接入新的服务。这里以解锁网易云音乐为例，将整个流程走一遍'
---

每次配置 nginx 都是一件烦人的事，原来尝试用过 `docker-compose-letsencrypt-nginx-proxy-companion`, 一键生成证书，配置 nginx，反向代理服务。但用了后发现也没有那么方便，体量太重，也不好自己定制化修改配置，于是自己写了 docker-compose，方便配置 nginx，也方便接入新的服务。这里以解锁网易云音乐为例，将整个流程走一遍

<!--more-->

### 需求

按照 UnblockNeteaseMusic (下面简称unblock) 的 [iOS配置经验](https://github.com/nondanee/UnblockNeteaseMusic/issues/368) 所说

> iOS比较特殊的另外一点是他会在下载第三方音源时，将它们的 HTTP 地址先替换成 HTTPS 地址再去请求。而很多第三方音源不支持 HTTPS 访问（证书错误且资源不存在，表现就是歌曲虽然亮起来，但是无法播放，报错“网络不给力，播放失败”)

最优雅的解决方案就是启用 endpoint 功能，将第三方音源的地址包裹在自己域名下转发

大致原理: unblock 找到歌曲的第三方歌源 -> unblock 返回被包裹地址(`https://your-domain.com/package/{真实地址编码}`) -> iOS 客户端请求该地址 -> nginx 转发该请求到 unblock -> unblock 取出真实地址 -> unblock 请求歌曲内容并返回 -> iOS 客户端成功播放

从上面流程可以看出其实就是搭建一个 nginx，反向代理到 unblock，下面讲如何使用 docker 达到这个效果

> 仓库地址: https://github.com/achjqz/nginx

### 申请 SSL 证书

按照 [certbot](https://certbot.eff.org/lets-encrypt/debianstretch-nginx) 官方流程申请免费的 SSL 证书

具体命令也可以参考 [我的仓库](https://github.com/achjqz/nginx/blob/main/install-certbot.sh)

::: danger
免费域名，如 .tk, .ga 会申请失败
:::

申请成功后证书可以在`/etc/letsencrypt/live/`中找到

### 修改配置

1. 修改证书位置

    在 [docker-compose.yml](https://github.com/achjqz/nginx/blob/main/docker-compose.yml) 中修改 volumes

    ``` yml
    ...
    volumes:
      # 将 music.xhyh.site 改为自己域名地址
      - /etc/letsencrypt/live/music.xhyh.site/fullchain.pem:/etc/nginx/certs/music/fullchain.pem:ro
      - /etc/letsencrypt/live/music.xhyh.site/chain.pem:/etc/nginx/certs/music/chain.pem:ro
      - /etc/letsencrypt/live/music.xhyh.site/privkey.pem:/etc/nginx/certs/music/privkey.pem:ro
    ...
    ```

2. 修改 endpoint 地址

    在 [music/docker-compose.yml](https://github.com/achjqz/nginx/blob/main/music/docker-compose.yml) 中修改 command

    ``` yml
    ...
    # 修改 music.xhyh.site 为自己的域名
    command: -s -e https://music.xhyh.site
    ...
    ```

3. 修改 nginx config

    在 [nginx-data/music.conf](https://github.com/achjqz/nginx/blob/main/nginx-data/music.conf) 中 修改 server_name

    ``` conf
    server_name music.xhyh.site; # 改为你自己的域名
    ```

    > 如果部署在阿里云又没有备案，则可以把 443 端口换成 2096, 这样可以规避备案提醒

### 部署服务

1. 安装`docker`和`docker-compose` 

    ``` bash
    # install docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    
    # install docker-compose
    
    sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    ```

2. 创建 network

    ``` bash
    # nginx 和 music 都会使用该网络 
    docker network create webproxy
    ```

3. 运行 unblock

    ``` bash
    cd music
    docker-compose up -d
    ```

4. 运行 nginx

    ``` bash
    # 退回到项目根目录
    cd ..
    docker-compose up -d
    ```
