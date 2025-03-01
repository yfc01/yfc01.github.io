---
title: "STM32中断" #标题
date: 2024-12-15T22:32:47+08:00 #创建时间
lastmod: 2024-12-15T22:32:47+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- embedded
tags: 
- STM32中断
description: "STM32中断介绍" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "STM32 interrupt"
draft: false # 是否为草稿
comments: true #是否展示评论
showToc: true # 显示目录
TocOpen: true # 自动展开目录
hidemeta: false # 是否隐藏文章的元信息，如发布日期、作者等
disableShare: true # 底部不显示分享栏
showbreadcrumbs: false #顶部显示当前路径
mermaid: true #是否开启mermaid
cover:
    image: "" #图片路径：posts/tech/文章1/picture.png
    caption: "" #图片底部描述
    alt: ""
    relative: false
---

## 前言

关于单片机中断的相关笔记内容在很早之前就已完成，只是恰好最近又使用到了相关知识，于是把之前的笔记重新整理了一遍上传到了博客。

## 中断

中断是一个适用范围很宽泛的概念，并不局限于嵌入式领域。就比如我写博客文章，突然来感觉了，想要上个厕所，因此我马上停下手上的工作去上厕所去了。在从写博客文章到上厕所行动的变化，就很符合中断的描述。下面用更加学术和严谨语句对中断进行重新描述。

对于单片机来说，**中断是指CPU正在处理某个事件A，发生了另一件事件B，请求CPU迅速去处理（中断发生）；CPU暂时停止当前的工作（中断响应），转去处理事件B（中断服务）；待CPU处理事件B完成后，再回到原来的事件A（断点）继续执行，这一过程称之为中断。**

> **中断的作用和意义：**
>
> 1.实时控制：在确定的时间内对相应事件做出相应；例如：温度控制；
>
> 2.故障处理：检测到故障，需要第一时间进行处理；
>
> 3.数据传输：不确定数据何时会来，利用中断进行控制；
>
> 中断的作用：高效处理紧急程序，并且不会占用CPU资源。

STM32 GPIO外部中断简图：

{{<mermaid>}}
flowchart LR
    GPIO --> AFIO --> EXTI --> NVIC --> CPU
{{</mermaid>}}

## NVIC

**NVIC**（嵌套向量中断控制器，Nested Vectored Interrupt Controller）是 ARM Cortex-M 系列处理器中专门用于管理和控制中断的模块。它支持中断优先级管理和中断嵌套，是 Cortex-M 系列处理器处理实时任务的核心部分。

以STM32为例，M3 内核都是支持 **256 个中断**，其中包含了 **16 个系统中断**和 **240 个外部中断**，并且具有 **256 级的可编程中断**设置。

NVIC支持：256个中断（16个内核+240个外部）；支持256个优先级。

但是对于ST公司来说，用不了M3内核中的所有中断以及中断优先级，进而对其进行了一定的裁剪。STM32中共有10个内核中断，60个外部中断，16个中断优先级。

 在中断的使用中还有一个极其重要的一部分为中断服务函数，中断服务函数是中断的入口。

### 中断向量表

**中断向量表**是嵌入式系统中断处理机制的核心部分，用于存储中断服务例程（ISR，Interrupt Service Routine）的入口地址。当中断发生时，处理器会通过中断向量表快速找到对应中断服务例程的地址，并跳转到该地址执行。

在STM32中系统已经将中断服务函数定义好了，放在中断向量表中，我们只需要进行调用即可。

Cortex-M3 中断向量表布局：

