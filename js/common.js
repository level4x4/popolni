(function(){
	window.pc = {};

	$.fn.exists = function () {
		return this.length !== 0;
	};

	var classNames = {
		pcLanguages: 'pc-languages',
		pcOpen: 'pc-open'
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

	var $pcLanguages;

	pc.preloadImage = function(url){
		var image = new Image();
		image.src = url;
	};

	$(function(){
		pc.preloadImage('/images/pc-slide-bg-1920.jpg');
		pc.preloadImage('/images/pc-slide-bg-995.jpg');
		pc.preloadImage('/images/pc-slide-bg-768.jpg');

		$pcLanguages = $(selectors.pcLanguages);

		$pcLanguages.on('click', 'a:first', function(){
			$pcLanguages.toggleClass(classNames.pcOpen);
			return false;
		});
	});

	$(document).on('mousedown touchend', function(e){
		var $container = $(selectors.pcLanguages);
		if ($container.has(e.target).length === 0) {
			$pcLanguages.removeClass(classNames.pcOpen);
		}
	});
})();