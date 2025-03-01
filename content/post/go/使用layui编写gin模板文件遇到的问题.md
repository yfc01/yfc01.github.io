---
title: "使用layui编写gin模板文件遇到的问题" #标题
date: 2024-11-10T16:51:30+08:00 #创建时间
lastmod: 2024-11-17T16:51:30+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- go
tags: 
- gin
- layui
description: "使用layui编写gin模板文件遇到的问题与解决思路" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "Issues encountered when using layui to write Gin template files"
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

##  gin加载HTML模板文件

### 加载错误

在gin项目中，常常会通过`router.LoadHTMLGlob()`来对html模板文件进行渲染。

```go
router.LoadHTMLGlob("resources/views/**/*")	//使用了双星号通配符，意味着会递归查找**resources/views** 目录下的所有子目录和文件。
```

上面代码块中的代码，如果文件目录中既有html文件又有文件目录，便会产生错误。比如下面的文件目录树：

```cmd
views
├── admin
│   ├── adminHome.html
│   └── test
│       └── test.html
└── user
    ├── home.html
    ├── login.html
    └── register.html
```

### 解决方法

#### 方法一（推荐）

使用`filepath.WalkDir`获取文件目录，在通过`LoadHTMLFiles()`加载模板文件，可以应付各种文件目录结构。在这里必须得吐槽一下，通过`router.LoadHTMLGlob()`加载模板文件会遇到各种奇奇怪怪的问题，让人头大。通过filepath.WalkDir + LoadHTMLFiles() 的方式加载模板的示例代码如下：

```go
// 模板文件加载
var tplFiles []string
filepath.WalkDir("templates", func(path string, d fs.DirEntry, err error) error {
    if !d.IsDir() && strings.HasSuffix(d.Name(), ".html") {
        // 非目录,且是.html结尾的文件加入到模板文件列表
        tplFiles = append(tplFiles, path)
    }
    return nil
})

r.LoadHTMLFiles(tplFiles...) // 加载html模板
```

#### 解决办法二（不推荐）

这里说明一下为什么不推荐，因为使用方法一可以应对各种文件目录结构，而方法二为了将文件目录结构规范成符合`router.LoadHTMLGlob()`的使用条件会丧失一定的可读性。

方法二非常简单，将文件目录结构改成如下所示：

```cmd
views
├── test
│   ├── test.html
├── admin
│   ├── adminHome.html
└── user
    ├── home.html
    ├── login.html
    └── register.html
```

### 缺点

上述方法一的做法并不是没有缺点的。在实际加载的过程中`router.LoadHTMLGlob()`比`LoadHTMLFiles()`更加严格，比如html文件中出现`{{}}`代码会变判断成go中分隔符，可能会导致加载错误。在使用layui编写模板文件的时候我就遇到过，就比如以下代码。

```html
<span>{{= d.lineStyle ? '多行' : '单行' }}模式</span>
```

`LoadHTMLFiles()`会成功加载，但是在通过路由加载任意模板文件会出现报错。

## 模板文件分隔符冲突问题

自定义分隔符

```go
r := gin.Default()
	r.Delims("{[{", "}]}")
	r.LoadHTMLGlob("/path/to/templates")
```

## 管理界面外层框架构建

在这里我综合了 <a href="https://github.com/C-GY/Y-Admin.git" target="_blank">GitHub - C-GY/Y-Admin: 🐳基于layui的管理系统模板，代码易读易懂，结构清晰，界面简洁美观。</a> 和 <a href="https://layui.dev/" target="_blank">Layui - 极简模块化前端 UI 组件库(官方文档)</a> 关于后台管理界面的代码。话不多说，直接给出代码。

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>layout 管理界面大布局示例 - Layui</title>
    <meta name="renderer" content="webkit">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="./layui/css/layui.css" rel="stylesheet">
</head>

