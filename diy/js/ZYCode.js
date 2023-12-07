// 这四个常量是复制,复制成功,展开,收缩
// 我使用的是 https://fontawesome.com/ 图标, 不用可以改为文字.
const copyText = '<i class="fa-regular fa-copy"></i>';
const copySuccess = '<i class="fa-regular fa-circle-check"></i>';
const openText = '<i class="fa-solid fa-angles-down fa-beat-fade"></i>';
const closeText = '<i class="fa-solid fa-angles-up fa-beat-fade"></i>';
const fullOpen = '<i class="fa-solid fa-expand"></i>'
const fullClose = '<i class="fa-solid fa-compress"></i>'
const downTest = '<i class="fa-solid fa-download"></i>'

const codeElements = document.querySelectorAll('td.code');

codeElements.forEach(async (code, index) => {
    let figure = code.parentElement.parentElement.parentElement.parentElement;  // 整个figure代码块标签
    const preCode = code.querySelector('pre').firstElementChild;  // 代码元素
    let preGutter = code.parentElement.firstElementChild;  // 行号元素

    preCode.id = `ZYCode${index + 1}`;  // 设置id，未来用
    preCode.style.webkitLineClamp = '6';
    // 修改code标签的before伪类
    const setPreCodeBefore = (msg = '优雅借鉴') => {
        preCode.setAttribute('code-msg',msg)
    }
    setPreCodeBefore()

    // 添加展开/收起按钮
    if (preCode.innerHTML.split('<br>').length > 6) {
        // preGutter.style.display = 'none';
        const codeCopyDiv = document.createElement('div');
        codeCopyDiv.classList.add('CodeCloseDiv');
        figure.appendChild(codeCopyDiv);

        var codeCopyOver = document.createElement('button');
        codeCopyOver.classList.add('CodeClose');
        codeCopyOver.innerHTML = openText;

        const description = figure.childNodes.length === 3 ? figure.children[2] : figure.children[1];
        description.appendChild(codeCopyOver);

        await codeCopyOver.addEventListener('click', async () => {
            if (codeCopyOver.innerHTML === openText) {
                setPreCodeBefore('右上角可全屏亦可下载')
                preCode.style.webkitLineClamp = '99999';
                preGutter.style.overflow = 'visible'
                codeCopyOver.innerHTML = closeText;
            } else {
                setPreCodeBefore()
                preCode.style.webkitLineClamp = '6';
                preGutter.style.overflow = 'hidden';
                codeCopyOver.innerHTML = openText;
                const figureTop = figure.previousElementSibling.previousElementSibling;
                (figureTop ? figureTop : figure).scrollIntoView({behavior: 'smooth'});
            }
        });
    }

    // 添加复制按钮
    const codeCopyBtn = document.createElement('div');
    codeCopyBtn.classList.add('copy-btn');
    codeCopyBtn.classList.add('more-btn');
    codeCopyBtn.innerHTML = copyText;
    code.appendChild(codeCopyBtn);
    code.appendChild(codeCopyBtn);

    // 添加复制功能
    codeCopyBtn.addEventListener('click', async () => {
        const currentCodeElement = code.querySelector('pre')?.innerText;
        await copyCode(currentCodeElement);

        codeCopyBtn.innerHTML = copySuccess;
        codeCopyBtn.classList.add('success');
        setPreCodeBefore('借鉴成功，Ctrl+V 查收')

        setTimeout(() => {
            codeCopyBtn.innerHTML = copyText;
            codeCopyBtn.classList.remove('success');
            setPreCodeBefore()
        }, 3000);
    });

    // 添加全屏按钮
    const codeFullBtn = document.createElement('div');
    codeFullBtn.classList.add('full-btn');
    codeFullBtn.classList.add('more-btn');
    codeFullBtn.innerHTML = fullOpen;
    code.appendChild(codeFullBtn);
    const fullEvents = ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange']
    // 添加全屏功能与监听用户退出全屏， 退出则控制台输出日志
    codeFullBtn.addEventListener('click', async () => {
        if (codeFullBtn.innerHTML === fullClose){
            codeFullBtn.innerHTML = fullOpen;
            setPreCodeBefore()
            await exitFullscreen();
        }else {
            // 尝试全屏代码
            try {
                // 如果当前元素支持全屏API
                await openFullscreen()
                if (codeCopyOver && codeCopyOver.innerHTML === openText){
                    codeCopyOver.click()
                }
                setPreCodeBefore('ESC键退出全屏')
                codeFullBtn.innerHTML = fullClose
                // 监听全屏状态变化事件
                    fullEvents.forEach(event => document.addEventListener(event, handleFullscreenChange));

            } catch (err) {
                console.error('全屏请求失败：', err);
            }
        }
    });

// 处理全屏状态变化事件
    const handleFullscreenChange = () => {
        if (!document.fullscreenElement && !document.mozFullScreenElement &&
            !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (codeCopyOver && codeCopyOver.innerHTML === closeText){
                codeCopyOver.click()
            }
            if (codeFullBtn.innerHTML === fullClose){
                codeFullBtn.innerHTML = fullOpen;
            }
            // 在这里执行用户退出全屏后的操作
            // 例如：移除全屏事件监听器
            fullEvents.forEach(event => document.removeEventListener(event, exitFullscreen));
        }
    }
    // 在需要的时候主动开启全屏
    const openFullscreen = async () => {
        await (figure.requestFullscreen() || figure.mozRequestFullScreen() || figure.webkitRequestFullscreen() || figure.msRequestFullscreen());
    }
    // 在需要的时候主动关闭全屏
    const exitFullscreen = async () => {
        await (document.exitFullscreen() || document.mozCancelFullScreen() || document.webkitExitFullscreen() || document.msExitFullscreen());
    }

    // 添加下载按钮
    const codeDownBtn = document.createElement('div');
    codeDownBtn.classList.add('down-btn');
    codeDownBtn.classList.add('more-btn');
    codeDownBtn.innerHTML = downTest;
    code.appendChild(codeDownBtn);
    // 创建 Blob 对象
    let blob = new Blob([code.innerText], { type: 'text/plain' });
    // 格式化文件大小函数
    const formatFileSize = (sizeInBytes) => {
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        let size = sizeInBytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
    // 添加figure的after伪类
    figure.setAttribute('code-info',`📟 ${formatFileSize(blob.size)}   © luoxue❄️`)

    codeDownBtn.addEventListener('click', () => {
        const figcaption = figure.firstElementChild
        const figcaptionText = figcaption.tagName === 'FIGCAPTION' ? figcaption.innerText : 'luoxue';
        const fileNamePattern = /^[^\/\\]+\.\w+$/;
        const fileName =  fileNamePattern.test(figcaptionText) ? figcaptionText : `${figcaptionText}.txt`;
        // const suffix = window.getComputedStyle(code, ':before').getPropertyValue('content');
        // 创建下载链接
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        // 设置文件名
        downloadLink.download = fileName;
        // 将链接添加到页面
        document.body.appendChild(downloadLink);
        // 模拟点击下载链接
        downloadLink.click();
        // 移除链接元素
        document.body.removeChild(downloadLink);
        setPreCodeBefore("下载成功，Ctrl+J 查收")
        codeDownBtn.classList.add('success')
        setTimeout(() => {
            codeDownBtn.classList.remove('success');
            setPreCodeBefore()
        }, 3000);
    });
});

async function copyCode(currentCode) {
    if (navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(currentCode);
        } catch (error) {
            console.error(error);
        }
    } else {
        console.error('当前浏览器不支持此API');
    }
}