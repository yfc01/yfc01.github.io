---
title: "Windows11各种疑难杂症" #标题
date: 2025-03-02T03:06:25+08:00 #创建时间
lastmod: 2025-03-02T03:06:25+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- windows
tags: 
- Windows11问题汇总
description: "记录我所遇到的Windows11各种奇葩问题" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "Various difficult and complicated problems in Windows 11"
draft: false # 是否为草稿
comments: true #是否展示评论
showToc: true # 显示目录
TocOpen: true # 自动展开目录
hidemeta: false # 是否隐藏文章的元信息，如发布日期、作者等
disableShare: true # 底部不显示分享栏
showbreadcrumbs: false #顶部显示当前路径
cover:
    image: "https://cdn.pixabay.com/photo/2021/09/05/17/28/system-error-6600040_1280.png" #图片路径：posts/tech/文章1/picture.png
    caption: "" #图片底部描述
    alt: ""
    relative: false
---

## 前言

作为一个Windows系统的用户，我用过XP、7、10、11系统，在综合体验上win11带给我的体验是最糟糕的。当然，这并不等于"win11比其他版本Windows差"这种结论，毕竟这其中有太多的变量存在，谁也说不准具体的问题出在哪里。

为了能在遇到系统问题时更快的找到解决办法，在这个文章里我将记录一些我平时遇到的，影响我日常使用的系统bug，并提供解决方法。

## wifi和声音的控制器打不开

<img src="https://i.postimg.cc/d3p9Dnwt/status-bar-bug.jpg" alt="Image" data-zoomable width="40%;">

Q：状态栏右边的wifi、声音、电量图标点击后没有办法打开控制器，并且没有任何提示反应。

A：

1. 打开任务管理器
2. 搜索“资源管理器”
3. 重启Windows 资源管理器，问题得到解决

## 文件夹删除不了

Q：删除文件夹提示“你需要提供管理员权限才能删除此文件夹”，并且点击继续后还是删除不了，提示“你需要来自 XXX 的权限才能对比文件夹进行更改”。

A：

- 方法一：管理员打开CMD，通过删除指令“rmdir /s /q D:\路径就行了”，文件会删除到回收站。
- 方法二：查看并修改当前用户，对目标文件夹的控制权限。详细方法参考：<a href="https://blog.csdn.net/pro_fan/article/details/121698283" target="_blank">Win10 文件夹删不掉，提示需要来自XXX的权限才能对此文件夹进行更改_你需要来自everyone的权限才能删除-CSDN博客</a>

