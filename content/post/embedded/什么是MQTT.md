---
title: "什么是MQTT" #标题
date: 2024-11-29T13:59:32+08:00 #创建时间
lastmod: 2024-11-29T13:59:32+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- embedded
tags: 
- MTQQ
description: " MQTT 是一种基于标准的消息传递协议或规则集" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "What is MQTT"
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

## 什么是MTQQ

MQTT 是一种基于标准的消息传递协议或规则集，用于机器对机器的通信。智能传感器、可穿戴设备和其他物联网（<a href="https://zh.wikipedia.org/wiki/%E7%89%A9%E8%81%94%E7%BD%91" target="_blank">IoT</a>）设备通常必须通过带宽有限的资源受限网络传输和接收数据。这些物联网设备使用 MQTT 进行数据传输，因为它易于实施，并且可以有效地传输物联网数据。MQTT 支持设备到云端和云端到设备之间的消息传递。

## MTQQ的重要性

- **轻量、高效**：<a href="https://zh.wikipedia.org/wiki/%E7%89%A9%E8%81%94%E7%BD%91" target="_blank">IoT</a> 设备上的 MQTT 实施需要最少的资源，因此它甚至可以用于小型微控制器。例如，最小的 MQTT 控制消息可以少至两个数据字节。MQTT 消息的标头也很小，因此您可以优化网络带宽。
- **可扩展**：MQTT 实施需要最少的代码，在操作中消耗的功率非常少。该协议还具有支持与大量物联网设备通信的内置功能。因此，您可以实施 MQTT 协议来连接数百万台此类设备。
- **可靠**：许多 <a href="https://zh.wikipedia.org/wiki/%E7%89%A9%E8%81%94%E7%BD%91" target="_blank">IoT</a> 设备通过低带宽、高延迟的不可靠蜂窝网络连接。MQTT 具有内置功能，可减少 <a href="https://zh.wikipedia.org/wiki/%E7%89%A9%E8%81%94%E7%BD%91" target="_blank">IoT</a> 设备重新连接云所需的时间。它还定义了三种不同的服务质量级别，以确保 <a href="https://zh.wikipedia.org/wiki/%E7%89%A9%E8%81%94%E7%BD%91" target="_blank">IoT</a> 用例的可靠性——最多一次（0）、至少一次（1）和恰好一次（2）。
- **安全**：MQTT 使开发人员可以轻松地使用现代身份验证协议（例如 OAuth、TLS1.3、客户管理的证书等）加密消息并对设备和用户进行身份验证。
- **得到良好的支持**：几种语言（如 Python）对 MQTT 协议的实施提供广泛的支持。因此，开发人员可以在任何类型的应用程序中以最少的编码快速实现它。

## MQTT 的工作原理

要了解 MQTT 的工作原理，首先需要掌握以下几个概念：MQTT 客户端、MQTT Broker、发布-订阅模式、主题、QoS。

- **MQTT 客户端**：任何运行 MQTT 客户端库的应用或设备都是 MQTT 客户端。例如，使用 MQTT 的即时通讯应用是客户端，使用 MQTT 上报数据的各种传感器是客户端，各种 MQTT 测试工具也是客户端。

- **MQTT Broker**：MQTT Broker 是负责处理客户端请求的关键组件，包括建立连接、断开连接、订阅和取消订阅等操作，同时还负责消息的转发。一个高效强大的 MQTT Broker 能够轻松应对海量连接和百万级消息吞吐量，从而帮助物联网服务提供商专注于业务发展，快速构建可靠的 MQTT 应用。

- **发布-订阅模式**：发布-订阅模式与客户端-服务器模式的不同之处在于，它将发送消息的客户端（发布者）和接收消息的客户端（订阅者）进行了解耦。发布者和订阅者之间无需建立直接连接，而是通过 MQTT Broker 来负责消息的路由和分发。

  下图展示了 MQTT 发布/订阅过程。温度传感器作为客户端连接到 MQTT Broker，并通过发布操作将温度数据发布到一个特定主题（例如 `Temperature`）。MQTT Broker 接收到该消息后会负责将其转发给订阅了相应主题（`Temperature`）的订阅者客户端。

  <img src="https://i.postimg.cc/sgkYSfkn/uxmpks22pp3ce-20230627-47d8b523b10a4af6ae1d0cecbd5c492f.png" alt="Image" data-zoomable width="80%;">

