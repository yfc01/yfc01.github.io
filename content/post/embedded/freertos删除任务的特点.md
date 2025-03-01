---
title: "Freertos删除任务的特点" #标题
date: 2025-02-18T18:42:54+08:00 #创建时间
lastmod: 2025-02-18T18:42:54+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- embedded
tags: 
- freertos删除任务
description: "freertos删除任务有些情况下并不会释放内存，从而导致内存泄露" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "Characteristics of Freertos deletion task"
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

在我的门锁项目中，涉及到触控按键的操作。当用户点击触控按键时，应该记录一次按键输入。然而，在我的项目中，触控按键的响应较为敏感，短时间内的单次点击可能触发多次按键输入处理。这导致了每次点击都记录多个数字，从而导致模块无法按预期正常工作。

为了解决这个问题，我设计了一种方案：在按键被点击后，设置一个标志位，表示当前已经处理了按键输入，并且忽略后续的多次触发；接着，创建一个 RTOS 任务，进行延时操作，延时到期后复位标志位，并删除任务。这样可以避免同一次按键触发多次处理。

然而，经过测试，我发现程序在触控按键输入一段时间后卡死了，程序只通过复位才能重新运行，而按键输入次数也有限制。进一步检查后，我发现原因是我创建的延时任务在删除后并未正确释放内存，导致内存逐渐消耗完，最终造成系统崩溃。

为了找到解决方案，我进行了更多的测试，并总结出了一些关于 RTOS 删除任务时的特性，以下是我的总结和解决方案。

## FreeRTOS 删除任务后未能释放内存

在使用 FreeRTOS 时，任务删除后可能没有释放内存，特别是当任务通过 `vTaskDelete()` 自删除，并且程序没有机会进入空闲任务时，内存并未如预期释放。

以下为测试代码：

在第一个例子中，我创建了两个任务，task1会创建task2，并且在task2延时阻塞后删除自身。在串口打印助手中可以得知task2删除自身后没有释放内存。

```c
SemaphoreHandle_t xSemaphore = NULL;  // 信号量

void Task2(void *pvParameters) {
    // 延时500ms
    vTaskDelay(pdMS_TO_TICKS(500));

    // 通知 Task1 任务已完成
    xSemaphoreGive(xSemaphore);
    
    // 删除自身
    vTaskDelete(NULL);
}

void Task1(void *pvParameters) {
    // 打印当前剩余内存
    printf(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n");
    printf("当前剩余内存: %u 字节\n", xPortGetFreeHeapSize());
    printf("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n");
    
    // 创建信号量
    xSemaphore = xSemaphoreCreateBinary();
    
    // 创建 Task2
    xTaskCreate(Task2, "Task2", 1024, NULL, 2, NULL);
    
    // 等待 Task2 完成并发送信号
    if (xSemaphoreTake(xSemaphore, portMAX_DELAY) == pdTRUE) {
        // Task2 完成后打印剩余内存
        printf("Task2 完成，当前剩余内存: %u 字节\n", xPortGetFreeHeapSize());
    }
    
    // 删除信号量
    vSemaphoreDelete(xSemaphore);
}
```

串口助手输出内容：

<img src="https://i.postimg.cc/J7bQg0cC/1.png" alt="Image" data-zoomable width="80%;">

在第二个例子中，唯一和第一个例子的区别便是添加一个时常为1000ms的延时阻塞，可以让程序进入空闲状态。在串口打印助手中可以得知task2删除自身后，并且程序进入延时阻塞后，内存被正常释放了。

```c
SemaphoreHandle_t xSemaphore = NULL;  // 信号量

void Task2(void *pvParameters) {
    // 延时500ms
    vTaskDelay(pdMS_TO_TICKS(500));

    // 通知 Task1 任务已完成
    xSemaphoreGive(xSemaphore);
    
    // 删除自身
    vTaskDelete(NULL);
}

void Task1(void *pvParameters) {
    // 打印当前剩余内存
    printf(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n");
    printf("当前剩余内存: %u 字节\n", xPortGetFreeHeapSize());
    printf("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n");
    
    // 创建信号量
    xSemaphore = xSemaphoreCreateBinary();
    
    // 创建 Task2
    xTaskCreate(Task2, "Task2", 1024, NULL, 2, NULL);
    
    // 等待 Task2 完成并发送信号
    if (xSemaphoreTake(xSemaphore, portMAX_DELAY) == pdTRUE) {
		// 延时1000ms
		vTaskDelay(pdMS_TO_TICKS(1000));
        // Task2 完成后打印剩余内存
        printf("Task2 完成，当前剩余内存: %u 字节\n", xPortGetFreeHeapSize());
    }
    
    // 删除信号量
    vSemaphoreDelete(xSemaphore);
}
```

串口助手输出内容：

<img src="https://i.postimg.cc/gjJkvnGL/2.png" alt="Image" data-zoomable width="80%;">

## 删除后立即释放内存的方法

经过更加详细的测试，不是任务删除自身的方式皆可。虽然上述代码并没有测试通过结构体变量显式自删除的方法，但实际上也是不会立即释放内存的。