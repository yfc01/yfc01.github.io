---
title: "SPI通信协议" #标题
date: 2025-01-02T22:23:43+08:00 #创建时间
lastmod: 2025-01-09T22:23:43+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- embedded
tags: 
- SPI通信协议
description: "SPI通行协议是单片机与外设通用的通信协议" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "SPI communication protocol"
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

在完成毕设的过程中我使用的单片机需要通过SPI协议与OLED的显示屏和NFC读卡器进行通信，因此接下来将记录SPI通信协议的学习知识。

## SPI通信

串行外设接口(Serial Peripheral InterfaceBuS，SPI)，是一种用于芯片通信的同步串行通信接口规范，主要应用于单片机系统中的信号传递。 摩托罗拉公司于20世纪80年代中期首先开发出此传输接口，之后逐渐发展为行业规范之一。

SPI设备之间使用**全双工模式通信**，是一个主机和一个或多个从机的**主从模式**。主机负责初始化帧，这个数据传输帧可以用于读与写两种操作，片选线路可以从多个从机选择一个来响应主机的请求。

SPI总线规定了4个保留逻辑信号接口：

- SCLK（Serial Clock）：串列时脉，由主机发出
- MOSI（Master Output, Slave Input）：主机输出，从机输入信号（数据由主机发出）
- MISO（Master Input, Slave Output）：主机输入，从机输出信号（数据由从机发出）
- SS（Slave Select）：片选信号，由主机发出，一般是低电位有效

SPI的优点：

- **速度快**：SPI 可以支持高达几十兆赫兹的通信速度，比 I²C 等协议更快，非常适合对速度要求较高的场景。
- **全双工通信**：SPI 支持同时发送和接收数据（全双工），提高数据传输效率。
- **简单协议**：协议结构简单，没有复杂的握手和校验机制，硬件实现容易，时延低。
- **支持多从机**：可以通过片选信号（CS/SS）控制多个从机，并且没有从设备地址冲突的问题。
- **数据长度灵活**：数据帧长度可以由硬件配置（如8位、16位等），可以适应多种应用需求。
- **可靠性高**：使用独立的时钟信号（SCLK）进行同步，数据传输可靠，特别适用于主从设备距离较短的场景。

SPI的缺点：

- **线数多**：SPI 通信需要 4 根基本信号线（MOSI、MISO、SCLK、CS），随着从机数量的增加，CS 线的数量也会增加，占用更多的引脚资源。
- **不支持长距离传输**：由于 SPI 的信号没有差分传输的特性，对抗电磁干扰能力较弱，适合短距离通信。
- **不支持多主机模式**：SPI 设计为单主多从通信，如果需要多主机，协议需进行额外设计，增加实现复杂度。
- **缺少错误检测机制**：SPI 没有内置的错误检测（如 I²C 的 ACK/NACK 机制），需要额外的硬件或软件支持来保证数据完整性。
- **缺乏标准化**：SPI 协议本身没有明确的标准规范，不同设备对时序、工作模式的定义可能有所不同，增加了兼容性问题。
- **占用系统资源**：主设备需要负责时钟生成和片选控制，在多从机通信中，主机的管理复杂度较高。

## 硬件电路

以下是典型 SPI 硬件电路连接的框图：

<img src="https://i.postimg.cc/YqKBZB4R/SPI.jpg" alt="Image" data-zoomable width="80%;">

1. **MOSI（Master Out Slave In）**
   - 主机输出，从机输入的数据线。
   - 主机通过此线向从机发送数据。
2. **MISO（Master In Slave Out）**
   - 主机输入，从机输出的数据线。
   - 从机通过此线向主机发送数据。
3. **SCLK（Serial Clock）**
   - 串行时钟信号，由主机生成。
   - 时钟用于同步数据传输，所有通信都在时钟沿触发下完成。
4. **CS/SS（Chip Select/Slave Select）**
   - 片选信号，主机通过拉低某个从机的 CS 引脚来选择通信对象。
   - 一个从机对应一个片选信号线。

> 注意：输出引脚配置为推挽输出，输入引脚配置为浮空或上拉输入。

## 移位寄存器

<img src="https://i.postimg.cc/xjKNWYxT/image.png" alt="Image" data-zoomable width="80%;">

SPI通信时钟信号由主机提供，通过SCK引脚提供给从机，对应为波特率发生器。

传输通常会使用给定字长的两个移位寄存器，一个在主设备中，一个在从设备中，这两个寄存器连接成一个虚拟的环形缓冲器。数据通常先从最高位移出。在时钟讯号边沿，主机和从机均移出一位，然后在传输线上输出给对方。在下一个时钟沿，每个接收器都从传输线接受对方发出的数据位，并且从移位寄存器的最低位推入。每完成这样一个移出——推入的周期后，主机和从机就交换寄存器中的一位数据。当所有数据位都经过了这样的移出——推入过程后，主机和从机就完成了寄存器上的数据交换。如果需要交换的数据比寄存器的位数还要长的话，则需要重新加载移位寄存器并重复该过程。传输可能会持续任意数量的时钟周期。完成后，主设备会停止发送时钟讯号，并通常会取消选择从设备。

## SPI时序基本单元

起始条件：SS从高电平切换到低电平

终止条件：SS从低电平切换到高电平

<img src="https://i.postimg.cc/mgCVZzgK/SPI.png" alt="Image" data-zoomable width="80%;">

SPI有4种传输模式，对应的CPOL和CPHA4种不同情况的组合。

**模式0：**

- CPOL=0：空闲状态时，SCK为低电平
- CPHA=0：SCK第一个边沿移入数据，第二个边沿移出数据

当数据从主设备传输到从设备时，SCK会在低电平时静止。当SCK从低电平跳到高电平时，数据会被采样，然后在SCK下降沿时，数据会从传输设备（主设备或从设备）移出。因此在模式0下，第一个数据的移出与SS下降沿同时进行，而到了SCK第一个上升沿时移入第一个数据。

<img src="https://i.postimg.cc/xCzL5BNh/SPI-0.png" alt="Image" data-zoomable width="80%;">

**模式1：**

- CPOL=0：空闲状态时，SCK为低电平
- CPHA=1：SCK第一个边沿移出数据，第二个边沿移入数据

<img src="https://i.postimg.cc/VLqQp6cL/SPI-1.png" alt="Image" data-zoomable width="80%;">

**模式2：**

- CPOL=1：空闲状态时，SCK为高电平
- CPHA=0：SCK第一个边沿移入数据，第二个边沿移出数据

<img src="https://i.postimg.cc/NMcRNp80/SPI-2.png" alt="Image" data-zoomable width="80%;">

**模式3：**

- CPOL=1：空闲状态时，SCK为高电平
- CPHA=1：SCK第一个边沿移出数据，第二个边沿移入数据

<img src="https://i.postimg.cc/c4rtBpqm/SPI-3.png" alt="Image" data-zoomable width="80%;">

## 参考连接

<a href="https://zh.wikipedia.org/wiki/序列周邊介面#数据传输" target="_blank">序列周边接口 - 维基百科，自由的百科全书</a>

<a href="https://www.bilibili.com/video/BV1th411z7sn?spm_id_from=333.788.player.switch&vd_source=fcbd8c5e9a46fc8723685feb30801506&p=36" target="_blank">[11-1\] SPI通信协议_哔哩哔哩_bilibili</a>