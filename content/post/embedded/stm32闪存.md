---
title: "Stm32闪存" #标题
date: 2025-03-03T02:01:28+08:00 #创建时间
lastmod: 2025-03-03T02:01:28+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- embedded
tags: 
- stm32闪存
description: "stm32中的闪存用于存储掉电不丢失数据" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "Stm32 flash memory"
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

我们平时编写的代码，为什么在烧写到单片机后重新上电后不会丢失？是因为程序写进了 Flash 中，在单片机中flash用于存储程序代码和数据的非易失性存储器，即断电后数据不会丢失。

有时候我们需要在单片机中存储一些掉电不丢失的数据，并且可以在日后不使用编程的方式对数据进行更新，让设备更加的智能化。在这样的场景中，利用单片机中的flash进行数据存储，并且实现数据更新功能的对外接口就非常合适。

当然，也可以通过在单片机引脚上接入 Flash 外设，并实现相应的掉电不丢失存储功能。不过本文重点的讨论对象是stm32中的 Flash 该如何使用。

## Flash

Flash 是一种非易失性存储器（Non-Volatile Memory, NVM），能够在断电后保留存储的数据。它基于浮栅晶体管（Floating Gate Transistor）技术，通过电荷的存储来实现数据的持久化。Flash 存储的数据在断电后不会丢失，这与易失性存储器（如 RAM）形成鲜明对比。非易失性使得 Flash 非常适合用于存储固件、配置数据和其他需要长期保存的信息。

**Flash 与 EEPROM、RAM 的区别与联系：**

| 特性     | Flash                              | EEPROM                 | RAM            |
| :------- | :--------------------------------- | :--------------------- | :------------- |
| 存储类型 | 非易失性                           | 非易失性               | 易失性         |
| 读写速度 | 较慢（写操作需要擦除）             | 较慢（写操作需要擦除） | 极快           |
| 擦写单位 | 块（Block）或扇区（Sector）        | 字节（Byte）           | 字节（Byte）   |
| 擦写次数 | 10,000 - 100,000 次                | 100,000 - 1,000,000 次 | 无限制         |
| 功耗     | 较高（擦写时）                     | 较高（擦写时）         | 低             |
| 成本     | 较低                               | 较高                   | 较高           |
| 典型应用 | 固件存储、文件系统、大容量数据存储 | 小容量配置数据存储     | 运行时数据存储 |

**Flash常见的擦写次数和寿命：**

| Flash 类型 | 擦写次数               |
| :--------- | :--------------------- |
| NOR Flash  | 10,000 - 100,000 次    |
| NAND Flash | 1,000 - 100,000 次     |
| EEPROM     | 100,000 - 1,000,000 次 |

Flash 的擦写次数是指每个存储单元能够承受的擦除和写入操作的最大次数。超过这个次数后，存储单元可能失效。STM32 单片机内部的 Flash 存储器主要采用 NOR Flash 类型。

## STM32中的Flash

接下来以STM32F1系列为例（无OTP），介绍 STM32 中的 Flash 存储器。

STM32F1 系列的 FLASH 存储器分为三个部分：程序存储器、系统存储器和选项字节。通过闪存存储器接口（外设）可以对程序存储器和选项字节进行擦除和编程。

FLASH 读写的主要用途：

- 利用程序存储器的剩余空间来保存用户数据，使其在掉电后仍能保持。
- 通过 JTAG/SWD 或 Bootloader 进行 Flash 重新烧录。适用于生产测试、维护升级等场景，可更新整个程序存储器内容。
- 允许MCU在运行时对 Flash 进行写入，实现固件的自我更新。可通过串口、I2C、SPI、USB 等通信接口接收新固件并写入 Flash。需要划分指定 Flash 区域实现 Bootloader 功能。

### 闪存模块组织

以中容量STM32F10系列为例，从官方文档中可查阅Flash的地址映射。

<img src="https://i.postimg.cc/pdLFgdDz/image.png" alt="Image" data-zoomable width="80%;">

主存储块用于存储程序代码和数据，共 128 页，每页 1K。

信息块主要包含 系统存储器（用于 Bootloader）和 选项字节（用于 Flash 配置）。

闪存存储器接口寄存器用于控制 Flash 的访问、擦除和编程操作。

### Flash基本结构

<img src="https://i.postimg.cc/DzwxBn0Y/Flash.png" alt="Image" data-zoomable width="80%;">

选项字节（Option Bytes, OB） 是 STM32 Flash 里面的一部分特殊存储区域，用于存储 MCU 的一些重要配置参数，比如 读保护（RDP）、写保护（WRP）、启动模式（Boot Mode）、看门狗（IWDG_SW） 等。

选项字节的特点：

- 掉电不丢失，存储在 Flash 的 信息块（Information Block） 内。
- 只能通过 FLASH_OPTKEYR 进行解锁和修改，不能随意改动。
- 更改选项字节后，需要复位 MCU 才能生效。

在进行程序存储器的擦除和编程之前，需要配置选项字节里的读写保护。

## Flash 操作原理与流程

### Flash 编程原理

STM32 系列 MCU 的 Flash 最小写入单位 由具体芯片型号决定，常见情况如下：

| MCU 系列         | 最小写入单位           |
| ---------------- | ---------------------- |
| STM32F0/F1/F3    | 半字（16-bit, 2 字节） |
| STM32F2/F4/F7/H7 | 字（32-bit, 4 字节）   |
| STM32L0/L1/L4/L5 | 字（32-bit, 4 字节）   |

