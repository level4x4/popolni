(function(){
	window.pc = {};

	$.fn.exists = function () {
		return this.length !== 0;
	};

	var classNames = {
		pcLanguages: 'pc-languages',
		pcOpen: 'pc-open',
		pcShowShortText: 'pc-show-short-text',
		pcTextHeight: 'pc-text-height',
		pcShowFullText: 'pc-show-full-text',
		pcShowFullTextButton: 'pc-show-full-text-button'
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

	var $pcLanguages,
		$pcTextHeight,
		$pcShowShortText;

	pc.preloadImage = function(url){
		var image = new Image();
		image.src = url;
	};

	$(function(){
		pc.preloadImage('/images/pc-slide-bg-1920.jpg');
		pc.preloadImage('/images/pc-slide-bg-995.jpg');
		pc.preloadImage('/images/pc-slide-bg-768.jpg');

		$pcLanguages = $(selectors.pcLanguages);
		$pcShowShortText = $(selectors.pcShowShortText);
		$pcTextHeight = $(selectors.pcTextHeight);

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
	});

	$(document).on('mousedown touchend', function(e){
		var $container = $(selectors.pcLanguages);
		if ($container.has(e.target).length === 0) {
			$pcLanguages.removeClass(classNames.pcOpen);
		}
	});
})();