---
title: "Sqlserver案例题" #标题
date: 2024-10-15T22:08:45+08:00 #创建时间
lastmod: 2024-10-15T22:08:45+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- database
tags: 
- sql server
description: "实现一个sqlserver的数据库案例" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "SQL Server Case Study Question"
draft: false # 是否为草稿
comments: true #是否展示评论
showToc: true # 显示目录
TocOpen: true # 自动展开目录
hidemeta: false # 是否隐藏文章的元信息，如发布日期、作者等
disableShare: true # 底部不显示分享栏
showbreadcrumbs: false #顶部显示当前路径
cover:
    image: "https://ts1.cn.mm.bing.net/th/id/R-C.e5b8326df26905f8cdf597d6143ce4ce?rik=yoc1hVmLZWdxNQ&riu=http%3a%2f%2fa766.com%2fuploads%2fallimg%2f221123%2f1-221123110K70-L.jpg&ehk=n3PK6TBXr3cEmLI%2fQ5iRg4pJfbK6%2fPXJLD2e8dCcys8%3d&risl=&pid=ImgRaw&r=0" #图片路径：posts/tech/文章1/picture.png
    caption: "" #图片底部描述
    alt: ""
    relative: falsew
---

## 前言

接下来将通过sql server实现一个企业订单数据库。

## 案例题目

### 一、创建一个数据库，路径在非系统盘下

### 二、往数据库创建表

- 企业管理器创建

  1. 商品资料表：商品编码（主键），名称，规格，厂家，条码，税率

  2. 企业资料表：企业编码（主键），名称，联系人，联系人电话

  3. 库存表：创建商品库存表，关联商品信息表查询库存信息

- 用SQL语句创建订单表
  1. 订单汇总：订单号，订单类型，企业编码，订单总金额，订单条目，订单日期，订单时间，订单备注，创建人
  2. 订单明细项：订单号，序号，商品编码，数量，单价，金额，税额，税率
  3. 采购订单汇总tmp：企业编码，订单总金额，订单条目，订单日期，订单时间，订单备注，创建人
  4. 采购订单明细项tmp：序号，商品编码，数量，单价，金额，税额，税率
  5. 销售订单汇总tmp：企业编码，订单总金额，订单条目，订单日期，订单时间，订单备注，创建人
  6. 销售订单明细项tmp：序号，商品编码，数量，单价，金额，税额，税率

### 三、创建存储过程

- 创建一个订单号自动递增获取存储过程，供生成订单时调用

  1. 采购订单GUA，销售订单XSA

    单号示例：GUA000001，GUA为订单标识，000001为递增值

- 往tmp表中插入采购单数据、销售数据

  1. 创建一个登记采购单数据的存储过程，将tmp表数据登记到【订单汇总、订单明细项】，并增加库存表数量
  2. 创建一个登记销售单数据的，存储过程，将tmp表数据登记到【订单汇总、订单明细项】，并减少库存表数量

- 分别创建采购订单、销售订单

  1. 明细表登记要求5条明细
  2. 登记3份采购订单，2份销售订单

  3. 查询最终库存结果

### 四、数据库备份

- 创建一个数据库备份任务，备份到非系统盘，备份后缀位DLL，设定每天12点备份一次

## 案例实现

### 一、创建一个数据库，路径在非系统盘下

```sql
CREATE DATABASE EnterpriseDB 
ON PRIMARY 
(
    NAME = N'EnterpriseDB_Data', 
    FILENAME = 'D:\software\Microsoft SQL Server Management Studio 20\database\EnterpriseDB_Data.mdf',  -- 修改为非系统盘路径
    SIZE = 10MB, 
    MAXSIZE = 100MB, 
    FILEGROWTH = 5MB
)
LOG ON 
(
    NAME = N'EnterpriseDB_Log', 
    FILENAME = 'D:\software\Microsoft SQL Server Management Studio 20\database\EnterpriseDB_Data.ldf',  -- 修改为非系统盘路径
    SIZE = 5MB, 
    MAXSIZE = 50MB, 
    FILEGROWTH = 5MB
);
```