<body>
    <div class="layui-layout layui-layout-admin">
        <div class="layui-layout layui-layout-admin">
            <!-- 头部区域 -->
            <div class="layui-header">
                <!-- LOGO 区域 -->
                <div class="layui-logo layui-hide-xs layui-bg-black">layout demo</div>
                <!-- 左侧导航 -->
                <ul class="layui-nav layui-layout-left">
                    <!-- 移动端显示的左侧菜单切换按钮 -->
                    <li class="layui-nav-item layui-show-xs-inline-block layui-hide-sm" lay-header-event="menuLeft">
                        <i class="layui-icon layui-icon-spread-left"></i>
                    </li>
                    <!-- 普通导航菜单 -->
                    <li class="layui-nav-item layui-hide-xs"><a href="javascript:;">nav 1</a></li>
                    <li class="layui-nav-item layui-hide-xs"><a href="javascript:;">nav 2</a></li>
                    <li class="layui-nav-item layui-hide-xs"><a href="javascript:;">nav 3</a></li>
                    <li class="layui-nav-item">
                        <a href="javascript:;">nav groups</a>
                        <!-- 子菜单 -->
                        <dl class="layui-nav-child">
                            <dd><a href="javascript:;">menu 11</a></dd>
                            <dd><a href="javascript:;">menu 22</a></dd>
                            <dd><a href="javascript:;">menu 33</a></dd>
                        </dl>
                    </li>
                </ul>
                <!-- 右侧用户菜单 -->
                <ul class="layui-nav layui-layout-right">
                    <!-- 用户信息和头像 -->
                    <li class="layui-nav-item layui-hide layui-show-sm-inline-block">
                        <a href="javascript:;">
                            <img src="./icon-v2.png" class="layui-nav-img"> tester
                        </a>
                        <dl class="layui-nav-child">
                            <dd><a href="javascript:;">Your Profile</a></dd>
                            <dd><a href="javascript:;">Settings</a></dd>
                            <dd><a href="javascript:;">Sign out</a></dd>
                        </dl>
                    </li>
                    <!-- 右侧菜单按钮 -->
                    <li class="layui-nav-item" lay-header-event="menuRight" lay-unselect>
                        <a href="javascript:;">
                            <i class="layui-icon layui-icon-more-vertical"></i>
                        </a>
                    </li>
                </ul>
            </div>

            <!-- 左侧导航区域 -->
            <div class="layui-side layui-bg-black">
                <div class="layui-side-scroll">
                    <ul class="layui-nav layui-nav-tree" lay-filter="lay-nav">
                        <li class="layui-nav-item layui-nav-itemed">
                            <a href="javascript:;" lay-id="#" lay-url="#">menu group 1</a>
                            <dl class="layui-nav-child">
                                <dd><a href="javascript:;" lay-id="test2" lay-url="test2.html">test2</a></dd>
                                <dd><a href="javascript:;">menu 2</a></dd>
                                <dd><a href="javascript:;">menu 3</a></dd>
                            </dl>
                        </li>
                        <li class="layui-nav-item"><a href="javascript:;" lay-id="test1" lay-url="test1.html">test1</a>
                        </li>
                        <li class="layui-nav-item"><a href="javascript:;">the links</a></li>
                    </ul>
                </div>
            </div>

            <!-- 主体内容区域 -->
            <div class="layui-body">
                <div class="layui-pagetabs">
                    <div class="layui-tab" lay-allowclose="true" lay-filter="lay-tab">
                        <ul class="layui-tab-title">
                            <!-- 默认打开的首页标签页 -->
                            <li lay-id="home" lay-url="home.html" class="layui-this">
                                <i class="layui-icon layui-icon-home"></i>
                            </li>
                        </ul>
                        <div class="layui-tab-content">
                            <div class="layui-tab-item layui-show">
                                <iframe src="home.html" class="layui-iframe"></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 底部区域 -->
            <div class="layui-footer">底部固定区域</div>
        </div>

        <script src="./layui/layui.js"></script>
        <script>
            //JS 
            layui.use(['element', 'layer'], function () {
                var element = layui.element;
                var layer = layui.layer;
                var $ = layui.$;

                // 导航和标签页相关的变量
                var navLayFilter = "lay-nav";
                var tabLayFilter = "lay-tab";
                var rememberTab = true;
                var tabList = [];
                var tabsSelector = ".layui-pagetabs .layui-tab-title li[lay-id]";

                // 用于管理 Tab 页的事件处理对象
                var event = {
                    /**
                     * 添加一个新的 Tab 页
                     * @param {Object} o - 包含 Tab 信息的对象
                     * o.id: Tab 的唯一标识符
                     * o.url: Tab 页 iframe 的 URL 地址
                     * o.title: Tab 页的显示标题
                     */
                    tabAdd: function (o) {
                        // 提取传入对象中的 id、url、title 属性
                        var id = o.id;
                        var url = o.url;
                        var title = o.title;

                        // 检查是否已经存在相同 id 的 Tab
                        if (!this.tabExist(id)) {
                            // 如果不存在，则新增一个 Tab 项
                            element.tabAdd(tabLayFilter, {
                                id: id, // 设置 Tab 的唯一 id
                                title: title, // 设置 Tab 的标题
                                // Tab 页内容为一个 iframe，加载指定的 url
                                content: "<iframe data-frame-id='" + id + "' class='layui-iframe' src='" + url + "'></iframe>"
                            });

                            // 如果启用了记忆功能（rememberTab 为 true），将 Tab 信息存入 sessionStorage
                            if (rememberTab) {
                                // 将当前 Tab 的信息（id、title、url）存入 tabList 数组
                                tabList.push({
                                    id: id,
                                    title: title,
                                    url: url
                                });
                                // 将更新后的 tabList 保存到 sessionStorage，以便下次页面加载时恢复
                                sessionStorage.setItem("tabs", JSON.stringify(tabList));
                            }
                        }

                        // 切换到新打开的 Tab 页
                        element.tabChange(tabLayFilter, id);
                    },

                    /**
                     * 检查指定的 Tab 是否已经存在
                     * @param {string} id - 要检查的 Tab 的唯一 id
                     * @returns {boolean} - 如果 Tab 存在则返回 true，否则返回 false
                     */
                    tabExist: function (id) {
                        var isExist = false; // 初始化一个标识变量

                        // 遍历所有已存在的 Tab 项，检查是否有匹配的 id
                        $.each($(tabsSelector), function () {
                            // 如果找到匹配的 id，设置标识变量为 true，并中断循环
                            if ($(this).attr("lay-id") === id) {
                                isExist = true;
                                return false; // 退出循环
                            }
                        });

                        // 返回检查结果（存在为 true，不存在为 false）
                        return isExist;
                    },

                    /**
                     * 切换到指定的 Tab 页
                     * @param {string} id - 要切换到的 Tab 的唯一 id
                     */
                    tabChange: function (id) {
                        // 使用 layui 的 tabChange 方法切换到指定的 Tab
                        element.tabChange(tabLayFilter, id);
                    }
                };


                // 获取页面上所有的标有 lay-event 的元素，点击时执行相应的事件。
                $(document).on("click", "*[lay-event]", function () {
                    // 获取被点击元素的 lay-event 属性值
                    var layEvent = $(this).attr("lay-event");

                    // 如果 yadmin 对象中存在以 event 名称命名的方法，则调用该方法
                    if (typeof event[layEvent] === "function") {
                        event[layEvent].apply(this);
                    }
                });

                element.on("nav(" + navLayFilter + ")", function (elem) {

                    // 判断lay-id如果为#则为菜单
                    if ($(this).attr("lay-id") == "#") {
                        return; // 阻止进一步操作
                    }

                    // 如果没有子目录，则执行页面切换操作
                    if ($(elem).find("span.layui-nav-more").length === 0) {
                        var obj = $(this);
                        var title = obj.find("cite").html();
                        var id = obj.attr("lay-id");
                        var url = obj.attr("lay-url");

                        // 添加标签页
                        event.tabAdd({
                            id: id,
                            title: title,
                            url: url
                        });
                    }
                });

                // 点击标签卡定位菜单
                element.on("tab(" + tabLayFilter + ")", function (elem) {
                    var id = $(this).attr("lay-id");
                    var navElem = $(".layui-nav[lay-filter='" + navLayFilter + "']"); //菜单导航元素
                    //移除所有选中、获取当前tab选择导航、标注选中样式、展开条目
                    navElem.find("li, dd").removeClass("layui-this").find("a[lay-id='" + id + "']").parent().first().addClass("layui-this").parents("li,dd").addClass("layui-nav-itemed");

                    if (rememberTab) {
                        sessionStorage.setItem("currentTabId", id);
                    }
                });

                // 监听 tab 删除事件.
                element.on("tabDelete(" + tabLayFilter + ")", function (elem) {
                    tabList.splice(elem.index - 1, 1);
                    if (rememberTab) {
                        sessionStorage.setItem("tabs", JSON.stringify(tabList));
                    }
                });

                // 页面加载完后, 打开存储的标签卡.
                $(document).ready(function () {
                    if (rememberTab) {
                        var tabs = JSON.parse(sessionStorage.getItem("tabs"));
                        var currentTabId = sessionStorage.getItem("currentTabId");
                        for (var i = 0; tabs != null && i < tabs.length; i++) {
                            event.tabAdd({
                                id: tabs[i].id,
                                title: tabs[i].title,
                                url: tabs[i].url
                            });
                        }
                        event.tabChange(currentTabId);
                    }
                });
            });
        </script>
