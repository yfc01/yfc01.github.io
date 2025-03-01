---
title: "（转载）PaperMod添加文章版权声明" #标题
date: 2025-01-08T22:22:43+08:00 #创建时间
lastmod: 2025-01-08T22:22:43+08:00 #更新时间
author: ["yfc01"] #作者
categories: 
- blog
tags: 
- 添加文章版权声明
description: "在文章章末添加对文章的版权声明" #描述
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: "PaperMod adds article copyright statement"
draft: false # 是否为草稿
comments: true #是否展示评论
showToc: true # 显示目录
TocOpen: true # 自动展开目录
hidemeta: false # 是否隐藏文章的元信息，如发布日期、作者等
disableShare: true # 底部不显示分享栏
showbreadcrumbs: false #顶部显示当前路径
reposted: true
repostedTitle: "PaperMod 添加文章版权声明"
repostedAuthor: "tofuwine"
repostedLink: "https://tofuwine.github.io/posts/18b224b5/"
cover:
    image: "" #图片路径：posts/tech/文章1/picture.png
    caption: "" #图片底部描述
    alt: ""
    relative: false
---

## 概要

在文章章末添加对文章的版权声明，如果为转载文章，则在章末显示转载原文信息。

## copyright 界面

创建 `layouts/partials/copyright.html` 文件：

```html
<div class="pe-copyright">
    <hr>
    <blockquote>
    {{ if .Param "reposted" }}
        <p>本文为转载内容，原文信息如下：</p>
        <p>原文标题：{{- .Param "repostedTitle" -}}</p>
        <p>原文作者：{{- .Param "repostedAuthor" -}}</p>
        <p>原文链接：<a href="{{- .Param "repostedLink" -}}" target="_blank">{{- .Param "repostedLink" -}}</a></p>
        <p>如有侵权，请<a href="mailto://{{ .Param "contactEmail" }}">联系作者</a>删除。</p>
    {{ else }}
        <p>本文为原创内容，版权归作者所有。如需转载，请在文章中声明本文标题及链接。</p>
        <p>文章标题：{{ .Title }} —— {{ .Param "author" }}</p>
        <p>文章链接：<a href="{{ .Permalink }}" target="_blank">{{ .Permalink }}</a></p>
        <p>许可协议：<a href="{{- .Param "licenseLink" -}}" target="_blank">{{- .Param "licenseName" -}}</a></p>
    {{ end }}
    </blockquote>
</div>
```

## 样式

添加版权信息区域样式。创建 `assets/css/extended/copyright.css` 文件：

```css
.pe-copyright {
    margin-top: 20px;
    font-size: 14px;
}

.pe-copyright hr {
    border-style: dashed;
    color: #e26c56;
}

.pe-copyright blockquote {
    margin: 10px 0;
    padding: 0 10px;
    border-inline-start: 3px solid #e26c56;
}

.pe-copyright a {
    box-shadow: 0 1px;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
}
```

## 将版权元素添加到文章章末

打开`layouts/_default/single.html`，在 `footer` 节点上添加如下内容：

```html
<article class="post-single">
    {{- if .Content }}
    <div class="post-content">
        ...
    </div>
    {{- end }}    

    {{ if .Param "enableCopyright" }}
    {{ partial "copyright.html" . }}
    {{ end }}

    <footer class="post-footer">
        ...
    </footer>
</article>
```

## 启用 copyright

在 hugo 配置文件中添加以下配置：

```yaml
params:
  enableCopyright: true
```

### 原创文章

原创文章应在文章 `frontmatter` 中添加以下参数：(以下仅为示例，请根据实际自行修改)

```
---
author: tofuwine
licenseLink: "https://creativecommons.org/licenses/by-nc/4.0/"
licenseName: "CC BY-NC 4.0"
---
```

也可直接在 hugo 配置文件中指定默认值：

```yaml
params:
  author: tofuwine
  licenseLink: "https://creativecommons.org/licenses/by-nc/4.0/"
  licenseName: "CC BY-NC 4.0"
```

其中 `author` 为 Hugo-PaperMod 已有参数。

### 转载文章

转载文章应在文章 `frontmatter` 中添加以下参数：

```
---
reposted: true
repostedTitle: "修改为原文章标题"
repostedAuthor: "修改为原文章作者名"
repostedLink: "修改为原文章链接"
contactEmail: your email
---
```

其中 `contactEmail` 参数可在 hugo 配置中指定全局默认值：

```yaml
params:
  contactEmail: your email
```

## 源码

本站主题已开源，最新源码请参考：<a href="https://github.com/tofuwine/PaperMod-PE" target="_blank">PaperMod-PE</a>
