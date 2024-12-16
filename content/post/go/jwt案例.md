---
title: "Jwt案例" #标题
date: 2024-11-26T08:16:48+08:00 #创建时间
lastmod: 2024-11-26T08:16:48+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- go
tags: 
- gin-jwt
description: "使用jwt添加信息认证" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "Jwt Case"
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

在构建面向管理员类型用户的系统时，用户认证功能是不可或缺的核心环节。在 Web 应用开发中，常见的认证方式包括 Session 和 JWT (JSON Web Token)。本文将着重讨论 JWT 的特点及其适用场景。

## jwt

JWT 是一种 无状态 的用户认证方式。与传统的 Session 不同，JWT 将用户的认证信息直接嵌入到 Token 中，并由客户端保存。服务器在收到 Token 后，通过验证其完整性和有效性来决定是否允许请求。

### JWT 的特性与工作机制

无状态认证：
JWT 不依赖服务器存储用户的会话数据。每次请求都携带 Token，服务器通过解析 Token 即可获取用户信息，无需查询数据库或内存。

Token 组成：
JWT 由三部分组成，使用点号 (`.`) 分隔：

- Header： 说明签名算法和类型（如 HMAC-SHA256）。
- Payload： 包含用户信息（如 `user_id`）及声明（如过期时间）。
- Signature： 使用指定算法生成的签名，确保 Token 未被篡改。

加密与安全性：
JWT 通常使用签名算法（如 HMAC 或 RSA）来验证 Token 的完整性，而不对 Payload 本身加密。敏感数据不应直接存储在 JWT 中。

认证流程：

- 用户登录后，服务器生成 JWT 并返回给客户端。
- 客户端存储 Token（通常存放于浏览器的本地存储或 Cookie 中）。
- 每次需要权限验证的请求，客户端通过 HTTP Header 携带 Token，服务器解析验证后处理请求。

### JWT vs Session

1. 性能开销：
   - JWT：由于服务器不需要维护用户状态，避免了额外的存储和查询开销。适合高并发和分布式架构的场景。
   - Session：需要服务器端存储会话信息，随着用户量增加，存储和管理成本也会增加。
2. 安全性：
   - JWT：将认证信息存储在客户端，可能面临 Token 被窃取或滥用的风险。一旦 Token 泄露，攻击者可冒用用户身份，直到 Token 过期。
   - Session：认证信息存储在服务器，安全性更高，但需要保护服务器存储不被非法访问。
3. 适用场景：
   - JWT：适合前后端分离、移动端应用、微服务架构等需要轻量化和分布式特性的场景。
   - Session：适用于传统的单体架构或需要频繁更新用户状态的系统。

## 在go中使用jwt

首先安装jwt包：`go get -u github.com/golang-jwt/jwt/v5`

生成和验证token：

```go
// 主包声明
package main

// 导入所需的包
import (
    "crypto/rand"       // 用于生成随机数
    "fmt"               // 用于格式化输出
    "github.com/golang-jwt/jwt/v5" // 用于生成和解析 JWT
)

/*
GenerateJwt 函数生成一个 JWT 字符串。

参数：
- key：签名所使用的密钥，可以是对称密钥（如 HMAC）或非对称密钥的私钥。
- method：签名算法，指定如何生成 Token 的签名部分。
- claims：JWT 的 Claims 数据，包含自定义的有效载荷信息。

返回值：
- JWT 字符串
- 错误信息（如果生成 Token 失败）
*/
func GenerateJwt(key any, method jwt.SigningMethod, claims jwt.Claims) (string, error) {
    // 创建一个新的 JWT Token，并将 Claims 数据嵌入其中
    token := jwt.NewWithClaims(method, claims)
    // 使用指定的密钥对 Token 进行签名，并返回生成的 JWT 字符串
    return token.SignedString(key)
}

// 主函数
func main() {
    // 生成一个 32 字节（256 位）的随机密钥，用于 HMAC 签名
    jwtKey := make([]byte, 32)
    // 读取随机数据填充密钥
    if _, err := rand.Read(jwtKey); err != nil {
        // 如果生成随机密钥失败，程序退出
        panic(err)
    }

    // 调用 GenerateJwt 函数生成 JWT 字符串
    jwtStr, err := GenerateJwt(jwtKey, jwt.SigningMethodHS256, jwt.MapClaims{
        "iss": "程序员陈明勇",      // "iss" 是 JWT 的标准字段，表示签发者
        "song.cn", // "sub" 是 JWT 的标准字段，表示主题
        "aud": "Programmer",      // "aud" 是 JWT 的标准字段，表示受众
    })
    if err != nil {
        // 如果生成 Token 失败，程序退出
        panic(err)
    }

    // 打印生成的 JWT 字符串
    fmt.Println(jwtStr)
}
```