### 二、往数据库创建表

- 进入EnterpriseDB数据库

  ```sql
  use EnterpriseDB	-- 进入EnterpriseDB数据库
  SELECT DB_NAME() AS CurrentDatabase;	-- 查询当前所在数据库
  ```

- 企业管理器创建

  1. 商品资料表：商品编码（主键），名称，规格，厂家，条码，税率

     ```sql
     CREATE TABLE 商品资料表 (
         商品编码 INT PRIMARY KEY,
         名称 NVARCHAR(50),
         规格 NVARCHAR(50),
         厂家 NVARCHAR(50),
         条码 NVARCHAR(20),
         税率 DECIMAL(5, 2)
     );
     ```

     测试数据：

     ```sql
     INSERT INTO 商品资料表 (商品编码, 名称, 规格, 厂家, 条码, 税率) 
     VALUES 
     (1, '智能手机', '6.1英寸', 'ABC科技', '123456789012', 13.00),
     (2, '笔记本电脑', '15.6英寸', 'XYZ电子', '987654321098', 16.00);
     ```

  2. 企业资料表：企业编码（主键），名称，联系人，联系人电话

     ```sql
     CREATE TABLE 企业资料表 (
         企业编码 INT PRIMARY KEY,
         名称 NVARCHAR(100),
         联系人 NVARCHAR(50),
         联系人电话 NVARCHAR(15)
     );
     ```

     测试数据：

     ```sql
     INSERT INTO 企业资料表 (企业编码, 名称, 联系人, 联系人电话) 
     VALUES 
     (101, '杭州科技有限公司', '王先生', '18812345678'),
     (102, '上海电子商贸公司', '李小姐', '17798765432');
     ```

  3. 库存表：创建商品库存表，关联商品信息表查询库存信息

     ```sql
     CREATE TABLE 库存表 (
         商品编码 INT,
         企业编码 INT,
         库存数量 INT,
         PRIMARY KEY (商品编码, 企业编码),
         FOREIGN KEY (商品编码) REFERENCES 商品资料表(商品编码),
         FOREIGN KEY (企业编码) REFERENCES 企业资料表(企业编码)
     );
     ```

     测试数据：

     ```sql
     INSERT INTO 库存表 (商品编码, 企业编码, 库存数量) 
     VALUES 
     (1, 101, 10),  -- 杭州科技有限公司的智能手机库存 50 台
     (2, 101, 10),  -- 上海电子商贸公司的笔记本电脑库存 30 台
     (1, 102, 10),  -- 杭州科技有限公司的智能手机库存 50 台
     (2, 102, 10);  -- 上海电子商贸公司的笔记本电脑库存 30 台
     ```

