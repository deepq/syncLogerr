/**
 * sync logerr
 *
 * @category   syncLogerr
 * @author     Yuri Rynkov <yuri@rynkov.eu>
 * @copyright  Copyright (c) 2018 Yuri Rynkov <https://github.com/deepq/syncLogger>
 * @license    http://www.opensource.org/licenses/mit-license.html MIT License
 * @version    0.1 Beta
 * @description Based on original code of 'logger' <https://github.com/i-break-codes/logerr> by  Vaibhav Mehta <firekillz@gmail.com>
 */

var Logerr = function () {
    'use strict';

    var setConfig;
    var failedErrors = [];
    var browser = detect();

    function init(userConfig) {
        if (!userConfig) userConfig = {};

        // Default configuration
        var config = {
            detailedErrors: true,
            remoteLogging: false,
            syncInterval: 2000,
            remoteSettings: {
                url: null,
                additionalParams: null,
                successCallback: null,
                errorCallback: null
            }
        };

        // Override with user config
        setConfig = Object.assign(config, userConfig);

        //Remove current listener
        window.removeEventListener('error', listener);

        // Listen to errors
        window.addEventListener('error', listener);

        syncFailedErrors(setConfig);
    }

    // NOTE: Private
    function listener(e) {
        if (setConfig.detailedErrors) {
            detailedErrors(e);
        }

        if (setConfig.remoteLogging) {
            remoteLogging(e, setConfig.remoteSettings);
        }
    }

    function detailedErrors(e) {
        var i = errorData(e);
        var str = [
            "%cType: %c" + i.type,
            "%cError: %c" + i.error,
            "%cStackTrace: %c" + i.stackTrace,
            "%cFile Name: %c" + i.filename,
            "%cPath: %c" + i.path,
            "%cLine: %c" + i.line,
            "%cColumn: %c" + i.column,
            "%cDate: %c" + i.datetime,
            "%cDebug: %c" + i.path + ':' + i.line
        ].join("\n");

        if (window.chrome) {
            console.log(str, "font-weight: bold;", "color: #e74c3c;", "font-weight: bold;", "font-weight: normal; color: #e74c3c;", "font-weight: bold;", "font-weight: normal; color: #e74c3c;", "font-weight: bold;", "font-weight: normal;", "font-weight: bold;", "font-weight: normal;", "font-weight: bold;", "font-weight: normal;", "font-weight: bold;", "font-weight: normal;", "font-weight: bold;", "font-weight: normal;", "font-weight: bold;", "font-weight: normal;", "font-weight: bold;", "font-weight: normal; color: #3498db;");
        } else {
            console.log(str.replace(/%c/gi, ''));
        }
    }


    function makeRequest(url, data, successCb, failCb) {
        var http = new XMLHttpRequest();
        http.open("POST", url, true);
        http.setRequestHeader("Content-type", "application/json");
        http.send(JSON.stringify(data));
        http.onreadystatechange = function () {
            if (http.readyState === 4 && http.status === 200) {
                successCb && successCb();
                return;
            }

            failCb && failCb();
        };
    }

    function remoteLogging(e, remoteSettings) {
        if (!remoteSettings.url) {
            throw new Error('Provide remote URL to log errors remotely');
        } else if (remoteSettings.additionalParams && typeof remoteSettings.additionalParams !== 'object') {
            throw new Error('Invalid data type, additionalParams should be a valid object');
        }

        var data = errorData(e);
        var setData = Object.assign(data, remoteSettings.additionalParams);

        function handleSuccess() {
            remoteSettings.successCallback
            && typeof remoteSettings.successCallback === 'function'
            && remoteSettings.successCallback()
        }

        function handleError() {
            remoteSettings.errorCallback
            && typeof remoteSettings.errorCallback === 'function'
            && remoteSettings.errorCallback();
            failedErrors.push(e);
        }

        makeRequest(remoteSettings.url, setData, handleSuccess, handleError);
    }

    function remoteLogBatch(batch, remoteSettings, successCb, errorCb) {
        if (!remoteSettings.batchUrl) {
            throw new Error('Provide remote batch URL to log errors remotely');
        } else if (remoteSettings.additionalParams && typeof remoteSettings.additionalParams !== 'object') {
            throw new Error('Invalid data type, additionalParams should be a valid object');
        }

        var data = batch.map(function (e) {
            return Object.assign(errorData(e), remoteSettings.additionalParams);
        });

        function handleSuccess() {
            successCb && typeof successCb === 'function' && successCb();
        }

        function handleError() {
            errorCb && typeof errorCb === 'function' && errorCb();
        }

        makeRequest(remoteSettings.batchUrl, data, handleSuccess, handleError);
    }

    function syncFailedErrors(config) {
        function handleSuccess() {
            failedErrors = [];
        }

        setInterval(function () {
            if (failedErrors.length > 0) {
                remoteLogBatch(failedErrors, setConfig.remoteSettings, handleSuccess)
            }
        }, config.syncInterval);
    }

    function errorData(e) {
        var filename = e.filename.lastIndexOf('/');
        var datetime = new Date().toString();

        /**
         * userAgent only for POST request purposes, not required in pretty print
         */

        return {
            type: e.type,
            path: e.filename,
            filename: e.filename.substring(++filename),
            line: e.lineno,
            column: e.colno,
            error: e.message,
            stackTrace: ((e.error) ? e.error.stack.toString().replace(/(\r\n|\n|\r)/gm, "") : ""),
            datetime: datetime,
            userAgent: navigator.userAgent || window.navigator.userAgent,
            browser: browser,
            language: navigator.language,
            screen: getScreen(),
            url: window.document.URL,
            queryString: window.location.search,
            location: window.location.hash,
            codeVersion: '',
            logLevel: ''
        };
    }

    //Polyfill for Object.assign
    if (typeof Object.assign !== 'function') {
        Object.assign = function (target) {
            if (target === null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            target = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var source = arguments[index];
                if (source !== null) {
                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            target[key] = source[key];
                        }
                    }
                }
            }
            return target;
        };
    }

    //screen detection
    function getScreen() {
        var screen = window.screen;
        return {
            height: screen.height,
            width: screen.width,
            pixelDepth: screen.pixelDepth,
            colorDepth: screen.colorDepth,
            orientation: screen.orientation ? screen.orientation.type : ''
        }
    }

    //browser detection
    function detect() {
        if (typeof navigator !== 'undefined') {
            return parseUserAgent(navigator.userAgent);
        }

        return null;
    }

    function detectOS(userAgentString) {
        var rules = getOperatingSystemRules();
        var detected = rules.filter(function (os) {
            return os.rule && os.rule.test(userAgentString);
        })[0];

        return detected ? detected.name : null;
    }

    function parseUserAgent(userAgentString) {
        var browsers = getBrowserRules();
        if (!userAgentString) {
            return null;
        }

        var detected = browsers.map(function (browser) {
            var match = browser.rule.exec(userAgentString);
            var version = match && match[1].split(/[._]/).slice(0, 3);

            if (version && version.length < 3) {
                version = version.concat(version.length === 1 ? [0, 0] : [0]);
            }

            return match && {
                name: browser.name,
                version: version.join('.')
            };
        }).filter(Boolean)[0] || null;

        if (detected) {
            detected.os = detectOS(userAgentString);
        }

        return detected;
    }

    function getBrowserRules() {
        return buildRules([
            ['edge', /Edge\/([0-9\._]+)/],
            ['yandexbrowser', /YaBrowser\/([0-9\._]+)/],
            ['vivaldi', /Vivaldi\/([0-9\.]+)/],
            ['kakaotalk', /KAKAOTALK\s([0-9\.]+)/],
            ['chrome', /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],
            ['phantomjs', /PhantomJS\/([0-9\.]+)(:?\s|$)/],
            ['crios', /CriOS\/([0-9\.]+)(:?\s|$)/],
            ['firefox', /Firefox\/([0-9\.]+)(?:\s|$)/],
            ['fxios', /FxiOS\/([0-9\.]+)/],
            ['opera', /Opera\/([0-9\.]+)(?:\s|$)/],
            ['opera', /OPR\/([0-9\.]+)(:?\s|$)$/],
            ['ie', /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/],
            ['ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/],
            ['ie', /MSIE\s(7\.0)/],
            ['bb10', /BB10;\sTouch.*Version\/([0-9\.]+)/],
            ['android', /Android\s([0-9\.]+)/],
            ['ios', /Version\/([0-9\._]+).*Mobile.*Safari.*/],
            ['safari', /Version\/([0-9\._]+).*Safari/]
        ]);
    }

    function getOperatingSystemRules() {
        return buildRules([
            ['iOS', /iP(hone|od|ad)/],
            ['Android OS', /Android/],
            ['BlackBerry OS', /BlackBerry|BB10/],
            ['Windows Mobile', /IEMobile/],
            ['Amazon OS', /Kindle/],
            ['Windows 3.11', /Win16/],
            ['Windows 95', /(Windows 95)|(Win95)|(Windows_95)/],
            ['Windows 98', /(Windows 98)|(Win98)/],
            ['Windows 2000', /(Windows NT 5.0)|(Windows 2000)/],
            ['Windows XP', /(Windows NT 5.1)|(Windows XP)/],
            ['Windows Server 2003', /(Windows NT 5.2)/],
            ['Windows Vista', /(Windows NT 6.0)/],
            ['Windows 7', /(Windows NT 6.1)/],
            ['Windows 8', /(Windows NT 6.2)/],
            ['Windows 8.1', /(Windows NT 6.3)/],
            ['Windows 10', /(Windows NT 10.0)/],
            ['Windows ME', /Windows ME/],
            ['Open BSD', /OpenBSD/],
            ['Sun OS', /SunOS/],
            ['Linux', /(Linux)|(X11)/],
            ['Mac OS', /(Mac_PowerPC)|(Macintosh)/],
            ['QNX', /QNX/],
            ['BeOS', /BeOS/],
            ['OS/2', /OS\/2/],
            ['Search Bot', /(nuhk)|(Googlebot)|(Yammybot)|(Openbot)|(Slurp)|(MSNBot)|(Ask Jeeves\/Teoma)|(ia_archiver)/]
        ]);
    }

    function buildRules(ruleTuples) {
        return ruleTuples.map(function (tuple) {
            return {
                name: tuple[0],
                rule: tuple[1]
            };
        });
    }

    return {
        init: init
    };

}();