| **向量号** | **异常编号** | **名称**           | **描述**                                             |
| ---------- | ------------ | ------------------ | ---------------------------------------------------- |
| 0          | -            | MSP 初始值         | 存放主堆栈指针（Main Stack Pointer）的初始值。       |
| 1          | -15          | Reset              | 复位中断，指向复位处理函数，启动代码从这里开始。     |
| 2          | -14          | NMI Handler        | 非屏蔽中断（Non-Maskable Interrupt）。               |
| 3          | -13          | HardFault Handler  | 硬故障中断（处理严重错误）。                         |
| 4          | -12          | MemManage Handler  | 存储器管理故障中断（需要 MPU 支持）。                |
| 5          | -11          | BusFault Handler   | 总线故障中断（外设或存储器访问错误）。               |
| 6          | -10          | UsageFault Handler | 用法故障中断（非法指令或无效操作）。                 |
| 7~10       | -9~-6        | 保留               | 未使用（通常填充为默认处理函数）。                   |
| 11         | -5           | SVCall             | 系统服务调用中断（RTOS 常用）。                      |
| 12         | -4           | Debug Monitor      | 调试监控中断。                                       |
| 13         | -3           | 保留               | 未使用。                                             |
| 14         | -2           | PendSV             | 挂起的系统服务调用中断（RTOS 上下文切换常用）。      |
| 15         | -1           | SysTick            | 系统滴答定时器中断（周期性任务执行）。               |
| 16 及以上  | 0 及以上     | 外设中断（IRQ）    | 对应外设的中断服务例程（例如 USART、GPIO、ADC 等）。 |

### NVIC工作原理 

<img src="https://i.postimg.cc/cJrbkbcn/98097e9d76a1e3ba10587d4a2c7792f0.png" alt="Image" data-zoomable width="80%;"> 

> 当外部中断被触发时，首先进入ICER、ISER寄存器，用于控制是否开对应的中断，打开的中断进入IPR寄存器，进行中断优先级的判断，IPR寄存器受AIRCR寄存器控制，最后按照中断优先级依次进入CPU被执行。
>
> 内核中断由SHPR寄存器控制，SHPR与IPR寄存器属于同一级别。

### 中断优先级

中断优先级在嵌套中断系统中用于决定多个中断的处理顺序。Cortex-M 系列处理器的 NVIC（嵌套向量中断控制器）支持灵活的中断优先级配置，包括 **抢占优先级** 和 **响应优先级**，以及对它们的分组控制。

**抢占优先级（Preemption Priority）**

- **作用**：用于决定当前中断是否可以打断正在执行的其他中断。
- 规则：
  - 优先级数字越小，优先级越高。
  - 抢占优先级高的中断可以打断低抢占优先级的中断。
- 适用场景：时间敏感的任务（如系统定时器或硬件错误处理）。

**响应优先级（Subpriority）**

- **作用**：当抢占优先级相同时，用于决定中断的执行顺序。
- 规则：
  - 优先级数字越小，优先级越高。
  - 响应优先级仅影响顺序，不影响抢占能力。
- 适用场景：协调同一抢占级别的中断执行次序。

**自然优先级（Natural Priority）**

- **作用**：中断向量表中的固定顺序，未显式配置优先级时作为默认顺序。
- 规则：向量表中中断位置越靠前，自然优先级越高。
- 适用场景：应用程序未自定义中断优先级时。

通过配置 SCB 的 AIRCR 寄存器，可以设置抢占优先级和响应优先级的位数分配。

| **PRIGROUP 值** | **抢占优先级位数** | **响应优先级位数** | **说明**                       |
| --------------- | ------------------ | ------------------ | ------------------------------ |
| 0               | 0                  | 4                  | 无抢占优先级，仅响应优先级生效 |
| 1               | 1                  | 3                  | 1 位抢占优先级，3 位响应优先级 |
| 2               | 2                  | 2                  | 2 位抢占优先级，2 位响应优先级 |
| 3               | 3                  | 1                  | 3 位抢占优先级，1 位响应优先级 |
| 4               | 4                  | 0                  | 仅抢占优先级生效，无响应优先级 |

### NVIC相关寄存器

