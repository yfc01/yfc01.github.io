---
title: "gin添加打印请求和响应数据的中间件" #标题
date: 2024-11-23T14:13:14+08:00 #创建时间
lastmod: 2024-11-25T14:13:14+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- go
tags: 
- gin中间件
description: "便于进行接口调试" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "Add middleware for printing requests and response data in gin"
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

在使用gin搭建web服务器的过程中可能会遇到接口请求或者响应数据错误的问题，为了在开发接口的过程中方便调试，可以添加一个打印数据的全局中间件。

## go方法重写

在给出实现方法之前，首先简单理解在go中如何通过结构体实现继承，在进行方法重写。

```go
package main

import "fmt"

// Animal 接口定义：任何实现了 Speak 方法的类型都可以被视为 Animal
type Animal interface {
	Speak() string // Speak 方法返回一个字符串，表示动物的叫声
}

// Dog 结构体：表示狗类型
type Dog struct{}

// Speak 方法：实现 Animal 接口，定义狗的叫声
func (d Dog) Speak() string {
	return "Woof!" // 狗的叫声
}

// Cat 结构体：表示猫类型
type Cat struct{}

// Speak 方法：实现 Animal 接口，定义猫的叫声
func (c Cat) Speak() string {
	return "Meow!" // 猫的叫声
}

// CustomDog 结构体：表示自定义狗类型
type CustomDog struct {
	Cat
}

// Speak 方法：实现 Animal 接口，重写狗的叫声
func (cd CustomDog) Speak() string {
	return "Custom Woof!" // 自定义狗的叫声
}

// MakeAnimalSpeak 函数：接收 Animal 接口类型，调用其 Speak 方法
func MakeAnimalSpeak(a Animal) {
	// 动态调用传入的具体实现类型的 Speak 方法
	fmt.Println(a.Speak())
}

// 主函数：程序入口
func main() {
	// 创建 Dog、Cat 和 CustomDog 实例
	dog := Dog{}         // 狗实例
	cat := Cat{}         // 猫实例
	customDog := CustomDog{} // 自定义狗实例

	// 调用 MakeAnimalSpeak 函数分别输出它们的叫声
	MakeAnimalSpeak(dog)        // 输出: Woof!  (狗的叫声)
	MakeAnimalSpeak(cat)        // 输出: Meow!  (猫的叫声)
	MakeAnimalSpeak(customDog)  // 输出: Custom Woof! (自定义狗的叫声)
}
```

将`CustomDog`实现的`Speak()`方法注释掉后`MakeAnimalSpeak(customDog)`打印`Meow!`，这部分内容`javascript`的原型链类似，当前层级（作用域或者对象）无法查询到目标则向上层查询。

## 实现方法

### 代码

下面的代码可以向控制台输出调用接口传入的`json`数据和接口返回的数据。

```go
package yourpackage

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"time"

	"github.com/gin-gonic/gin"
)

// CustomResponseWriter 封装 gin ResponseWriter 用于获取回包内容。
type CustomResponseWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w CustomResponseWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

// 日志中间件。
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 记录请求时间
		start := time.Now()

		// 使用自定义 ResponseWriter
		crw := &CustomResponseWriter{
			body:           bytes.NewBufferString(""),
			ResponseWriter: c.Writer,
		}
		c.Writer = crw

		// 读取并保存请求体内容
		reqBody, _ := io.ReadAll(c.Request.Body)
		c.Request.Body = io.NopCloser(bytes.NewBuffer(reqBody)) // 重置请求体

		// 打印请求信息
		fmt.Printf("-------------------------------------------------------------------\n")
		fmt.Printf("[INFO] Request: %s %s %s\n", c.Request.Method, c.Request.RequestURI, string(reqBody))

		// 执行请求处理程序和其他中间件函数
		c.Next()

		// 记录回包内容和处理时间
		end := time.Now()
		latency := end.Sub(start)

		// 格式化响应内容
		respBody := crw.body.String()
		var formattedRespBody bytes.Buffer
		if err := json.Indent(&formattedRespBody, []byte(respBody), "", "  "); err != nil {
			// 如果无法格式化，则直接输出原始响应
			fmt.Printf("[INFO] Response: %s %s %s (%v)\n", c.Request.Method, c.Request.RequestURI, respBody, latency)
		} else {
			// 打印格式化后的响应内容
			fmt.Printf("[INFO] Response: %s %s %s (%v)\n", c.Request.Method, c.Request.RequestURI, formattedRespBody.String(), latency)
		}
		fmt.Printf("-------------------------------------------------------------------\n")
	}
}

```

### 代码解析

#### 捕获请求体信息

获取并重置结构体信息，打印获取的信息。

```go
// 读取并保存请求体内容
reqBody, _ := io.ReadAll(c.Request.Body)
c.Request.Body = io.NopCloser(bytes.NewBuffer(reqBody)) // 重置请求体

// 打印请求信息
fmt.Printf("[INFO] Request: %s %s %s\n", c.Request.Method, c.Request.RequestURI, string(reqBody))
```

#### 捕获响应信息

为了记录回包内容，封装了 `gin.ResponseWriter` 并通过 `CustomResponseWriter` 实现：

- 在 `Write` 方法中拦截并保存写入的数据到 `body` 缓冲区（`w.body.Write(b)`）。
- 同时将数据继续写回原始 `ResponseWriter`，以便正常响应客户端（`w.ResponseWriter.Write(b)`）。

```go
// 自定义 ResponseWriter
crw := &CustomResponseWriter{
	body:           bytes.NewBufferString(""),
	ResponseWriter: c.Writer,
}
c.Writer = crw
```

- 将 `CustomResponseWriter` 替换 Gin 的 `ResponseWriter`，实现对响应的拦截和存储。

## 参考链接

<a href="https://blog.csdn.net/K346K346/article/details/129339396" target="_blank">Gin 优雅打印请求与回包内容</a>