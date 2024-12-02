---
title: "Linux基础命令" #标题
date: 2024-10-20T23:45:37+08:00 #创建时间
lastmod: 2024-10-20T23:45:37+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- linux
tags: 
- linux基础命令
description: "linux基础命令是学习liux操作系统的第一步" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "Linux Basic Commands"
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

## linux目录结构

以下是常见的Linux目录结构及其用途的简单概述：

```
/
├── bin      # 常用二进制可执行文件 (如 ls, cp 等)
├── boot     # 启动加载程序和内核文件
├── dev      # 设备文件 (如 /dev/sda)
├── etc      # 系统配置文件
│   ├── nginx      # Nginx 配置文件目录示例
│   ├── systemd    # systemd 配置文件目录示例
├── home     # 用户的主目录 (如 /home/user)
│   └── user      # 某个用户的个人目录
├── lib      # 系统程序使用的库文件
├── media    # 挂载的外部媒体 (如 U 盘、CD)
├── mnt      # 临时挂载点
├── opt      # 可选软件包 (如第三方应用)
├── proc     # 虚拟文件系统，包含进程信息
├── root     # 超级用户的主目录
├── run      # 系统运行时的状态文件
├── sbin     # 系统管理员使用的二进制文件
├── srv      # 服务相关的数据
├── sys      # 系统文件 (如内核信息)
├── tmp      # 临时文件 (系统重启后清除)
├── usr      # 用户二进制文件和库文件
│   ├── bin      # 用户使用的二进制文件
│   ├── lib      # 用户库文件
│   ├── local    # 本地安装的软件
│   └── share    # 共享数据 (如文档、图标)
└── var      # 可变数据 (如日志、缓存)
    ├── log      # 日志文件
    ├── cache    # 缓存文件
    └── www      # Web 服务器文件 (如 /var/www/html)
```

- `/` (根目录)：一切目录和文件的起点。
- `/home`：存放用户的数据，每个用户有独立的目录。
- `/etc`：系统的主要配置文件都位于此处。
- `/usr`：用户级的程序和库文件。
- `/var`：动态内容，如日志、数据库文件和缓存。

## linux命令通用格式

command [-options] [parameter]

- command：命令本身。
- -options：[可选，非必填]命令的一些选项，可以通过选项控制命令的行为细节。
- parameter：[可选，非必填]命令的参数，多数用于命令的指向目标等。

## ls命令

`ls`命令是Linux系统中最常用的命令之一，用于显示目录内容。它提供了多种选项，可以详细列出文件和目录的信息。

语法：

```bash
 ls [-alrtAFR] [name...]
```

参数 :

- -a 显示所有文件及目录 (. 开头的隐藏文件也会列出)
- -d 只列出目录（不递归列出目录内的文件）。
- -l 以长格式显示文件和目录信息，包括权限、所有者、大小、创建时间等。
- -r 倒序显示文件和目录。
- -t 将按照修改时间排序，最新的文件在最前面。
- -A 同 -a ，但不列出 "." (目前目录) 及 ".." (父目录)
- -F 在列出的文件名称后加一符号；例如可执行档则加 "*", 目录则加 "/"
- -R 递归显示目录中的所有文件和子目录。

```bash
ls -l                    # 以长格式显示当前目录中的文件和目录
ls -a                    # 显示当前目录中的所有文件和目录，包括隐藏文件
ls -lh                   # 以人类可读的方式显示当前目录中的文件和目录大小
ls -t                    # 按照修改时间排序显示当前目录中的文件和目录
ls -R                    # 递归显示当前目录中的所有文件和子目录
ls -l /etc/passwd        # 显示/etc/passwd文件的详细信息
```

## cd&pwd命令

在Linux系统中，`cd`和`pwd`是两个基本且非常常用的命令，用于导航和显示当前工作目录。

语法：

```bash
cd [dirName]
pwd [--help][--version]		#--help 在线帮助 --version 显示版本信息。
```

## mkdir命令

`mkdir`命令是Linux系统中用于创建目录的基本命令。

语法：

```bash
mkdir [-p] dirName		# -p 确保目录名称存在，不存在的就建一个
```

## touch命令

Linux touch命令用于修改文件或者目录的时间属性，包括存取时间和更改时间。若文件不存在，系统会建立一个新的文件。ls -l 可以显示档案的时间记录。

语法：

```bash
touch [-acfm][-d<日期时间>][-r<参考文件或目录>] [-t<日期时间>][--help][--version][文件或目录…]
```

- a 改变档案的读取时间记录。
- m 改变档案的修改时间记录。
- c 假如目的档案不存在，不会建立新的档案。与 --no-create 的效果一样。
- f 不使用，是为了与其他 unix 系统的相容性而保留。
- r 使用参考档的时间记录，与 --file 的效果一样。
- d 设定时间与日期，可以使用各种不同的格式。
- t 设定档案的时间记录，格式与 date 指令相同。
- --no-create 不会建立新档案。
- --help 列出指令格式。
- --version 列出版本讯息。

首先，使用ls命令查看testfile文件的属性，如下所示：

```bash
$ ls -l testfile                #查看文件的时间属性  
#原来文件的修改时间为16:09  
-rw-r--r-- 1 yfc01 yfc01 0 Oct 21 00:17 testfile
```

执行指令"touch"修改文件属性以后，并再次查看该文件的时间属性，如下所示：

```bash
$ touch testfile                #修改文件时间属性为当前系统时间  
$ ls -l testfile                #查看文件的时间属性  
#修改后文件的时间属性为当前系统时间  
-rw-r--r-- 1 yfc01 yfc01 0 Oct 21 00:18 testfile
```

## cat命令

---

未完待续

---



## 参考资料

<a href="https://www.runoob.com/linux/linux-tutorial.html" target="_blank">Linux 教程 | 菜鸟教程</a>
