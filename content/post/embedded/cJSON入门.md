---
title: "CJSON入门" #标题
date: 2025-01-28T21:03:54+08:00 #创建时间
lastmod: 2025-02-03T21:03:54+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- embedded
tags: 
- cJSON
description: "cJSON大大简化了json数据与c语言结构体的相互转换" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "CJSON Beginner's Guide"
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

在完成项目的过程中，单片机与web服务器进行通讯使用的是json格式数据。然而，在c语言中并没有办法直接对json数据进行操作，通常使用结构体进行数据存储，而cJSON可以简化c语言结构体与json数据的相互转换。

## cJSON是什么

cJOSN开发者对其的介绍：

> `cJSON` 的目标是成为最简单的解析器，足以完成你的工作。它是一个单独的 C 文件和一个单独的头文件。
>
> JSON 在这里被描述得最好：http://www.json.org/。它类似于 XML，但更加简洁。你可以用它来传输数据、存储东西，或者一般来说表示程序的状态。
>
> 作为一个库，`cJSON` 的存在是为了尽可能减少工作量，但又不妨碍你的使用。出于务实的考虑（即忽略一些事实），我要说你可以以两种模式使用它：自动模式和手动模式。让我们简单看一下。
>
> 我从这个页面提取了一些 JSON：http://www.json.org/fatfree.html。这个页面启发我写了 `cJSON`，它是一个尝试与 JSON 本身一样分享相同哲学的解析器。简单、傻乎乎的、不会干扰你。

## 安装cJSON

直接打开 <a href="https://github.com/DaveGamble/cJSON" target="_blank">DaveGamble/cJSON: Ultralightweight JSON parser in ANSI C</a> 然后将`cJSON.h`和`cJSON.c`下载下来，并且导入到项目中，在需要使用相关功能的时候导入即可。

安装cJSON除了将源文件复制进入项目中的方式，还可以使用CMake，详细内容可自行查阅 <a href="https://github.com/DaveGamble/cJSON?tab=readme-ov-file#cmake" target="_blank">CMake</a>。

## 数据转换要点

`cJSON` 的数据转换设计思路非常简单且高效，主要是为了提供一个易用的 API 来解析和生成 JSON 数据，同时保持较小的代码体积和较高的执行效率。其设计理念基于“简化”的原则。

### 结构体设计

`cJSON` 的核心是一个简单的结构体 `cJSON`，用于表示 JSON 对象的各种数据类型。这个结构体包含了多种 JSON 数据类型（如字符串、数字、对象、数组等）的支持，并且具有指向子元素和下一个元素的指针。

```c
/* The cJSON structure: */
typedef struct cJSON
{
    /* next/prev allow you to walk array/object chains. Alternatively, use GetArraySize/GetArrayItem/GetObjectItem */
    struct cJSON *next;
    struct cJSON *prev;
    /* An array or object item will have a child pointer pointing to a chain of the items in the array/object. */
    struct cJSON *child;

    /* The type of the item, as above. */
    int type;

    /* The item's string, if type==cJSON_String  and type == cJSON_Raw */
    char *valuestring;
    /* writing to valueint is DEPRECATED, use cJSON_SetNumberValue instead */
    int valueint;
    /* The item's number, if type==cJSON_Number */
    double valuedouble;

    /* The item's name string, if this item is the child of, or is in the list of subitems of an object. */
    char *string;
} cJSON;
```

这个设计使得 `cJSON` 对象在内存中结构化地存储 JSON 数据，并且通过指针连接可以方便地进行遍历和数据访问。

cJSON的设计很巧妙。

首先，**它不是将一整段JSON数据抽象出来，而是将其中的一条JSON数据抽象出来，也就是一个键值对**，用上面的结构体 strcut cJSON 来表示，其中用来存放值的成员列表如下：

- String：用于表示该键值对的名称；
- type：用于表示该键值对中值的类型；
- valuestring：如果键值类型(type)是字符串，则将该指针指向键值；
- valueint：如果键值类型(type)是整数，则将该指针指向键值；
- valuedouble：如果键值类型(type)是浮点数，则将该指针指向键值；

其次，一段完整的JSON数据中由很多键值对组成，并且涉及到键值对的查找、删除、添加，所以**使用链表来存储整段JSON数据**，如上面的代码所示：

- next指针：指向下一个键值对
- prev指针：指向上一个键值对

最后，因为JSON数据支持嵌套，所以**一个键值对的值会是一个新的JSON数据对象（一条新的链表），也有可能是一个数组**，方便起见，在cJSON中，数组也表示为一个数组对象，用链表存储，所以在键值对结构体中，当该键值对的值是一个嵌套的JSON数据或者一个数组时，由`child`指针指向该条新链表。