- 用SQL语句创建订单表

  1. 订单汇总：订单号，订单类型，企业编码，订单总金额，订单条目，订单日期，订单时间，订单备注，创建人

     ```sql
     CREATE TABLE 订单汇总 (
         订单号 NVARCHAR(20) PRIMARY KEY,
         订单类型 NVARCHAR(10),
         企业编码 INT REFERENCES 企业资料表(企业编码),
         订单总金额 DECIMAL(10, 2),
         订单条目 INT,
         订单日期 DATE,
         订单时间 TIME,
         订单备注 NVARCHAR(200),
         创建人 NVARCHAR(50)
     );
     ```

  2. 订单明细项：订单号，序号，商品编码，数量，单价，金额，税额，税率

     ```sql
     CREATE TABLE 订单明细项 (
         订单号 NVARCHAR(20),
         序号 INT,
         商品编码 INT REFERENCES 商品资料表(商品编码),
         数量 INT,
         单价 DECIMAL(10, 2),
         金额 DECIMAL(10, 2),
         税额 DECIMAL(10, 2),
         税率 DECIMAL(5, 2),
         PRIMARY KEY (订单号, 序号)
     );
     ```

  3. 采购订单汇总tmp：企业编码，订单总金额，订单条目，订单日期，订单时间，订单备注，创建人

     ```sql
     CREATE TABLE 采购订单汇总_tmp (
         订单号 NVARCHAR(20) PRIMARY KEY,  -- 将标识码设置为主键
         企业编码 INT,
         订单总金额 DECIMAL(10, 2),
         订单条目 INT,
         订单日期 DATE,
         订单时间 TIME,
         订单备注 NVARCHAR(200),
         创建人 NVARCHAR(50)
     );
     ```
  
  4. 采购订单明细项tmp：序号，商品编码，数量，单价，金额，税额，税率
  
     ```sql
     CREATE TABLE 采购订单明细项_tmp (
         序号 INT IDENTITY(1,1) PRIMARY KEY,
         订单号 NVARCHAR(20),  -- 外键用于关联
         商品编码 INT,
         数量 INT,
         单价 DECIMAL(10, 2),
         金额 DECIMAL(10, 2),
         税额 DECIMAL(10, 2),
         税率 DECIMAL(5, 2),
         FOREIGN KEY (订单号) REFERENCES 采购订单汇总_tmp(订单号)  -- 通过标识码关联
     );
     ```
  
  5. 销售订单汇总tmp：企业编码，订单总金额，订单条目，订单日期，订单时间，订单备注，创建人
  
     ```sql
     CREATE TABLE 销售订单汇总_tmp (
         订单号 NVARCHAR(20) PRIMARY KEY,  -- 将标识码设置为主键
         企业编码 INT,  
         订单总金额 DECIMAL(10, 2),
         订单条目 INT,
         订单日期 DATE,
         订单时间 TIME,
         订单备注 NVARCHAR(200),
         创建人 NVARCHAR(50)
     );
     ```
  
  6. 销售订单明细项tmp：序号，商品编码，数量，单价，金额，税额，税率
  
     ```sql
     CREATE TABLE 销售订单明细项_tmp (
         序号 INT IDENTITY(1,1) PRIMARY KEY,
         订单号 NVARCHAR(20),  -- 外键用于关联
         商品编码 INT,
         数量 INT,
         单价 DECIMAL(10, 2),
         金额 DECIMAL(10, 2),
         税额 DECIMAL(10, 2),
         税率 DECIMAL(5, 2),
         FOREIGN KEY (订单号) REFERENCES 销售订单汇总_tmp(订单号)  -- 通过标识码关联
     );
     ```

### 三、创建存储过程

- 创建一个订单号自动递增获取存储过程，供生成订单时调用

  1. 采购订单GUA，销售订单XSA

     单号示例：GUA000001，GUA为订单标识，000001为递增值

     ```sql
     CREATE PROCEDURE 获取订单号 
         @订单类型 NVARCHAR(3),  -- 订单类型 (GUA 或 XSA)
         @订单号 NVARCHAR(10) OUTPUT  -- 输出参数：生成的订单号
     AS
     BEGIN
         DECLARE @递增值 INT;
     
         -- 查找当前订单类型的最大订单号并递增1
         SELECT @递增值 = ISNULL(MAX(CAST(RIGHT(订单号, 6) AS INT)), 0) + 1
         FROM 订单汇总
         WHERE LEFT(订单号, 3) = @订单类型;
     
         -- 格式化订单号：例如 GUA000001 或 XSA000001
         SET @订单号 = @订单类型 + RIGHT('000000' + CAST(@递增值 AS NVARCHAR(6)), 6);
     END;
     ```
     
     测试存储过程：
     
     ```sql
     DECLARE @新订单号 NVARCHAR(10);  -- 声明一个变量来接收输出参数
     
     -- 调用存储过程
     EXEC 获取订单号 @订单类型 = 'XSA', @订单号 = @新订单号 OUTPUT;
     
     -- 查看生成的订单号
     SELECT @新订单号 AS 生成的订单号;
     ```

