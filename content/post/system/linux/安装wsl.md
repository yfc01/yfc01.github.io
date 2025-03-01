---
title: "安装Wsl" #标题
date: 2024-10-20T15:49:33+08:00 #创建时间
lastmod: 2024-10-20T15:49:33+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- linux
tags: 
- wsl
- 虚拟机
description: "wsl是window原生支持的linux系统搭建工具" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "Install WSL"
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

在许久之前想要在window系统搭建虚拟机要借助第三方搭建工具，还得自己去下载linux镜像文件，过程复杂。有没有那么一款工具能实现在window中不借助第三方工具快速搭建虚拟机呢？wsl便能实现在window不借助第三方工具搭建ubantu系统，大大简化了window中linux虚拟机搭建过程。

## 什么是wsl

适用于 Linux 的 Windows 子系统 (WSL) 是 Windows 的一项功能，可用于在 Windows 计算机上运行 Linux 环境，而无需单独的虚拟机或双引导。 WSL 旨在为希望同时使用 Windows 和 Linux 的开发人员提供无缝高效的体验。

- 使用 WSL 安装和运行各种 Linux 发行版，例如 Ubuntu、Debian、Kali 等。 安装 Linux 发行版并从 Microsoft Store 接收自动更新、导入 Microsoft Store 中没有的 Linux 发行版，或构建你自己的定制 Linux 发行版。

- 将文件存储在独立的 Linux 文件系统中，具体取决于安装的发行版。
- 运行命令行工具，例如 BASH。
- 运行常用的 BASH 命令行工具（例如 grep、sed、awk）或其他 ELF-64 二进制文件。
- 运行 Bash 脚本和 GNU/Linux 命令行应用程序，包括：
- 工具：vim、emacs、tmux
- 语言：NodeJS、JavaScript、Python、Ruby、C/C++、C# 和 F#、Rust、Go 等。
- 服务：SSHD、MySQL、Apache、lighttpd、MongoDB、PostgreSQL。
- 使用自己的 GNU/Linux 分发包管理器安装其他软件。
- 使用类似于 Unix 的命令行 shell 调用 Windows 应用程序。
- 在 Windows 上调用 GNU/Linux 应用程序。
- 运行直接集成到 Windows 桌面的 GNU/Linux 图形应用程序
- 使用你的设备 GPU 加速 Linux 上运行的机器学习工作负载。

### wsl2

WSL2是新一代的版本，相较于WSL1有几个显著的区别：

1. 架构：WSL1基于兼容层，直接将Linux系统调用转换为Windows系统调用，运行Linux二进制文件。WSL2：使用真正的Linux内核，运行在轻量级虚拟机中，这使得它可以更好地支持完整的Linux环境。

2. 性能：WSL1在某些情况下性能较低，特别是在处理复杂的系统调用时。WSL2性能显著提高，尤其是文件系统操作和对容器的支持。

3. 文件系统：WSL1通过Windows文件系统共享，文件操作相对较慢。WSL2有自己的文件系统，使用真实的Linux文件系统，文件操作速度更快，同时也支持较好的文件权限管理。

4. 兼容性：WSL1不支持某些Linux特性，如完整的网络功能和某些系统调用。WSL2由于运行在真实的Linux内核上，支持更多Linux应用程序和工具。

5. 资源管理：WSL1使用Windows的资源管理，资源占用较小。WSL2虽然使用轻量级虚拟机，但仍然可以配置更多的内存和CPU资源，提供更好的性能。

接下将会使用wsl2在window中搭建linux环境。

## 安装wsl

### window安装wsl需要开启的功能

在window中使用wsl需要开启虚拟化，以及开启window的`适用于Linux的Windows子系统`和`虚拟机平台`功能。

- 在`任务管理器->性能->CPU`界面中可以查看虚拟化有没有启用。

  <img src="https://i.postimg.cc/pLMwdPHD/freecompress-1729428958373.jpg" alt="Image" data-zoomable width="80%;">

- 在`启用或关闭Windows功能`窗口可以查看`适用于Linux的Windows子系统`和`虚拟机平台`功能是否开启。

  <img src="https://i.postimg.cc/HWyHWZM1/freecompress-1729429308250.jpg" alt="Image" data-zoomable width="80%;">

### 安装wsl

安装只需要打开cmd命令行工具，找到对应要下载的版本下载即可。详细安装细节参考： <a href="https://learn.microsoft.com/zh-cn/windows/wsl/install#install-wsl-command" target="_blank">安装 WSL | Microsoft Learn</a>。

```cmd
# 从网络中而不是 Microsoft Store 中下载并安装指定的发行版，如果不指定发行版则会安装默认的 Ubuntu 发行版，在安装完成后会自动启动，类似于创建 Docker 容器。
wsl --install Ubuntu --web-download
```

在安装完成后需要输入用户名和密码，输入用户和密码后默认进入linux系统中。

### 打开和关闭wsl

这里提供打开wsl的两种方式，一种直接通过终端直接打开对应的窗口，这种方式方便快捷。第二种是在`cmd`或者`PowerShell`输入命令`wsl -d <wslname>`的方式启动。退出则是直接输入`exit`命令即可。

### 卸载wsl

输入`wsl --unregister <wslname>`即可完成卸载。

### 其他功能

wsl不单只支持linux原有功能，还能支持和window命令的混合使用，直接打开window安装的程序，显卡直通等功能。

## 参考链接

<a href="https://learn.microsoft.com/zh-cn/windows/wsl/about" target="_blank">什么是适用于 Linux 的 Windows 子系统 | Microsoft Learn</a>

<a href="https://www.bilibili.com/video/BV1tW42197za" target="_blank">超详细的WSL教程：Windows上的Linux子系统_哔哩哔哩_bilibili</a>

<a href="https://learn.microsoft.com/zh-cn/windows/wsl/install#install-wsl-command" target="_blank">安装 WSL | Microsoft Learn</a>