- **主题**：主题是 MQTT 消息的标识符，它是消息传递系统中用于标识特定数据流的名称。发布者通过主题将消息发送到消息代理（Broker），而订阅者根据主题来接收消息。主题是一个层级结构，可以通过 `/` 分隔不同的层级。

  MQTT 协议根据主题来转发消息。主题通过 `/` 来区分层级，类似于 URL 路径，例如：

  ```bash
  chat/room/1
  
  sensor/10/temperature
  
  sensor/+/temperature
  ```

  MQTT 主题支持以下两种通配符：`+` 和 `#`。

  - `+`：表示单层通配符，例如 `a/+` 匹配 `a/x` 或 `a/y`。
  - `#`：表示多层通配符，例如 `a/#` 匹配 `a/x`、`a/b/c/d`。

  > **注意**：通配符主题只能用于订阅，不能用于发布。
  
  MQTT 提供了三种服务质量（QoS），在不同网络环境下保证消息的可靠性。
  
  - QoS 0：消息最多传送一次。如果当前客户端不可用，它将丢失这条消息。
  - QoS 1：消息至少传送一次。
  - QoS 2：消息只传送一次。

## MQTT传输协议

mqtt协议构建于TCP/IP协议上，由IBM在1999年发布。

### 协议结构

MQTT协议由三部分组成，固定报头，可变报头，有效载荷；固定报头是所有的报文统一的格式，可变抱头则根据固定抱头中的报文类型不同基本不同，每个报文类型基本上都有自己的可变报头格式，这里需要注意，最后有效载荷则部分报文有，部分报文没有，而且报文内容也是根据报文类型的不同而不同。协议总结构如下图所示：  

<img src="https://pic2.zhimg.com/v2-d105ee486e17356dc096f779f56ece03_1440w.jpg" alt="Image" data-zoomable width="80%;">

MQTT协议总体来讲，就是规定了16条报文的具体规范，每一条报文都有自己的用途，自己的规定；一开始接触MQTT协议的时候，因为概念和名字较多可能会有点不容易理解，但是梳理清楚一两条具体报文的含义之后，就能比较清晰的理解这份协议了；把16条报文理解清楚，就能实现完整的MQTT协议。

#### 固定报头

固定报文是MQTT协议的开头，2个字节，分为三个部分标志为，报文类型，剩余长度，如下如所示：

  <img src="https://i.postimg.cc/vZrKvXmk/0272de43e327135cc4d0507d18944732.png" alt="Image" data-zoomable width="80%;">

第一个字节分为2个部分：标志位和报文类型，一个字节有8位二进制，前面的4位用来做标志位，标志位在每条报文中有不同的作用，如下如所示：

  <img src="https://picx.zhimg.com/v2-aaf25c9890faf5f20cd34d1d2a9e1abb_1440w.jpg" alt="Image" data-zoomable width="80%;">

后4位用来表示表示具体的报文类型，一共有16种，有部分类型是预留未使用的类型，在代码实现时，可以暂时忽略。具体的报文类型如下图所示：

  <img src="https://pica.zhimg.com/v2-dbdad3783a499e674bcf751a5162b92a_1440w.jpg" alt="Image" data-zoomable width="80%;">

第二个字节是剩余长度，其表示的就是在剩余长度之后的数据长度（还有多少个字节），剩余长度的字节数是不固定的，至少一个字节，最多4个字节，所以固定报头中包含的一个字节就是剩余长度的第一个字节；这里需要说明一下，剩余长度的每一个字节的最高位是一个标志位，用来表示下一个字节是否也属于剩余长度。

假设 MQTT 消息的剩余长度字段是 2 个字节，如下所示：

- 第一个字节：`11001000`（二进制），其中高 1 位表示后面还有字节，低 7 位表示数据长度的一部分，即 `1001000`，即 `72`（十进制）。
- 第二个字节：`00000001`（二进制），表示剩余长度的另一部分，即 `1`（十进制）。

那么，剩余长度的总值为 `72 * 128 + 1 = 9217`。

#### 可变报头

在 **MQTT** 协议中，**可变报头**（Variable Header）是随消息类型不同而变化的，它用于携带一些与消息类型相关的信息。每个消息类型都有不同的可变报头结构。下面我将列出一些常见的 MQTT 消息类型及其对应的可变报头字段。

