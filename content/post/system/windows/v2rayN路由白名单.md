---
title: "V2rayN路由白名单" #标题
date: 2024-10-23T01:01:20+08:00 #创建时间
lastmod: 2024-10-23T01:01:20+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- windows
tags: 
- v2rayN路由白名单
description: "v2rayN的一些使用方法" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "V2rayN routing whitelist"
draft: false # 是否为草稿
comments: true #是否展示评论
showToc: true # 显示目录
TocOpen: true # 自动展开目录
hidemeta: false # 是否隐藏文章的元信息，如发布日期、作者等
disableShare: true # 底部不显示分享栏
showbreadcrumbs: false #顶部显示当前路径
cover:
    image: "" #图片路径：posts/tech/文章1/picture.png
    caption: "" #图片底部描述
    alt: ""
    relative: false
---

## 前言

在使用v2rayN的时，并不是所有的站点都需要进行代理。原有的预定义规则并不能满足所有的使用情况，比如有时候你需要上个视频网站看看美剧之类的，而这个站点的域名并不是常规的绕行配置，便会出现访问内地服务器反而过不了认证的情况。解决上述问题的方法便是设置白名单，就不会出现一会儿要打开一会儿要关闭的情况。

## 设置路由白名单

演示的v2rayN版本为6.60.0。

### 打开路由配置

`菜单栏->路由设置`打开，如下所示。

<img src="https://i.postimg.cc/V6TGz1jt/freecompress-20241023012545.jpg" alt="Image" data-zoomable width="30%;">

### 添加新的规则集

在路由设置界面中，可以选择建立一个新的规则集也可以选择将已有的规则集复制后在进行自定义修改。在这里我选择复制原有规则集进行修改。v2rayN提供的规则集能应对绝大多数情况，用户只需要针对特定的使用场景进行优化即可。就我的博客使用了postimg图床，默认情况下v2rayN会进行代理，而我选择将postimg的域名添加进入白名单即可解决这个问题。

<img src="https://i.postimg.cc/fyRzQcfy/freecompress-1729619047930.jpg" alt="Image" data-zoomable width="80%;">

### 添加规则

双击自己新建的规则集，进入页面后便可以查看到当前规则集究竟做了哪些配置，点击`添加规则`便可以添加自己的想要定制的规则。

路由规则详情设置主要设置两个地方，`outboundTag`选项选择`direct`选项表示不代理，在`Domain`下方自己对应网站域名格式为`domain:<顶级域名不加www.>`，如下图所示。完成所有设置后点击级确定。

<img src="https://i.postimg.cc/SNLBf26t/freecompress-20241023015634.jpg" alt="Image" data-zoomable width="80%;">

### 设置规则优先级

建议将自己设置的规则`上移至顶层`，保证自己设置的规则有最高的优先级，防止规则不生效。上移方法非常简单，右键规则选择上移至顶层即可，这里不做图片演示了。

### 一些值得注意的点

- 设置完路由规则没有点击确定，确认方式是通过规则列表查看相关信息，并确保已经enabled了配置。
- 设置完路由规则没有选择。
- 流量监控可以查看当前流量有没有成功被代理，注意查看。