---
title: Stellar-Timeline-More
categories:
  - - 主题配置
    - Stellar
article:
  auto_cover: false
  auto_excerpt: 200
cover: https://cdn.jsdelivr.net/gh/luoxue03/ImagesHost/PIC/time-line-cover.png
banner:
poster:
  topic:
  headline: Stellar-Timeline-More
  caption: From -- Luoxue
  color: white
references:
  - title: Stellar 提高时间线适配范围
    url: https://blog.thatcoder.cn/Stellar-Timeline-More/
date: 2023-12-09 17:32:56
tags:
  - Stellar
  - 主题配置
description:
---
<!-- 手动摘要 -->
本文主要对Stellar主题的时间线配置应用的记录，错误排查及教程备份。
<!-- more -->
# Stellar 提高时间线适配范围

## 前言
首先感谢钟意大佬对Stellar主题的贡献，在使用Stellar主题的过程中，使用了许多大佬开发的功能。此篇我主要是想对教程进行备份，同时将遇到的问题记录。
{% image https://upyun.thatcdn.cn/myself/typora/202308131428294.png 原文效果展示 download:true fancybox:true %}
## 教程记录

### 主题加入功能
{% note 路径以stellar主题为根 共需要修改三个文件,添加一个文件 color:red %}

1. 文件路径:  `_config.yml`
```diff _config.yml
plugins:
  stellar:
    ......
+   custom: /js/plugins/custom.js
```

2. 文件路径: `layout/_partial/widgets/timeline.ejs`
```diff layout/_partial/widgets/timeline.ejs
#  15行一处
-      ['api', 'user', 'hide', 'limit'].forEach(key => {
+      ['api', 'user', 'hide', 'limit', 'config'].forEach(key => {
```

3. 文件路径: `scripts/tags/lib/timeline.js` 
```diff scripts/tags/lib/timeline.js
# 38行
-      args = ctx.args.map(args, ['api', 'user', 'type', 'limit', 'hide')
+      args = ctx.args.map(args, ['api', 'user', 'type', 'limit', 'hide', 'config'])
# 45行
-      el += ' ' + ctx.args.joinTags(args, ['api', 'user', 'limit', 'hide']).join(' ')
+      el += ' ' + ctx.args.joinTags(args, ['api', 'user', 'limit', 'hide', 'config']).join(' ')
```
4. 文件路径: `source/js/plugins/custom.js`
```js source/js/plugins/custom.js
# 添加整个文件
var customNum = {}
const Custom = {
    reactions: {
        '+1': '👍',
        '-1': '👎',
        'laugh': '😀',
        'hooray': '🎉',
        'confused': '😕',
        'heart': '❤️',
        'rocket': '🚀',
        'eyes': '👀'
    },
    requestAPI: (url, callback, timeout) => {
        let retryTimes = 5;
        function request() {
            return new Promise((resolve, reject) => {
                let status = 0; // 0 等待 1 完成 2 超时
                let timer = setTimeout(() => {
                    if (status === 0) {
                        status = 2;
                        timer = null;
                        reject('请求超时');
                        if (retryTimes == 0) {
                            timeout();
                        }
                    }
                }, 5000);
                fetch(url).then(function (response) {
                    if (status !== 2) {
                        clearTimeout(timer);
                        resolve(response);
                        timer = null;
                        status = 1;
                    }
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Network response was not ok.');
                }).then(function (data) {
                    retryTimes = 0;
                    callback(data);
                }).catch(function (error) {
                    if (retryTimes > 0) {
                        retryTimes -= 1;
                        setTimeout(() => {
                            request();
                        }, 5000);
                    } else {
                        timeout();
                    }
                });
            });
        }

        request();
    },
    layoutDiv: (cfg) => {
        const el = $(cfg.el)[0];
        $(el).append('<div class="loading-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" stroke-opacity=".3" d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="1.3s" values="60;0"/></path><path stroke-dasharray="15" stroke-dashoffset="15" d="M12 3C16.9706 3 21 7.02944 21 12"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="15;0"/><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path></g></svg></div>');
        Custom.requestAPI(cfg.api, function (data) {
            $(el).find('.loading-wrap').remove();
            const query = new URL(cfg.api).search;
            var users = [];
            const filter = el.getAttribute('user');
            if (filter && filter.length > 0) {
                users = filter.split(",");
            }
            var hide = [];
            const hideStr = el.getAttribute('hide');
            if (hideStr && hideStr.length > 0) {
                hide = hideStr.split(",");
            }
            // ThatCoder: 解析 config 参数
            let config = el.getAttribute('config') || [];
            el.removeAttribute('config')
            config = JSON.parse(config.replace(/'/g, '"'));
            data = config[0].type === 'root' ? match(data, config.shift().src) : data
            const identifier = config[0]['identifier'] || false;
            if (identifier && isNull(customNum[identifier])) {
                customNum[identifier] = {'num': Number(config[0].num), 'now': 0, 'data': []}
            }
            let configObjects = []
            for (const item of data) {
                let configObject = {};
                let shutFor = true;
                for (const item2 of config) {
                    if (isNull(item2.src)) continue
                    const configObjectValue = match(item, item2.src);
                    if (!configObjectValue && configObjectValue !== null) {
                        shutFor = false;  // 整个不要
                        break; // 中断内部循环
                    }
                    configObject[item2.type] = configObjectValue;
                }
                if (shutFor) configObjects.push(configObject)
            }
            if (identifier) {   // 添加到标识集合
                customNum[identifier]['data'] = customNum[identifier]['data'].concat(configObjects)
                customNum[identifier]['now']++
            }
            if (!identifier || customNum[identifier]['now'] === customNum[identifier]['num']) {   // 没标识 或 标识集合已满
                configObjects =identifier ? customNum[identifier]['data'] : configObjects;
                let sort = null;
                if (!isNull(config[0]['sort']) && config[0]['sort'] === 'timestamp') {
                    sort = 1
                }else if (!isNull(config[0]['sort']) && config[0]['sort'] === 'pmatsemit'){
                    sort = -1
                }
                if (sort!==null) {
                    configObjects.sort((a, b) => {
                        const timestampA = convertToMilliseconds(Number(a['timestamp']));
                        const timestampB = convertToMilliseconds(Number(b['timestamp']));
                        return sort>0?timestampB - timestampA:timestampA - timestampB;
                    });
                }
                for (const configObject of configObjects) {
                    $(el).append(TempStyle.getTimeNode(configObject));
                }
                $(el).append(TempStyle.getFloatStyle())
                delete customNum[identifier]  // 清空对应标识集合, 防止赛博诈尸
            }
        }, function () {
            $(el).find('.loading-wrap svg').remove();
            $(el).find('.loading-wrap').append('<svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" d="M12 3L21 20H3L12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="60;0"/></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M12 10V14"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="6;0"/></path></g><circle cx="12" cy="17" r="1" fill="currentColor" fill-opacity="0"><animate fill="freeze" attributeName="fill-opacity" begin="0.8s" dur="0.4s" values="0;1"/></circle></svg>');
            $(el).find('.loading-wrap').addClass('error');
        });
    },
}

$(function () {
    const els = document.getElementsByClassName('stellar-custom-api');
    for (var i = 0; i < els.length; i++) {
        const el = els[i];
        const api = el.getAttribute('api');
        if (api == null) {
            continue;
        }
        var obj = new Object();
        obj.el = el;
        obj.api = api;
        Custom.layoutDiv(obj);
    }
});

/**
 * 源数据格式处理
 * @param origin
 * @returns {string|null|any}
 */
const strToJson = (origin) => {
    if (Array.isArray(origin)) {
        return origin;
    } else if (typeof origin === "string") {
        try {
            return JSON.parse(origin);
        } catch (error) {
            return origin;
        }
    } else if (typeof origin === "object" && origin !== null) {
        return origin;
    }
    return null;
};

/**
 * 匹配目标路径数据, 返回结果(结果集)
 * @param origin
 * @param src
 * @returns {null|*}
 */
const filter = (origin, src) => {
    src = src.split(".");
    for (const key of src) {
        if (origin && origin[key] !== undefined) {
            origin = origin[key];
        } else {
            origin = strToJson(origin);
            if (origin === null) {
                return null;
            }
            origin = origin[key];
        }
    }
    return origin;
};

/**
 * 匹配目标路径数据集, 返回结果集
 * @param origin
 * @param arraySrc 数据集
 * @param src 结果路径
 * @returns {*[]|*}
 */
const map = (origin, arraySrc, src) => {
    // 处理字符串状态的 JSON、Array
    if (typeof origin !== "object") {
        origin = strToJson(origin);
        if (isNull(origin)) {
            return [];
        }
    }
    const arrayData = filter(origin, arraySrc);
    // 处理数据集为空
    if (isNull(arrayData)) {
        return []
    }
    // 处理无结果路径
    if (src === null) {
        return arrayData;
    }
    return arrayData.map((item) => {
        const filteredItem = filter(item, src);
        return filteredItem !== false ? filteredItem : [];
    });
};

/**
 * 匹配是否排除获取本次configObject
 * @param origin
 * @param exclude
 * @returns {boolean|*}
 */
const containsExclude = (origin, exclude) => {
    if (typeof origin === 'string') {
        return origin.includes(exclude);
    } else if (Array.isArray(origin)) {
        return origin.some(item => containsExclude(item, exclude));
    }
    return false;
};

const decodeCustomString = (customString) => {
    return window.decodeURIComponent(window.atob(customString))
}

/**
 * 匹配去除符合正则内容
 * @param origin
 * @param regex 经过编码 memos去标签示例 window.btoa(window.encodeURIComponent(String.raw`#[\d\u4e00-\u9fa5a-zA-Z]+[\s\n]`));
 * @param r 替换的内容, 需解码
 * @returns {string|*}
 */
const removeMatches = (origin, regex, r='') => {
    const decodedRegex = decodeCustomString(regex);
    const regexObj = new RegExp(decodedRegex);
    if (typeof origin === 'string') {
        return origin.replace(regexObj, isNull(r)?'':decodeCustomString(r));
    } else if (Array.isArray(origin)) {
        return origin.map(item => typeof item === 'string' ? item.replace(regexObj, isNull(r)?'':decodeCustomString(r)) : item);
    }

    return origin;
};


/**
 * 匹配是否添加基础前缀
 * @param origin
 * @param base 经过编码 示例 window.btoa(window.encodeURIComponent(String.raw`http://106.55.60.131:5230/m/`));
 * @returns {string|*}
 */
const addBaseToStrings = (origin, base) => {
    base =decodeCustomString(base);
    if (typeof origin === 'string' || typeof origin === 'number') {
        return '' + base + origin;
    } else if (Array.isArray(origin)) {
        return origin.map(item => base + item);
    }
    return origin;
};

/**
 * 匹配路径返回结果(主方法)
 * @param origin
 * @param src
 * @returns {boolean|*}
 */
const match = (origin, src) => {
    src = src.split("|");
    for (let i = 0; i < src.length; i++) {
        const matchUrl = src[i].split(':').length > 1 ? src[i].split(':') : ('filter:' + src[i]).split(':');
        const type = matchUrl[0];
        const srcValue = matchUrl.slice(1).join(":");

        if (type === "filter") {
            origin = filter(origin, srcValue);
        } else if (type === "map") {
            const matchUrl2 = i + 1 < src.length ? src[i + 1].split(":") : null;
            origin = map(origin, srcValue, matchUrl2 === null ? null : (matchUrl2[1] || matchUrl2[0]));
            i++;
        } else if (type === "exclude") {
            if (containsExclude(origin, decodeCustomString(srcValue))) {
                return false;
            }
        } else if (type === "default") {
            origin = decodeCustomString(srcValue);
        } else if (type === "base") {
            origin = addBaseToStrings(origin, srcValue);
        } else if (type === "markdown") {
            origin = markdownToHtml(origin);
        } else if (type === "regex") {
            origin = removeMatches(origin, srcValue, matchUrl[2] || null)
        }
    }
    return origin;
};

/**
 * 简易的 mark 转 html
 * @param md
 * @returns {string}
 */
const markdownToHtml = (md) => {
    let html = md.replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`);
    html = html.replace(/__(.*?)__/g, `<strong>$1</strong>`);
    html = html.replace(/\*(.*?)\*/g, `<em>$1</em>`);
    html = html.replace(/_(.*?)_/g, `<em>$1</em>`);
    html = html.replace(/```(.*?)```/gs, `<code>$1</code>`);
    html = html.replace(/`(.*?)`/g, `<code>$1</code>`);
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, `<img alt="$1" src="$2" />`);
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2">$1</a>`);
    html = html.replace(/^[\*\-] (.*)$/gm, `<li>$1</li>`);
    html = html.replace(/^#{1,6} (.*)$/gm, (match, p1) => {
        const level = match.trim().length;
        return `<h${level}>${p1}</h${level}>`;
    });
    html = `<ul>${html.replace(/<\/li><li>/g, '</li>\n<li>')}</ul>`;
    return html;
}

