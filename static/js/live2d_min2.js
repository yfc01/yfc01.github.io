document.addEventListener("DOMContentLoaded", function () {
    // live2d_path 参数建议使用绝对路径
    const live2d_path = "https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/";
    //const live2d_path = "/live2d-widget/";
    const cssPath = "/css/waifu.css";
    const live2dJsPath = "/js/live2d_min2_tool.js";

    console.log(cssPath)

    // 封装异步加载资源的方法
    function loadExternalResource(url, type) {
        return new Promise((resolve, reject) => {
            let tag;

            if (type === "css") {
                tag = document.createElement("link");
                tag.rel = "stylesheet";
                tag.href = url;
            }
            else if (type === "js") {
                tag = document.createElement("script");
                tag.src = url;
            }
            if (tag) {
                tag.onload = () => resolve(url);
                tag.onerror = () => reject(url);
                document.head.appendChild(tag);
            }
        });
    }

    // 加载 waifu.css live2d.min.js waifu-tips.js
    if (screen.width >= 768) {
        Promise.all([
            loadExternalResource(cssPath, "css"),
            loadExternalResource(live2dJsPath, "js"),
            loadExternalResource(live2d_path + "waifu-tips.js", "js")
        ]).then(() => {
            // 配置选项的具体用法见 README.md
            initWidget({
                waifuPath: live2d_path + "waifu-tips.json",
                //apiPath: "https://live2d.fghrsh.net/api/",
                cdnPath: "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/",
                tools: ["hitokoto", "asteroids", "switch-model", "switch-texture", "photo", "info", "quit"]
            });
            // 初始化看板娘鼠标监听事件
            initWaifuMouseEvent();
        });
    }

    function initWaifuMouseEvent() {
        const waifu = document.getElementById("waifu");
        let isDown = false;
        let waifuLeft;
        let mouseLeft;
        let waifuTop;
        let mouseTop;
        // 鼠标点击监听
        waifu.onmousedown = function (e) {
            isDown = true;
            // 记录x轴
            waifuLeft = waifu.offsetLeft;
            mouseLeft = e.clientX;
            // 记录y轴
            waifuTop = waifu.offsetTop;
            mouseTop = e.clientY;
        }
        // 鼠标移动监听
        window.onmousemove = function (e) {
            if (!isDown) {
                return;
            }
            // x轴移动
            let currentLeft = waifuLeft + (e.clientX - mouseLeft);
            if (currentLeft < 0) {
                currentLeft = 0;
            } else if (currentLeft > window.innerWidth - 300) {
                currentLeft = window.innerWidth - 300;
            }
            waifu.style.left = currentLeft + "px";
            // y轴移动
            // let currentTop = waifuTop + (e.clientY - mouseTop);
            // if (currentTop < 30) {
            //     currentTop = 30
            // } else if (currentTop > window.innerHeight - 290) {
            //     currentTop = window.innerHeight - 290
            // }
            // waifu.style.top = currentTop + "px";
        }
        // 鼠标点击松开监听
        window.onmouseup = function (e) {
            isDown = false;
        }
    }

    console.log(`
  く__,.ヘヽ.        /  ,ー､ 〉
           ＼ ', !-─‐-i  /  /´
           ／｀ｰ'       L/／｀ヽ､
         /   ／,   /|   ,   ,       ',
       ｲ   / /-‐/  ｉ  L_ ﾊ ヽ!   i
        ﾚ ﾍ 7ｲ｀ﾄ   ﾚ'ｧ-ﾄ､!ハ|   |
          !,/7 '0'     ´0iソ|    |
          |.从"    _     ,,,, / |./    |
          ﾚ'| i＞.､,,__  _,.イ /   .i   |
            ﾚ'| | / k_７_/ﾚ'ヽ,  ﾊ.  |
              | |/i 〈|/   i  ,.ﾍ |  i  |
             .|/ /  ｉ：    ﾍ!    ＼  |
              kヽ>､ﾊ    _,.ﾍ､    /､!
              !'〈//｀Ｔ´', ＼ ｀'7'ｰr'
              ﾚ'ヽL__|___i,___,ンﾚ|ノ
                  ﾄ-,/  |___./
                  'ｰ'    !_,.:
`);
});