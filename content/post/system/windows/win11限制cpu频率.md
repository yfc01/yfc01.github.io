---
title: "Win11限制cpu频率" #标题
date: 2024-10-28T03:29:50+08:00 #创建时间
lastmod: 2024-10-28T03:29:50+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- windows
tags: 
- 限制cpu频率
- windows11体验优化
description: "通过限制cpu频率避免散热突然抽风的情况出现" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "Win11 restricts CPU frequency"
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

之前购买了一台笔记本，使用时发现散热风扇会在打开一些软件或者网页后狂转动，即使打开的软件不吃性能，通过上网查询得知这是由于开启了CPU睿频导致的。笔记本不像台式机，可以放在远离桌面的地方，散热风扇“无缘无故”的抽风对耳朵简直是残忍的折磨，特别是我的笔记本还有风哨声，当风扇转起来之后连使用笔记本的欲望都没有了。于是我把笔记本的睿频关了，虽然说并没有达到完美无声的效果，但是相比较于没关之前已经有了非常大的改善了。

如何查看自己的电脑有没有关睿频？有一个很简单的方法，那就是打开任务管理器，然后尝试着打开一些新的网页，比如哔哩哔哩，也可以打开一些软件，看开cpu频率是否会突然拉高，并超过cpu基准频率。如果会的话毫无疑问是开启了cpu睿频的。

<img src="https://i.postimg.cc/rpST4VcG/freecompress-1729282158420.jpg" alt="Image" data-zoomable width="80%;">

值得注意的是，如果关闭了睿频会导致cpu应对突发任务能力下降。当然，在这个大部分工作都远远无法跑满cpu的时代，这样的影响在许多时候都是可以忽略不计的。不过玩网游的如果关闭了cpu睿频可能会大大影响流畅体验，即帧率可能会大大降低。

总结下来就是，视自己的使用情况判断是否需要关闭睿频。

## 关闭睿频的步骤

通过运行窗口运行regedit即可打开注册表编辑器。

### 备份注册表

备份注册表只需要选中对应的注册表文件，然后在菜单栏选择`文件->导出`到指定位置即可，导入备份操作类似。在进行任何注册表配置之前建议都先进行备份操作，以备不时之需。

<img src="https://i.postimg.cc/DybzxKPD/freecompress-1729315283705.jpg" alt="Image" data-zoomable width="80%;">

### 修改注册表

与cpu睿频有关的注册表文件的路径为`计算机\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Power\PowerSettings\54533251-82be-4824-96c1-47b60b740d00\be337238-0d82-4146-a960-4f3749d470c7`。打开该路径文件夹下的Attributes选项，并将数据数值设置成为2。

<img src="https://i.postimg.cc/05hVTp7Q/freecompress-1729316535116.jpg" alt="Image" data-zoomable width="80%;">

### 修改电源计划

打开控制面板，进入电源计划选择界面，这里建议创建一个新的电源计划，选择创建的电源计划选项，然后点击更改计划设置。

<img src="https://i.postimg.cc/CLVjCJjj/freecompress-1729317259829.jpg" alt="Image" data-zoomable width="80%;">

点击更改高级电源设置，选择处理器电源管理->处理器性能提升模式，将使用电池和接通电源选项设置为已禁用。

<img src="https://i.postimg.cc/8ckTDq2R/1729318630404.png" alt="Image" data-zoomable width="80%;">

通过上述步骤便成功关闭了cpu睿频，需要说明的是，这是使用win11操作系统关闭睿频的步骤，win10系统步骤可能不同。

## 设置处理器最大频率

限制cpu频率还可以通过在电源计划中设置处理器最大频率的方式实现。由于步骤和关闭睿频类似，因此接下来将不再进行图片演示，仅作文字描述。

### 修改注册表

这里再次提醒，如果记忆力不好请一定要备份注册表，避免因为各种不良操作导致系统故障。

在注册表中进入`计算机\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Power\PowerSettings\54533251-82be-4824-96c1-47b60b740d00\75b0ae3f-bce0-45a7-8c89-c9611c25e100`目录，将`Attributes`选项修改成`2`，然后保存设置。

### 修改电源计划

在电源计划面板，进入`更改电源计划->更改高级电源计划->处理器电源管理->处理器最大频率`，根据需求设置`使用电源`和`接通电源`选项频率，单位MHz。

通过观察`任务管理器->性能->CPU`相关参数验证操作是否成功。

### 注意点

在本人使用过的机型中，tinkbook14+ 2024 Utral7型号无法修改`接通电源`选项的处理器最大频率。