- 往tmp表中插入采购单数据、销售数据

  1. 创建一个登记采购单数据的存储过程，将tmp表数据登记到【订单汇总、订单明细项】，并增加库存表数量

     ```sql
     CREATE PROCEDURE 登记采购订单
     @订单号 NVARCHAR(10)  -- 输入参数
     AS
     BEGIN
         -- 插入订单汇总数据
         INSERT INTO 订单汇总 (订单号, 订单类型, 企业编码, 订单总金额, 订单条目, 订单日期, 订单时间, 订单备注, 创建人)
         SELECT @订单号, 'GUA', 企业编码, 订单总金额, 订单条目, 订单日期, 订单时间, 订单备注, 创建人
         FROM 采购订单汇总_tmp WHERE 订单号 = @订单号;
     
         -- 插入订单明细项数据并增加库存
         INSERT INTO 订单明细项 (订单号, 序号, 商品编码, 数量, 单价, 金额, 税额, 税率)
         SELECT @订单号, 序号, 商品编码, 数量, 单价, 金额, 税额, 税率
         FROM 采购订单明细项_tmp WHERE 订单号 = @订单号;
     
         -- 更新库存：增加数量
         UPDATE k
         SET k.库存数量 = k.库存数量 + tmp.数量
         FROM 库存表 k
         INNER JOIN 采购订单明细项_tmp tmp ON k.商品编码 = tmp.商品编码
         INNER JOIN 采购订单汇总_tmp wh ON k.企业编码 = wh.企业编码
     	WHERE wh.订单号 = tmp.订单号;
     END;
     ```

     测试存储过程：

     ```sql
     -- 声明变量 @新订单号
     DECLARE @新订单号 NVARCHAR(10);  
     
     -- 调用存储过程来获取订单号，并将结果存储在 @新订单号 中
     EXEC 获取订单号 @订单类型 = 'GUA', @订单号 = @新订单号 OUTPUT;
     
     -- 插入采购订单汇总测试数据，使用 @新订单号 变量
     INSERT INTO 采购订单汇总_tmp (订单号, 企业编码, 订单总金额, 订单条目, 订单日期, 订单时间, 订单备注, 创建人)
     VALUES
     (@新订单号, 101, 10000.00, 1, '2024-10-16', '10:00:00', '电子产品采购', '张三');
     
     -- 插入采购订单明细项测试数据，使用 @新订单号 变量
     INSERT INTO 采购订单明细项_tmp (订单号, 商品编码, 数量, 单价, 金额, 税额, 税率)
     VALUES
     (@新订单号, 1, 10, 500.00, 5000.00, 500.00, 0.10),
     (@新订单号, 2, 10, 500.00, 5000.00, 500.00, 0.10);
     
     -- 调用存储过程登记采购订单，传入 @新订单号 变量
     EXEC 登记采购订单 @订单号 = @新订单号;
     ```

  2. 创建一个登记销售单数据的，存储过程，将tmp表数据登记到【订单汇总、订单明细项】，并减少库存表数量

     ```sql
     CREATE PROCEDURE 登记销售订单
     @订单号 NVARCHAR(10)  -- 输入参数
     AS
     BEGIN
         -- 插入订单汇总数据
         INSERT INTO 订单汇总 (订单号, 订单类型, 企业编码, 订单总金额, 订单条目, 订单日期, 订单时间, 订单备注, 创建人)
         SELECT @订单号, 'XSA', 企业编码, 订单总金额, 订单条目, 订单日期, 订单时间, 订单备注, 创建人
         FROM 销售订单汇总_tmp WHERE 订单号 = @订单号;
     
         -- 插入订单明细项数据并减少库存
         INSERT INTO 订单明细项 (订单号, 序号, 商品编码, 数量, 单价, 金额, 税额, 税率)
         SELECT @订单号, 序号, 商品编码, 数量, 单价, 金额, 税额, 税率
         FROM 销售订单明细项_tmp WHERE 订单号 = @订单号;
     
         -- 更新库存：减少数量
         UPDATE k
         SET k.库存数量 = k.库存数量 - tmp.数量
         FROM 库存表 k
         INNER JOIN 销售订单明细项_tmp tmp ON k.商品编码 = tmp.商品编码
         INNER JOIN 销售订单汇总_tmp wh ON k.企业编码 = wh.企业编码
     	WHERE wh.订单号 = tmp.订单号;
     END;
     ```
     
     测试存储过程：
     
     ```sql
     -- 声明变量 @新订单号
     DECLARE @新订单号 NVARCHAR(10);  
     
     -- 调用存储过程来获取订单号，并将结果存储在 @新订单号 中
     EXEC 获取订单号 @订单类型 = 'XSA', @订单号 = @新订单号 OUTPUT;
     
     -- 插入销售订单汇总测试数据，使用 @新订单号 变量
     INSERT INTO 销售订单汇总_tmp (订单号, 企业编码, 订单总金额, 订单条目, 订单日期, 订单时间, 订单备注, 创建人)
     VALUES
     (@新订单号, 101, 10000.00, 1, '2024-10-16', '10:00:00', '电子产品采购', '张三');
     
     -- 插入销售订单明细项测试数据，使用 @新订单号 变量
     INSERT INTO 销售订单明细项_tmp (订单号, 商品编码, 数量, 单价, 金额, 税额, 税率)
     VALUES
     (@新订单号, 1, 10, 500.00, 5000.00, 500.00, 0.10),
     (@新订单号, 2, 10, 500.00, 5000.00, 500.00, 0.10);
     
     -- 调用存储过程登记销售订单，传入 @新订单号 变量
     EXEC 登记销售订单 @订单号 = @新订单号;
     ```

