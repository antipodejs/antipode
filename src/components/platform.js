const ua = navigator.userAgent;

const ep = {};

let platforms = [
    // Android 4+ using Chrome
    {platform: 'androidChrome', regex: /Android .* Chrome\/(\d+)[.\d]+/},
    // Android 2 - 4
    {platform: 'android', regex: /Android (\d+)/},
    // Kindle Fire
    // Force version to 2, (desktop mode does not list android version)
    {platform: 'android', regex: /Silk\/1./, forceVersion: 2, extra: {silk: 1}},
    // Kindle Fire HD (Silk versions 2 or 3)
    // Force version to 4
    {platform: 'android', regex: /Silk\/2./, forceVersion: 4, extra: {silk: 2}},
    {platform: 'android', regex: /Silk\/3./, forceVersion: 4, extra: {silk: 3}},
    // Windows Phone 7 - 8
    {platform: 'windowsPhone', regex: /Windows Phone (?:OS )?(\d+)[.\d]+/},
    // IE 8 - 10
    {platform: 'ie', regex: /MSIE (\d+)/},
    // IE 11
    {platform: 'ie', regex: /Trident\/.*; rv:(\d+)/},
    // iOS 3 - 5
    // Apple likes to make this complicated
    {platform: 'ios', regex: /iP(?:hone|ad;(?: U;)? CPU) OS (\d+)/},
    // webOS 1 - 3
    {platform: 'webos', regex: /(?:web|hpw)OS\/(\d+)/},
    // webOS 4 / OpenWebOS
    {platform: 'webos', regex: /WebAppManager|Isis|webOS\./, forceVersion: 4},
    // Open webOS release LuneOS
    {platform: 'webos', regex: /LuneOS/, forceVersion: 4, extra: {luneos: 1}},
    // desktop Safari
    {platform: 'safari', regex: /Version\/(\d+)[.\d]+\s+Safari/},
    // desktop Chrome
    {platform: 'chrome', regex: /Chrome\/(\d+)[.\d]+/},
    // Firefox on Android
    {platform: 'androidFirefox', regex: /Android;.*Firefox\/(\d+)/},
    // FirefoxOS
    {platform: 'firefoxOS', regex: /Mobile;.*Firefox\/(\d+)/},
    // desktop Firefox
    {platform: 'firefox', regex: /Firefox\/(\d+)/},
    // Blackberry Playbook
    {platform: 'blackberry', regex: /PlayBook/i, forceVersion: 2},
    // Blackberry 10+
    {platform: 'blackberry', regex: /BB1\d;.*Version\/(\d+\.\d+)/},
    // Tizen
    {platform: 'tizen', regex: /Tizen (\d+)/}
];

for (let i = 0, p, m, v; (p = platforms[i]); i++) {

    m = p.regex.exec(ua);
    if (m) {
        if (p.forceVersion) {
            v = p.forceVersion;
        } else {
            v = Number(m[1]);
        }
        ep[p.platform] = v;
        if (p.extra) {
            Object.assign(ep, p.extra);
        }
        ep.platformName = p.platform;
        break;
    }
};

ep['touch'] = Boolean('ontouchstart' in window);

export default ep;
