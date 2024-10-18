---
title: "Win11关睿频" #标题
date: 2024-10-19T03:29:50+08:00 #创建时间
lastmod: 2024-10-19T03:29:50+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- windows
tags: 
- 关睿频
- windows体验优化
description: "通过关闭cpu睿频避免散热突然抽风的情况出现" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "disable-cpu-throttling-in-win11"
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

之前购买了一台笔记本，使用时发现散热风扇会在打开一些软件或者网页后狂转动，即使打开的软件不吃性能，通过上网查询得知这是由于没关睿频导致的。笔记本不像台式机，可以放在远离桌面的地方，散热风扇“无缘无故”的抽风对耳朵简直是残忍的折磨，特别是我的笔记本还有风哨声，当风扇转起来之后连使用笔记本的欲望都没有了。于是我把笔记本的睿频关了，虽然说并没有达到完美无声的效果，但是相比较于没关之前已经有了非常大的改善了。

如何查看自己的电脑有没有关睿频？有一个很简单的方法，那就是打开任务管理器，然后尝试着打开一些新的网页，比如哔哩哔哩，也可以打开一些软件，看开cpu频率是否会突然拉高，并超过cpu基准频率。如果会的话毫无疑问是开启了cpu睿频的。

<img src="https://753e3422.telegraph-image-8tf.pages.dev/file/49d74448f3b465ccc4217-72eace47208110dc10.png" class="zoom-img" style="width: 80%;margin: auto;">

值得注意的是，如果关闭了睿频会导致cpu应对突发任务能力下降。当然，在这个大部分工作都远远无法跑满cpu的时代，这样的影响在许多时候都是可以忽略不计的。不过玩网游的如果关闭了cpu睿频可能会大大影响流畅体验，即帧率可能会大大降低。

总结下来就是，视自己的使用情况判断是否需要关闭睿频。

## 关闭睿频的步骤

### 修改注册表

### 修改电源计划