验证token：

```go
// 主程序入口，用于生成和解析 JWT。
package main

import (
    "crypto/rand"    // 用于生成随机密钥
    "errors"         // 标准错误处理包
    "fmt"            // 标准输入输出包
    "github.com/golang-jwt/jwt/v5" // 引入 jwt 库
    "time"           // 时间操作包
)

/*
ParseJwt 函数解析一个 JWT 字符串并校验其合法性。

参数：
- key：用于校验签名的密钥，必须与生成 JWT 时的密钥一致。
- jwtStr：要解析的 JWT 字符串。
- options：可选的解析选项，例如是否需要校验 exp（过期时间）。

返回值：
- jwt.Claims：解析后的 JWT Claims 数据，可以通过断言转换为具体的结构体或 Map。
- error：如果解析或校验失败，返回错误信息。
*/
func ParseJwt(key any, jwtStr string, options ...jwt.ParserOption) (jwt.Claims, error) {
    // 使用指定的密钥和选项解析 JWT 字符串
    token, err := jwt.Parse(jwtStr, func(token *jwt.Token) (interface{}, error) {
        return key, nil // 返回用于校验签名的密钥
    }, options...)
    if err != nil {
        return nil, err // 如果解析失败，返回错误信息
    }

    // 校验 Token 的合法性，包括签名和 Claims（如 exp、nbf 等）
    if !token.Valid {
        return nil, errors.New("invalid token") // 如果校验失败，返回无效的 Token 错误
    }

    // 返回解析成功的 Claims
    return token.Claims, nil
}

// main 函数是程序的入口，演示生成和解析 JWT 的过程。
func main() {
    // 生成一个随机的 32 字节（256 位）密钥
    jwtKey := make([]byte, 32)
    if _, err := rand.Read(jwtKey); err != nil {
        panic(err) // 如果生成密钥失败，直接退出
    }

    // 创建一个新的 JWT，使用 HS256 签名方法和自定义的 Claims
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "iss": "程序员陈明勇",                  // 签发者
        "sub": "chenmingyong.cn",             // 主题
        "aud": "Programmer",                  // 接收者
        "exp": time.Now().Add(time.Second * 10).UnixMilli(), // 过期时间，10 秒后失效
    })

    // 生成 JWT 字符串
    jwtStr, err := token.SignedString(jwtKey)
    if err != nil {
        panic(err) // 如果生成失败，直接退出
    }

    // 打印生成的 JWT 字符串（供参考）
    fmt.Printf("Generated JWT: %s\n", jwtStr)

    // 使用密钥解析 JWT 字符串，指定必须校验 exp（过期时间）
    claims, err := ParseJwt(jwtKey, jwtStr, jwt.WithExpirationRequired())
    if err != nil {
        panic(err) // 如果解析失败，直接退出
    }

    // 打印解析后的 Claims 数据
    fmt.Println("Parsed Claims:", claims)
}
```

在具体的项目中，可以根据需求将验证token的步骤放到中间件中实现。

## 参考链接

<a href="https://www.cnblogs.com/yuanrw/p/10089796.html" target="_blank">用户认证：基于jwt和session的区别和优缺点 - yuanrw - 博客园</a>

<a href="https://learnku.com/articles/85927" target="_blank">Go JWT 全面指南 | Go 技术论坛</a>