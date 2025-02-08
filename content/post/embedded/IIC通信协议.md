---
title: "IIC通信协议" #标题
date: 2025-02-07T15:55:33+08:00 #创建时间
lastmod: 2025-02-07T15:55:33+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- embedded
tags: 
- IIC通信协议
description: "IIC通信协议是单片机与外设通信的常见通信协议" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "IIC Communication Protocol"
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

IIC是单片机与外设通信常见的通信协议，是非常有必要学习的一种通信协议。

## IIC简介

12C（Inter-Integrated Circuit）字面上的意思是集成电路之间，它其实是I2CBuS简称，所以中文应该叫集成电路总线，它是一种串行通信总线，使用多主从架构，由飞利浦公司在1980年代为了让主板、嵌入式系统或手机用以连接低速周边设备而发展。

I²C只使用两条双向漏极开路（Open Drain）线，其中一条线为传输数据的串行资料线（SDA, Serial DAta line），另一条线是启动或停止传输以及发送时钟序列的串行主频（SCL, Serial CLock line）线，这两条线上都有上拉电阻。因此IIC为同步，半双工协议。I²C允许相当大的工作电压范围，但典型的电压准位为+3.3V或+5v。

I²C的参考设计使用一个7比特长度的地址空间但保留了16个地址，所以在一组总线最多可和112个节点通信。常见的I²C总线依传输速率的不同而有不同的模式：*标准模式*（100 kbit/s）、*低速模式*（10 kbit/s），但时钟频率可被允许下降至零，这代表可以暂停通信。而新一代的I²C总线可以和更多的节点（支持10比特长度的地址空间）以更快的速率通信：*快速模式*（400 kbit/s）、*快速+模式*（1 Mbit/s）*高速模式*（3.4 Mbit/s）*超高速模式*（5 Mbit/s）。

> 应该为27＝128个，但是其中16个指令具有特殊定义，所以剩下112。

## 硬件电路

<img src="https://i.postimg.cc/SsXptSHL/IIC.png" alt="Image" data-zoomable width="80%;">

IIC采用多主从架构，所有的设备SCL和SDA连在一起。并且主机对SCL拥有绝对的控制，从机无法控制SCL。SDA用于数据传输，主机和从机都可以控制，不过从机只能接受到发送数据命令后短暂的控制SDA。

由于SDA既要接受数据，又要发送数据，如果在同一个时间段内有两个设备分别数据高电平和低电平，就会发生短路。因此，IIC规定所有的设备只能输出低电平而不能输出高电平，高电平有外置电源负责拉高。即设备的SCL和SDA均要配置成开漏输出模式。这样做还有一个好处是既可以接受数据又可以发送数据。我们可以用一个简单的了例子去理解IIC的主从设备控制电平：

有一根用弹簧连接的杠杆，下面有一群人用手搭在杠杆上，如果有人要传递消息就拉动杆子，其他人就知道有人拉动杆子，如果要接受消息就松开杆子观察杆子的高低变化。

通常上拉电源都需要搭配上拉电阻，因此SCL和SDA各添加一个上拉电阻，阻值一般为4.7KΩ左右。

## IIC时序基本单元

- 起始条件：SCL高电平期间，SDA从高电平切换到低电平
- 终止条件：SCL高电平期间，SDA从低电平切换到高电平

<img src="https://i.postimg.cc/NMP8tHBn/image.png" alt="Image" data-zoomable width="80%;">

- 发送一个字节：SCL低电平期间，主机将数据位依次放到SDA线上（高位先行），然后释放SCL，从机将在SCL高电平期间读取数据位，所以SCL高电平期间SDA不允许有数据变化，依次循环上述过程8次，即可发送一个字节

<img src="https://i.postimg.cc/9fQ7SWs0/image.png" alt="Image" data-zoomable width="80%;">

- 接收一个字节：SCL低电平期间，从机将数据位依次放到SDA线上（高位先行），然后释放SCL，主机将在SCL高电平期间读取数据位，所以SCL高电平期间SDA不允许有数据变化，依次循环上述过程8次，即可接收一个字节（主机在接收之前，需要释放SDA）

<img src="https://i.postimg.cc/8cmkNv6S/image.png" alt="Image" data-zoomable width="80%;">

- 发送应答：主机在接收完一个字节之后，在下一个时钟发送一位数据，数据0表示应答，数据1表示非应答
- 接收应答：主机在发送完一个字节之后，在下一个时钟接收一位数据，判断从机是否应答，数据0表示应答，数据1表示非应答（主机在接收之前，需要释放SDA）

<img src="https://i.postimg.cc/wM2zSdCx/image.png" alt="Image" data-zoomable width="80%;">

## IIC时序

IIC设备地址的前几位通常有芯片制造厂商决定，而后自己可以通过芯片引脚用户自定义，防止在同一条IIC总线上多个相同设备地址冲突。

### 指定地址写

对于指定设备（Slave Address），在指定地址（Reg Address）下，写入指定数据（Data）

<img src="https://i.postimg.cc/Y2ZTC03c/image.png" alt="Image" data-zoomable width="80%;">

### 当前地址读

对于指定设备（Slave Address），在当前地址指针指示的地址下，读取从机数据（Data）

<img src="https://i.postimg.cc/y6cy0NKC/image.png" alt="Image" data-zoomable width="80%;">

### 指定地址读

对于指定设备（Slave Address），在指定地址（Reg Address）下，读取从机数据（Data）

<img src="https://i.postimg.cc/Pqvwh6rn/image.png" alt="Image" data-zoomable width="80%;">

## 参考资料

<a href="https://zh.wikipedia.org/wiki/I²C" target="_blank">I²C - 维基百科，自由的百科全书</a>

<a href="https://www.bilibili.com/video/BV1th411z7sn" target="_blank">[10-1\] I2C通信协议_哔哩哔哩_bilibili</a>