| **寄存器名称**  | **全称**                                         | **功能**                                             | **地址偏移** | **备注**                                                     |
| --------------- | ------------------------------------------------ | ---------------------------------------------------- | ------------ | ------------------------------------------------------------ |
| **ISER**        | Interrupt Set-Enable Register                    | 用于使能中断，将对应中断源设置为启用状态。           | `0xE000E100` | 每个位控制一个中断源，写 1 使能中断。                        |
| **ICER**        | Interrupt Clear-Enable Register                  | 用于禁用中断，将对应中断源设置为禁用状态。           | `0xE000E180` | 每个位控制一个中断源，写 1 禁用中断。                        |
| **ISPR**        | Interrupt Set-Pending Register                   | 将中断置为挂起状态，相当于触发一次中断请求。         | `0xE000E200` | 模拟中断触发，可用于调试。                                   |
| **ICPR**        | Interrupt Clear-Pending Register                 | 清除挂起状态，使挂起的中断恢复为非挂起状态。         | `0xE000E280` | 清除挂起的中断状态，写 1 生效。                              |
| **IABR**        | Interrupt Active Bit Register                    | 查看中断的活动状态，判断当前是否有中断正在执行。     | `0xE000E300` | 每个位表示一个中断的活动状态，读出为 1 表示中断正在活动。    |
| **IPR**         | Interrupt Priority Register                      | 设置中断优先级，支持分组抢占优先级和子优先级。       | `0xE000E400` | 每个中断有 1 字节用于配置优先级。                            |
| **VTOR** (SCB)  | Vector Table Offset Register                     | 设置中断向量表的基地址，用于支持中断向量表的重定位。 | `0xE000ED08` | 设置地址需对齐到 128 字节。                                  |
| **AIRCR** (SCB) | Application Interrupt and Reset Control Register | 设置优先级分组和系统复位。                           | `0xE000ED0C` | 使用 VECTKEY 键值 `0x05FA` 解锁，配置 PRIGROUP 控制优先级分组。 |

>1、ISER与ICER寄存器共有32*8=356,用于控制240个中断的打开与关闭。
>
>2、AIRCR寄存器，位10、9、8三位用于控制优先级的分组，三位共2*2*2=8种，取其中的5组作为中断优先级的分组情况。
>
>3、IPR寄存器，用于控制中断的优先级，包括抢占优先级与响应优先级，高4位控制，至于哪几位控制抢占，哪几位控制响应，由AIRCR寄存器说了算。

### 配置 TIM2 定时器中断

下面是一个 **STM32 NVIC（嵌套向量中断控制器）** 使用的简单示例，演示如何配置和使用中断。以 **TIM2（定时器2）** 中断为例，配置 NVIC 使能中断并设置优先级。

1. **初始化定时器（TIM2）**

   首先，我们需要初始化 **TIM2** 定时器，设置定时器的计数频率，并使能定时器的中断。

   ```c
   #include "stm32f10x.h"
   
   void TIM2_Config(void) {
       // 使能 TIM2 外设时钟
       RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM2, ENABLE);
   
       // 配置定时器 TIM2
       TIM_TimeBaseInitTypeDef TIM_InitStructure;
       TIM_InitStructure.TIM_Prescaler = 7199;   // 设置预分频器，定时器频率为 10kHz
       TIM_InitStructure.TIM_CounterMode = TIM_CounterMode_Up;
       TIM_InitStructure.TIM_Period = 999;       // 设置计数器最大值，计数周期为 100ms
       TIM_InitStructure.TIM_ClockDivision = TIM_CKD_DIV1;
       TIM_TimeBaseInit(TIM2, &TIM_InitStructure);
   
       // 使能 TIM2 更新中断
       TIM_ITConfig(TIM2, TIM_IT_Update, ENABLE);
   
       // 使能定时器 TIM2
       TIM_Cmd(TIM2, ENABLE);
   }
   ```

