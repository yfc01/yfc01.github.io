# hugo博客

## 目录
- [简介](#简介)
- [安装](#安装)
- [联系方式](#联系方式)

## 简介
这是一个使用 <a href="https://gohugo.io/" target="_blank">Hugo</a> 和 <a href="https://github.com/adityatelange/hugo-PaperMod/" target="_blank">PaperMod</a> 构建的博客站点。站点页面地址：<a href="https://yfc01.github.io/" target="_blank">Thoughts and Musings (yfc01.github.io)</a>，欢迎访问。

## 安装
### 环境要求
- <a href="https://gohugo.io/" target="_blank">Hugo</a> v0.134.3

### 安装步骤

```bash
# 克隆仓库
git clone git@github.com:yfc01/yfc01.github.io.git

# 进入项目目录
cd yfc01.github.io

# 安装主题(子模块)
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
git submodule update --init --recursive # needed when you reclone your repo (submodules may not get cloned automatically)


# 启动 Hugo 本地开发服务器
hugo server -D
```

## 联系方式
如需帮助或反馈，请通过以下方式联系：

- Email: 2063454530@qq.com
- GitHub: <a href="https://github.com/yfc01" target="_blank">GitHub</a>
