(function() {
	var em = edunav.map;
	var cm = {};

	em.coursesManager = cm;

	cm.renderCourses = function() {
		var data = em._data;
		var terms = data.terms;
		var startingYear = 15;
		var termTitleSizes, _termTitleSizes, termTitleSizesActive, termTitleOffset;
		em._coursesById = {};
		em._coursesByTermId = {};
		em._coursesByCode = {};

		cm.calculateCircleSizes();
		cm.calculateMediumRectangleSizes();

		termTitleSizes = em.termsManager.getTermTitleSizes();
		_termTitleSizes = termTitleSizes;

		var termIndexTemp = -1;

		for(var termIndex = 0; termIndex < terms.length; termIndex++) {
			if (em.goalsManager.isGoalTerm(terms[termIndex])) {
				continue;
			}
			termIndexTemp += 1;

			if (terms[termIndex].hideTerm) {
				continue;
			}

			var term = terms[termIndex];
			var renderData = term.renderData || {};
			var termTitle = '';
			var $termTitle = renderData.$element;
			var _zoomLevel;
			var hours = term.hours || term.termHours;
			var termId = term.id;
			var termData = edunav.getTermById(termId);
			var hoursTitle = '<span class="term-hours edunav-hours-text--single">'+hours+' <i class="fa fa-circle"></i></span>';

			if (em._zoomLevel === 1) {
				_zoomLevel = renderData.zoomLevel || em.defaultZoomLevel;
				renderData.singleOffset = renderData.singleOffset || 0;
			} else {
				_zoomLevel = em._zoomLevel;
				renderData.singleOffset = 0;
			}

			if (!$termTitle) {
				$termTitle = $('<div>').addClass(em.classNames.termTitle).attr('id', 'term-title-' + termIndex);
				$termTitle.attr('data-term-index', termIndex);
				$termTitle.attr('data-term-id', term.id);
				renderData.$element = $termTitle;
			}

			renderData._isActiveTerm = _zoomLevel === 2;

			if (em._zoomLevel === 1) {
				em.utils.generateRatioForFirstLevel(renderData._isActiveTerm);
			}

			term.renderData = renderData;

			if(term.renderData._isActiveTerm) {
				termTitleSizesActive = em.termsManager.getTermTitleSizes(term);
				termTitleOffset = {top: -(_termTitleSizes.height / 2), left: -(termTitleSizesActive.width / 2)};
				termTitleSizes = termTitleSizesActive;
			} else {
				termTitleSizes = _termTitleSizes;
				termTitleOffset = {top: -( (termTitleSizes.height + termTitleSizes.verticalPadding * 2) / 2), left: -(termTitleSizes.width / 2)};
			}

			switch (_zoomLevel) {
				case 1:
					if(_.isUndefined(termData)) {
						termTitle = (termIndexTemp % 2?'Fa':'Sp') + '-' + (startingYear + Math.floor(termIndexTemp / 2));
					} else {
						termTitle = termData.shortName;
					}
					$termTitle.removeClass(em.classNames.termTitleSecondLevel).text(termTitle);
					$termTitle.css('margin-left', 0);
					break;
				case 2:
					if(_.isUndefined(termData)) {
						termTitle = (termIndexTemp % 2 ? 'Fall' : 'Spring') + ' 20' + (startingYear + Math.floor(termIndexTemp / 2));
					} else {
						termTitle = termData.name;
					}
					$termTitle.addClass(em.classNames.termTitleSecondLevel).text(termTitle);
					$termTitle.addClass(em.classNames.termTitleSecondLevel).append(hoursTitle);
					$termTitle.css('margin-left', -termTitleSizes.horizontalPadding);
					break;
				default:
					throw new Error('Unknown zoom level');
			}

			var hoursText = hours === 1?  ' hour' : ' hours';

			$termTitle.css({
				width: termTitleSizes.width + 'px',
				height: termTitleSizes.height + 'px',
				fontSize: termTitleSizes.fontSize + 'px',
				padding: termTitleSizes.verticalPadding + 'px ' + termTitleSizes.horizontalPadding + 'px'
			}).attr('title', hours+' credit '+ hoursText);

			em.gridSystem.renderAtGridPoint($termTitle, termIndex, 0, termTitleOffset, term.renderData.singleOffset);

			var courses = term.courses;

			var maxCoursesAmount = em._maxCoursesAmount;

			var courseIndexOffset = em._coursesIndexPadding + (maxCoursesAmount - courses.length) / 2;
			for(var courseIndex = 0; courseIndex < courses.length; courseIndex++) {
				var course = courses[courseIndex];
				var x = termIndex;
				var y = courseIndex + courseIndexOffset;

				if(!_.isObject(course)) {
					continue;
				}

				if(!course.id) {
					course.id = '_' + (+(new Date())) + Math.random().toString().slice(2);
					course.generatedId = course.id;
				}

				if(!course.renderData) {
					course.renderData = {};
				}

				if(em._zoomLevel === 1) {
					course.renderData.singleOffset = course.renderData.singleOffset || 0;
				} else {
					course.renderData.singleOffset = 0;
				}

				course.renderData.termIndex = x;
				course.renderData.courseIndex = y;
				course.renderData.courseItemIndex = courseIndex;
				course.renderData.gridCoordinates = {
					x: x,
					y: y
				};
				if(!course.renderData.isCriticalPath) {
					course.renderData.isCriticalPath = em._criticalPathById[course.id]? true : false;
				}
				cm.renderCourse(course, x, y, _zoomLevel);
				if(!em._coursesById[course.id]) {
					em._coursesById[course.id] = course;
				}
				em._coursesByTermId[course.id+'-'+termIndex+'-'+courseIndex] = course;
				em._coursesByCode[course.code] = course;
			}
		}
	};

	cm.courseCircleMultiply = function(hours) {
		var baseSize = 1,
			baseHours = 3,
			maxHours = 5,
			step = 0.15;

		var _hours = hours <= maxHours? hours : maxHours;
		var diffHours = _hours - baseHours;
		var multiplier = baseSize + diffHours * step;

		return multiplier;
	};

	cm.renderCourse = function(course, termIndex, courseIndex, zoomLevel) {
		var $course = course.renderData.$element;
		zoomLevel = zoomLevel || em._zoomLevel;

		var getGoalIndex = function (course) {
			var currentGoals = edunav.currentGoals;
			var courseGoals = course.goals;
			var i = 0;

			for(var key in currentGoals) {
				for(var key2 in courseGoals) {
					var currentGoal = currentGoals[key];
					var goalInfo = edunav.goalsManager.getFullGoalInfoById(currentGoals.id);
					var goalType = edunav.goalsManager.getGoalCollectionTypeById(currentGoals.id);
					var courseGoal = courseGoals[key2];
					var id = currentGoal.id;

					if(id === courseGoal) {
						continue;
					}

					if(goalType !== "careers") {
						i++;
					}
				}
			}

			return i;
		};

		if(!$course) {
			$course = $('<div>').attr('class', em.classNames.course+' marker-body edu-map-opacity');
			$course.attr('data-id', course.id);
			var courses = edunav.courses || {};
			var _course = courses[course.id] || {};
			course.renderData.title = _course.name || course.name;
			$course.attr('data-title', course.renderData.title);
			course.renderData.$element = $course;
			course.prerequisites = _course.prerequisites;
		}

		$course.attr('data-render-id', course.id+'-'+termIndex+'-'+course.renderData.courseItemIndex);
		course.renderData.tempId = course.id+'-'+termIndex+'-'+course.renderData.courseItemIndex;

		var width, height, borderRadius, borderWidth, fontSize, boxShadow, boxShadowSize,
			borderColor, backgroundColor, color, horizontalPadding, verticalPadding, margin;

		var offset, sizes, radiusMultiply, hours = course.hours || 3;
		radiusMultiply = 1;//em._courseCircleMultiply(hours);
		course.renderData.radiusMultiply = radiusMultiply;

		var renderData = em._data.terms[termIndex].renderData || {};
		course.renderData._isActiveTerm = renderData._isActiveTerm || false;

		var courseColor =
			course.renderData._isActiveCourse || zoomLevel === 2?
				em.utils.getCourseColor(course, em.colors.lightGrey, em.colors.lightGrey):
				em.utils.getCourseColor(course, em.colors.grey, em.colors.white);

		boxShadow = '0';
		margin = {
			left: 0,
			right: 0
		};


		switch (zoomLevel) {
			case 1:
				offset = em.gridSystem.getCircleOffset(radiusMultiply);
				sizes = em._courseCircleSizes;
				width = sizes.radius * 2 * radiusMultiply;
				height = sizes.radius * 2 * radiusMultiply;
				borderRadius = sizes.radius * radiusMultiply;
				borderWidth = sizes.borderWidth * radiusMultiply;
				color = em.colors.darkGrey;
				horizontalPadding = verticalPadding = 0;
				fontSize = 0;
				$course.text('');
				borderColor = courseColor.borderColor;
				backgroundColor = courseColor.backgroundColor;

				if(course.electiveIds) {
					boxShadowSize = sizes.boxShadowSize * radiusMultiply;
					borderWidth -= boxShadowSize;
					borderRadius -= boxShadowSize;
					margin.left = boxShadowSize;
					margin.top = boxShadowSize;
					width -= boxShadowSize * 2;
					height -= boxShadowSize * 2;
					boxShadow = '0 0 0 ' + boxShadowSize + 'px '+em.colors.action;

					if(course && course.effectiveCourse) {
						borderColor = em.colors.grey;
					} else {
						borderColor = em.colors.action;
					}
				}

				em.utils.addCallbackForNextTransitionEnd({
					$element: $course,
					callback: function() {
						$course.removeClass(em.classNames.courseSecondLevel);
					}
				});

				break;
			case 2:
				if(em.isCourseHover) {
					em.utils.generateRatioForSecondLevel();
					cm.calculateMediumRectangleSizes();
				}
				if(renderData._isActiveTerm) {
					em.utils.generateRatioForSecondLevel(true);
					cm.calculateMediumRectangleSizes();
				}
				offset = em.gridSystem.getMediumRectangleOffset();
				sizes = em._courseMediumRectangleSizes;
				width = sizes.width;
				height = sizes.height;
				borderRadius = sizes.borderRadius;
				fontSize = sizes.fontSize;
				borderWidth = 2;
				borderColor = courseColor.borderColor;
				backgroundColor = courseColor.backgroundColor;
				color = em.colors.darkGrey;
				horizontalPadding = sizes.horizontalPadding;
				verticalPadding = sizes.verticalPadding;

				em.utils.addCallbackForNextTransitionEnd({
					$element: $course,
					callback: function() {
						setCourseTitle(course, course.renderData.title);
						var spanHeight = height - (verticalPadding+borderWidth)*2;
						$course.find('span').css({height: spanHeight + 'px', overflow: 'hidden', display: 'block'});
						if(course.electiveIds) {
							$course.append('<div class="elective--set-text"><b>Set preference</b></div>');
							if(course.preferredCourses.length > 0) {
								$course.find('.elective--set-text b').text('Change preference');
							}
						}
						$course.addClass(em.classNames.courseSecondLevel);
					}
				});

				break;
		}

		if(course.electiveIds) {
			$course.addClass('is-elective');
		}

		if(course.electiveIds && !course.electiveFocus && zoomLevel === 2) {
			$course.addClass('course-elective');
		} else {
			$course.removeClass('course-elective');
		}

		$course.css({
			width: width + 'px',
			height: height + 'px',
			borderRadius: borderRadius + 'px',
			borderWidth: borderWidth + 'px',
			fontSize: fontSize + 'px',
			padding: verticalPadding + 'px ' + horizontalPadding + 'px',
			color: color,
			backgroundColor: backgroundColor,
			borderColor: borderColor,
			boxShadow: boxShadow,
			marginLeft: margin.left,
			marginTop: margin.top
		});

		course.renderData.baseRenderOffset = em.gridSystem.getGridPointOffset(termIndex, courseIndex);
		offset.left += course.renderData.singleOffset;
		var courseOffset = em.gridSystem.combineOffsets(course.renderData.baseRenderOffset, offset);
		var containerWidth = em._containerSize.width;
		var courseRightOffset = courseOffset.left + width;

		if(zoomLevel === 2 && em.isCourseHover) {
			if(courseOffset.left < 0) {
				courseOffset.left = 0;
			}

			if(courseRightOffset > containerWidth) {
				courseOffset.left = containerWidth - width;
			}
		}


		em.gridSystem.renderAtOffset($course, courseOffset);
	};

	cm.calculateMaxCoursesAmount = function(terms) {
		var result = 0;
		for(var termIndex = 0; termIndex < terms.length; termIndex++) {
			if(em.goalsManager.isGoalTerm(terms[termIndex])) {
				continue;
			}
			var coursesAmount = terms[termIndex].courses.length;
			if(coursesAmount > result) {
				result = coursesAmount;
			}
		}
		em._maxCoursesAmount = result;
		em._maxCoursesAmountBeta = em._maxCoursesAmount;
		em._maxCoursesAmountGamma = em._maxCoursesAmountGamma || em._maxCoursesAmount;
	};

	cm.calculateCircleSizes = function() {
		var result = {};
		var base = em.baseCourseCircleSizes;

		result.radius = Math.round(base.radius * em._ratio);
		result.borderWidth = Math.round(result.radius * (base.borderWidth / base.radius));
		result.boxShadowSize = Math.round(result.radius * (base.boxShadowSize / base.radius));

		em.circleRadius = result.radius;

		em._courseCircleSizes = result;
	};

	cm.calculateMediumRectangleSizes = function() {
		var result = {};
		var base = em.baseMediumRectangeSizes;

		result.width = Math.round(base.width * em._ratio);
		result.height = Math.round(result.width * (base.height / base.width));
		result.borderRadius = Math.round(base.borderRadius * em._ratio);

		var heightIncreaseRatio = result.height / base.height;
		result.fontSize = Math.round(base.fontSize * heightIncreaseRatio);

		result.horizontalPadding = Math.round(base.horizontalPadding * em._ratio);
		result.verticalPadding = Math.round(result.horizontalPadding * (base.verticalPadding / base.horizontalPadding));
		em._courseMediumRectangleSizes = result;
	};

	cm.moveCourse = function(courseId, termIndex) {
		$(em.selectors.termTitle).removeClass('state-move is-move').off('click', em.termsManager.onTermMouseClick);

		var _data = _.clone(em._data);
		var _terms = _data.terms;
		var _tempCourse, i, k;
		var course = em._coursesByTermId[courseId];
		var termIndex2 = course.renderData.termIndex;


		var courses = _.clone(_terms[termIndex2].courses);
		for(k = 0; k < _terms[termIndex2].courses.length; k++) {
			if(courses[k].renderData.tempId === courseId) {
				_tempCourse = _.clone(courses[k]);
				courses.splice(k, 1);
				break;
			}
		}

		_terms[termIndex2].courses = courses;

		if(em._invertAssert) {
			_terms[termIndex].courses.unshift(_tempCourse);
		} else {
			_terms[termIndex].courses.push(_tempCourse);
		}

		_data.terms = _terms;

		edunav.mapData = _data;

		em.utils.clean();
		em.reRenderMap($(em.selectors.mapContainer), edunav.mapData, em._zoomLevel);
		cm.onCoursesRendered();
	};

	cm.renderMarker = function($this) {
		if($this instanceof jQuery) {
			if($this.is(edunav._contextSidePanel._$target)) {
				em.utils.addCallbackForNextTransitionEnd({
					$element: $this,
					callback: function() {
						edunav._contextSidePanel._renderMarker($this);
					}
				});
			}
		}
	};

	cm.attachCourseEventHandlers = function() {
		var $courses = $(em.selectors.course);
		$courses.on('click', onCourseMouseClick);
		$(window).on('keydown', onCourseInverseAssert);
		$(window).on('keyup', onCourseConverseAssert);
		$courses.on('mouseenter', onCourseMouseOver);
		$courses.on('mouseleave', onCourseMouseOut);
	};

	cm.removeCourseEventHandlers = function() {
		var $courses = $(em.selectors.course);
		$courses.off('click', onCourseMouseClick);
		$(window).off('keydown', onCourseInverseAssert);
		$(window).off('keyup', onCourseConverseAssert);
		$courses.off('mouseenter', onCourseMouseOver);
		$courses.off('mouseleave', onCourseMouseOut);
	};

	cm.onCoursesRendered = function() {
		cm.removeCourseEventHandlers();
		cm.attachCourseEventHandlers();
		em.disableZoomLevel();
		em.connectionsManager.processAndRenderSvgContent();
		em.gridSystem.renderCoursesSeparators();
		em.trigger('courses-rendered');
		edunav.trigger('courses-rendered');
		em.termsManager.offZoomTerm();
		em.termsManager.zoomTerm();
		edunav.updateScrollBars();
	};

	cm.getPrerequisitesById = function(id) {
		var prerequisites = edunav.getCourseById[id].prerequisites;
		return getPrerequisites(prerequisites);
	};

	cm.getPrerequisites = function(prerequisites) {
		return getPrerequisites(prerequisites);
	};

	cm.addingRadioControlInCourse = function() {
		var preferences = ['No preference', 'Preferred', 'Exempt'];
		var preferenceSelected = 'no_preference';
		var preferredCourses = edunav.map.getPlanProfileProperty('preferredCourses') || [];
		var preferredCourseTerm, defaultPreferenceSelected;
		var currentTermIndex = em.currentTermIndex;
		var terms = edunav.terms;
		var currentUserTermsPreferences = edunav.map.getPlanProfileProperty('termsPreferences') || edunav.termsPreferences;
		var termPreferenceSelected = preferredCourseTerm || em._data.terms[currentTermIndex].id || 'fall2016';
		var select = '<select class="edu-course-preference-select">';

		var radioControl = {};

		var $options = $('<div>', {
			'class': 'edu-course-preference-options'
		});
		var $select = $('<div>', {
			'class': 'edu-course-term-select'
		});

		for (var i in preferredCourses) {
			var preferredCourse = preferredCourses[i];
			if (preferredCourse.courseId === id) {
				preferenceSelected = preferredCourse.preference;
				preferredCourseTerm = preferredCourse.termId || undefined;
				break;
			}
		}

		for (var key in preferences) {
			if(!preferences.hasOwnProperty(key)) {
				continue;
			}
			var preference = preferences[key];
			var label = '<label>{input} '+preference+'</label>';
			var inputValue = preference.toLowerCase().replace(/\s/gi, '_');
			var checked = inputValue === preferenceSelected? ' checked="checked"' : '';
			var input = '<input class="edu-course-preference-radio-input" type="radio" name="preference" value="'+inputValue+'" '+checked+'>';

			$options.append(label.replace('{input}', input));
		}
		radioControl.$options = $options;

		defaultPreferenceSelected = preferenceSelected;
		for (var i in terms) {
			var term = terms[i];
			var termPreference, termId, termTitle, selected;

			if (currentUserTermsPreferences.length > 0) {
				for (var indexTermsUser in currentUserTermsPreferences) {
					var currentUserTerm = currentUserTermsPreferences[indexTermsUser];
					if (term.id === currentUserTerm.id) {
						if(currentUserTermsPreferences[indexTermsUser].preference !== 'normal') {
							continue;
						}

						termPreference = currentUserTermsPreferences[indexTermsUser];
						termId = termPreference.id;
						termTitle = edunav.getTermById(termId).name;
						selected = termId === termPreferenceSelected? ' selected="selected"' : '';

						select += '<option value="'+termId+'"'+selected+'>'+termTitle+'</option>';
					}
				}
			} else {
				termPreference = term[i];
				termId = termPreference.id;
				termTitle = edunav.getTermById(termId).name;
				selected = termId === termPreferenceSelected ? ' selected="selected"' : '';

				select += '<option value="'+termId+'"'+selected+'>'+termTitle+'</option>';
			}
		}

		select += '</select>';

		radioControl.buttons = [
			{
				text: 'Save preference',
				'class': 'edu-save-preference'
			},
			{
				text: 'Close',
				onClick: edunav._contextSidePanel.close
			}
		];
		radioControl.$select = $select.append('Preferred term: ').append(select);

		return radioControl;
	};

	cm.renderCoursesInfoPanel = function(params) {
		var id = params.id;
		var savePreviousState = params.savePreviousState;
		var buttons = params.buttons;
		var afterOpen = params.afterOpen;
		var noCollapse = params.noCollapse;

		var courses = edunav.courses;
		var course = em._coursesByTermId[id];
		course = course?course:_.findWhere(courses, {id: id}) || em._coursesById[id];

		var courseId = course.id;
		var courseInfo = edunav.getCourseById[courseId] || course;
		var prerequisites = courseInfo.prerequisites;
		var courseName = '';
		var _course = '';

		var $this = course.renderData && course.renderData.$element? course.renderData.$element: false;
		var termId = $this? $this.attr('data-render-id'): false;

		$(em.selectors.course).each(function () {
			var _$this = $(this);
			var _id = _$this.attr('data-render-id');
			var course = em._coursesByTermId[_id];

			if(id === _id) {
				return true;
			}

			if(noCollapse) {
				return false;
			}

			course.renderData._isActiveCourse = false;
			_$this.trigger('mouseleave');
		});

		if($this && !noCollapse) {
			$(document).on('closeContextSidePanel', function () {
				em.isCourseHover = false;
				course.renderData._isActiveCourse = false;
				$this.trigger('mouseleave');
			});
		}

		var hours = course.hours? course.hours : '-';
		var minimumGrade = course.minimumGrade? course.minimumGrade : '-';
		var $desc = $('<div/>');
		var desc = courseInfo && courseInfo.description? '<p>'+courseInfo.description+'</p>' : '';

		if(_.isEmpty(desc) && course.electiveIds) {
			desc = 'This is an elective slot. Click "Set preference" to choose courses.';
		}

		if(course.renderData) {
			em.activeCourseId = id;
			course.renderData._isActiveCourse = true;
		}

		if(!_.isUndefined(edunav.mapData.courses)) {
			_course = edunav.mapData.courses[course.id];
			courseName = _course? _course.name : course.name;
		} else {
			courseName = course.name;
		}

		if (params.coursePreferenceRadioInput) {
			var radioControl = cm.addingRadioControlInCourse();
			buttons = radioControl.buttons;
			$desc.append(radioControl.$options).append(radioControl.$select);
		}

		$desc.append(desc);
		$desc.append('<p>Credit hours: '+ hours +'</p>');

		if(_.isUndefined(buttons)) {
			buttons = [
				{
					text: 'Close',
					onClick: edunav._contextSidePanel.close
				}
			];

			if(course.electiveIds && $this) {
				buttons.push({
					text: 'Set preference',
					onClick: function () {
						$this.find('.elective--set-text').trigger('click');
					}
				});
			}
		}


		edunav._contextSidePanel.open({
			params: {
				description: $desc,
				dataCourse: termId
			},
			savePreviousState: savePreviousState,
			renderAllComponents: {
				afterTrigger: 'all-courses-loaded',
				ifHasData: edunav.courses,
				afterRendered: function(args, template) {
					template.$contentWrapper.find(edunav._contextSidePanel.selectors.eduContextSidePanelText).append(getPrerequisites(prerequisites));
				}
			},
			afterOpen: afterOpen,
			title: 'Course info:',
			description: courseName,
			components: 'text',
			focusFor: $this,
			buttons: buttons
		});
	};

	var setCourseTitle = function(course, title) {
		var $course = course.renderData.$element;
		var hours = course.hours;
		var hoursText = hours === 1?  ' hour' : ' hours';
		var hoursHTML;

		if(hours === 0) {
			hoursHTML = '';
		} else if(hours <= 6) {
			hoursHTML = '<strong title="'+hours+' credit '+hoursText+'"><i class="edunav-icon edunav-hours-icon edunav-hours-icon-'+hours+'"></i></strong>';
		} else {
			hoursHTML = '<strong title="'+hours+' credit '+hoursText+'" class="edunav-hours-text--single">'+hours+' <i class="fa fa-cricle"></i></strong>';
		}
		var id = _.isUndefined(course.generatedId)? course.id+': ' : '';
		var courseHtml = hoursHTML + '<span>' + (course.electiveIds ? '' : id) + title + '</span>';
		$course.html(courseHtml);
		if(course.electiveIds) {
			$course.attr('title', title);
		}
	};

	var onCourseInverseAssert = function(e) {
		if(e.keyCode === 16) {
			em._invertAssert = true;
			em._isZoomTerm = true;
		}
	};

	var onCourseConverseAssert = function(e) {
		if(e.keyCode === 16) {
			em._invertAssert = false;
			em._isZoomTerm = false;
		}
	};

	var onSetPreference = function(e, _this) {
		if(em._$container.hasClass('disable')) {
			return false;
		}
		e.stopPropagation();
		var $this = $(_this).closest(em.selectors.course);
		var id = $this.attr('data-render-id');
		var electiveId = $this.attr('data-id');
		var course = em._coursesByTermId[id];

		$(em.selectors.course).each(function () {
			var _$this = $(this);
			var _id = _$this.attr('data-render-id');
			var course = em._coursesByTermId[_id];

			if(id === _id) {
				return true;
			}

			course.renderData._isActiveCourse = false;
			_$this.trigger('mouseleave');
		});

		course.renderData._isActiveCourse = true;

		$(document).on('closeContextSidePanel', function () {
			em.isCourseHover = false;
			course.renderData._isActiveCourse = false;
			$this.trigger('mouseleave');
		});

		em.activeCourseId = id;

		if(course.electiveIds) {
			var electivesList = [];
			var changeColor = function() {
				var _changeColor = function () {
					var colors = em.colors;
					var _zoomLevel = course.renderData.zoomLevel;
					var courseColor, borderColor, backgroundColor;

					if(em.isCourseHover || _zoomLevel === 2 || course.renderData._isActiveTerm) {
						courseColor = em.utils.getCourseColor(course, colors.lightGrey, colors.lightGrey);
						borderColor = courseColor.borderColor;
						backgroundColor = courseColor.backgroundColor;
					} else {
						courseColor = em.utils.getCourseColor(course, colors.grey, colors.white);
						borderColor = em.colors.grey;
						backgroundColor = courseColor.backgroundColor;
					}

					course.renderData.$element.css({
						backgroundColor: backgroundColor,
						borderColor: borderColor
					});
				};

				var electives = em.getPlanProfileProperty('electives');
				var elective = _.findWhere(electives, {id: course.id});

				if( ( _.isUndefined(elective) || _.isEmpty(elective) ) && course.electiveIds )  {
					course.electiveFocus = false;

					if(em._zoomLevel === 2) {
						course.renderData.$element.addClass('course-elective');
					}

					if(course.renderData.$element.find('.elective--set-text').length === 0 && em.isCourseHover) {
						course.renderData.$element.append('<div class="elective--set-text"><b>Set preference</b></div>');
					}

					_changeColor();

				} else {
					course.electiveFocus = true;
					course.renderData.$element.removeClass('course-elective');
					_changeColor();
				}
			};
			var moveElective = function(oldIndex, newIndex) {
				var _electives = em.getPlanProfileProperty('electives');
				var _elective = _.findWhere(_electives, {id: electiveId});

				if(_elective && _elective.preferredCourses && _elective.preferredCourses.length > 0) {
					var data = _elective.preferredCourses;

					while (oldIndex < 0) {
						oldIndex += data.length;
					}

					while (newIndex < 0) {
						newIndex += data.length;
					}

					if (newIndex >= data.length) {
						var k = newIndex - data.length;
						while ((k--) + 1) {
							data.push(undefined);
						}
					}

					data.splice(newIndex, 0, data.splice(oldIndex, 1)[0]);
					em.setPlanProfileProperty('electives', _electives);
				}
			};

			var uid;
			var request = function() {
				edunav.currentAjaxRequests.electives.progress = true;
				var $globalThrobber = edunav.showThrobber('global');

				edunav.dataAccess.getMapData({
					goals: edunav.currentGoals,
					planProfile: em.getPlanProfile()
				}, function(error, dataMap) {
					$globalThrobber.remove();

					edunav.currentAjaxRequests.electives.progress = false;
					_.each(dataMap, function(value, key) {
						if(key === 'planProfile') {
							return true;
						}
						edunav.mapData[key] = value;
					});

					edunav.setState(edunav.ApplicationStates.Map, edunav.mapData);
					edunav.goalsManager.renderGoalsColumn();
					edunav.goalsManager.changeGoalBlockText();

					var $course = $('.course[data-id='+electiveId+']:first');
					var activeCourseId = $course.attr('data-render-id');
					var activeCourse = em._coursesByTermId[activeCourseId];
					if(activeCourse.renderData) {
						em.activeCourseId = activeCourseId;
					}

					edunav._contextSidePanel.close();

					$course.trigger('mouseover');
					var handler = function () {$course.trigger('mouseleave');};
					$(document).off('closeContextSidePanel', handler).on('closeContextSidePanel', handler);
					edunav._contextSidePanel.open(_.extend(electiveParams, {savePreviousState: false, focusFor: $('.course[data-id='+electiveId+']')}));
				});
			};

			var electiveParams = {
				title: 'Elective preference:',
				savePreviousState: true,
				renderAllComponents: {
					afterTrigger: 'all-courses-loaded',
					ifHasData: edunav.courses,
					callback: function(args) {
						args.beforeOpen(args);
					}
				},
				description: 'Select your preferred courses in order',
				components: ['list', 'search'],
				list: electivesList,
				focusFor: $this,
				fixedContent: '<p class="edu-fixed-content"><strong>Additional courses</strong></p>',
				fixedContentPosition: 'top',
				beforeOpen: function(args) {
					var electives = em.getPlanProfileProperty('electives') || [];
					var preferredCourses;

					if(!_.isEmpty(electives)) {
						var elective = _.findWhere(electives, {id: course.id}) || {};
						preferredCourses = elective.preferredCourses;
						course.selectedElectives = preferredCourses;
					}

					var data = edunav.courses || {};
					var selectedElectives = [];
					args.list = [];

					var key, key2, item;
					if(!_.isUndefined(preferredCourses)) {
						for (key in preferredCourses) {
							for (key2 in data) {
								item = data[key2];

								if(preferredCourses[key] === item.id) {
									selectedElectives.push(item);
								}
							}
						}

						for (key in data) {
							item = data[key];
							if(preferredCourses.indexOf(item.id) !== -1) {
								continue;
							}
							args.list.push(item);
						}
					}

					if(_.isUndefined(preferredCourses)) {
						for (key in data) {
							item = data[key];
							args.list.push(item);
						}
					}


					args.list = _.sortBy(args.list, 'id');
					args.selectedElectives = selectedElectives;
				},
				afterOpen: function(template, args) {
					var $content = template.$content;
					var $fixedContent = $content.find('div.edu-context-side-panel__fixed-content');
					var $courseInfoTitle = template.$courseInfoTitle;
					var $courseInfoDescription = template.$courseInfoDescription;
					var _electives = edunav.map.getPlanProfileProperty('electives');
					var _elective = _.findWhere(_electives, {id: electiveId});

					if(_elective && _elective.preferredCourses && _elective.preferredCourses.length > 0) {
						var selectedElectives = _elective.preferredCourses;
						var _course = em._coursesByTermId[em.activeCourseId];
						var effectiveCourseId = _course.effectiveCourse;
						if(effectiveCourseId) {
							var name = _course.name;
							var effectiveCourse = edunav.getCourseById[effectiveCourseId];
							var effectiveCourseName = effectiveCourse? effectiveCourse.name : '';
							$courseInfoTitle.html(name);
							$courseInfoDescription.html('Preferred course: <strong>'+effectiveCourseName+' ('+effectiveCourseId+')</strong>');
						}

						var listTemplate = function(item, key) {
							var id = item.id;
							var name = item.name;
							var title = id +' '+name;
							var hours = item.hours || 0;
							var hoursText = hours === 1?  ' hour' : ' hours';
							var hoursHTML;

							if(hours === 0) {
								hoursHTML = '';
							} else if(hours <= 6) {
								hoursHTML = '<strong class="edunav-hours-icon-container" title="'+hours+' credit '+hoursText+'"><i class="edunav-hours-icon edunav-hours-icon-'+hours+'"></i></strong>';
							} else {
								hoursHTML = '<strong title="'+hours+' credit '+hoursText+'" class="edunav-hours-text--single">'+hours+' <i class="edunav-hours-icon--single"></i></strong>';
							}

							var $electiveItem;
							if(_elective && _elective.preferredCourses && _elective.preferredCourses.length > 0 && _elective.preferredCourses.indexOf(id) !== -1) {
								var selectedElectives = _elective.preferredCourses;
								var $upBtn = $('<div/>', {'class': 'edu-elective-up', text: "E"});
								var $downBtn = $('<div/>', {'class': 'edu-elective-down', text: "F"});
								var $delete = $('<div/>', {'class': 'edu-delete-elective', text: 'A'});

								$electiveItem = $('<li/>', {'class': 'edu-context-side-panel-list-item edu-suggestions-item edu-elective-line', 'data-id': id});
								var $btnHolder = $('<span/>', {'class': 'edu-elective-btn-holder'}).appendTo($electiveItem);
								$('<span/>', {'class': 'edu-context-side-panel-list-item-wrapper edu-elective-preferred', html: title}).appendTo($electiveItem);
								$('<span/>', {
									'class': 'edu-suggestion__credit-holder',
									'title': hours + ' credit ' + (hours > 1? 'hours' : 'hour'),
									'html': hoursHTML
								}).appendTo($electiveItem);

								if(parseInt(key, 10) === selectedElectives.length  - 1) {
									$electiveItem.addClass('edu-elective-preferred--last');
								}

								$btnHolder.append($delete);

								if(selectedElectives.length > 1) {
									if(parseInt(key, 10) === 0) {
										$upBtn.addClass('disabled');
									}

									if(parseInt(key, 10) === selectedElectives.length  - 1) {
										$downBtn.addClass('disabled');
									}

									$btnHolder.append($downBtn);
									$btnHolder.append($upBtn);
									$btnHolder.addClass('edu-elective-btn-holder--with-nav');
								}
							} else {
								$electiveItem = $('<li/>', {'class': 'edu-context-side-panel-list-item edu-suggestions-item', 'data-id': id});
								$('<span/>', {'class': 'edu-context-side-panel-list-item-wrapper', html: title}).appendTo($electiveItem);
								$('<span/>', {
									'class': 'edu-suggestion__credit-holder',
									'title': hours + ' credit ' + (hours > 1? 'hours' : 'hour'),
									'html': hoursHTML
								}).appendTo($electiveItem);
							}

							return $electiveItem;
						};

						var _selectedElectives = args.selectedElectives;

						$fixedContent.prepend('<ul class="edu-context-side-panel-list--fixed ps-container"></ul>');
						$fixedContent.prepend('<p class="edu-fixed-content"><strong>Preferred courses</strong></p>');

						_.each(_selectedElectives, function(item, key) {
							var $item = listTemplate(item, key);
							$fixedContent.find('.edu-context-side-panel-list--fixed').append($item);
							$item.on('click', args.onClickListItem);
						});

						$fixedContent.find('.edu-elective-line').each(function(i) {
							$(this).find('.edu-delete-elective').off().on('click', function(e) {
								e.preventDefault();
								e.stopPropagation();
								selectedElectives.splice(i, 1);
								request();
								changeColor();
							});
							$(this).find('.edu-elective-up').off().on('click', function(e) {
								e.preventDefault();
								e.stopPropagation();
								if(!$(this).hasClass('disabled')) {
									moveElective(i, i - 1);
									request();
								}
							});
							$(this).find('.edu-elective-down').off().on('click', function(e) {
								e.preventDefault();
								e.stopPropagation();
								if(!$(this).hasClass('disabled')) {
									moveElective(i, i + 1);
									request();
								}
							});
						});

					}
				},
				listTemplate: function(item) {
					var id = item.id;
					var name = item.name;
					var title = id +' '+name;
					var hours = item.hours || 0;
					var hoursText = hours === 1?  ' hour' : ' hours';
					var hoursHTML;

					if(hours === 0) {
						hoursHTML = '';
					} else if(hours <= 6) {
						hoursHTML = '<strong class="edunav-hours-icon-container" title="'+hours+' credit '+hoursText+'"><i class="edunav-hours-icon edunav-hours-icon-'+hours+'"></i></strong>';
					} else {
						hoursHTML = '<strong title="'+hours+' credit '+hoursText+'" class="edunav-hours-text--single">'+hours+' <i class="edunav-hours-icon--single"></i></strong>';
					}

					var $electiveItem;
					$electiveItem = $('<li/>', {'class': 'edu-context-side-panel-list-item edu-suggestions-item', 'data-id': id});
					$('<span/>', {'class': 'edu-context-side-panel-list-item-wrapper', html: title}).appendTo($electiveItem);
					$('<span/>', {
						'class': 'edu-suggestion__credit-holder',
						'title': hours + ' credit ' + (hours > 1? 'hours' : 'hour'),
						'html': hoursHTML
					}).appendTo($electiveItem);

					return $electiveItem;
				},
				onClickListItem: function() {
					var data = edunav.courses || {};
					var key = $(this).attr('data-id');
					var item = _.find(data, {id: key});
					var id = item.id;
					var electives = em.getPlanProfileProperty('electives') || [];
					var _course = _.findWhere(electives, {id: course.id});
					var buttons = [];

					if(_course && _course.preferredCourses && _course.preferredCourses.indexOf(id) !== -1) {
						buttons.push({
							text: 'Close',
							onClick: edunav._contextSidePanel.close
						});
					} else {
						buttons.push({
							text: 'Add as<br> preference',
							'class': 'edu-context-side-panel--add-preference',
							onClick: function() {
								var $this = $(this);
								var electives = em.getPlanProfileProperty('electives') || [];
								var _selectedElectives = course.selectedElectives || {};
								var _selectedElectivesArray = _.isArray(_selectedElectives)? _selectedElectives : [];
								var _course = _.findWhere(electives, {id: course.id});

								_selectedElectivesArray.push(id);
								_selectedElectives = _selectedElectivesArray;
								course.selectedElectives = _selectedElectives;

								if(_.isEmpty(_course)) {
									_course = edunav.deepClone(course);

									_course.renderData = undefined;
									delete _course.renderData;
									_course.selectedElectives = undefined;
									delete _course.selectedElectives;
									_course.electiveFocus = undefined;
									delete _course.electiveFocus;

									_course.preferredCourses = _selectedElectives;
									electives.push(_course);
								} else {
									_.each(electives, function(item, key) {
										if(item.id === course.id) {
											electives[key] = _course;
										}
									});
								}

								em.setPlanProfileProperty('electives', electives);
								var $throbber = edunav.showThrobber();
								$this.addClass('loader').html($throbber.html());
								request();
							}
						});
					}

					em.coursesManager.renderCoursesInfoPanel({
						id: id,
						noCollapse: true,
						focusFor: $this,
						buttons: buttons,
						savePreviousState: true
					});
				},
				buttons: [
					{
						text: 'Close',
						onClick: function() {
							edunav._contextSidePanel.close();
						}
					}
				]
			};
			uid = edunav._contextSidePanel.open(electiveParams);
		}
	};

	var onCourseMouseClick = function(e) {
		if(em._$container.hasClass('disable')) {
			return false;
		}
		var $this = $(this);

		if($this.hasClass('is-elective')) {
			onSetPreference(e, this);
			return false;
		}

		var id = $this.attr('data-render-id');
		cm.renderCoursesInfoPanel({
			id: id,
			coursePreferenceRadioInput: true
		});
	};

	var onCourseMouseOver = function() {
		var $this = $(this);
		var course = em._coursesByTermId[$this.attr('data-render-id')];

		if(course.renderData._isActiveTerm) {
			return false;
		}

		if(em._zoomLevel === 1) {
			em.isCourseHover = true;
			cm.renderCourse(course, course.renderData.termIndex, course.renderData.courseIndex, 2);
			course.renderData.$element.css({zIndex: 2});

			em.utils.addCallbackForNextTransitionEnd({
				$element: course.renderData.$element,
				callback:  function() {
					cm.renderMarker($this);
					edunav.updateScrollBars();
				}
			});
		} else {
			cm.renderMarker($this);
		}
	};

	var onCourseMouseOut = function() {
		var $this = $(this);
		var $html = $('html');
		var course = em._coursesByTermId[$this.attr('data-render-id')];

		if(course.renderData._isActiveTerm || course.renderData._isActiveCourse) {
			return false;
		}

		if(!$html.hasClass('ios') && !$html.hasClass('android')) {
			if(em.isCourseHover){
				em.coursesManager.renderMarker($this);
				em._zoomLevel = 1;
			}
		}

		if(em._zoomLevel === 1) {
			em.isCourseHover = false;
			cm.renderCourse(course, course.renderData.termIndex, course.renderData.courseIndex, 1);
			course.renderData.$element.css({zIndex: ''});

			em.utils.addCallbackForNextTransitionEnd({
				$element: course.renderData.$element,
				callback:  function() {
					edunav.updateScrollBars();
				}
			});
		}
	};

	function getPrerequisites(prerequisites) {
		if(!_.isUndefined(prerequisites)) {
			var prerequisitesContainer = '<div class="edu-prerequisites-container"><span class="open-prerequisites"><i class="fa fa-chevron-right"></i> Prerequisites</span> <div class="edu-prerequisites-text edu-prerequisites--compact">{content}</div></div>';

			var _plain = function(prerequisites, callback) {
				var _prerequisites = [];
				var _obj = {};
				_.each(prerequisites, function(value, key) {
					_.each(value, function(v, k){
						if(v.hasOwnProperty('and') || v.hasOwnProperty('or')) {
							_prerequisites.push(_plain(v, callback));
						} else {
							if(_.isFunction(callback)) {
								_prerequisites.push(callback(v.id));
							} else {
								_prerequisites.push(v.id);
							}
						}
					});
					_obj[key] = _prerequisites;
				});

				return _obj;
			};

			var _extract = function(_prerequisites, _deep, _separator) {
				var stringLine = '';
				var separator = _separator || '';
				var deep = _deep || 0;
				var prerequisites = [];

				_.each(_prerequisites, function(value, key) {
					if(_.isArray(value)) {
						separator = ' '+ key +' ';
						if(deep === 0) {
							stringLine += _extract(value, deep + 1, separator);
						} else {
							stringLine += '<div class="edu-prerequisites--inner">'+_extract(value, deep + 1, separator)+'</div>';
						}
					} else if(_.isObject(value)) {
						prerequisites.push(_extract(value, deep + 1));
					} else {
						prerequisites.push(value);
					}
				});

				stringLine += prerequisites.join(separator);
				return stringLine;
			};

			var _plainCallback = function(item){
				var _course = _.find(edunav.courses, {id: item});

				if(_course) {
					var name = '<span class="name"> - '+_course.name+'</span>';
					return '<div><span class="prerequisite-link" data-id="'+item+'">'+item+name+'</span></div>';
				} else {
					return '<div><span class="prerequisite-end">'+item+'</span></div>';
				}
			};

			var _openPrerequisite = function($link) {
				var id = $link.attr('data-id');
				var course = _.find(edunav.courses, {id: id});
				var hours = course.hours? course.hours : '-';
				var $desc = $('<div/>');
				var desc = course.description? '<p>'+course.description+'</p>' : '';
				var prerequisites = course.prerequisites;

				$desc.append('<p>Credit hours: '+ hours +'</p>');
				$desc.append(desc);

				if(!_.isUndefined(prerequisites)) {
					var plain = _plain(prerequisites, _plainCallback);
					$desc.append(prerequisitesContainer.replace('{content}', _extract(plain)));
				}

				var _$this = $('.course[data-id="'+id+'"]');
				var termId = _$this.attr('data-render-id');

				$(em.selectors.course).each(function () {
					var _$this = $(this);
					var _id = _$this.attr('data-render-id');
					var course = em._coursesByTermId[_id];

					if(termId === _id) {
						return true;
					}

					course.renderData._isActiveCourse = false;
					_$this.trigger('mouseleave');
				});

				_$this.trigger('mouseenter');

				var _params = {
					params: {
						description: $desc,
						dataCourse: termId
					},
					afterOpen: function() {
						var handler = function () {
							_$this.trigger('mouseleave');
						};
						$(document).off('closeContextSidePanel', handler).on('closeContextSidePanel', handler);
					},
					onBack: function($panel) {
						var termId = $panel.attr('data-course');
						var _$this = $('.course[data-render-id="'+termId+'"]');

						edunav.removeSidePanelMarker();
						$(em.selectors.course).each(function () {
							$(this).trigger('mouseleave');
							var _id = $(this).attr('data-render-id');
							var course = em._coursesByTermId[_id];
							course.renderData._isActiveCourse = false;
						});

						_$this.trigger('mouseenter');
						em.utils.addCallbackForNextTransitionEnd({
							$element: _$this,
							callback: function() {
								edunav._contextSidePanel._renderMarker(_$this);
							}
						});
					},
					waitFocusForWait: _$this,
					savePreviousState: true,
					title: 'Course info:',
					description: course.name,
					components: 'text',
					buttons: [{
						text: 'Close',
						onClick: edunav._contextSidePanel.close
					}]
				};

				edunav._contextSidePanel.open(_params);
			};

			var plain = _plain(prerequisites, _plainCallback);

			$(document).off('click', '.prerequisite-link').on('click', '.prerequisite-link', function() {
				_openPrerequisite($(this));
			});

			$(document).off('click', '.open-prerequisites').on('click', '.open-prerequisites', function() {
				$(this).toggleClass('open-prerequisites--expand');
				$(this).find('i').toggleClass('fa-chevron-right').toggleClass('fa-chevron-down');
				$(this).siblings('.edu-prerequisites-text').toggleClass('edu-prerequisites--compact');
				$('.edu-perfect-scrollbar').perfectScrollbar('update');
			});

			return prerequisitesContainer.replace('{content}', _extract(plain));
		}

		return '';
	}



})();