2. **配置 NVIC（中断控制器）**

    接下来，配置 **NVIC** 使能 **TIM2** 的中断，并设置其优先级。

    ```c
    void NVIC_Config(void) {
        // 配置 NVIC 中 TIM2 的优先级
        NVIC_InitTypeDef NVIC_InitStructure;
    
        // 设置中断优先级，抢占优先级为 1，响应优先级为 0
        NVIC_InitStructure.NVIC_IRQChannel = TIM2_IRQn;
        NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 1;  // 抢占优先级 1
        NVIC_InitStructure.NVIC_IRQChannelSubPriority = 0;         // 响应优先级 0
        NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;             // 使能 TIM2 中断
    
        // 配置 NVIC
        NVIC_Init(&NVIC_InitStructure);
    }
    ```

3. **中断处理函数**

    当 **TIM2** 计数器溢出时，会触发更新中断。中断服务函数 `TIM2_IRQHandler` 会处理此中断事件。

    ```c
    void TIM2_IRQHandler(void) {
        if (TIM_GetITStatus(TIM2, TIM_IT_Update) != RESET) {
            // 清除中断标志位
            TIM_ClearITPendingBit(TIM2, TIM_IT_Update);
    
            // 执行中断处理任务
            // 例如：切换LED状态
            GPIOA->ODR ^= GPIO_Pin_0;
        }
    }
    ```

4. **主程序**

   在主程序中，我们初始化 **TIM2** 和 **NVIC**，然后进入主循环。

   ```c
   int main(void) {
       // 系统初始化
       SystemInit();
   
       // 配置 GPIO（例如配置一个 LED 用来测试中断）
       GPIO_InitTypeDef GPIO_InitStructure;
       RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE);
       GPIO_InitStructure.GPIO_Pin = GPIO_Pin_0;
       GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;
       GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
       GPIO_Init(GPIOA, &GPIO_InitStructure);
   
       // 配置定时器 TIM2
       TIM2_Config();
   
       // 配置 NVIC
       NVIC_Config();
   
       while (1) {
           // 主循环：等待中断触发
       }
   }
   ```

5. **程序流程简述**

   1. **TIM2_Config**：初始化 **TIM2** 定时器，设置计数频率、计数周期以及使能更新中断。

   2. **NVIC_Config**：配置 **TIM2** 中断的优先级（抢占优先级为 1，响应优先级为 0）并使能中断。

   3. **TIM2_IRQHandler**：定时器中断服务程序，在中断发生时切换 LED 状态。

## EXIT

外部中断（External Interrupt）是指由外部硬件信号触发的中断，它与内部中断（如定时器中断、串口中断等）不同。外部中断通常是由外部设备的事件或外部引脚的状态变化所引发的。

1. **触发源**：外部中断通常由外部硬件事件触发，例如：
   - 按钮按下或释放
   - 外部传感器的变化
   - 外部通信接口的信号变化（如 UART、SPI）
   - 外部 GPIO 引脚的电平变化（如上升沿、下降沿触发）
2. **触发方式**：
   - **上升沿触发**：当外部信号由低电平跳变为高电平时触发中断。
   - **下降沿触发**：当外部信号由高电平跳变为低电平时触发中断。
   - **电平触发**：外部信号维持在某个电平（高或低）时触发中断。
3. **应用场景**：
   - 按键事件检测：例如，用户按下按钮时触发中断，执行相应操作。
   - 外部传感器事件：例如，外部传感器输出的变化（如温度、光照等）触发中断，进行数据采集。
   - 外部设备信号：例如，接收到外部设备的信号（如 UART 收到数据）时触发中断，进行数据处理。

接下来用stm32为例，对EXIT进行介绍。

### EXTI基本结构

<img src="https://i.postimg.cc/kMLw7ydx/EXIT.png" alt="Image" data-zoomable width="80%;">

每个外部中断源（如 GPIO 引脚）都通过对应的 EXTI 线路连接，并可以设置触发条件（如上升沿、下降沿或电平触发）。

### EXIT工作原理

<img src="https://i.postimg.cc/WbDct8KS/6fcbe27815207faf641aa82af5d0cb11.png" alt="Image" data-zoomable width="80%;">