/**
 * 判空成功返回 True
 * @param _obj
 * @returns {*|boolean}
 */
const isNull = (_obj) => {
    const _type = Object.prototype.toString.call(_obj).slice(8, -1).toLowerCase();
    // 判断是否为空
    const isEmpty = () => {
        switch (_type) {
            case "array":
            case "string":
                return !_obj.length;
            case "object":
                return JSON.stringify(_obj) === "{}";
            case "map":
            case "set":
                return !_obj.size;
            default:
                return !_obj;
        }
    };
    return isEmpty();
};

/**
 * 简易的时间处理
 * @param time
 * @returns {null|Date|*}
 */
const parseTime = (time) => {
    if (!time) {
        return null;
    }

    if (/^\d+$/.test(time)) {
        // 尝试将字符串解析为毫秒级时间戳
        const millisecondsTimestamp = parseInt(time);
        if (String(millisecondsTimestamp).length === 13) {
            return new Date(millisecondsTimestamp);
        }

        // 尝试将字符串解析为秒级时间戳
        const secondsTimestamp = parseInt(time);
        if (String(secondsTimestamp).length === 10) {
            return new Date(secondsTimestamp * 1000);
        }
    }

    const parsedDate = new Date(time);
    if (!isNaN(parsedDate.getTime())) {
        // 如果能够成功解析为日期对象，则返回
        return parsedDate;
    }

    // 如果无法解析为日期对象，尝试解析英文时间
    const parsedEnglishDate = new Date(Date.parse(time));
    if (!isNaN(parsedEnglishDate.getTime())) {
        return parsedEnglishDate;
    }

    // 无法解析的情况下，返回原始值
    return time;
};

