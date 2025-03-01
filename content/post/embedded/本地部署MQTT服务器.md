---
title: "本地部署MQTT服务器" #标题
date: 2024-11-30T16:46:24+08:00 #创建时间
lastmod: 2024-12-02T16:46:24+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- embedded
tags: 
- MTQQ服务器
description: "在window系统本地部署MTQQ服务器" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "Deploy MTQQ server locally"
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

## EMQX

**EMQX**（Erlang/VMQ MQTT Broker）是一个高性能、可扩展的 MQTT 消息代理，基于 Erlang/OTP 构建，专门用于处理 **IoT（物联网）** 和 **实时消息传递** 的应用场景。它支持 MQTT 5.0、MQTT 3.1.1 和 CoAP 协议，广泛应用于物联网、智能家居、车联网等领域。

EMQX有多个版本，既有更能更加丰富的付费版，也有开源版，接下来使用的是开源版的EMQX。

## 安装EMQX

接下来使用的部署环境是WSL2，WSL的安装安装方法在 <a href="/install-wsl" target="_blank">安装Wsl</a> 文章中，可以自行翻看。在WSL安装并进行Ubuntu子系统，按照 <a href="https://www.emqx.com/" target="_blank">EMQX官网</a> 的安装指示指示，通过如下命令进行安装。

1. 配置 EMQX Apt 源

   ```bash
   curl -s https://assets.emqx.com/scripts/install-emqx-deb.sh | sudo bash
   ```

2. 安装 EMQX

   ```bash
   sudo apt-get install emqx
   ```

3. 启动 EMQX

   ```bash
   sudo systemctl start emqx
   ```

执行完上述命令后命令行工具会输出`System has not been booted with systemd as init system (PID 1). Can't operate. Failed to connect to bus: Host is down`，这时候可以发现，原来WSL2不能使用`systemctl`命令。

通过上网查资料发现，微软官方提供了启用`systemctl`的方法，仅需要添加一个配置文件。

在`/etc`目录新建`wsl.conf`文件，添加如下内容：

```bash
[boot]
systemd=true
```

然后重启Ubantu系统，通过命令`systemctl list-unit-files --type=service`检测`systemctl`功能是否正常启用。发现命令行工具打印如下信息：

  <img src="https://i.postimg.cc/gjs3WRQ2/freecompress-1732967049063.jpg" alt="Image" data-zoomable width="80%;">

表示成功配置`systemctl`启用。当然还有一些其他的配置方法，但这里就不在赘述了。

再次执行命令`sudo systemctl start emqx`，启动本地EMQX服务器。

在浏览器中输入网址`http://localhost:18083/`访问EMQX服务器控制台，默认的账号密码为：

```
账号: admin
密码: public
```

登录后进入如下页面：

<img src="https://i.postimg.cc/026NxDLX/freecompress-1732967608704.jpg" alt="Image" data-zoomable width="80%;"> 

## 添加认证方式

这一步可以查看 <a href="https://blog.csdn.net/weixin_41542513/article/details/134328627" target="_blank">Windows系统下本地MQTT服务器搭建（保姆级教程）_mqtt windows-CSDN博客</a> ，里面详细介绍了如何通过EMQX和MQTTX实现利用MQTT通信的案例。

## 使用 Go SDK 连接

EMQX官方提供了Go SDK 用于在go项目中连接EMQX，点击 <a href="https://github.com/eclipse/paho.mqtt.golang" target="_blank">Eclipse Paho MQTT Go Client</a> 跳转查看。

根据官方例程和网上翻找资料进行修改得到如下代码：

```go
package main

import (
	"fmt"
	"log"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

// 全局变量，定义消息处理函数
var messagePubHandler mqtt.MessageHandler = func(client mqtt.Client, msg mqtt.Message) {
	// 处理收到的消息，并打印主题和消息内容
	fmt.Printf("Received message: %s from topic: %s\n", msg.Payload(), msg.Topic())
}

// 连接成功时的处理函数
var connectHandler mqtt.OnConnectHandler = func(client mqtt.Client) {
	// 输出连接成功的消息
	fmt.Println("Connected to MQTT broker successfully.")
}

// 连接丢失时的处理函数
var connectLostHandler mqtt.ConnectionLostHandler = func(client mqtt.Client, err error) {
	// 输出连接丢失的错误信息
	fmt.Printf("Connection lost: %v\n", err)
}

// 主函数，程序入口
func main() {
	// 配置 Broker 地址和端口
	broker := "localhost"
	port := 1883

	// 创建 MQTT 客户端选项
	opts := mqtt.NewClientOptions()

	// 设置 Broker 地址
	opts.AddBroker(fmt.Sprintf("tcp://%s:%d", broker, port))

	// 设置客户端ID、用户名和密码
	opts.SetClientID("go_mqtt_client")
	opts.SetUsername("emqx")
	opts.SetPassword("public")

	// 设置默认的消息发布处理函数
	opts.SetDefaultPublishHandler(messagePubHandler)

	// 设置连接成功后的处理函数
	opts.OnConnect = connectHandler

	// 设置连接丢失后的处理函数
	opts.OnConnectionLost = connectLostHandler

	// 创建 MQTT 客户端
	client := mqtt.NewClient(opts)

	// 连接到 MQTT Broker
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		log.Fatalf("Failed to connect to broker: %v", token.Error()) // 改用 log.Fatalf 打印错误并退出
	}

	// 订阅主题
	subscribe(client)

	// 发布消息
	publish(client)

	// 断开与 Broker 的连接
	client.Disconnect(250)
}

// 发布消息到指定的主题
func publish(client mqtt.Client) {
	num := 10 // 发布 10 条消息
	for i := 0; i < num; i++ {
		// 构造消息内容
		text := fmt.Sprintf("Message %d", i)

		// 发布消息到 topic/test 主题，设置 QoS 为 0，不持久化消息
		token := client.Publish("topic/test", 0, false, text)

		// 等待消息发布完成
		token.Wait()

		// 打印发布的消息
		fmt.Printf("Published: %s\n", text)

		// 每发布一条消息等待 1 秒
		time.Sleep(1 * time.Second)
	}
}

// 订阅主题
func subscribe(client mqtt.Client) {
	// 订阅 topic/test 主题，设置 QoS 为 1
	topic := "topic/test"
	token := client.Subscribe(topic, 1, nil)

	// 等待订阅完成
	token.Wait()

	// 打印订阅成功的消息
	fmt.Printf("Subscribed to topic: %s\n", topic)
}
```

