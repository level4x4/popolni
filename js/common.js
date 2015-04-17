(function(){
	window.pc = {};

	$.fn.exists = function () {
		return this.length !== 0;
	};

	var classNames = {
		pcOverflowHidden: 'pc_overflow_hidden',
		overflowAuto: '_overflow_auto',
		overflowYAuto: '_overflow-y_auto',
		hide: 'pc-hide',

		pcWrapper: 'pc-wrapper',
		pcLanguages: 'pc-languages',
		pcOpen: 'pc-open',
		pcShowShortText: 'pc-show-short-text',
		pcTextHeight: 'pc-text-height',
		pcShowFullText: 'pc-show-full-text',
		pcShowFullTextButton: 'pc-show-full-text-button',

		pcNav: 'pc-nav',
		pcMobileMenu: 'pc-mobile-menu',
		pcHeaderNav: 'pc-header-nav',
		pcShowNav: 'pc-show-nav',
		pcBackgroundMenu: 'pc-background-menu',
		pcUlNavContainer: 'pc-ul-nav-container',
		pcMobileScroll: 'pc-mobile-scroll',

		badBrowser: 'bad-browser'
	};

	var ids = {};

	var buildSelectors = function (selectors, source, characterToPrependWith) {
		$.each(source, function (propertyName, value) {
			selectors[propertyName] = characterToPrependWith + value;
		});
	};

	pc.buildSelectors = function (classNames, ids) {
		var selectors = {};
		if (classNames) {
			buildSelectors(selectors, classNames, ".");
		}
		if (ids) {
			buildSelectors(selectors, ids, "#");
		}
		return selectors;
	};

	var selectors = pc.buildSelectors(classNames, ids);

	var $html,
		$body,
		$pcWrapper,
		$pcMobileMenu,
		$pcLanguages,
		$pcTextHeight,
		$pcShowShortText,
		$pcBackgroundMenu,

		isShowMenu = false;

	pc.preloadImage = function(url){
		var image = new Image();
		image.src = url;
	};

	pc.preloadImage('/images/pc-slide-bg-1920.jpg');
	pc.preloadImage('/images/pc-slide-bg-995.jpg');
	pc.preloadImage('/images/pc-slide-bg-768.jpg');

	$(function(){
		$html = $('html');
		$body = $('body');

		badBrowser([{browser: 'safari', version: '5'},{browser: 'ie', version: '9'}]);

		$pcWrapper = $(selectors.pcWrapper);
		$pcMobileMenu = $(selectors.pcMobileMenu);
		$pcLanguages = $(selectors.pcLanguages);
		$pcShowShortText = $(selectors.pcShowShortText);
		$pcTextHeight = $(selectors.pcTextHeight);
		$pcBackgroundMenu = $(selectors.pcBackgroundMenu);

		$pcLanguages.on('click', 'a:first', function(){
			$pcLanguages.toggleClass(classNames.pcOpen);
			return false;
		});

		if ($pcShowShortText.exists()) {
			var $pcShowFullTextButton;
			$pcShowFullTextButton = $('<a/>', {class: classNames.pcShowFullTextButton, text: pc.lang.showAllText}).insertAfter($pcShowShortText);
			$pcShowFullTextButton.on('click', function() {
				var fullHeight = $pcTextHeight.height(),
					$this = $(this);
				if (!$pcShowShortText.hasClass(classNames.pcShowFullText)) {
					$pcShowShortText.animate({height: fullHeight}, 1000).addClass(classNames.pcShowFullText);
					$this.text(pc.lang.hideText);
				} else {
					$pcShowShortText.animate({height: 70}, 1000).removeClass(classNames.pcShowFullText);
					$this.text(pc.lang.showAllText);
				}
			});
		}

		if ($pcMobileMenu.exists()) {
			$pcMobileMenu.on('click', function(){
				var $this = $(this);
				var $pcHeaderNav = $this.closest(selectors.pcHeaderNav);
				var $pcMobileScroll = $pcHeaderNav.find(selectors.pcMobileScroll);
				var windowHeight = $pcMobileScroll.height();

				if (!isShowMenu) {
					//$body.addClass(classNames.pcOverflowHidden);
					$pcHeaderNav.addClass(classNames.pcShowNav);
					$pcBackgroundMenu.removeClass(classNames.hide);
					$pcWrapper.css({height: (windowHeight + 82)}).addClass(classNames.pcOverflowHidden);
					$pcMobileScroll.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
						if($html.hasClass('ios') || $html.hasClass('android')) {
							return false;
						}
						$pcMobileScroll.perfectScrollbar({suppressScrollX: true});
						$pcMobileScroll.perfectScrollbar('update');
					});
					isShowMenu = true;
				} else {
					$pcHeaderNav.removeClass(classNames.pcShowNav);
					$pcMobileScroll.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
						//$body.removeClass(classNames.pcOverflowHidden);
						$pcWrapper.css({height: '100%'}).removeClass(classNames.pcOverflowHidden);
						$pcBackgroundMenu.addClass(classNames.hide);
					});
					isShowMenu = false;
				}
			});
		}
	});

	$(document).on('mousedown touchend', function(e){
		var $container = $(selectors.pcLanguages);
		if ($container.has(e.target).length === 0) {
			$pcLanguages.removeClass(classNames.pcOpen);
		}
	});
})();