</body>

</html>
```

值得注意的是，要想使用上面的代码，必须自己在本地添加一些文件，这里我给出我的文件目录供参考使用。

```powershell
layui/
├── css/
│   └── layui.css
├── font/
└── layui.js
home.html
icon-v2.png
test.html
test1.html
test2.html
```

### 代码解析

值得注意的是这一部分的关键是对代码进行思路上的解析，并非是构建这个页面的步骤。通过一张图片简单分析将要实现的功能，和与之对应的代码。

<img src="https://i.postimg.cc/9FgmMtr8/freecompress-1731835663701.jpg" alt="Image" data-zoomable width="100%;">

- 在左侧菜单栏选中对应的选项，添加选中样式，导航栏添加对应标签卡，并且对应的页面渲染到页面主体。

  这个功能的代码执行流程是，捕获左侧菜单的点击事件--->判断是否为多级菜单的非最底层菜单--->如果不是则获取元素的关键属性`title`，`id`，`url`调用`tabAdd()`并将参数传入--->判断菜单栏是否已经存在对应的标签卡--->如果不存在则在菜单栏添加该标签卡--->选中该标签卡。

  ```html
  // 用于管理 Tab 页的事件处理对象
  var event = {
      /**
       * 添加一个新的 Tab 页
       * @param {Object} o - 包含 Tab 信息的对象
       * o.id: Tab 的唯一标识符
       * o.url: Tab 页 iframe 的 URL 地址
       * o.title: Tab 页的显示标题
       */
      tabAdd: function (o) {
          // 提取传入对象中的 id、url、title 属性
          var id = o.id;
          var url = o.url;
          var title = o.title;
  
          // 检查是否已经存在相同 id 的 Tab
          if (!this.tabExist(id)) {
              // 如果不存在，则新增一个 Tab 项
              element.tabAdd(tabLayFilter, {
                  id: id,             // 设置 Tab 的唯一 id
                  title: title,       // 设置 Tab 的标题
                  // Tab 页内容为一个 iframe，加载指定的 url
                  content: "<iframe data-frame-id='" + id + "' class='layui-iframe' src='" + url + "'></iframe>"
              });
  
              // 如果启用了记忆功能（rememberTab 为 true），将 Tab 信息存入 sessionStorage
              if (rememberTab) {
                  // 将当前 Tab 的信息（id、title、url）存入 tabList 数组
                  tabList.push({
                      id: id,
                      title: title,
                      url: url
                  });
  
                  // 将更新后的 tabList 保存到 sessionStorage，以便下次页面加载时恢复
                  sessionStorage.setItem("tabs", JSON.stringify(tabList));
              }
          }
  
          // 切换到新打开的 Tab 页
          element.tabChange(tabLayFilter, id);
      },
  
      /**
       * 检查指定的 Tab 是否已经存在
       * @param {string} id - 要检查的 Tab 的唯一 id
       * @returns {boolean} - 如果 Tab 存在则返回 true，否则返回 false
       */
      tabExist: function (id) {
          var isExist = false; // 初始化一个标识变量
  
          // 遍历所有已存在的 Tab 项，检查是否有匹配的 id
          $.each($(tabsSelector), function () {
              // 如果找到匹配的 id，设置标识变量为 true，并中断循环
              if ($(this).attr("lay-id") === id) {
                  isExist = true;
                  return false; // 退出循环
              }
          });
  
          // 返回检查结果（存在为 true，不存在为 false）
          return isExist;
      },
  
      /**
       * 切换到指定的 Tab 页
       * @param {string} id - 要切换到的 Tab 的唯一 id
       */
      tabChange: function (id) {
          // 使用 layui 的 tabChange 方法切换到指定的 Tab
          element.tabChange(tabLayFilter, id);
      }
  };
  
  // 监听导航栏点击事件，navLayFilter 为导航栏的过滤器名称
  element.on("nav(" + navLayFilter + ")", function (elem) {
      // 判断当前点击的导航项是否是多级菜单的非最低级菜单
      // 如果导航项的 lay-id 属性值为 "#"，则认为它只是一个父级菜单
      if ($(this).attr("lay-id") === "#") {
          return; // 终止执行，防止展开父级菜单时触发页面切换
      }
  
      // 检查当前点击的导航项是否有子目录
      // 如果导航项下没有包含 class 为 'layui-nav-more' 的 span 元素，表示该导航项没有子菜单
      if ($(elem).find("span.layui-nav-more").length === 0) {
          // 获取被点击导航项的引用
          var obj = $(this);
          
          // 获取导航项的标题（通常是 <cite> 标签内的文本）
          var title = obj.find("cite").html();
          
          // 获取导航项的唯一标识（lay-id 属性值）
          var id = obj.attr("lay-id");
          
          // 获取导航项的 URL（lay-url 属性值）
          var url = obj.attr("lay-url");
  
          // 调用 tabAdd 方法向标签页组件中添加一个新的标签页
          event.tabAdd({
              id: id,       // 新标签页的 ID，用于唯一标识
              title: title, // 标签页的标题
              url: url      // 标签页内嵌 iframe 的 URL 地址
          });
      }
  });
  ```

  在上述代码中通过`element.on("nav(" + navLayFilter + ")", function (elem){...}`进行事件绑定，由此为出发点进行接下来的一系列操作。

- 刷新后导航栏恢复刷新前的所有选项，这一功能通过浏览器的本地存储功能实现。

  这个功能的代码执行流程是，通过本地存储对应的api获取存储数据--->选中对应的标签卡。

  ```html
  // 页面加载完后，打开存储的标签页
  $(document).ready(function () {
      // 检查是否启用了标签页记忆功能（rememberTab 为 true）
      if (rememberTab) {
          // 从 sessionStorage 中获取已存储的标签页信息（tabs）
          var tabs = JSON.parse(sessionStorage.getItem("tabs"));
          // 获取最后活跃的标签页 ID（currentTabId）
          var currentTabId = sessionStorage.getItem("currentTabId");
  
          // 遍历存储的标签页数据，如果存在则逐一恢复
          for (var i = 0; tabs != null && i < tabs.length; i++) {
              // 调用 tabAdd 方法添加存储的标签页
              event.tabAdd({
                  id: tabs[i].id,        // 标签页的唯一 ID
                  title: tabs[i].title,  // 标签页的标题
                  url: tabs[i].url       // 标签页 iframe 的 URL
              });
          }
  
          // 切换到最后一次活跃的标签页
          event.tabChange(currentTabId);
      }
  });
  ```

  在初次看到这个功能效果的时候感觉到很神奇，当时并没有想到利用本地存储去实现。

- 在导航栏中切换选项，删除选项卡，左侧菜单也会跟随切换对应的选项。

  这个功能的代码执行流程是，获取点击点击事件--->对相关元素进行样式的添加和切换。

  ```html
  // 点击标签页时，根据当前标签页定位并高亮对应的菜单项
  element.on("tab(" + tabLayFilter + ")", function (elem) {
      // 获取当前选中的标签页的唯一 ID
      var id = $(this).attr("lay-id");
  
      // 获取导航菜单元素，根据 navLayFilter 查找指定的菜单区域
      var navElem = $(".layui-nav[lay-filter='" + navLayFilter + "']");
  
      // 1. 清除所有菜单项的选中状态（layui-this）
      // 2. 定位到与当前标签页 ID 匹配的菜单项，并设置为选中状态
      // 3. 展开该菜单项的所有父级菜单（如果有多级菜单）
      navElem.find("li, dd")
          .removeClass("layui-this") // 移除所有导航项的选中样式
          .find("a[lay-id='" + id + "']") // 查找与当前标签页 ID 匹配的菜单项
          .parent().first()
          .addClass("layui-this") // 为匹配项添加选中样式
          .parents("li, dd")
          .addClass("layui-nav-itemed"); // 展开所有父级菜单
  
      // 如果启用了标签页记忆功能，将当前标签页的 ID 存入 sessionStorage
      if (rememberTab) {
          sessionStorage.setItem("currentTabId", id);
      }
  });
  
  // 监听标签页删除事件，当用户删除某个标签页时触发
  element.on("tabDelete(" + tabLayFilter + ")", function (elem) {
      // 从 tabList 数组中删除被移除的标签页
      // elem.index 表示被删除标签页的索引，注意索引从 1 开始，因此需要减 1
      tabList.splice(elem.index - 1, 1);
  
      // 如果启用了标签页记忆功能，更新 sessionStorage 中的 tabs 数据
      if (rememberTab) {
          sessionStorage.setItem("tabs", JSON.stringify(tabList));
      }
  });
  ```

  这个功能效果相对于前两个是比较简单的。

## 参考链接

<a href="https://blog.csdn.net/tekin_cn/article/details/140046795" target="_blank">gin框架 HTML 模板加载，渲染 使用详解和总结_gin html模板-CSDN博客</a>

<a href="https://gin-gonic.com/zh-cn/docs/examples/html-rendering/" target="_blank">HTML 渲染 | Gin Web Framework</a>

<a href="https://github.com/C-GY/Y-Admin.git" target="_blank">GitHub - C-GY/Y-Admin: 🐳基于layui的管理系统模板，代码易读易懂，结构清晰，界面简洁美观。</a>

<a href="https://layui.dev/" target="_blank">Layui - 极简模块化前端 UI 组件库(官方文档)</a>