- 分别创建采购订单、销售订单

  1. 明细表登记要求5条明细

  2. 登记3份采购订单，2份销售订单

  3. 查询最终库存结果

     ```sql
     -- 创建采购订单、销售订单如上测试数据
     ```

### 四、数据库备份

- 创建一个数据库备份任务，备份到非系统盘，备份后缀位DLL，设定每天12点备份一次

  ```sql
  -- 1. 确保删除旧的作业和计划（如果存在）
  EXEC msdb.dbo.sp_delete_job @job_name = '每日数据库备份', @delete_unused_schedule = 1;
  
  -- 2. 创建数据库备份作业
  EXEC msdb.dbo.sp_add_job 
      @job_name = '每日数据库备份',  
      @enabled = 1,  -- 启用作业
      @description = '每天12点备份数据库到非系统盘',
      @start_step_id = 1,  
      @category_name = 'Database Maintenance';
  
  -- 3. 添加作业步骤，执行数据库备份操作
  EXEC msdb.dbo.sp_add_jobstep 
      @job_name = '每日数据库备份',
      @step_name = '备份数据库',
      @subsystem = 'TSQL',
      @command = 'BACKUP DATABASE EnterpriseDB TO DISK = ''D:\test\EnterpriseDB_Backup.dll'' WITH INIT',
      @retry_attempts = 1,  
      @retry_interval = 5;  -- 重试间隔（分钟）
  
  -- 4. 创建每日调度计划（每天12点执行）
  EXEC msdb.dbo.sp_add_schedule 
      @schedule_name = '每日12点备份',
      @freq_type = 4,  -- 每天
      @freq_interval = 1,  -- 每天一次
      @active_start_time = 120000;  -- 12:00 PM
  
  -- 5. 将调度计划关联到作业
  EXEC msdb.dbo.sp_attach_schedule 
      @job_name = '每日数据库备份',
      @schedule_name = '每日12点备份';
  
  -- 6. 将作业添加到 SQL Server 代理
  EXEC msdb.dbo.sp_add_jobserver 
      @job_name = '每日数据库备份';
  
  -- 7. 检查 D:\SQLBackups\ 是否存在并具有写权限
  -- 如果文件夹不存在，请确保手动创建，并授予SQL Server服务账号写权限
  ```
  
  