**EXTI（外部中断/事件控制器）** 的结构可以按功能划分为四个主要部分，每个部分负责不同的控制任务。这些部分协同工作，通过外部输入线与内部电路的配合，实现外部中断和事件的处理。下面是每个部分的优化说明：

1. **输入线**：输入线是信号的接收端，可以通过配置寄存器将其映射到任意 GPIO 引脚，或者某些外设事件。输入线通常由电平变化的信号驱动，作为外部中断或事件的来源。
2. **边沿检测电路**：边沿检测电路通过 **上升沿触发选择寄存器** 和 **下降沿触发选择寄存器** 监控输入线的电平变化。当检测到边沿跳变时，电路输出有效信号（`1`）。该信号的有效性依赖于寄存器设置，即只有当输入信号符合所设定的触发条件时，边沿检测电路才会输出信号。
3. **或门电路**：或门电路接收来自 **软件中断事件寄存器** 和 **边沿检测电路** 的信号。如果任何一个输入端信号为 `1`，则输出为 `1`。该输出信号将传递到后续的两个电路（与门电路），并进一步影响中断和事件的处理。
4. **与门电路**：
   - **与门电路（标号3）**：该电路的输入来自 **中断屏蔽寄存器** 和 **边沿检测电路** 的输出信号。如果中断屏蔽寄存器为 `0`，则该电路输出为 `0`，即使边沿检测电路输出信号为 `1`，也不会触发中断。当中断屏蔽寄存器为 `1` 时，输出信号将由边沿检测电路决定，允许中断发生。
   - **与门电路（标号4）**：输入信号来自边沿检测电路和 **事件屏蔽寄存器**。事件屏蔽寄存器控制是否生成外部事件。如果事件屏蔽寄存器允许生成事件，则标号4电路输出信号为 `1`，触发脉冲发生器。
5. **脉冲发生器**：当标号4电路输出有效信号（`1`）时，脉冲发生器会产生一个脉冲信号。这个脉冲信号可以用于触发其他外设，如定时器（TIM）、模拟数字转换器（ADC）等，用来启动相关功能。

通过这些电路的配合，EXTI 控制器能够根据外部信号的变化生成中断请求或事件信号，并根据配置的优先级和触发条件进行处理。优化后的描述清晰地阐明了各个电路的作用，并强调了配置寄存器在中断和事件控制中的重要性。

### EXTI 线路

**EXTI 线路**是与 MCU 内部外设（如 GPIO 引脚）相关的中断线路，每个外部中断源都有一个对应的 **EXTI 线路**。每条 EXTI 线路可以关联一个 GPIO 引脚，并触发外部中断。

<img src="https://i.postimg.cc/mDyRTrP9/AFIO-IO.png" alt="Image" data-zoomable width="80%;">

EXTI支持配置20个中断和事件屏蔽位。

- GPIO端口连接到16个外部中断/事件线上，EXTI_Line0 — EXTI_Line15。
- EXTI_Line16 连接到PVD输出 。
- EXTI_Line17连接到RTC闹钟事件。
- EXTI_Line18连接到USB唤醒事件。
- EXTI_Line19连接到以太网唤醒事件(只适用于互联型产品)。

在关于GPIO端口的EXTI_Line0 — EXTI_Line15上，还有**AFIO**外设模块负责配置和管理引脚的替代功能。

**AFIO的主要功能**：

1. **引脚复用**：STM32 的 GPIO 引脚大多数是多功能的，可以通过 AFIO 控制将引脚功能切换到不同的外设功能（如 UART、SPI、TIM、I2C 等）。
2. **外部中断配置**：通过 AFIO，GPIO 引脚可以配置为外部中断源，支持多种触发方式（上升沿、下降沿、电平等）。
3. **调试功能**：AFIO 也用于配置调试接口（如 SWD 或 JTAG）引脚。

**常见寄存器**：