下面举个例子：

```json
{
  "name": "Alice",
  "age": 25,
  "address": {
    "city": "Wonderland",
    "zip": "12345"
  },
  "hobbies": ["Reading", "Adventuring"]
}
```

在解析时：

- `"name": "Alice"` 对应一个 `cJSON` 对象，它的 `string` 为 `"name"`，`valuestring` 为 `"Alice"`，`type` 为 `cJSON_String`。
- `"age": 25` 对应一个 `cJSON` 对象，它的 `string` 为 `"age"`，`valueint` 为 `25`，`type` 为 `cJSON_Number`。
- `"address"` 是一个对象，它的 `string` 为 `"address"`，`child` 指向该对象的子元素（`city` 和 `zip`）。
- `"hobbies"` 是一个数组，它的 `string` 为 `NULL`，`child` 指向 `"Reading"` 和 `"Adventuring"` 两个数组元素。

通过这种结构，可以使用 `cJSON` 的 API 来访问、修改和生成 JSON 数据。

### 内存管理

`cJSON` 使用动态内存分配来存储数据，使用 `malloc` 为 `cJSON` 对象及其子元素分配内存。数据解析和生成的过程中，确保内存被合理分配，并且最终需要手动释放内存，以避免内存泄漏。

- **cJSON_Delete()**：释放一个 `cJSON` 对象及其所有子元素。
- **内存泄漏管理**：由于 `cJSON` 是一个单文件库，内存的管理是其设计中的重要部分。每个解析或生成操作都要求程序员手动释放内存，否则会导致内存泄漏。

## 封装JSON数据

这个示例将创建一个包含 `string`、`number`、`boolean`、`null` 和嵌套对象的数据，然后序列化为一个 JSON 字符串。

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "cJSON.h"

int main() {
    // 创建根对象
    cJSON *root = cJSON_CreateObject();

    // 创建字符串字段
    cJSON_AddStringToObject(root, "name", "Alice");

    // 创建整数字段
    cJSON_AddNumberToObject(root, "age", 30);

    // 创建布尔值字段
    cJSON_AddBoolToObject(root, "isStudent", 0);  // 0 代表 false

    // 创建 NULL 字段
    cJSON_AddNullToObject(root, "address");

    // 创建嵌套对象 "address"
    cJSON *address = cJSON_CreateObject();
    cJSON_AddStringToObject(address, "city", "Wonderland");
    cJSON_AddStringToObject(address, "zip", "12345");
    
    // 将 "address" 添加到 root 对象中
    cJSON_AddItemToObject(root, "addressDetails", address);

    // 创建数组字段
    cJSON *hobbies = cJSON_CreateArray();
    cJSON_AddItemToArray(hobbies, cJSON_CreateString("Reading"));
    cJSON_AddItemToArray(hobbies, cJSON_CreateString("Traveling"));
    cJSON_AddItemToObject(root, "hobbies", hobbies);

    // 序列化成 JSON 字符串
    char *json_string = cJSON_Print(root);
    printf("Generated JSON:\n%s\n", json_string);

    // 释放内存
    free(json_string);
    cJSON_Delete(root);

    return 0;
}
```

- **`cJSON_CreateObject()`**：创建一个空的 JSON 对象。
- **`cJSON_AddStringToObject()`**：向对象中添加一个字符串类型的字段（键值对）。
- **`cJSON_AddNumberToObject()`**：向对象中添加一个数字类型的字段。
- **`cJSON_AddBoolToObject()`**：向对象中添加一个布尔值类型的字段。
- **`cJSON_AddNullToObject()`**：向对象中添加一个 `null` 类型的字段。
- **`cJSON_CreateArray()`**：创建一个空的 JSON 数组。
- **`cJSON_AddItemToArray()`**：将元素添加到数组中。
- **`cJSON_AddItemToObject()`**：将一个对象或数组添加到另一个对象中。
- **`cJSON_Print()`**：将 JSON 对象序列化为字符串。这个函数会为你格式化 JSON 字符串，便于阅读。
- **`cJSON_Delete()`**：释放 JSON 对象所占用的内存。

输出结果：

```json
Generated JSON:
{
    "name": "Alice",
    "age": 30,
    "isStudent": false,
    "address": null,
    "addressDetails": {
        "city": "Wonderland",
        "zip": "12345"
    },
    "hobbies": [
        "Reading",
        "Traveling"
    ]
}
```

## 解析JSON数据

以下是一个使用 `cJSON` 解析 JSON 数据的简单示例。该示例展示了如何解析一个 JSON 字符串，提取其中的字段值，并打印出来。

示例 JSON 数据：

```json
{
    "lock_id": 1,
    "lock_identification": "test_doorLock",
    "lock_password": "1234568",
    "lock_location": "test_room",
    "lock_state": 1
}
```

解析 JSON 数据并访问其中的字段：

下面是一个完整的例子，演示了如何解析这个 JSON 字符串并获取其中的字段值。

```c
#include <stdio.h>
#include "cJSON.h"