/**
 * 时间戳同谐
 * @param timestamp
 * @returns {number}
 */
const convertToMilliseconds = (timestamp) => {
    if (/^\d{13}$/.test(timestamp)) {
        return parseInt(timestamp);
    }
    if (typeof timestamp === 'number') {
        timestamp = timestamp.toString().padEnd(13, '0');
    } else {
        timestamp = new Date(timestamp).getTime().toString().padEnd(13, '0');
    }
    return parseInt(timestamp);
};


/**
 * 简易的时间转中文
 * @param date
 * @returns {string}
 */
const formatChineseDate = (date) => {
    if (!(date instanceof Date)) {
        return '';
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}年 ${month}月 ${day}日`;
};

/**
 * 控件调用器
 * @type {{getMsg: (function(*): string|*), getAuthor: (function(*): string|string), getNeteaseMusic: ((function(*): (string|string|string))|*), getAvatar: ((function(*): (string|string))|*), getTimestamp: ((function(*): (string|string))|*), getTags: ((function(*): (string|string))|*), getPics: ((function(*, *): (string|string))|*)}}
 */
const TempStyle = {
    getAuthor: (data) => isNull(data['author']) ? '' : `<span style="padding: 8px;">${data['author']}</span>`,
    getAvatar: (data) => isNull(data['avatar']) ? '' : `<img style="height: 30px;" src="${data['avatar']}" onerror="javascript:this.src='${data['avatar']}';">`,
    getTags: (data) => isNull(data['tags']) ? '' : data['tags'].map(tag => `<a class="tag-plugin tag" style="margin: 0;font-size: small;float: right;" color="yellow" target="_blank" rel="external nofollow noopener noreferrer">#${tag}</a>`).join('') + '<br>',
    getMsg: (data) => isNull(data['msg']) ? '' : `<div style="padding: 8px;">${data['msg'].replace(/\n/g, '<br>')}</div>`,
    getTimestamp: (data) => {
        const timestamp = data['timestamp'];
        if (isNull(timestamp)) return '';
        const parsedDate = parseTime(timestamp);
        if (!parsedDate) return '';
        return formatChineseDate(parsedDate);
    },
    getNeteaseMusic: (data) => {
        const mid = data['netease'];
        if (isNull(mid)) return '';
        return mid === null ? '' : `<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" style="width: 100%" height=86 src="https://music.163.com/outchain/player?type=2&id=${mid}&auto=0&height=66"></iframe>`;
    },
    getQuote: (data) => {
        const quote = data['quote'];
        if (isNull(quote)) return '';
        return quote === null ? '' : `<blockquote style="font-size: smaller;">${quote.replace(/\n/g, "<br>")}</blockquote>`
    },
    getPics: (data) => {
        const pics = data['pics'];
        if (isNull(pics)) return '';
        let body = '<div class="tag-plugin image">';
        for (let i = 0; i < pics.length; i++) {
            body += `<div class="image-bg"><img class="lazy entered loaded" style="max-height: 35vh; width: auto;" src="${pics[i].replace(/http:\/\//g, 'https://')}" data-src="${pics[i].replace(/http:\/\//g, 'https://')}" data-ll-status="loaded"></div>`;
            if (i === 0) break;
        }
        return body + '</div>';
    },
    getOriginLink: (data) => {
        const link = data['link'];
        const origin = data['origin'];
        let body = '';
        if (!isNull(link)) body += `<div class="flex left"><a href="${link}" target="_blank"><div class="item reaction rocket"><span> 🚀 </span></div></a></div>`;
        if (!isNull(origin)) {
            const icon = data['icon'];
            body += `${body !== '' ? '' : '<div class="flex left"></div>'}<div class="flex right" style=""><div style="display: flex;align-items: center;font-style: italic;font-family: cursive;font-size: smaller;" ><span style="display: flex;align-items: center;">${origin}${isNull(icon) ? '' : `  <img style="width: 1rem;margin-left: 4px;" src="${icon}" > `}</span></div></div>`;
        }
        return body !== '' ? body : '';
    },
    getFooter: (data) => {
        const footerRight = isNull(TempStyle.getOriginLink(data)) ? '' : TempStyle.getOriginLink(data)
        const footer = `<div className="footer" style="display: flex;justify-content: space-between;" >${isNull(footerRight)?'':footerRight}</div>`
        return footer==='<div className="footer"></div>' ? '' : footer
    },
    getTitle: (data) => isNull(data['title']) ? '' : `<div class="tag-plugin quot"><p class="content" type="icon">${data['title']}</p></div>`,
    // TODO: 想添加可选右侧悬浮小图标
    // getFloat: (data) => {
    //     let float = '<div class="actions">\n' +
    //         '      <div class="action-button"><img height="20px" src="/access/image/logo/start.svg"><p>9999</p></div>\n' +
    //         '      <div class="action-button"><img height="20px" src="/access/image/logo/comment.svg"><p>10</p></div>\n' +
    //         '      <div class="action-button"><img height="20px" src="/access/image/logo/share.svg"><p>10</p></div>\n' +
    //         '    </div>'
    //     return float
    // },
    getFloatStyle: () => {
        return '<style>.actions{\n' +
            '  display: none;\n' +
            '}\n' +
            '\n' +
            ' div.timenode:hover > div.body > div.actions {\n' +
            '   width: 6rem;\n' +
            '   height: .001rem;\n' +
            '   position: relative;\n' +
            '   bottom: 6.3rem;\n' +
            '   right: -105%;\n' +  // TODO: 这里有bug, 按百分比距离不一样
            '   display: flex;\n' +
            '   flex-direction: column;\n' +
            '   transform: translateY(-50%);z-index: 999\n' +
            '  }\n' +
            '\n' +
            '  .action-button {\n' +
            '    width: 4rem;\n' +
            '    border-radius: 50%;\n' +
            '    margin-bottom: 2px;\n' +
            '    display: flex;\n' +
            '    justify-content: space-between;\n' +
            '    align-items: center;\n' +
            '    cursor: pointer;\n' +
            '  }\n' +
            'div.action-button > img{margin: 0 0 0 6px !important;filter: grayscale(1)}div.action-button:hover > img{filter: grayscale(0)}' +
            '\n' +
            '  .action-button:hover {\n' +
            // '    background-color: #ccc;\n' +
            '  }</style>'
    },
    getTimeNode: (configObject) => {
        const cell =
            `<div class="timenode" index="${Date.now()}">
            <div class="header">
                <div class="user-info" style="display: flex; align-items: center;height: 30px;">
                    ${TempStyle.getAvatar(configObject)}${TempStyle.getAuthor(configObject)}
                </div>
                ${TempStyle.getTimestamp(configObject)}
            </div>
            <div class="body">
                ${TempStyle.getTitle(configObject)}
                ${TempStyle.getTags(configObject)}
                ${TempStyle.getMsg(configObject)}
                ${TempStyle.getQuote(configObject)}
                ${TempStyle.getPics(configObject)}
                ${TempStyle.getNeteaseMusic(configObject)}
                ${TempStyle.getFooter(configObject)}
            </div>
        </div>`;
        return cell;
    },
};
```
{% link https://kedao.thatcoder.cn/#s/9kZW_6Eg custom.js-原文分享链接，更新会在此发布 %}

### 功能使用
{% note 以下为原文内容 color:cyan %}

作为一个timeline插件形式, 所以使用和正常的timeline一样, 只是多了一个config。

**有点抽象, 我尽能力表述清楚**

#### 示例
以下是一个基本使用格式
{% tabs active:1 align:center %}
<!-- tab 简单使用 -->
{% timeline api:https://blog.thatcoder.cn/custom/test/timetest1.json type:custom config:"[{ 'type': 'root', 'src': 'data' }, { 'type': 'msg', 'src': 'content|markdown:true' }, { 'type': 'tags', 'src': 'map:talkTags' },{ 'type': 'timestamp', 'src': 'time时间戳' }]" %}
{% endtimeline %}
<!-- tab 示例代码 -->
```
{% timeline api:https://blog.thatcoder.cn/custom/test/timetest1.json type:custom config:"[{ 'type': 'root', 'src': 'data' }, { 'type': 'msg', 'src': 'content|markdown:true' }, { 'type': 'tags', 'src': 'map:talkTags' },{ 'type': 'timestamp', 'src': 'time时间戳' }]" %}
{% endtimeline %}
```
<!-- tab 数据代码 -->
``` json timetest1.json
{
  "id": "timetest1",
  "data": [
    {
      "talkTags": ["测试", "BUG制造者"],
      "content": "这是timetest1的**第一个数据**, 时间为2023-08-11",
      "time时间戳": "1691740257"
    },
    {
      "talkTags": ["摆烂", "佛祖保佑", "永无BUG"],
      "content": "这是timetest1的第二个数据, 时间为2023-06-06",
      "time时间戳": "1686037857"
    },
    {
      "talkTags": ["再看一眼","就会爆炸"],
      "content": "这是timetest1的第三个数据, 时间为2023-07-06 \n再看一眼就会爆炸, 应该排除",
      "time时间戳": "1688629857"
    }
  ]
}
```
{% endtabs %}

### 关于config
> 我们现在把config单独拿出来, 它就是一个数组, 里面有每个配置对象。
```
[
  {'type': '组件名', 'src':'指令:参数|指令:参数' }
]
```
组件名和指令细分在下文
现在需要注意的是以下几点:
  * `{ % timeline ... % }`不能分行, 必须一行。
  * config整体用双引号包裹, 里面的内容用单引号包裹, 都是英文的!

### 指令
> 指令其实就是调用什么方法去处理指令附属的内容
> 指令之间是协同的 (比如使用1、2搭配拿到数据,再使用其余指令加以处理补充)
> default比较特殊, 一般用了default就不需要使用其余的
> 主指令是1、2, 常用指令是3、4

1. `filter` (可省略, 默认指令)
  - 用途: 匹配数据的方法之一, 匹配的内容为单个
  - 参数: 填写对应的路径, 路径指向的地方是字符串、数值之类
  - 提示: 字符串形式的json或数值也能匹配, 请大胆写路径
2. `map`
  - 用途: 匹配数据的方法之一, 匹配的内容为复数
  - 参数: 填写对应的路径, 路径指向的地方是数组之类的集合
3. `default` (编码)
  - 用途: 放弃匹配, 使用默认值
  - 参数: 填写组件显示的默认值
  - 提示: 常用来补充作者名、作者头像、来源、来源icon等
4. `base` (编码)
  - 用途: 给匹配到的内容追加前缀
  - 参数: 填写需要追加的前缀
  - 提示: 常用来根据ID拼凑源链接、给图片拼凑基础URL。 后缀的话…没写!
5. `markdown`
  - 用途: 简易的markdown转义
  - 参数: 填写 true
  - 提示: Memos的内容就是markdown
6. `exclude` (编码)
  - 用途: 若包含内容关键字, 则放弃这条数据
  - 参数: 填写需要匹配的跳过循环的内容
  - 提示: 比如我网易云动态有分享黑胶礼品卡, 我就填写的黑胶
7. `regex` (编码)
  - 用途: 正则替换
  - 参数: 第一个参数为正则规则, 第二个参数为替换内容(不写就是替换为空字符串)
  - 提示: memos去标签的实现 ‘…|regex:`#[\d\u4e00-\u9fa5a-zA-Z]+[\s\n]`’ (方便展示, 记得编码)
  - 注意事项: 我忘了要注意什么, 但开发时候依稀记得regex第一个正则参数需要注意点什么…私密马赛

### 组件
> 组件其实就是用对应的已经准备好的div和样式去装载内容

1. `root` (很重要, 要写在最前面)
  - 组件内容: 接口数据真正的主体
  - 参数类型: 基础路径
  - 提示: 这不是组件, 是一个特殊的配置。指向数据真正的主体(一般指向的是array), 不然其它路径很长且重复
2. `author`
  - 组件内容: 时间节点上显示的作者名称
  - 参数类型: 字符串
3. `avatar`
  - 组件内容: 时间节点上显示的作者头像
  - 参数类型: 链接
4. `avatar`
  - 组件内容: 时间节点上显示的时间
  - 参数类型: 时间戳
  - 提示: 没写多少解析,尽量是标准的时间戳或其字符串, 11位13位均可
5. `tags`
  - 组件内容: 内容主体右上角的小标签
  - 参数类型: 字符串或数组
  - 提示: 类似话题之类的
6. `title`
  - 组件内容: 内容主体上方居中的标题
  - 参数类型: 字符串或数组
  - 提示: 一般用不上啦
7. `msg`
  - 组件内容: 内容主体内容
  - 参数类型: 字符串
  - 提示: 类似\n之类的已经解析了, 更多解析记得开启markdown
8. `quote`
  - 组件内容: 内容主体msg下面的引用
  - 参数类型: 字符串
  - 提示: 类似于回复的原内容, 我是因为微信读书笔记有引用
9. `pics`
  - 组件内容: 内容主体msg下面的图片
  - 参数类型: 链接 (字符串或数组)
  - 提示: 即使是数组也是显示数组的第一张图片, 不然很丑的! 预留了多张, 请设计一个方案给我.
10. `netease`
  - 组件内容: 内容主体msg下面的音乐
  - 参数类型: 网易云音乐歌曲ID
  - 提示: QQ音乐请先打钱, 私密马赛QAQ
11. `link`
  - 组件内容: 左下角的小火箭, 点击跳转动态源链接
  - 参数类型: 链接
  - 提示: 一般动态之类的只有ID, 记得加base补充完整
12. `origin`
  - 组件内容: 右下角的文字
  - 参数类型: 字符串
  - 提示: 我一般用来写 ‘– Form XXX’, 已经赋予了斜体
13. `icon`
  - 组件内容: 右下角的图标
  - 参数类型: 链接
  - 提示: 我一般用来放来源的icon, 至于你呢, 你喜欢便好

### 编码
> 因为涉及到正则、冒号、竖杠等特殊字符, 有编码标注的地方需使用下面的编码, 在浏览器控制台即可使用
- 编码
`window.btoa(window.encodeURIComponent(String.raw'输入编码内容'));` (编码里面不是单引号, 是常用来包裹代码的符号)

- 解码
`window.decodeURIComponent(window.atob('输入解码内容'))`

### 指令教程
#### 匹配单个

{% image https://upyun.thatcdn.cn/myself/typora/202308132237730.png  download:true fancybox:true %}

#### 匹配目标集合
{% image https://upyun.thatcdn.cn/myself/typora/202308132231381.png download:true fancybox:true %}

### 进阶

timelines一定要紧接在root组件后面, root没有就写在最前面。
- `sort`
  1. 用途: 全节点排序
  2. 参数: timestamp 顺序 | pmatsemit 逆序 (目前只支持时间排序)
- `identifier`
  1. 用途: 集合标识符
  2. 参数: 随便一个单词
  3. 提示: 需要集合在一起的timeline的标识符是一样的
- `num`
  1. 用途: 这个标识符集合的数量
  2. 参数: 数值
  3. 提示: 考虑到api请求耗时不一样, 还是加一个num为妥, 不满则等待
`{ 'type': 'timelines', 'identifier': 'life', 'num': '3', 'sort': 'timestamp' }`

### 代码参考
* 网易接口: https://netease.thatapi.cn/user/event?uid=134968139&limit=10
* Memos接口: https://memos.thatcoder.cn/api/v1/memo/all?reatorId=1&limit=20
* 微信读书接口: https://blog.thatcoder.cn/custom/test/ThatRead.json (需要提取微信读书数据可留言)


{% link https://blog.thatcoder.cn/%E9%82%AE%E7%AE%B1%E6%A8%A1%E6%9D%BF%E9%9B%86/#%E7%BB%84%E8%A3%85%E6%97%B6%E9%97%B4%E7%BA%BF%E6%B5%8B%E8%AF%95 代码参考渲染结果 %}

```markdown 参考代码
### 网易云memos微信读书联合测试

{% timeline api:https://netease.thatapi.cn/user/event?uid=134968139&limit=10 type:custom config:"[{ 'type': 'root', 'src': 'events' }, { 'type': 'timelines', 'identifier': 'life', 'num': '3', 'sort': 'timestamp' }, { 'type': 'author', 'src': 'user.nickname' }, { 'type': 'avatar', 'src': 'user.avatarUrl' }, { 'type': 'msg', 'src': 'json.msg' }, { 'type': 'netease', 'src': 'json.song.id' }, { 'type': 'tags', 'src': 'map:bottomActivityInfos|name|exclude:JUU5JUJCJTkxJUU4JTgzJUI2' }, { 'type': 'pics', 'src': 'map:pics|originUrl' }, { 'type': 'timestamp', 'src': 'showTime' }, {'type': 'icon', 'src': 'default:aHR0cHMlM0ElMkYlMkZibG9nLnRoYXRjb2Rlci5jbiUyRmN1c3RvbSUyRmltZyUyRiVFNyVCRCU5MSVFNiU5OCU5MyVFNCVCQSU5MSVFOSU5RiVCMyVFNCVCOSU5MC5zdmc='}, { 'type': 'origin', 'src': 'default:LS0lMjBGb3JtJTIwJUU3JUJEJTkxJUU2JTk4JTkzJUU0JUJBJTkxJUU5JTlGJUIzJUU0JUI5JTkw' } ]" %}
{% endtimeline %}

{% timeline api:https://memos.thatcoder.cn/api/v1/memo/all?reatorId=1&limit=20 type:custom config:"[{ 'type': 'timelines', 'identifier': 'life', 'num': '3', 'sort': 'timestamp' }, { 'type': 'author', 'src': 'creatorName' }, { 'type': 'avatar', 'src': 'default:aHR0cHMlM0ElMkYlMkZibG9nLnRoYXRjb2Rlci5jbiUyRmN1c3RvbSUyRmltZyUyRmZsb21vLnN2Zw==' }, { 'type': 'msg', 'src': 'content|regex:JTIzJTVCJTVDZCU1Q3U0ZTAwLSU1Q3U5ZmE1YS16QS1aJTVEJTJCJTVCJTVDcyU1Q24lNUQ=|markdown:true' }, { 'type': 'pics', 'src': 'map:resourceList|externalLink' }, { 'type': 'timestamp', 'src': 'createdTs' }, {'type': 'icon', 'src': 'default:aHR0cHMlM0ElMkYlMkZibG9nLnRoYXRjb2Rlci5jbiUyRmN1c3RvbSUyRmltZyUyRmZsb21vLnN2Zw=='}, { 'type': 'origin', 'src': 'default:LS0lMjBGb3JtJTIwTWVtb3M=' } ]" %}
{% endtimeline %}

{% timeline api:https://blog.thatcoder.cn/custom/test/ThatRead.json type:custom config:"[{ 'type': 'root', 'src': 'data' }, { 'type': 'timelines', 'identifier': 'life', 'num': '3', 'sort': 'timestamp' }, { 'type': 'author', 'src': 'ideaAuthor' }, { 'type': 'avatar', 'src': 'ideaAvtar' }, { 'type': 'msg', 'src': 'ideaContent' }, { 'type': 'quote', 'src': 'ideaQuote' }, { 'type': 'timestamp', 'src': 'ideaTime' }, {'type': 'icon', 'src': 'default:aHR0cHMlM0ElMkYlMkZibG9nLnRoYXRjb2Rlci5jbiUyRmN1c3RvbSUyRmltZyUyRiVFNSVCRSVBRSVFNCVCRiVBMSVFOCVBRiVCQiVFNCVCOSVBNi5zdmc='}, { 'type': 'origin', 'src': 'default:LS0lMjBGcm9tJTIwJUU1JUJFJUFFJUU0JUJGJUExJUU4JUFGJUJCJUU0JUI5JUE2' } ]" %}
{% endtimeline %}


### memos单个测试
标识符不同应该不会混淆进去
{% timeline api:https://memos.thatcoder.cn/api/v1/memo/all?reatorId=1&limit=20 type:custom config:"[{ 'type': 'author', 'src': 'creatorName' }, { 'type': 'avatar', 'src': 'default:aHR0cHMlM0ElMkYlMkZibG9nLnRoYXRjb2Rlci5jbiUyRmN1c3RvbSUyRmltZyUyRmZsb21vLnN2Zw==' }, { 'type': 'msg', 'src': 'content|regex:JTIzJTVCJTVDZCU1Q3U0ZTAwLSU1Q3U5ZmE1YS16QS1aJTVEJTJCJTVCJTVDcyU1Q24lNUQ=|markdown:true' }, { 'type': 'pics', 'src': 'map:resourceList|externalLink' }, { 'type': 'timestamp', 'src': 'createdTs' }, {'type': 'icon', 'src': 'default:aHR0cHMlM0ElMkYlMkZibG9nLnRoYXRjb2Rlci5jbiUyRmN1c3RvbSUyRmltZyUyRmZsb21vLnN2Zw=='}, { 'type': 'origin', 'src': 'default:LS0lMjBGb3JtJTIwTWVtb3M=' } ]" %}
{% endtimeline %}

```

### 侧边栏使用
> 效果是主页侧边栏的 近期动态

在 `widgets.yml` 写好一个组件, 就能像其它侧边栏一样引用即可
``` yaml widgets.yml
memosLife:
  layout: timeline
  title: 近期动态
  api: https://memos.thatcoder.cn/api/v1/memo/all?reatorId=1&limit=20
  type: custom
  config: "[{ 'type': 'author', 'src': 'creatorName' }, { 'type': 'avatar', 'src': 'default:aHR0cHMlM0ElMkYlMkZibG9nLnRoYXRjb2Rlci5jbiUyRmN1c3RvbSUyRmltZyUyRmF1dGhvci5qcGc=' }, { 'type': 'msg', 'src': 'content|regex:JTIzJTVCJTVDZCU1Q3U0ZTAwLSU1Q3U5ZmE1YS16QS1aJTVEJTJCJTVCJTVDcyU1Q24lNUQ=|markdown:true' }, { 'type': 'pics', 'src': 'map:resourceList|externalLink' }, { 'type': 'timestamp', 'src': 'createdTs' }, {'type': 'icon', 'src': 'default:aHR0cHMlM0ElMkYlMkZibG9nLnRoYXRjb2Rlci5jbiUyRmN1c3RvbSUyRmltZyUyRmZsb21vLnN2Zw=='}, { 'type': 'origin', 'src': 'default:LS0lMjBGb3JtJTIwTWVtb3M=' } ]"
```
### 结语
再次感谢大佬的开发，辛苦。