| 消息类型        | 描述                           | 可变报头字段                                                 | 说明                                                         |
| --------------- | ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **CONNECT**     | 客户端向代理发起连接请求       | `Protocol Name`（协议名称） `Protocol Level`（协议等级） `Connect Flags`（连接标志位） `Keep Alive`（保持连接时间） | 协议名称通常为 "MQTT" 或 "MQIsdp"，协议等级为 3，连接标志位指示用户名、密码等选项。 |
| **CONNACK**     | 代理对连接请求的响应           | `Session Present`（会话存在标志） `Return Code`（返回码）    | `Session Present` 指示是否为持久会话，`Return Code` 表示连接请求的结果。 |
| **PUBLISH**     | 代理或客户端发布消息           | `Topic Name`（主题名） `Packet Identifier`（报文标识符，仅QoS 1和2使用） `Properties`（可选属性） | `Topic Name` 表示消息的目标主题，`Packet Identifier` 在 QoS 1 和 2 的消息中用于确认。 |
| **PUBACK**      | QoS 1 消息的确认响应           | `Packet Identifier`（报文标识符）                            | 包含发送消息时的标识符。                                     |
| **PUBREC**      | QoS 2 消息的接收确认响应       | `Packet Identifier`（报文标识符）                            | 包含发送消息时的标识符。                                     |
| **PUBREL**      | QoS 2 消息的发布确认响应       | `Packet Identifier`（报文标识符）                            | 包含发送消息时的标识符。                                     |
| **PUBCOMP**     | QoS 2 消息的完成确认响应       | `Packet Identifier`（报文标识符）                            | 包含发送消息时的标识符。                                     |
| **SUBSCRIBE**   | 客户端请求订阅主题             | `Packet Identifier`（报文标识符） `Topic Filters`（主题过滤器） | `Packet Identifier` 用于标识该请求，`Topic Filters` 包含订阅的主题及其 QoS。 |
| **SUBACK**      | 代理对订阅请求的响应           | `Packet Identifier`（报文标识符） `Return Codes`（返回码）   | `Packet Identifier` 对应订阅请求的标识符，`Return Codes` 是每个主题的订阅结果（QoS 0、1、2）。 |
| **UNSUBSCRIBE** | 客户端请求取消订阅             | `Packet Identifier`（报文标识符） `Topic Filters`（取消订阅的主题） | `Packet Identifier` 用于标识请求，`Topic Filters` 包含取消订阅的主题。 |
| **UNSUBACK**    | 代理对取消订阅请求的响应       | `Packet Identifier`（报文标识符）                            | 包含发送取消订阅请求时的标识符。                             |
| **PINGREQ**     | 客户端向代理发送的心跳请求     | 无                                                           | 无可变报头部分，仅包含一个固定报头字段。                     |
| **PINGRESP**    | 代理对客户端心跳请求的响应     | 无                                                           | 无可变报头部分，仅包含一个固定报头字段。                     |
| **DISCONNECT**  | 客户端或代理发起的断开连接请求 | 无                                                           | 无可变报头部分，仅包含一个固定报头字段。                     |

说明：

1. **Protocol Name**：通常是 `"MQTT"`，但也可以是 `"MQIsdp"`，表示协议的名称。

2. **Protocol Level**：协议版本，通常是 `4`，表示 MQTT 3.1.1。

3. Connect Flags

   ：一个字节的标志位，指示连接请求的选项。例如：

   - 最高位表示是否需要用户名；
   - 第二位表示是否需要密码；
   - 其他位用于连接类型、清理会话等选项。

4. **Keep Alive**：指示连接保持活动的最大时长，单位为秒。

5. **Session Present**：在 `CONNACK` 消息中，指示是否使用持久会话。

6. **Topic Name**：在 `PUBLISH` 消息中，表示要发布的主题。

7. **Packet Identifier**：在一些 QoS 消息（如 `PUBLISH`、`PUBACK`、`SUBSCRIBE` 等）中使用，用于标识消息。

8. **Return Codes**：在 `SUBACK` 中，表示订阅的返回码，每个主题有一个对应的返回码（如 QoS 0、1、2）。

9. **Topic Filters**：在订阅和取消订阅消息中使用，包含客户端感兴趣的主题。

#### 有效载荷

Payload有效载荷位于MQTT数据包的第三部分，CONNECT、SUBSCRIBE、SUBACK、UNSUBSCRIBE四种类型包含有效载荷。

CONNECT有效载荷内容主要是：客户端的ClientID、遗嘱主题、遗嘱Message以及用户名和密码。

SUBSCRIBE有效载荷内容是主题过滤器指明需要订阅的Topic以及QoS。

SUBACK有效载荷内容包含一个返回码清单，每个返回码对应等待确认的SUBSCRIBE报文中的一个主题过滤器。UNSUBSCRIBE有效载荷内容是客户端想要取消订阅的主题过滤器。

## MQTT的安全性

MQTT 通信使用 SSL 协议来保护物联网设备传输的敏感数据。您可以使用 SSL 证书和/或密码在客户端和代理之间实施身份、身份验证和授权。MQTT 代理通常使用其密码以及分配给每个客户端的唯一客户端标识符来对客户端进行身份验证。在大多数实施中，客户端使用证书或 DNS 代码来对服务器进行身份验证。您还可以使用 MQTT 来实施加密协议。 

## 参考链接

<a href="https://aws.amazon.com/cn/what-is/mqtt/" target="_blank">什么是 MQTT？- MQTT 协议简介 - AWS</a>

<a href="https://developer.aliyun.com/article/1261805" target="_blank">MQTT 协议入门：基础知识和快速教程-阿里云开发者社区</a>

<a href="https://blog.csdn.net/xiaoyukongyi/article/details/128847843" target="_blank">MQTT协议图解，一文看懂MQTT协议数据包（真实报文数据解析解释）-CSDN博客</a>

<a href="https://zhuanlan.zhihu.com/p/511368581" target="_blank">MQTT详解：协议特点和数据包结构 - 知乎</a>