void parse_json(const char *json_str) {
    // 解析 JSON 字符串
    cJSON *json = cJSON_Parse(json_str);
    
    // 检查解析是否成功
    if (json == NULL) {
        const char *error_ptr = cJSON_GetErrorPtr();
        printf("Error parsing JSON: %s\n", error_ptr);
        return;
    }

    // 获取 JSON 中的各个字段
    cJSON *lock_id = cJSON_GetObjectItem(json, "lock_id");
    cJSON *lock_identification = cJSON_GetObjectItem(json, "lock_identification");
    cJSON *lock_password = cJSON_GetObjectItem(json, "lock_password");
    cJSON *lock_location = cJSON_GetObjectItem(json, "lock_location");
    cJSON *lock_state = cJSON_GetObjectItem(json, "lock_state");

    // 打印各个字段的值
    if (cJSON_IsNumber(lock_id)) {
        printf("lock_id: %d\n", lock_id->valueint);
    }

    if (cJSON_IsString(lock_identification)) {
        printf("lock_identification: %s\n", lock_identification->valuestring);
    }

    if (cJSON_IsString(lock_password)) {
        printf("lock_password: %s\n", lock_password->valuestring);
    }

    if (cJSON_IsString(lock_location)) {
        printf("lock_location: %s\n", lock_location->valuestring);
    }

    if (cJSON_IsNumber(lock_state)) {
        printf("lock_state: %d\n", lock_state->valueint);
    }

    // 释放解析后的 JSON 对象
    cJSON_Delete(json);
}

int main() {
    // JSON 字符串
    const char *json_str = "{\"lock_id\":1,\"lock_identification\":\"test_doorLock\",\"lock_password\":\"1234568\",\"lock_location\":\"test_room\",\"lock_state\":1}";

    // 解析并处理 JSON 数据
    parse_json(json_str);

    return 0;
}
```

代码说明：

1. **`cJSON_Parse`**：
   - 该函数将 JSON 字符串解析为 `cJSON` 对象。如果解析失败，返回 `NULL`，可以通过 `cJSON_GetErrorPtr` 获取错误信息。
2. **`cJSON_GetObjectItem`**：
   - 该函数用于从 JSON 对象中获取特定字段的值。例如，`cJSON_GetObjectItem(json, "lock_id")` 会返回 `"lock_id"` 对应的 `cJSON` 对象。
3. **`cJSON_IsNumber` 和 `cJSON_IsString`**：
   - 这些宏用于检查某个字段是否为特定类型。`cJSON_IsNumber` 用于检查字段是否为数字，`cJSON_IsString` 用于检查字段是否为字符串。
4. **`cJSON_Delete`**：
   - 在使用完 `cJSON` 对象后，应该调用 `cJSON_Delete` 来释放内存。

输出：

```bash
lock_id: 1
lock_identification: test_doorLock
lock_password: 1234568
lock_location: test_room
lock_state: 1
```

## Freertos中使用cJSON的注意点

在Freertos中各功能代码在任务中执行，而在创建任务时需要设置任务堆栈大小。如果设置的太小，cJSON在进行JSON数据解析时会出现栈溢出的情况，从而导致程序运行失败。

```c
 BaseType_t xTaskCreate(
    TaskFunction_t pvTaskCode,           // 任务执行函数的入口地址（任务代码）
    const char * const pcName,           // 任务名称，主要用于调试，显示任务信息
    const configSTACK_DEPTH_TYPE uxStackDepth,  // 任务堆栈的深度（单位为字节），表示为任务栈分配的内存大小
    void *pvParameters,                  // 任务的输入参数，可以传递任意类型的参数给任务函数
    UBaseType_t uxPriority,              // 任务的优先级（较高的数字表示较高的优先级）
    TaskHandle_t *pxCreatedTask          // 用于返回任务句柄的指针，任务句柄用于后续操作，如删除任务
);
```

## 参考连接

<a href="https://github.com/DaveGamble/cJSON" target="_blank">DaveGamble/cJSON: Ultralightweight JSON parser in ANSI C</a>

<a href="https://blog.csdn.net/Mculover666/article/details/103796256" target="_blank">cJSON使用详细教程 | 一个轻量级C语言JSON解析器-CSDN博客</a>