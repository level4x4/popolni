(function(){
	window.pc = {};

	$.fn.exists = function () {
		return this.length !== 0;
	};

	var classNames = {
		pcOverflowHidden: 'pc_overflow_hidden',
		overflowAuto: '_overflow_auto',
		overflowYAuto: '_overflow-y_auto',
		pcHide: 'pc-hide',
		hide: 'hide',

		dataTablesScrollBody: 'dataTables_scrollBody',

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

		pcOpenSelect: 'pc-open-select',
		pcFormGroup: 'pc-form-group',

		pcDateFrom: 'pc-date-from',
		pcDateTo: 'pc-date-to',
		pcDateFileWithSums: 'pc-date-file-with-sums',

		pcToggleLeftAdminMenu: 'pc-toggle-left-admin-menu',
		pcAdminContainer: 'pc-admin-container',
		pcShortAdminMenu: 'pc-short-admin-menu',
		pcExportInCsv: 'pc-export-in-csv',

		pcBtnBrowseQueuePayments: 'pc-btn-browse-queue-payments',

		pcThrobberContainer: 'pc-throbber-container',
		pcDeleteRow: 'pc-delete-row',

		pcNavTabs: 'pc-nav-tabs',

		badBrowser: 'bad-browser'
	};

	var ids = {
		pcQueuePaymentsTable: 'pc-queue-payments-table'
	};

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
		$pcDateFrom,
		$pcDateTo,
		$pcDateFileWithSums,
		$pcBtnBrowseQueuePayments,
		$pcToggleLeftAdminMenu,
		$pcOpenSelect,
		$dataTablesScrollBody,
		$pcThrobberContainer,
		$pcQueuePaymentsTable,
		$pcNavTabs,

		pcQueuePaymentsTable,
		currentDate = new Date(),
		isShowMenu = false;

	pc.dateToYMD = function(date) {
		var d = date.getDate(), m = date.getMonth() + 1, y = date.getFullYear();
		return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
	};

	pc.preloadImage = function(url){
		var image = new Image();
		image.src = url;
	};

	pc.preloadImage('/images/pc-slide-bg-1920.jpg');
	pc.preloadImage('/images/pc-slide-bg-995.jpg');
	pc.preloadImage('/images/pc-slide-bg-768.jpg');

	pc.showThrobber = function() {
		var $pcThrobberTemplate = $pcThrobberContainer.clone();
		$pcThrobberTemplate.removeClass(classNames.hide).appendTo($body);
		return $pcThrobberTemplate;
	};

	$(function(){
		$html = $('html');
		$body = $('body');

		badBrowser([{browser: 'safari', version: '4'},{browser: 'ie', version: '9'}]);

		$pcWrapper = $(selectors.pcWrapper);
		$pcMobileMenu = $(selectors.pcMobileMenu);
		$pcLanguages = $(selectors.pcLanguages);
		$pcShowShortText = $(selectors.pcShowShortText);
		$pcTextHeight = $(selectors.pcTextHeight);
		$pcBackgroundMenu = $(selectors.pcBackgroundMenu);
		$pcBtnBrowseQueuePayments = $(selectors.pcBtnBrowseQueuePayments);
		$pcOpenSelect = $(selectors.pcOpenSelect);
		$pcToggleLeftAdminMenu = $(selectors.pcToggleLeftAdminMenu);
		$pcQueuePaymentsTable = $(selectors.pcQueuePaymentsTable);
		$pcDateFrom = $(selectors.pcDateFrom);
		$pcDateTo = $(selectors.pcDateTo);
		$pcDateFileWithSums = $(selectors.pcDateFileWithSums);
		$pcNavTabs = $(selectors.pcNavTabs);

		$pcThrobberContainer = $(selectors.pcThrobberContainer).detach();

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
					$pcBackgroundMenu.removeClass(classNames.pcHide);
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
						$pcBackgroundMenu.addClass(classNames.pcHide);
					});
					isShowMenu = false;
				}
			});
		}

		if ($pcOpenSelect.exists()) {
			$pcOpenSelect.on('click', function(){
				var $this = $(this);
			});
		}

		if ($pcDateFrom.exists()) {
			$pcDateFrom.datetimepicker({
				format: 'dd.mm.yyyy hh:ii',
				autoclose: true,
				todayBtn: true,
				pickerPosition: 'bottom-left',
				language: 'ru'
			});
			$pcDateFrom.datetimepicker('update', pc.dateToYMD(currentDate) + ' 00:00');
		}
		if ($pcDateTo.exists()) {
			$pcDateTo.datetimepicker({
				format: 'dd.mm.yyyy hh:ii',
				autoclose: true,
				todayBtn: true,
				pickerPosition: 'bottom-left',
				language: 'ru'
			});
			$pcDateTo.datetimepicker('update', pc.dateToYMD(currentDate) + ' 23:59');
		}
		if ($pcDateFileWithSums.exists()) {
			$pcDateFileWithSums.datetimepicker({
				format: 'dd.mm.yyyy hh:ii',
				autoclose: true,
				todayBtn: true,
				pickerPosition: 'bottom-left',
				language: 'ru'
			});
			$pcDateFileWithSums.datetimepicker('update', pc.dateToYMD(currentDate) + ' 00:00');
		}

		if ($pcNavTabs.exists()) {
			$pcNavTabs.on('click', 'a', function(e){
				e.preventDefault();
				$(this).tab('show');
			});
		}

		if ($pcToggleLeftAdminMenu.exists()) {
			$pcToggleLeftAdminMenu.on('click', function(){
				var $this = $(this);
				$this.closest(selectors.pcAdminContainer).toggleClass(classNames.pcShortAdminMenu);
			});
		}

		if ($pcQueuePaymentsTable.exists()) {
			renderQueuePaymentsTable();
		}

		if ($pcBtnBrowseQueuePayments.exists()) {
			$pcBtnBrowseQueuePayments.on('click', loadQueuePayments);
		}
	});

	$(document).on('mousedown touchend', function(e){
		var $container = $(selectors.pcLanguages);
		if ($container.has(e.target).length === 0) {
			$pcLanguages.removeClass(classNames.pcOpen);
		}
	});

	var loadQueuePayments = function() {
		var $throbber = pc.showThrobber(),
			$this = $(this);
		$.ajax({
			type: 'GET',
			url: 'js/dataTables.json',
			dataType: "json"
		}).done(function(displayColumns){
			pcQueuePaymentsTable.clear();
			for (var i in displayColumns.data) {
				var item = displayColumns.data[i];
				pcQueuePaymentsTable.row.add([
					item.removeItem ? '<i class="' + classNames.pcDeleteRow + ' fa fa-times"></i>' : '',
					item.id,
					item.dateTime,
					item.phone,
					item.sum + ' грн.',
					item.paymentStatus,
					item.SmsStatus
				]).nodes().to$().attr('data-row-id', item.id);
			}
			pcQueuePaymentsTable.draw();
			$(selectors.pcExportInCsv).html(
				$('<a/>', {text: pc.lang.exportInCsv, href: displayColumns.href})
			);
			deleteRowQueuePaymentsTable();
		}).fail(function(error){
			console.log(error);
		}).always(function(){
			$throbber.remove();
			$this.blur();
		});
	};

	var renderQueuePaymentsTable = function() {
		pcQueuePaymentsTable = $pcQueuePaymentsTable.DataTable({
			pagingType: 'simple_numbers',
			ordering: false,
			info: false,
			pageLength: 20,
			dom: "<'row'<'col-sm-6'i><'" + classNames.pcExportInCsv + " col-sm-6'>>" +
			"<'row'<'col-sm-12'p>>" +
			"<'row'<'col-sm-12'tr>>" +
			"<'row'<'col-sm-12'p>>",
			bAutoWidth: false,
			scrollX: true,
			language: {
				"url": "js/dataTables.russian.lang"
			}
		});
		$dataTablesScrollBody = $(selectors.dataTablesScrollBody);
		if($html.hasClass('ios') || $html.hasClass('android')) {
			return false;
		}
		$dataTablesScrollBody.perfectScrollbar({suppressScrollX: true});
		$dataTablesScrollBody.perfectScrollbar('update');
	};

	var deleteRowQueuePaymentsTable = function() {
		$(selectors.pcDeleteRow).on('click', function(){
			var $this = $(this);
			var $tr = $this.closest('tr'),
				rowId = $tr.data('row-id'),
				$throbber = pc.showThrobber();
			$.ajax({
				type: 'POST',
				url: 'blablabla',
				dataType: 'json',
				data: {
					removeId: rowId
				}
			}).done(function(){
				pcQueuePaymentsTable.row($tr).remove().draw(false);
			}).fail().always(function(){
				$throbber.remove();
			});

		});
	};
})();