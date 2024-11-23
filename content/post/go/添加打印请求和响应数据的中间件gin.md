---
title: "gin添加打印请求和响应数据的中间件" #标题
date: 2024-11-23T14:13:14+08:00 #创建时间
lastmod: 2024-11-23T14:13:14+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- go
tags: 
- gin中间件
description: "便于进行接口调试" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: ""
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

在使用gin搭建web服务器的过程中可能会遇到参数错误，获取接口返回的数据格式不符合要求等各种数据传递所遇到的错误。为了在开发接口的过程中方便调试，可以添加一个打印数据的全局中间件。

## 实现代码

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

## 参考链接

<a href="https://blog.csdn.net/K346K346/article/details/129339396" target="_blank">Gin 优雅打印请求与回包内容</a>