- **AFIO_MAPR**：用于映射外设到特定的 GPIO 引脚，控制外设引脚的功能选择。
- **AFIO_EXTICR**：用于配置外部中断的引脚映射。不同的引脚可以被映射到不同的 EXTI 线路。

### EXIT相关寄存器

| **寄存器名称** | **位域**   | **功能描述**                                                 |
| -------------- | ---------- | ------------------------------------------------------------ |
| **EXTI_IMR**   | EXTI_LineX | 中断屏蔽寄存器，控制外部中断的使能与屏蔽。`1`表示使能，`0`表示屏蔽。 |
| **EXTI_EMR**   | EXTI_LineX | 事件屏蔽寄存器，控制外部事件的使能与屏蔽。`1`表示使能，`0`表示屏蔽。 |
| **EXTI_RTSR**  | EXTI_LineX | 上升沿触发选择寄存器，设置外部中断为上升沿触发。`1`表示启用上升沿触发。 |
| **EXTI_FTSR**  | EXTI_LineX | 下降沿触发选择寄存器，设置外部中断为下降沿触发。`1`表示启用下降沿触发。 |
| **EXTI_SWIER** | EXTI_LineX | 软件中断请求寄存器，通过该寄存器软件触发外部中断。`1`表示触发该中断。 |
| **EXTI_PR**    | EXTI_LineX | 中断挂起寄存器，表示外部中断是否挂起。`1`表示该外部中断源已触发。 |
| **EXTI_IMR**   | EXTI_LineX | 中断使能寄存器，控制外部中断是否启用。`1`表示使能，`0`表示屏蔽。 |

详细说明：

1. **EXTI_IMR**（Interrupt Mask Register）：用于使能或屏蔽外部中断源。如果对应位为 `1`，表示该线路的外部中断被使能，否则屏蔽该中断源。
2. **EXTI_EMR**（Event Mask Register）：用于使能或屏蔽外部事件。如果对应位为 `1`，表示该线路的事件被使能，否则屏蔽该事件。
3. **EXTI_RTSR**（Rising Trigger Selection Register）：配置上升沿触发的中断。如果位为 `1`，表示外部中断线路在上升沿触发。
4. **EXTI_FTSR**（Falling Trigger Selection Register）：配置下降沿触发的中断。如果位为 `1`，表示外部中断线路在下降沿触发。
5. **EXTI_SWIER**（Software Interrupt Event Register）：通过软件触发外部中断。如果位为 `1`，表示触发该中断。
6. **EXTI_PR**（Pending Register）：表示外部中断是否已挂起。如果对应位为 `1`，表示外部中断已触发，处理中断后需要清除此标志。

这些寄存器与外部中断的配置密切相关，能够设置外部中断的使能、触发方式、挂起标志以及软件触发等功能。

### 配置外部中断

以下是一个使用 STM32 标准库实现外部中断的简单示例。该示例会将一个 GPIO 引脚配置为外部中断源，并触发一个中断服务程序（ISR）来响应外部事件。

**硬件要求：**

- 使用 STM32 开发板上的一个 GPIO 引脚（比如 **PA0**）作为外部中断源。
- 外部信号触发（例如，按键按下）。

**示例步骤：**

1. **配置系统时钟和外部中断引脚（GPIO PA0）**
2. **配置外部中断触发方式（例如，下降沿触发）**
3. **实现外部中断服务程序**

**示例代码：**

