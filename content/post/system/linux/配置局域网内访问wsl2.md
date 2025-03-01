---
title: "配置局域网内访问wsl2" #标题
date: 2024-12-05T14:22:28+08:00 #创建时间
lastmod: 2024-12-05T14:22:28+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- linux
tags: 
- wsl2镜像网络模式
description: "" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "Configure access to WSL2 within the local area network"
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

前不久，我在 WSL2 中的 Ubuntu 子系统上搭建了一个 Linux 环境，并安装了 EMQX，用于构建 MQTT 服务器，供 Web 服务器和物联网设备进行通信。

在 Web 服务器和 EMQX 通信的数据传输测试中，并未发现问题。因为 Web 服务器搭建在宿主机的 Windows 环境中，而 EMQX 则运行在 WSL2 的 Linux 子系统中。在 WSL2 中，宿主机可以通过 `localhost` 域名访问到服务，但局域网内的其他设备却无法直接访问 WSL2，应用场景受到限制。

为了使局域网内的其他设备能够访问 WSL2，主要有两种解决方法：端口转发和镜像代理。

- **端口转发**：顾名思义，端口转发将宿主机某个端口的请求转发到 WSL2 中。此方法的好处是可以更加个性化地配置哪些特定端口可以访问 WSL2。这种方式适用于希望控制外部访问的情况。
- **镜像代理**：镜像代理将 WSL2 中的所有服务监听的端口映射到宿主机上。这样，宿主机上的服务就能够通过宿主机的端口访问 WSL2。如果端口发生冲突，WSL2 中的程序将无法使用宿主机的端口，可能会导致冲突错误。

接下来将使用镜像代理的方式，让局域网内的其他设备能通过宿主机的ipv4地址访问到WSl2中的服务。

## 实现步骤

### 添加wslconfig

关于wslconfig的更多详细内容，请在 <a href="https://learn.microsoft.com/zh-cn/windows/wsl/wsl-config" target="_blank">WSL 中的高级设置配置 | Microsoft Learn</a> 查阅。

win + r 输入 %UserProfile% 进入目标文件还，新建 .wslconfig 建议内容如下：

```toml
[wsl2]
memory=8GB #内存最大值
swap=8GB #虚拟内存最大值
processors=4 #cpu核最大值
networkingMode=mirrored # 开启镜像网络
dnsTunneling=true # 开启 DNS Tunneling
firewall=true # 开启 Windows 防火墙
autoProxy=true # 开启自动同步代理

[experimental]
sparseVhd=true # 开启自动释放 WSL2 虚拟硬盘空间
autoMemoryReclaim=gradual # 开启自动回收内存
hostAddressLoopback=true # 允许容器通过分配给主机的 IP 地址连接到主机
```

### 开启Hyper-V

Hyper-V是Windows专业版专属功能，但大多数（除商业本）品牌机内置的Windows都是家庭版。可以通过命令安装：

新建一个`hyper-v.cmd`文件，可以通过新建txt文件然后修改文件类型，然后编辑添加如下命令：

```bash
pushd "%~dp0"
dir /b %SystemRoot%\servicing\Packages\*Hyper-V*.mum >hyper-v.txt
for /f %%i in ('findstr /i . hyper-v.txt 2^>nul') do dism /online /norestart /add-package:"%SystemRoot%\servicing\Packages\%%i"
del hyper-v.txt
Dism /online /enable-feature /featurename:Microsoft-Hyper-V-All /LimitAccess /ALL
```

保存后，右键以管理员身份运行，安装完成后命令行工具会提示是否重启计算机开启服务，如果选择了不开启则需要自己手到`控制面板->启用或者关闭 Windows 功能`中自己手动打开相应的功能。值得一提的是，即使手动打开Hyper-V功能依旧需要重启，所以建议通过命令行工具快速操作。

### 配置 Hyper-V 虚拟机的防火墙规则

管理员打开PowerShell，运行配置命令：

```bash
Set-NetFirewallHyperVVMSetting -Name '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' -DefaultInboundAction Allow
```

如果显示：Set-NetFirewallHyperVVMSetting : 找不到任何“Name”属性等于“{xxx}”的 MSFT_NetFirewall
HyperVVMSetting 对象。请验证属性值，然后重试。通过`Get-NetFirewallHyperVVMSetting`命令获取正确的属性名重新输入命令。

通过如上步骤便已经开启镜像代理，重启WSL2后通过宿主机地址便可以访问到WSL2的服务。

## 参考连接

<a href="https://www.cnblogs.com/heei/p/18171683" target="_blank">WSL2 固定IP与局域网访问 - Heei - 博客园</a>

<a href="https://learn.microsoft.com/zh-cn/windows/wsl/wsl-config" target="_blank">WSL 中的高级设置配置 | Microsoft Learn</a>

<a href="https://zhuanlan.zhihu.com/p/577980646" target="_blank">Win11 家庭版/专业版开启Hyper-V - 知乎</a>

<a href="https://learn.microsoft.com/zh-cn/windows/security/operating-system-security/network-security/windows-firewall/hyper-v-firewall" target="_blank">Hyper-V 防火墙 | Microsoft Learn</a>

<a href="https://learn.microsoft.com/zh-cn/windows/wsl/networking#mirrored-mode-networking" target="_blank">使用 WSL 访问网络应用程序 | Microsoft Learn</a>