Flash 写入前的擦除要求：

- Flash 在擦除前，默认状态是 `0xFFFF`（所有位为 1）
- Flash 只能从 `1` 变 `0`，不能直接从 `0` 变回 `1`
  - 这意味着在写入 Flash 前，如果目标地址已经写入过数据（非 `0xFFFF`），必须先擦除该区域。
  - Flash 的擦除最小单位是 页（Page）或扇区（Sector），不能单独擦除某个字节。
  - 擦除时，整个页（或扇区）都被重置为 `0xFFFF`，之后才能重新写入数据。

Flash 结构与存储方式：

- Flash 由多个 "页（Page）" 或 "扇区（Sector）" 组成：
  - STM32F1：按 Page（1KB/2KB） 进行擦除
  - STM32F4：按 Sector（16KB、64KB、128KB） 进行擦除
- 数据存储方式：
  - 16-bit 结构（STM32F1） → 每次写入 2 字节（半字）
  - 32-bit 结构（STM32F4） → 每次写入 4 字节（字）

### Flash 操作流程

STM32 Flash 操作主要包括**解锁、擦除、写入、锁定**四个步骤

#### 解锁 Flash

关键密钥：

- **RDPRT 密钥** = `0x000000A5`
- **KEY1** = `0x45670123`
- **KEY2** = `0xCDEF89AB`

解锁流程：

1. 设备复位后，FPEC 默认处于锁定状态，无法修改 `FLASH_CR`（Flash 控制寄存器）。
2. 依次向 `FLASH_KEYR` 寄存器写入 `KEY1` 和 `KEY2`，解锁 FPEC。
3. 如果写入顺序错误或发生非法操作，FPEC 和 `FLASH_CR` 将保持锁定状态，直到下一次复位。

加锁流程：

- 通过设置 `FLASH_CR` 寄存器中的 `LOCK` 位，可重新锁定 FPEC 和 `FLASH_CR`，防止 Flash 被修改。

#### 擦除 Flash

页擦除：擦除 Flash 存储器中的单个页（Page），使该页的所有数据变为 `0xFF`。

<img src="https://i.postimg.cc/63WJwDMk/image.png" alt="Image" data-zoomable width="80%;">

全擦除：擦除整个 Flash 存储器，恢复为 `0xFF`。

<img src="https://i.postimg.cc/GhZW9BMJ/image.png" alt="Image" data-zoomable width="80%;">

#### 编程（写入） Flash

<img src="https://i.postimg.cc/t4WL6Xw0/Flash.png" alt="Image" data-zoomable width="80%;">

####  锁定 Flash

为了防止 Flash 被意外写入，需要在完成 Flash 操作后锁定 Flash。

## 器件电子签名

器件电子签名是一种通过数字加密技术生成的唯一标识符，嵌入在电子设备中，用以验证设备的真伪和完整性。它不仅确保固件和软件在生产和更新过程中的安全性，防止未经授权的篡改，同时在设备身份认证和安全通信中发挥关键作用，从而保障整个系统的可靠运行。

- 闪存容量寄存器：

  -  基地址：0x1FFF F7E0

  -  大小：16位

- 产品唯一身份标识寄存器：

  -  基地址： 0x1FFF F7E8

  -  大小：96位

## 封装操作函数

下面是使用 STM32 HAL 库实现 Flash 解锁、擦除、写入和锁定的示例代码。

```c
#include "stm32f1xx_hal.h"

/**
  * @brief  将一个16位数据写入指定地址的 Flash（先擦除所在页，再写入）
  * @param  Address: 要写入的 Flash 地址（必须为页的起始地址，且对齐）
  * @param  Data: 要写入的16位数据
  * @retval 无
  */
void Flash_Write_Halfword(uint32_t Address, uint16_t Data)
{
    FLASH_EraseInitTypeDef EraseInitStruct;
    uint32_t PageError = 0;

    // 1. 解锁 Flash 以允许写入和擦除操作
    HAL_FLASH_Unlock();

    // 2. 擦除 Flash 页（以页为单位擦除，写入前必须擦除到 0xFFFF 状态）
    EraseInitStruct.TypeErase = FLASH_TYPEERASE_PAGES;  // 按页擦除
    EraseInitStruct.PageAddress = Address;              // 擦除的起始页地址
    EraseInitStruct.NbPages = 1;                          // 擦除 1 页
    if (HAL_FLASHEx_Erase(&EraseInitStruct, &PageError) != HAL_OK)
    {
        // 擦除操作失败，可根据需要添加错误处理代码
        HAL_FLASH_Lock();
        return;
    }

    // 3. 编程 Flash 数据，写入半字（16位数据写入）
    if (HAL_FLASH_Program(FLASH_TYPEPROGRAM_HALFWORD, Address, Data) != HAL_OK)
    {
        // 写入操作失败，可根据需要添加错误处理代码
        HAL_FLASH_Lock();
        return;
    }

    // 4. 锁定 Flash，防止意外的写入和擦除操作
    HAL_FLASH_Lock();
}
```

## 参考资料

<a href="https://www.bilibili.com/video/BV1th411z7sn/?spm_id_from=333.788.videopod.episodes&vd_source=fcbd8c5e9a46fc8723685feb30801506&p=48" target="_blank">[15-1\] FLASH闪存_哔哩哔哩_bilibili</a>