```c
#include "stm32f10x.h"

void GPIO_Configuration(void);
void NVIC_Configuration(void);
void EXTI_Configuration(void);

int main(void) {
    // 系统时钟配置
    SystemInit();
    
    // 配置 GPIO 和外部中断
    GPIO_Configuration();
    NVIC_Configuration();
    EXTI_Configuration();
    
    // 无限循环
    while (1) {
        // 主程序可以处理其他任务
    }
}

// 配置 GPIO 引脚为外部中断输入
void GPIO_Configuration(void) {
    GPIO_InitTypeDef GPIO_InitStructure;
    
    // 启用 GPIOA 时钟
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE);
    
    // 配置 PA0 为输入浮空（外部中断输入）
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_0;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IN_FLOATING;
    GPIO_Init(GPIOA, &GPIO_InitStructure);
}

// 配置外部中断的触发方式
void EXTI_Configuration(void) {
    EXTI_InitTypeDef EXTI_InitStructure;
    
    // 启用 EXTI 和 SYSCFG 时钟
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_AFIO, ENABLE);
    
    // 连接 EXTI Line0 到 GPIOA 的 PA0 引脚
    GPIO_EXTILineConfig(GPIO_PortSourceGPIOA, GPIO_PinSource0);
    
    // 配置 EXTI Line0 为下降沿触发
    EXTI_InitStructure.EXTI_Line = EXTI_Line0;
    EXTI_InitStructure.EXTI_Mode = EXTI_Mode_Interrupt;
    EXTI_InitStructure.EXTI_Trigger = EXTI_Trigger_Falling; // 下降沿触发
    EXTI_InitStructure.EXTI_LineCmd = ENABLE;
    EXTI_Init(&EXTI_InitStructure);
}

// 配置中断控制器（NVIC）
void NVIC_Configuration(void) {
    NVIC_InitTypeDef NVIC_InitStructure;
    
    // 配置外部中断的优先级
    NVIC_InitStructure.NVIC_IRQChannel = EXTI0_IRQn; // EXTI Line0 中断
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 0; // 抢占优先级
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 1; // 响应优先级
    NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&NVIC_InitStructure);
}

// 外部中断服务程序（EXTI Line0 中断）
void EXTI0_IRQHandler(void) {
    // 判断是否是 EXTI Line0 产生的中断
    if (EXTI_GetITStatus(EXTI_Line0) != RESET) {
        // 处理外部中断事件（例如，点亮一个 LED）
        // 在这里可以添加需要处理的代码
        
        // 清除 EXTI Line0 中断挂起标志
        EXTI_ClearITPendingBit(EXTI_Line0);
    }
}
```

**代码解析：**

1. **GPIO_Configuration()**: 配置 GPIO 引脚 PA0 为输入浮空模式，用于接收外部信号。
2. **EXTI_Configuration()**: 配置外部中断线路（EXTI Line0），并设置为下降沿触发。该中断源将连接到 PA0 引脚。
3. **NVIC_Configuration()**: 配置嵌套向量中断控制器（NVIC），为 EXTI Line0 中断配置优先级并使能该中断。
4. **EXTI0_IRQHandler()**: 这是外部中断服务程序，在外部中断触发时执行。如果 EXTI Line0 产生中断信号，ISR 将清除中断挂起标志并执行相应的处理。

**主要步骤：**

1. **配置 GPIO**：将 PA0 配置为输入浮空模式。
2. **配置 EXTI**：通过 **EXTI_Init()** 配置外部中断线路，并选择触发方式（下降沿）。
3. **配置 NVIC**：启用并配置外部中断的优先级。
4. **外部中断服务程序**：当外部信号变化触发 PA0 的下降沿时，进入中断服务程序进行处理。

**触发中断：**

按下连接到 PA0 的按键（假设是下降沿触发），会触发外部中断，执行相应的中断服务程序。

## 参考连接

<a href="https://blog.csdn.net/m0_56399733/article/details/134979299" target="_blank">STM32--中断使用（超详细！）_stm32中断-CSDN博客</a>

<a href="https://www.bilibili.com/video/BV1th411z7sn?p=11&vd_source=fcbd8c5e9a46fc8723685feb30801506" target="_blank">[5-1\] EXTI外部中断_哔哩哔哩_bilibili</a>

<a href="https://blog.csdn.net/u010632165/article/details/104544622" target="_blank">STM32 外部中断详解（原理+配置代码）_stm32外部中断代码-CSDN博客</a>
