/**
 * Created by Shnur on 17.04.2015.
 */
(function(){
	window.badBrowser = function(parametrs) {
		var ua = navigator.userAgent, tem,
			M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [],
			bb = {}, isDetect = false;
		if (/trident/i.test(M[1])) {
			tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
			bb = {
				browser: 'ie',
				version: tem[1] || ''
			};
			isDetect = true;
		}
		if (M[1] === 'Chrome') {
			tem = ua.match(/\bOPR\/(\d+)/);
			if (tem != null) {
				bb = {
					browser: 'opera',
					version: tem[1]
				};
				isDetect = true;
			}
		}
		M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
		if ((tem = ua.match(/version\/(\d+)/i)) != null) {
			M.splice(1, 1, tem[1]);
			bb = {
				browser: M[0].toLowerCase(),
				version: M[1]
			};
			isDetect = true;
		}
		if (!isDetect) {
			bb = {
				browser: M[0].toLowerCase(),
				version: M[1]
			};
		}
		for (var i in parametrs) {
			if (parametrs[i].browser === bb.browser && bb.version <= parametrs[i].version) {
				document.getElementsByTagName('html')[0].className += ' bad-browser';
				document.body.innerHTML = html;
			}
		}
	};

	var html = '<div class="bb-browser"><div style="width: 700px; margin: 0 auto; text-align: left; padding: 0; overflow: hidden;"><div style="width: 490px;"><div class="bb-title">Вы используете устаревший браузер</div><div class="bb-text">В целях безопасности и для более удобной работы с сайтом обновите Ваш браузер на более современный.</div></div><ul class="bb-ul"><li><a href="http://windows.microsoft.com/ru-ru/internet-explorer/download-ie" target="_blank"><img src="images/browser/ie9-10_64x64.png" width="64" height="64" title="Internet Explorer" /></a></li><li><a href="http://www.midori-browser.org/download/" target="_blank"><img src="images/browser/midori_64x64.png" width="64" height="64" title="Midori" /></a></li><li><a href="http://browser.yandex.ru/" target="_blank"><img src="images/browser/yandex_64x64.png" width="64" height="64" title="Yandex Browser" /></a></li><li><a href="https://www.apple.com/ru/safari/" target="_blank"><img src="images/browser/safari_64x64.png" width="64" height="64" title="Safari" /></a></li><li><a href="http://www.opera.com/ru/" target="_blank"><img src="images/browser/opera_64x64.png" width="64" height="64" title="Opera" /></a></li><li><a href="http://www.google.com/intl/ru/chrome/" target="_blank"><img src="images/browser/chrome_64x64.png" width="64" height="64" title="Google Chrome" /></a></li><li><a href="http://www.mozilla.org/ru/firefox/fx/" target="_blank"><img src="images/browser/firefox_64x64.png" width="64" height="64" title="Mozilla Firefox" /></a></li><li><a href="http://ru.ucweb.com/ucbrowser/download/" target="_blank"><img src="images/browser/uc_browser_72x72.png" width="64" height="64" title="UC Browser" /></a></li></ul></div></div>';
})();