### 使用MQTT进行程序测试

下载安装官方提供的客户端测试工具 <a href="https://www.emqx.com/zh/products/mqttx" target="_blank">MQTT</a>，在设置中选择程序语言为简体中文。

并选择新建连接，打开如下界面：

  <img src="https://i.postimg.cc/65jWZVPw/freecompress-1733054582334.jpg" alt="Image" data-zoomable width="80%;"> 

根据自己的服务器配置填写客户端基础配置，然后进行连接。

在go项目根目录运行命令行工具，然后输入`go run main.go`命令，在MQTT工具中接受到数据如下所示：

<img src="https://i.postimg.cc/7Y0vH3ym/freecompress-1733056771950.jpg" alt="Image" data-zoomable width="80%;"> 

表示通信成功。

### 会话过期间隔

在实际应用场景中，各端设备并不是时刻在线的，有一些设备可能是间断性向服务器获取数据，这时候就需要MQTT服务器保存相关数据，确保离线设备在重新连接服务器后能获取数据。

这里我尝试了在开源版emqx配置会话持久化，根据官网相关文档，结果是emqx程序无法运行，通过打印相关日志得知配置文件错误，报错信息如下：

```bash
2024-12-02T10:40:19.081052+08:00 [error] failed_to_check_schema: emqx_con>
2024-12-02T10:40:19.087927+08:00 [error] #{reason => integrity_validation>
ERROR: call_hocon_failed: -v -t 2024.12.02.10.40.18 -s emqx_conf_schema ->
emqx.service: Main process exited, code=exited, status=1/FAILURE
emqx.service: Failed with result 'exit-code'.
```

在 <a href="https://docs.emqx.com/zh/emqx/latest/durability/durability_introduction.html" target="_blank">MQTT 会话持久化</a> 一文中，描述为：会话持久化是 EMQX 企业版功能。至于为什么在 <a href="https://docs.emqx.com/zh/emqx/v5.8.2/hocon/" target="_blank">EMQX 开源版配置手册</a> 具有相应的配置项就不得而知了。

在这种背景下，我决定使用设置会话过期间隔功能，来满足设备离线重连也能获取数据的功能，详细可以参考相关文章 <a href="https://www.emqx.com/zh/blog/mqtt-session" target="_blank">MQTT 持久会话与 Clean Session 详解 | EMQ</a> 里面给出了持久会话的应用场景和会话过期间隔功能相关案例设置。

在emqx服务器中，可以配置会话过期间隔的最大时间，配置导航：管理->MQTT配置->会话。

## 参考资料

<a href="https://blog.csdn.net/ls0111/article/details/128513930" target="_blank">WSL2支持systemctl命令_wsl systemctl-CSDN博客</a>

<a href="https://www.emqx.com/zh/downloads-and-install/broker?os=Ubuntu" target="_blank">下载 EMQX 开源版</a>

<a href="https://blog.csdn.net/weixin_41542513/article/details/134328627" target="_blank">Windows系统下本地MQTT服务器搭建（保姆级教程）_mqtt windows-CSDN博客</a>

<a href="https://github.com/eclipse/paho.mqtt.golang" target="_blank">Eclipse Paho MQTT Go Client</a>

<a href="https://zhuanlan.zhihu.com/p/258374510" target="_blank">如何在 Golang 中使用 MQTT - 知乎</a>

<a href="https://docs.emqx.com/zh/emqx/latest/durability/durability_introduction.html" target="_blank">MQTT 会话持久化</a>

<a href="https://docs.emqx.com/zh/emqx/v5.8.2/hocon/" target="_blank">EMQX 开源版配置手册</a>
