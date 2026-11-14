/**
 * npm -i luxon
 * luxon-daterangepicker on github
/**
* @version: 3.1
* @author: Dan Grossman http://www.dangrossman.info/
* @copyright: Copyright (c) 2012-2019 Dan Grossman. All rights reserved.
* @license: Licensed under the MIT license. See http://www.opensource.org/licenses/mit-license.php
* @website: http://www.daterangepicker.com/
*/
import $ from 'jquery';
window.$ = window.jQuery = $;
import * as luxon from "luxon";



/**
* @version: 3.1
* @author: Dan Grossman http://www.dangrossman.info/
* @copyright: Copyright (c) 2012-2019 Dan Grossman. All rights reserved.
* @license: Licensed under the MIT license. See http://www.opensource.org/licenses/mit-license.php
* @website: http://www.daterangepicker.com/
*/
// Following the UMD template https://github.com/umdjs/umd/blob/master/templates/returnExportsGlobal.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Make globaly available as well
        define(['luxon', 'jquery'], function (luxon, jquery) {
            if (!jquery.fn) jquery.fn = {}; // webpack server rendering
            if (typeof luxon !== 'function' && luxon.hasOwnProperty('default')) luxon = luxon['default'];
            return factory(luxon, jquery);
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node / Browserify
        //isomorphic issue
        var jQuery = (typeof window != 'undefined') ? window.jQuery : undefined;
        if (!jQuery) {
            jQuery = require('jquery');
            if (!jQuery.fn) jQuery.fn = {};
        }
        var luxon = (typeof window != 'undefined' && typeof window.luxon != 'undefined') ? window.luxon : require('luxon');
        module.exports = factory(luxon, jQuery);
    } else {
        // Browser globals
        root.daterangepicker = factory(root.moment, root.jQuery);
    }
}(typeof window !== 'undefined' ? window : this, function(moment, $) {
    var DateRangePicker = function(element, options, cb) {
        //default settings for options
        this.parentEl = 'body';
        this.element = $(element);
        this.startDate = DateTime.now().startOf('day');
        this.endDate = DateTime.now().endOf('day');
        this.minDate = false;
        this.maxDate = false;
        this.maxSpan = false;
        this.autoApply = false;
        this.singleDatePicker = false;
        this.showDropdowns = false;
        this.minYear = DateTime.now().minus({years : 100}).toFormat('yyyy');
        this.maxYear = DateTime.now().plus({years : 100}).toFormat('yyyy');
        this.showWeekNumbers = false;
        this.showISOWeekNumbers = false;
        this.showCustomRangeLabel = true;
        this.timePicker = false;
        this.timePicker24Hour = false;
        this.timePickerIncrement = 1;
        this.timePickerSeconds = false;
        this.linkedCalendars = true;
        this.autoUpdateInput = true;
        this.alwaysShowCalendars = false;
        this.ranges = {};

        this.opens = 'right';
        if (this.element.hasClass('pull-right'))
            this.opens = 'left';

        this.drops = 'down';
        if (this.element.hasClass('dropup'))
            this.drops = 'up';

        this.buttonClasses = 'btn btn-sm';
        this.applyButtonClasses = 'btn-primary';
        this.cancelButtonClasses = 'btn-default';

        this.locale = {
            direction: 'ltr',
            format: 'MM/dd/yyyy',
            monthFormat: 'LLL', // dayOrder Letter month // LUXON - ADD // adapt the month formating for luxon.
            separator: ' - ',
            applyLabel: 'Apply',
            cancelLabel: 'Cancel',
            weekLabel: 'W',
            customRangeLabel: 'Custom Range',
            daysOfWeek: luxon.Info.weekdays('short'), // LUXON - DISABLED
            monthNames: luxon.Info.months('short'),
            firstDay: 1, 
            zone: 'Europe/Paris'
        };

        this.callback = function() { };

        //some state information
        this.isShowing = false;
        this.leftCalendar = {};
        this.rightCalendar = {};

        //custom options from user
        if (typeof options !== 'object' || options === null)
            options = {};

        //allow setting options with data attributes
        //data-api options will be overwritten with custom javascript options
        options = $.extend(this.element.data(), options);

        //html template for the picker UI
        if (typeof options.template !== 'string' && !(options.template instanceof $))
            options.template =
            '<div class="daterangepicker">' +
                '<div class="ranges"></div>' +
                '<div class="drp-calendar left">' +
                    '<div class="calendar-table"></div>' +
                    '<div class="calendar-time"></div>' +
                '</div>' +
                '<div class="drp-calendar right">' +
                    '<div class="calendar-table"></div>' +
                    '<div class="calendar-time"></div>' +
                '</div>' +
                '<div class="drp-buttons">' +
                    '<span class="drp-selected"></span>' +
                    '<button class="cancelBtn" type="button"></button>' +
                    '<button class="applyBtn" disabled="disabled" type="button"></button> ' +
                '</div>' +
            '</div>';

        this.parentEl = (options.parentEl && $(options.parentEl).length) ? $(options.parentEl) : $(this.parentEl);
        this.container = $(options.template).appendTo(this.parentEl);

        //
        // handle all the possible options overriding defaults
        //

        if (typeof options.locale === 'object') {

            if (typeof options.locale.direction === 'string')
                this.locale.direction = options.locale.direction;

            if (typeof options.locale.format === 'string')
                this.locale.format = options.locale.format;

            if (typeof options.locale.separator === 'string')
                this.locale.separator = options.locale.separator;

            if (typeof options.locale.daysOfWeek === 'object')
                this.locale.daysOfWeek = options.locale.daysOfWeek.slice();

            if (typeof options.locale.monthNames === 'object')
              this.locale.monthNames = options.locale.monthNames.slice();

            if (typeof options.locale.firstDay === 'number')
              this.locale.firstDay = options.locale.firstDay;

            if (typeof options.locale.applyLabel === 'string')
              this.locale.applyLabel = options.locale.applyLabel;

            if (typeof options.locale.cancelLabel === 'string')
              this.locale.cancelLabel = options.locale.cancelLabel;

            if (typeof options.locale.weekLabel === 'string')
              this.locale.weekLabel = options.locale.weekLabel;

            if (typeof options.locale.customRangeLabel === 'string'){
                //Support unicode chars in the custom range name.
                var elem = document.createElement('textarea');
                elem.innerHTML = options.locale.customRangeLabel;
                var rangeHtml = elem.value;
                this.locale.customRangeLabel = rangeHtml;
            }
        }
        this.container.addClass(this.locale.direction);

        if (typeof options.startDate === 'string')
            this.startDate = DateTime.fromISO(options.startDate, this.locale.zone);

        if (typeof options.endDate === 'string')
            this.endDate = DateTime.fromISO(options.endDate, this.locale.zone);

        if (typeof options.minDate === 'string')
            this.minDate = DateTime.fromISO(options.minDate, this.locale.zone);

        if (typeof options.maxDate === 'string')
            this.maxDate = DateTime.fromISO(options.maxDate, this.locale.zone);

        if (typeof options.startDate === 'object')
            this.startDate = DateTime.fromISO(options.startDate.toISO(), this.locale.zone);

        if (typeof options.endDate === 'object')
            this.endDate = DateTime.fromISO(options.endDate.toISO(), this.locale.zone);

        if (typeof options.minDate === 'object')
            this.minDate = DateTime.fromISO(options.minDate.toISO(), this.locale.zone);

        if (typeof options.maxDate === 'object')
            this.maxDate = DateTime.fromISO(options.maxDate.toISO(), this.locale.zone);

        if (this.minDate && this.startDate < this.minDate) // LUXON
            this.startDate = this.minDate.startOf('minute'); // LUXON
        
        // sanity check for bad options
        if (this.maxDate && this.endDate > this.maxDate) // LUXON
            this.endDate = this.maxDate.startOf('minute'); // LUXON
        

        if (typeof options.applyButtonClasses === 'string')
            this.applyButtonClasses = options.applyButtonClasses;

        if (typeof options.applyClass === 'string') //backwards compat
            this.applyButtonClasses = options.applyClass;

        if (typeof options.cancelButtonClasses === 'string')
            this.cancelButtonClasses = options.cancelButtonClasses;

        if (typeof options.cancelClass === 'string') //backwards compat
            this.cancelButtonClasses = options.cancelClass;

        if (typeof options.maxSpan === 'object')
            this.maxSpan = options.maxSpan;

        if (typeof options.dateLimit === 'object') //backwards compat
            this.maxSpan = options.dateLimit;

        if (typeof options.opens === 'string')
            this.opens = options.opens;

        if (typeof options.drops === 'string')
            this.drops = options.drops;

        if (typeof options.showWeekNumbers === 'boolean')
            this.showWeekNumbers = options.showWeekNumbers;

        if (typeof options.showISOWeekNumbers === 'boolean')
            this.showISOWeekNumbers = options.showISOWeekNumbers;

        if (typeof options.buttonClasses === 'string')
            this.buttonClasses = options.buttonClasses;

        if (typeof options.buttonClasses === 'object')
            this.buttonClasses = options.buttonClasses.join(' ');

        if (typeof options.showDropdowns === 'boolean')
            this.showDropdowns = options.showDropdowns;

        if (typeof options.minYear === 'number')
            this.minYear = options.minYear;

        if (typeof options.maxYear === 'number')
            this.maxYear = options.maxYear;

        if (typeof options.showCustomRangeLabel === 'boolean')
            this.showCustomRangeLabel = options.showCustomRangeLabel;

        if (typeof options.singleDatePicker === 'boolean') {
            this.singleDatePicker = options.singleDatePicker;
            if (this.singleDatePicker)
                this.endDate =  this.startDate.startOf('minute'); // LUXON
        }

        if (typeof options.timePicker === 'boolean')
            this.timePicker = options.timePicker;

        if (typeof options.timePickerSeconds === 'boolean')
            this.timePickerSeconds = options.timePickerSeconds;

        if (typeof options.timePickerIncrement === 'number')
            this.timePickerIncrement = options.timePickerIncrement;

        if (typeof options.timePicker24Hour === 'boolean')
            this.timePicker24Hour = options.timePicker24Hour;

        if (typeof options.autoApply === 'boolean')
            this.autoApply = options.autoApply;

        if (typeof options.autoUpdateInput === 'boolean')
            this.autoUpdateInput = options.autoUpdateInput;

        if (typeof options.linkedCalendars === 'boolean')
            this.linkedCalendars = options.linkedCalendars;

        if (typeof options.isInvalidDate === 'function')
            this.isInvalidDate = options.isInvalidDate;

        if (typeof options.isCustomDate === 'function')
            this.isCustomDate = options.isCustomDate;

        if (typeof options.alwaysShowCalendars === 'boolean')
            this.alwaysShowCalendars = options.alwaysShowCalendars;

        // update day names order to firstDay
        if (this.locale.firstDay != 0) {
            var iterator = this.locale.firstDay;
            while (iterator > 0) {
                this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
                iterator--;
            }
        }
        if (typeof options.locale.zone === 'string')
            this.locale.zone = options.locale.zone;

        var start, end, range;
//if no start/end dates set, check if an input element contains initial values
        if (typeof options.startDate === 'undefined' && typeof options.endDate === 'undefined') {
            if ($(this.element).is(':text')) {
                var val = $(this.element).val(),
                    split = val.split(this.locale.separator);
                
                start = end = null;
                
                if (split.length == 2) {
                    start = DateTime.fromISO(split[0], this.locale.zone); // LUXON
                    end = DateTime.fromISO(split[1], this.locale.zone); // LUXON
                } else if (this.singleDatePicker && val !== "") {
                    start = DateTime.fromISO(val, this.locale.zone); // LUXON
                    end =  DateTime.fromISO(val, this.locale.zone); // LUXON
                }
                if (start !== null && end !== null) {
                    this.setStartDate(start);
                    this.setEndDate(end);
                }
            }
        }
        
        if (typeof options.ranges === 'object') {
            for (range in options.ranges) {
                
                if (typeof options.ranges[range][0] === 'string')
                    start = DateTime.fromISO(options.ranges[range][0], this.locale.zone); // LUXON
                else
                    start = options.ranges[range][0].startOf('minute'); // LUXON
                
                if (typeof options.ranges[range][1] === 'string')
                    end = DateTime.fromISO(options.ranges[range][1], this.locale.zone); // LUXON
                else
                    end = options.ranges[range][1].startOf('minute'); // LUXON
                
                // If the start or end date exceed those allowed by the minDate or maxSpan
                // options, shorten the range to the allowable period.
                if (this.minDate && start < this.minDate) // LUXON
                    start = this.minDate.startOf('minute'); // LUXON
                
                var maxDate = this.maxDate;
                if (this.maxSpan && maxDate && start.plus({days: this.maxSpan}) > maxDate) // LUXON
                    maxDate = start.plus({days: this.maxSpan}); // LUXON
                if (maxDate && end > maxDate) // LUXON
                    end = maxDate.startOf('minute'); // LUXON
                
                // If the end of the range is before the minimum or the start of the range is
                // after the maximum, don't display this range option at all.
                if ((this.minDate && end < this.minDate.startOf(this.timepicker ? 'minute' : 'day')) // LUXON
                  || (maxDate && start > maxDate.startOf(this.timepicker ? 'minute' : 'day'))) // LUXON
                    continue;
                
                //Support unicode chars in the range names.
                var elem = document.createElement('textarea');
                elem.innerHTML = range;
                var rangeHtml = elem.value;
                
                this.ranges[rangeHtml] = [start, end];
            }
       
            var list = '<ul>';
            for (range in this.ranges) {
                list += '<li data-range-key="' + range + '">' + range + '</li>';
            }
            if (this.showCustomRangeLabel) {
                list += '<li data-range-key="' + this.locale.customRangeLabel + '">' + this.locale.customRangeLabel + '</li>';
            }
            list += '</ul>';
            this.container.find('.ranges').prepend(list);
        }

        if (typeof cb === 'function') {
            this.callback = cb;
        }

        if (!this.timePicker) {
            this.startDate = this.startDate.startOf('day');
            this.endDate = this.endDate.endOf('day');
            this.container.find('.calendar-time').hide();
        }

        //can't be used together for now
        if (this.timePicker && this.autoApply)
            this.autoApply = false;

        if (this.autoApply) {
            this.container.addClass('auto-apply');
        }

        if (typeof options.ranges === 'object')
            this.container.addClass('show-ranges');

        if (this.singleDatePicker) {
            this.container.addClass('single');
            this.container.find('.drp-calendar.left').addClass('single');
            this.container.find('.drp-calendar.left').show();
            this.container.find('.drp-calendar.right').hide();
            if (!this.timePicker && this.autoApply) {
                this.container.addClass('auto-apply');
            }
        }

        if ((typeof options.ranges === 'undefined' && !this.singleDatePicker) || this.alwaysShowCalendars) {
            this.container.addClass('show-calendar');
        }

        this.container.addClass('opens' + this.opens);

        //apply CSS classes and labels to buttons
        this.container.find('.applyBtn, .cancelBtn').addClass(this.buttonClasses);
        if (this.applyButtonClasses.length)
            this.container.find('.applyBtn').addClass(this.applyButtonClasses);
        if (this.cancelButtonClasses.length)
            this.container.find('.cancelBtn').addClass(this.cancelButtonClasses);
        this.container.find('.applyBtn').html(this.locale.applyLabel);
        this.container.find('.cancelBtn').html(this.locale.cancelLabel);

        //
        // event listeners
        //

        this.container.find('.drp-calendar')
            .on('click.daterangepicker', '.prev', $.proxy(this.clickPrev, this))
            .on('click.daterangepicker', '.next', $.proxy(this.clickNext, this))
            .on('mousedown.daterangepicker', 'td.available', $.proxy(this.clickDate, this))
            .on('mouseenter.daterangepicker', 'td.available', $.proxy(this.hoverDate, this))
            .on('change.daterangepicker', 'select.yearselect', $.proxy(this.monthOrYearChanged, this))
            .on('change.daterangepicker', 'select.monthselect', $.proxy(this.monthOrYearChanged, this))
            .on('change.daterangepicker', 'select.hourselect,select.minuteselect,select.secondselect,select.ampmselect', $.proxy(this.timeChanged, this));

        this.container.find('.ranges')
            .on('click.daterangepicker', 'li', $.proxy(this.clickRange, this));

        this.container.find('.drp-buttons')
            .on('click.daterangepicker', 'button.applyBtn', $.proxy(this.clickApply, this))
            .on('click.daterangepicker', 'button.cancelBtn', $.proxy(this.clickCancel, this));

        if (this.element.is('input') || this.element.is('button')) {
            this.element.on({
                'click.daterangepicker': $.proxy(this.show, this),
                'focus.daterangepicker': $.proxy(this.show, this),
                'keyup.daterangepicker': $.proxy(this.elementChanged, this),
                'keydown.daterangepicker': $.proxy(this.keydown, this) //IE 11 compatibility
            });
        } else {
            this.element.on('click.daterangepicker', $.proxy(this.toggle, this));
            this.element.on('keydown.daterangepicker', $.proxy(this.toggle, this));
        }

        //
        // if attached to a text input, set the initial value
        //

        this.updateElement();

    };

    DateRangePicker.prototype = {

        constructor: DateRangePicker,

        setStartDate: function(startDate) {
            if (typeof startDate === 'string')
                this.startDate = DateTime.fromISO(startDate, this.locale.zone); // LUXON
            
            if (typeof startDate === 'object')
                this.startDate = startDate.startOf('minute'); // LUXON
            
            if (!this.timePicker)
                this.startDate = this.startDate.startOf('minute'); // LUXON
            if (this.timePicker && this.timePickerIncrement)
                this.startDate.set({minute: Math.round(this.startDate.minute / this.timePickerIncrement) * this.timePickerIncrement}); // LUXON
            
            if (this.minDate && this.startDate < this.minDate) { // LUXON
                this.startDate = this.minDate.startOf('minute'); // LUXON
                if (this.timePicker && this.timePickerIncrement)
                    this.startDate.set({minute: Math.round(this.startDate.minute / this.timePickerIncrement) * this.timePickerIncrement}); // LUXON
            }
            
            if (this.maxDate && this.startDate > this.maxDate) { // LUXON
                this.startDate = this.maxDate.startOf('minute'); // LUXON
                if (this.timePicker && this.timePickerIncrement)
                    this.startDate.set({minute: Math.floor(this.startDate.minute / this.timePickerIncrement) * this.timePickerIncrement}); // LUXON
            }
            
            if (!this.isShowing)
                this.updateElement();
            this.updateMonthsInView();
        },
        
        setEndDate: function(endDate) {
            if (typeof endDate === 'string')
                this.endDate = DateTime.fromISO(endDate); // LUXON
            
            if (typeof endDate === 'object')
                this.endDate = endDate.startOf('minute'); // LUXON
            
            if (!this.timePicker)
                this.endDate = this.endDate.endOf('minute'); // LUXON
            
            if (this.timePicker && this.timePickerIncrement)
                this.endDate.set({minute: Math.round(this.endDate.minute / this.timePickerIncrement) * this.timePickerIncrement}); // LUXON
            
            if (this.endDate < this.startDate) // LUXON
                this.endDate = this.startDate.startOf('minute'); // LUXON
            
            if (this.maxDate && this.endDate > this.maxDate) // LUXON
                this.endDate = this.maxDate.startOf('minute'); // LUXON
            
            if (this.maxSpan && this.startDate.plus({days: this.maxSpan}) < this.endDate) // LUXON
                this.endDate = this.startDate.plus({days: this.maxSpan}); // LUXON
            
            this.previousRightTime = this.endDate.startOf('minute'); // LUXON
            
            this.container.find('.drp-selected').html(this.startDate.toFormat(DateTime.DATE_SHORT) + this.locale.separator + this.endDate.toFormat(DateTime.DATE_SHORT)); // LUXON
            
            if (!this.isShowing)
                this.updateElement();
            
            this.updateMonthsInView();
        },

        isInvalidDate: function() {
            return false;
        },

        isCustomDate: function() {
            return false;
        },

        updateView: function() {
            if (this.timePicker) {
                this.renderTimePicker('left');
                this.renderTimePicker('right');
                if (!this.endDate) {
                    this.container.find('.right .calendar-time select').prop('disabled', true).addClass('disabled');
                } else {
                    this.container.find('.right .calendar-time select').prop('disabled', false).removeClass('disabled');
                }
            }
            if (this.endDate)
                this.container.find('.drp-selected').html(this.startDate.toFormat(this.locale.format) + this.locale.separator + this.endDate.toFormat(this.locale.format));
            this.updateMonthsInView();
            this.updateCalendars();
            this.updateFormInputs();
        },

        updateMonthsInView: function() {
            if (this.endDate) {

                //if both dates are visible already, do nothing
                if (!this.singleDatePicker && this.leftCalendar.month && this.rightCalendar.month &&
                    (this.startDate.toFormat('YYYY-MM') == this.leftCalendar.month.toFormat('YYYY-MM') || this.startDate.toFormat('YYYY-MM') == this.rightCalendar.month.toFormat('YYYY-MM'))
                    &&
                    (this.endDate.toFormat('YYYY-MM') == this.leftCalendar.month.toFormat('YYYY-MM') || this.endDate.toFormat('YYYY-MM') == this.rightCalendar.month.toFormat('YYYY-MM'))
                    ) {
                    return;
                }

                this.leftCalendar.month = this.startDate.set({day: 2}); // LUXON
                if (!this.linkedCalendars && (this.endDate.month != this.startDate.month || this.endDate.year != this.startDate.year)) {
                    this.rightCalendar.month = this.endDate.set({day: 2}); // LUXON
                } else {
                    this.rightCalendar.month = this.startDate.set({day: 2}).plus({months: 1}); // LUXON
                }
                
            } else {
                if (this.leftCalendar.month.toFormat('yyyy-MM') != this.startDate.toFormat('yyyy-MM') && this.rightCalendar.month.toFormat('yyyy-MM') != this.startDate.toFormat('yyyy-MM')) { // LUXON
                    this.leftCalendar.month = this.startDate.set({day: 2}); // LUXON
                    this.rightCalendar.month = this.startDate.set({day: 2}).plus({months: 1}); // LUXON
                }
            }
            if (this.maxDate && this.linkedCalendars && !this.singleDatePicker && this.rightCalendar.month > this.maxDate) { // LUXON
                this.rightCalendar.month = this.maxDate.set({day: 2}); // LUXON
                this.leftCalendar.month = this.maxDate.set({day: 2}).minus({month: 1}); // LUXON
            }
        },

        updateCalendars: function() {
            if (this.timePicker) {
                var hour, minute, second;
                if (this.endDate) {
                    hour = parseInt(this.container.find('.left .hourselect').val(), 10);
                    minute = parseInt(this.container.find('.left .minuteselect').val(), 10);
                    if (isNaN(minute)) {
                        minute = parseInt(this.container.find('.left .minuteselect option:last').val(), 10);
                    }
                    second = this.timePickerSeconds ? parseInt(this.container.find('.left .secondselect').val(), 10) : 0;
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.left .ampmselect').val();
                        if (ampm === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm === 'AM' && hour === 12)
                            hour = 0;
                    }
                } else {
                    hour = parseInt(this.container.find('.right .hourselect').val(), 10);
                    minute = parseInt(this.container.find('.right .minuteselect').val(), 10);
                    if (isNaN(minute)) {
                        minute = parseInt(this.container.find('.right .minuteselect option:last').val(), 10);
                    }
                    second = this.timePickerSeconds ? parseInt(this.container.find('.right .secondselect').val(), 10) : 0;
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.right .ampmselect').val();
                        if (ampm === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm === 'AM' && hour === 12)
                            hour = 0;
                    }
                }
                this.leftCalendar.month = this.leftCalendar.month.set({hour: hour, minute: minute, second: second}); // LUXON
                this.rightCalendar.month = this.rightCalendar.month.set({hour: hour, minute: minute, second: second}); // LUXON
            }
            this.renderCalendar('left');
            this.renderCalendar('right');
            //highlight any predefined range matching the current start and end dates
            this.container.find('.ranges li').removeClass('active');
            if (this.endDate == null) return;
            this.calculateChosenLabel();
        },

        renderCalendar: function(side) { 
            // Build the matrix of dates that will populate the calendar
            //
            var calendar = side == 'left' ? this.leftCalendar : this.rightCalendar;
            var month = calendar.month.month; // LUXON
            var year = calendar.month.year; // LUXON
            var hour = calendar.month.hour; // LUXON
            var minute = calendar.month.minute; // LUXON
            var second = calendar.month.second; // LUXON
            var daysInMonth = calendar.month.daysInMonth; // LUXON
            var firstDay = calendar.month.startOf('month'); // LUXON
            var lastDay = calendar.month.endOf('month'); // LUXON
            var lastMonth = calendar.month.minus({month: 1}).month; // LUXON
            var lastYear = calendar.month.minus({month: 1}).year; // LUXON
            var daysInLastMonth = calendar.month.minus({month: 1}).daysInMonth; // LUXON
            var dayOfWeek = firstDay.weekday; // LUXON

            //initialize a 6 rows x 7 columns array for the calendar
            var calendar = [];
            calendar.firstDay = firstDay;
            calendar.lastDay = lastDay;

            for (var i = 0; i < 6; i++) {
                calendar[i] = [];
            }

            //populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth)
                startDay -= 7;

            if (dayOfWeek == this.locale.firstDay)
                startDay = daysInLastMonth - 6;

            var curDate = DateTime.local(lastYear, lastMonth, startDay, 12, minute, second); // LUXON
            var col, row;
            for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = curDate.plus({hour: 24})) { // LUXON
                if (i > 0 && col % 7 === 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate.set({hour: hour, minute: minute, second: second}); // LUXON
                curDate.set({hour: 12}); // LUXON
                
                if (this.minDate && calendar[row][col].toFormat('yyyy-MM-dd') == this.minDate.toFormat('yyyy-MM-dd') && calendar[row][col] > this.minDate && side == 'left') { // LUXON
                    calendar[row][col] = this.minDate.startOf('minute'); // LUXON
                }
                
                if (this.maxDate && calendar[row][col].toFormat('yyyy-MM-dd') == this.maxDate.toFormat('yyyy-MM-dd') && calendar[row][col] > this.maxDate && side == 'right') { // LUXON
                    calendar[row][col] = this.maxDate.startOf('minute'); // LUXON
                }
                
            }            
            //make the calendar object available to hoverDate/clickDate
            if (side == 'left') {
                this.leftCalendar.calendar = calendar;
            } else {
                this.rightCalendar.calendar = calendar;
            }

            //
            // Display the calendar
            //

            var minDate = side == 'left' ? this.minDate : this.startDate;
            var maxDate = this.maxDate;
            var selected = side == 'left' ? this.startDate : this.endDate;
            var arrow = this.locale.direction == 'ltr' ? {left: 'chevron-left', right: 'chevron-right'} : {left: 'chevron-right', right: 'chevron-left'};

            var html = '<table class="table-condensed">';
            html += '<thead>';
            html += '<tr>';

            // add empty cell for week number
            if (this.showWeekNumbers || this.showISOWeekNumbers)
                html += '<th></th>';
            
            if ((!minDate || minDate < calendar.firstDay) && (!this.linkedCalendars || side == 'left')) { // LUXON
                html += '<th class="prev available"><span></span></th>';
            } else {
                html += '<th></th>';
            }

            var dateHtml = calendar[1][1].toFormat(this.locale.monthFormat) + ' ' + calendar[1][1].toFormat('yyyy'); // LUXON
            
            if (this.showDropdowns) {
                var currentMonth = calendar[1][1].month; // LUXON
                var currentYear = calendar[1][1].year; // LUXON
                var maxYear = (maxDate && maxDate.year) || (this.maxYear); // LUXON
                var minYear = (minDate && minDate.year) || (this.minYear); // LUXON
                var inMinYear = currentYear == minYear;
                var inMaxYear = currentYear == maxYear;
                
                var monthHtml = '<select class="monthselect">';
                for (var m = 1; m <= 12; m++) { // LUXON
                    if ((!inMinYear || (minDate && m >= minDate.month)) && (!inMaxYear || (maxDate && m <= maxDate.month))) { // LUXON
                        monthHtml += "<option value='" + m + "'" +
                            (m === currentMonth ? " selected='selected'" : "") +
                            ">" + DateTime.local().set({month: m}).toFormat(this.locale.monthFormat) + "</option>";  // LUXON
                    } else {
                        monthHtml += "<option value='" + m + "'" +
                            (m === currentMonth ? " selected='selected'" : "") +
                            " disabled='disabled'>" + DateTime.local().set({month: m}).toFormat(this.locale.monthFormat) + "</option>"; // LUXON
                    }
                }
                monthHtml += "</select>";
                
                var yearHtml = '<select class="yearselect">';
                for (var y = minYear; y <= maxYear; y++) {
                    yearHtml += '<option value="' + y + '"' +
                        (y === currentYear ? ' selected="selected"' : '') +
                        '>' + y + '</option>';
                }
                yearHtml += '</select>';
                
                dateHtml = monthHtml + ' ' + yearHtml; // LUXON
            }
            
            html += '<th colspan="5" class="month">' + dateHtml + '</th>';
            if ((!maxDate || maxDate > calendar.lastDay) && (!this.linkedCalendars || side == 'right' || this.singleDatePicker)) { // LUXON
                html += '<th class="next available"><span></span></th>';
            } else {
                html += '<th></th>';
            }
            
            html += '</tr>';
            html += '<tr>';
            
            // add week number label
            if (this.showWeekNumbers || this.showISOWeekNumbers)
                html += '<th class="week">' + this.locale.weekLabel + '</th>';
            
            $.each(this.locale.daysOfWeek, function(index, dayOfWeek) {
                html += '<th>' + dayOfWeek + '</th>';
            });

            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';
            //adjust maxDate to reflect the maxSpan setting in order to
            //grey out end dates beyond the maxSpan
            if (this.endDate == null && this.maxSpan) {
                var maxLimit = this.startDate.add(this.maxSpan).endOf('day');
                if (!maxDate || maxLimit.isBefore(maxDate)) {
                    maxDate = maxLimit;
                }
            }

            for (var row = 0; row < 6; row++) {
                html += '<tr>';

                /// add week number
                if (this.showWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].toFormat('nn') + '</td>'; // LUXON
                else if (this.showISOWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].toFormat('WW') + '</td>'; // LUXON
                
                for (var col = 0; col < 7; col++) {
                    var classes = [];
                    
                    //highlight today's date
                    if (calendar[row][col].hasSame(DateTime.local(), 'day')) // LUXON
                        classes.push('today');
                    
                    //highlight weekends
                    if (calendar[row][col].weekday > 5) // LUXON
                        classes.push('weekend');
                    
                   /* // LUXON - ADD // grey out the dates in other months displayed at beginning and end of this calendar
                    if (!this.dayOverflow && calendar[row][col].month != calendar[1][1].month) // LUXON - ADD
                        classes.push('off', 'overflow'); // LUXON - ADD*/
                    if (calendar[row][col].month != calendar[1][1].month) // LUXON
                        classes.push('off', 'ends');
                    
                    //don't allow selection of dates before the minimum date
                    if (this.minDate && calendar[row][col] < this.minDate) // LUXON
                        classes.push('off', 'disabled');
                    
                    //don't allow selection of dates after the maximum date
                    if (maxDate && calendar[row][col] > maxDate) // LUXON
                        classes.push('off', 'disabled');
                    
                    //don't allow selection of date if a custom function decides it's invalid
                    if (this.isInvalidDate(calendar[row][col]))
                        classes.push('off', 'disabled');
                    
                    //highlight the currently selected start date
                    if (calendar[row][col].toFormat('yyyy-MM-dd') == this.startDate.toFormat('yyyy-MM-dd')) // LUXON
                        classes.push('active', 'start-date');
                    
                    //highlight the currently selected end date
                    if (this.endDate != null && calendar[row][col].toFormat('yyyy-MM-dd') == this.endDate.toFormat('yyyy-MM-dd')) // LUXON
                        classes.push('active', 'end-date');
                    
                    //highlight dates in-between the selected dates
                    if (this.endDate != null && calendar[row][col] > this.startDate && calendar[row][col] < this.endDate)
                        classes.push('in-range');
                    
                    //apply custom classes for this date
                    var isCustom = this.isCustomDate(calendar[row][col]);
                    if (isCustom !== false) {
                        if (typeof isCustom === 'string')
                            classes.push(isCustom);
                        else
                            Array.prototype.push.apply(classes, isCustom);
                    }
                    
                    var cname = '', disabled = false;
                    for (var i = 0; i < classes.length; i++) {
                        cname += classes[i] + ' ';
                        if (classes[i] == 'disabled')
                            disabled = true;
                    }
                    if (!disabled)
                        cname += 'available';
                    
                    html += '<td class="' + cname.replace(/^\s+|\s+$/g, '') + '" data-title="' + 'r' + row + 'c' + col + '">' + calendar[row][col].day + '</td>'; // LUXON

                }
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';

            this.container.find('.drp-calendar.' + side + ' .calendar-table').html(html);

        },

        renderTimePicker: function(side) {

            // Don't bother updating the time picker if it's currently disabled
            // because an end date hasn't been clicked yet
            if (side == 'right' && !this.endDate) return;
            
            var html, selected, minDate, maxDate = this.maxDate;
            
            if (this.maxSpan && (!this.maxDate || this.startDate.plus({days: this.maxSpan}) < this.maxDate)) // LUXON
                maxDate = this.startDate.plus({days: this.maxSpan}); // LUXON
            
            if (side == 'left') {
                selected = this.startDate.startOf('minute'); // LUXON
                minDate = this.minDate;
            } else if (side == 'right') {
                selected = this.endDate.startOf('minute'); // LUXON
                minDate = this.startDate;
                
                //Preserve the time already selected
                var timeSelector = this.container.find('.drp-calendar.right .calendar-time');
                if (timeSelector.html() != '') {
                    
                    selected = selected.set({
                        hour: !isNaN(selected.hour) ? selected.hour : timeSelector.find('.hourselect option:selected').val(), 
                        minute: !isNaN(selected.minute) ? selected.minute : timeSelector.find('.minuteselect option:selected').val(),
                        second: !isNaN(selected.second) ? selected.second : timeSelector.find('.secondselect option:selected').val()
                    }); // LUXON
                    
                    if (!this.timePicker24Hour) {
                        var ampm = timeSelector.find('.ampmselect option:selected').val();
                        if (ampm === 'PM' && selected.hour < 12) // LUXON
                            selected = selected.selected.set({hour: hour + 12}); // LUXON
                        if (ampm === 'AM' && selected.hour === 12) // LUXON
                            selected = selected.set({hour: 0}); // LUXON
                    }
                    
                }
                
                if (selected < this.startDate) // LUXON
                    selected = this.startDate.startOf('minute'); // LUXON
                
                if (maxDate && selected > maxDate) // LUXON
                    selected = maxDate.startOf('minute'); // LUXON
                
            }

            //
            // hours
            //
            
            html = '<select class="hourselect">';
            
            var start = this.timePicker24Hour ? 0 : 1;
            var end = this.timePicker24Hour ? 23 : 12;
            
            for (var i = start; i <= end; i++) {
                var i_in_24 = i;
                if (!this.timePicker24Hour)
                    i_in_24 = selected.hour >= 12 ? (i == 12 ? 12 : i + 12) : (i == 12 ? 0 : i); // LUXON
                    
                var time = selected.set({hour: i_in_24}); // LUXON
                var disabled = false;
                if (minDate && time.set({minute: 59}) < minDate) // LUXON
                    disabled = true;
                if (maxDate && time.set({minute: 0}) > maxDate) // LUXON
                    disabled = true;
                
                if (i_in_24 == selected.hour && !disabled) { // LUXON
                    html += '<option value="' + i + '" selected="selected">' + i + '</option>';
                } else if (disabled) {
                    html += '<option value="' + i + '" disabled="disabled" class="disabled">' + i + '</option>';
                } else {
                    html += '<option value="' + i + '">' + i + '</option>';
                }
            }
            
            html += '</select> ';
            
            //
            // minutes
            //
            
            html += ': <select class="minuteselect">';
            
            for (var i = 0; i < 60; i += this.timePickerIncrement) {
                var padded = i < 10 ? '0' + i : i;
                var time = selected.set({minute: i});
                
                var disabled = false;
                if (minDate && time.set({second: 59}) < minDate) // LUXON
                    disabled = true;
                if (maxDate && time.set({second: 0}) > maxDate) // LUXON
                    disabled = true;
                
                if (selected.minute == i && !disabled) { // LUXON
                    html += '<option value="' + i + '" selected="selected">' + padded + '</option>';
                } else if (disabled) {
                    html += '<option value="' + i + '" disabled="disabled" class="disabled">' + padded + '</option>';
                } else {
                    html += '<option value="' + i + '">' + padded + '</option>';
                }
            }
            
            html += '</select> ';
            
            //
            // seconds
            //
            
            if (this.timePickerSeconds) {
                html += ': <select class="secondselect">';
                
                for (var i = 0; i < 60; i++) {
                    var padded = i < 10 ? '0' + i : i;
                    var time = selected.set({second: i}); // LUXON
                    
                    var disabled = false;
                    if (minDate && time < minDate) // LUXON
                        disabled = true;
                    if (maxDate && time > maxDate) // LUXON
                        disabled = true;
                    
                    if (selected.second == i && !disabled) {
                        html += '<option value="' + i + '" selected="selected">' + padded + '</option>';
                    } else if (disabled) {
                        html += '<option value="' + i + '" disabled="disabled" class="disabled">' + padded + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + padded + '</option>';
                    }
                }
                
                html += '</select> ';
            }
            
            //
            // AM/PM
            //
            
            if (!this.timePicker24Hour) {
                html += '<select class="ampmselect">';
                
                var am_html = '';
                var pm_html = '';
                
                if (minDate && selected.set({hour: 12, minute: 0, second: 0}) < minDate) // LUXON
                    am_html = ' disabled="disabled" class="disabled"';
                
                if (maxDate && selected.set({hour: 0, minute: 0, second: 0}) > maxDate) // LUXON
                    pm_html = ' disabled="disabled" class="disabled"';
                
                if (selected.hour >= 12) { // LUXON
                    html += '<option value="AM"' + am_html + '>AM</option><option value="PM" selected="selected"' + pm_html + '>PM</option>';
                } else {
                    html += '<option value="AM" selected="selected"' + am_html + '>AM</option><option value="PM"' + pm_html + '>PM</option>';
                }
                
                html += '</select>';
            }
            
            this.container.find('.drp-calendar.' + side + ' .calendar-time').html(html);
        },

        updateFormInputs: function() {

            if (this.singleDatePicker || (this.endDate && (this.startDate < this.endDate || this.startDate == this.endDate))) { // LUXON
                this.container.find('button.applyBtn').prop('disabled', false);
            } else {
                this.container.find('button.applyBtn').prop('disabled', true);
            }

        },

        move: function() {
            var parentOffset = { top: 0, left: 0 },
                containerTop,
                drops = this.drops;

            var parentRightEdge = $(window).width();
            if (!this.parentEl.is('body')) {
                parentOffset = {
                    top: this.parentEl.offset().top - this.parentEl.scrollTop(),
                    left: this.parentEl.offset().left - this.parentEl.scrollLeft()
                };
                parentRightEdge = this.parentEl[0].clientWidth + this.parentEl.offset().left;
            }

            switch (drops) {
                case 'auto':
                    containerTop = this.element.offset().top + this.element.outerHeight() - parentOffset.top;
                    if (containerTop + this.container.outerHeight() >= this.parentEl[0].scrollHeight) {
                        containerTop = this.element.offset().top - this.container.outerHeight() - parentOffset.top;
                        drops = 'up';
                    }
                    break;
                case 'up':
                    containerTop = this.element.offset().top - this.container.outerHeight() - parentOffset.top;
                    break;
                default:
                    containerTop = this.element.offset().top + this.element.outerHeight() - parentOffset.top;
                    break;
            }

            // Force the container to it's actual width
            this.container.css({
              top: 0,
              left: 0,
              right: 'auto'
            });
            var containerWidth = this.container.outerWidth();

            this.container.toggleClass('drop-up', drops == 'up');

            if (this.opens == 'left') {
                var containerRight = parentRightEdge - this.element.offset().left - this.element.outerWidth();
                if (containerWidth + containerRight > $(window).width()) {
                    this.container.css({
                        top: containerTop,
                        right: 'auto',
                        left: 9
                    });
                } else {
                    this.container.css({
                        top: containerTop,
                        right: containerRight,
                        left: 'auto'
                    });
                }
            } else if (this.opens == 'center') {
                var containerLeft = this.element.offset().left - parentOffset.left + this.element.outerWidth() / 2
                                        - containerWidth / 2;
                if (containerLeft < 0) {
                    this.container.css({
                        top: containerTop,
                        right: 'auto',
                        left: 9
                    });
                } else if (containerLeft + containerWidth > $(window).width()) {
                    this.container.css({
                        top: containerTop,
                        left: 'auto',
                        right: 0
                    });
                } else {
                    this.container.css({
                        top: containerTop,
                        left: containerLeft,
                        right: 'auto'
                    });
                }
            } else {
                var containerLeft = this.element.offset().left - parentOffset.left;
                if (containerLeft + containerWidth > $(window).width()) {
                    this.container.css({
                        top: containerTop,
                        left: 'auto',
                        right: 0
                    });
                } else {
                    this.container.css({
                        top: containerTop,
                        left: containerLeft,
                        right: 'auto'
                    });
                }
            }
        },

        show: function(e) {
            if (this.isShowing) return;
            
            // Create a click proxy that is private to this instance of datepicker, for unbinding
            this._outsideClickProxy = $.proxy(function(e) { this.outsideClick(e); }, this);
            
            // Bind global datepicker mousedown for hiding and
            $(document)
                .on('mousedown.daterangepicker', this._outsideClickProxy)
                // also support mobile devices
                .on('touchend.daterangepicker', this._outsideClickProxy)
                // also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
                .on('click.daterangepicker', '[data-toggle=dropdown]', this._outsideClickProxy)
                // and also close when focus changes to outside the picker (eg. tabbing between controls)
                .on('focusin.daterangepicker', this._outsideClickProxy);
            
            // Reposition the picker if the window is resized while it's open
            $(window).on('resize.daterangepicker', $.proxy(function(e) { this.move(e); }, this));
            
            this.oldStartDate = this.startDate.startOf('minute'); // LUXON
            this.oldEndDate = this.endDate.startOf('minute'); // LUXON
            this.previousRightTime = this.endDate.startOf('minute'); // LUXON
            
            this.updateView();
            this.container.show();
            this.move();
            this.element.trigger('show.daterangepicker', this);
            this.isShowing = true;
        },

        hide: function(e) {
            if (!this.isShowing) return;
            
            //incomplete date selection, revert to last values
            if (!this.endDate) {
                this.startDate = this.oldStartDate.startOf('minute'); // LUXON
                this.endDate = this.oldEndDate.startOf('minute'); // LUXON
            }
            
            //if a new date range was selected, invoke the user callback function
            if (!(this.startDate == this.oldStartDate) || !(this.endDate == this.oldEndDate)) // LUXON
                this.callback(this.startDate.startOf('minute'), this.endDate.startOf('minute'), this.chosenLabel); // LUXON
            
            //if picker is attached to a text input, update it
            this.updateElement();
            
            $(document).off('.daterangepicker');
            $(window).off('.daterangepicker');
            this.container.hide();
            this.element.trigger('hide.daterangepicker', this);
            this.isShowing = false;
        },

        toggle: function(e) {
            if (this.isShowing) {
                this.hide();
            } else {
                this.show();
            }
        },

        outsideClick: function(e) {
            var target = $(e.target);
            // if the page is clicked anywhere except within the daterangerpicker/button
            // itself then call this.hide()
            if (
                // ie modal dialog fix
                e.type == "focusin" ||
                target.closest(this.element).length ||
                target.closest(this.container).length ||
                target.closest('.calendar-table').length
                ) return;
            this.hide();
            this.element.trigger('outsideClick.daterangepicker', this);
        },

        showCalendars: function() {
            this.container.addClass('show-calendar');
            this.move();
            this.element.trigger('showCalendar.daterangepicker', this);
        },

        hideCalendars: function() {
            this.container.removeClass('show-calendar');
            this.element.trigger('hideCalendar.daterangepicker', this);
        },

        clickRange: function(e) {
            var label = e.target.getAttribute('data-range-key');
            this.chosenLabel = label;
            if (label == this.locale.customRangeLabel) {
                this.showCalendars();
            } else {
                var dates = this.ranges[label];
                this.startDate = dates[0];
                this.endDate = dates[1];

                if (!this.timePicker) {
                    this.startDate.startOf('day');
                    this.endDate.endOf('day');
                }

                if (!this.alwaysShowCalendars)
                    this.hideCalendars();
                this.clickApply();
            }
        },

        clickPrev: function(e) {
            var cal = $(e.target).parents('.drp-calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month = this.leftCalendar.month.minus({month: 1}); // LUXON
                if (this.linkedCalendars)
                    this.rightCalendar.month = this.rightCalendar.month.minus({month: 1}); // LUXON
            } else {
                this.rightCalendar.month = this.rightCalendar.month.minus({month: 1}); // LUXON
            }
            this.updateCalendars();
        },
        
        clickNext: function(e) {
            var cal = $(e.target).parents('.drp-calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month = this.leftCalendar.month.plus({month: 1}); // LUXON
            } else {
                this.rightCalendar.month = this.rightCalendar.month.plus({month: 1}); // LUXON
                if (this.linkedCalendars)
                    this.leftCalendar.month = this.leftCalendar.month.plus({month: 1}); // LUXON
            }
            this.updateCalendars();
        },
        
        hoverDate: function(e) {
//ignore dates that can't be selected
            if (!$(e.target).hasClass('available')) return;
            
            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.drp-calendar');
            var date = cal.hasClass('left') ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];
            
            //highlight the dates between the start date and the date being hovered as a potential end date
            var leftCalendar = this.leftCalendar;
            var rightCalendar = this.rightCalendar;
            var startDate = this.startDate;
            var minSpan = this.minSpan ? this.minSpan : 0;  // LUXON - ADD // making sure an unset minSpan does not cause issues.
            
            // LUXON - ADD // prevent minSpan dates fro being stuck in that state when direction chagnes.
            $('td.min-span').removeClass('min-span');
            
            if (!this.endDate) {
                this.container.find('.drp-calendar tbody td').each(function(index, el) {
                    
                    //skip week numbers, only look at dates
                    if ($(el).hasClass('week')) return;
                    
                    var title = $(el).attr('data-title');
                    var row = title.substr(1, 1);
                    var col = title.substr(3, 1);
                    var cal = $(el).parents('.drp-calendar');
                    var dt = cal.hasClass('left') ? leftCalendar.calendar[row][col] : rightCalendar.calendar[row][col];
                    
                    if (minSpan && dt.day == startDate.day &&  dt.month == startDate.month && dt.year == startDate.year) {
                    // LUXON - ADD // minSpan active. day is start day. 
                        $(el).addClass('min-span');
                    } else if (minSpan && date >= startDate && dt > startDate && dt < startDate.plus({days: minSpan-1})) { 
                    // LUXON - ADD // minSpan active. selected date after start. day after start and in range. 
                        $(el).addClass('min-span', 'in-range'); // LUXON - ADD
                    } else if (minSpan && date < startDate && dt < startDate && dt > startDate.minus({days: minSpan-1})) { 
                    // LUXON - ADD // minSpan active. selected date before start. day before start and in range. 
                        $(el).addClass('min-span', 'in-range'); // LUXON - ADD
                    } else if ((dt > startDate && dt < date) || dt == date) { // LUXON
                        $(el).addClass('in-range');
                    } else if (dt < startDate && dt > date) { 
                    // LUXON - ADD // second date is before start date.
                        $(el).addClass('in-range'); // LUXON - ADD
                    } else {
                        $(el).removeClass('in-range', 'min-span');
                    }
                    
                });
            }
        },

        clickDate: function(e) {
            if (!$(e.target).hasClass('available')) return;
            
            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.drp-calendar');
            var date = cal.hasClass('left') ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];
            this.reverseSelection = false;  // LUXON - ADD //reset and default to standard selection order.
            
            //
            // this function needs to do a few things:
            // * alternate between selecting a start and end date for the range,
            // * if the time picker is enabled, apply the hour/minute/second from the select boxes to the clicked date
            // * if autoapply is enabled, and an end date was chosen, apply the selection
            // * if single date picker mode, and time picker isn't enabled, apply the selection immediately
            // * if one of the inputs above the calendars was focused, cancel that manual input
            //
            
            if (this.minSpan && !this.endDate && date > this.startDate.minus({days: this.minSpan-1}) && date < this.startDate.plus({days:  this.minSpan-1})) {
            // LUXON - ADD // do nothing if the date selceted is within the minspan.reduce range by one so last day can be selected.
            } else if ((this.startDate && this.endDate) && (date < this.startDate)) { // LUXON - ADD // if range set selected date to start.
                this.endDate = null; // LUXON  - ADD
                this.setStartDate(date.startOf('minute')); // LUXON  - ADD
            } else if (this.endDate || date < this.startDate) { // picking start // LUXON
                if (this.timePicker) {
                    var hour = parseInt(this.container.find('.left .hourselect').val(), 10);
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.left .ampmselect').val();
                        if (ampm === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm === 'AM' && hour === 12)
                            hour = 0;
                    }
                    var minute = parseInt(this.container.find('.left .minuteselect').val(), 10);
                    if (isNaN(minute)) {
                        minute = parseInt(this.container.find('.left .minuteselect option:last').val(), 10);
                    }
                    var second = this.timePickerSeconds ? parseInt(this.container.find('.left .secondselect').val(), 10) : 0;
                    date = date.set({hour: hour, minute: minute, second: second}); // LUXON
                }
                if (date < this.startDate) { // LUXON - ADD // allow reverse range selection.
                    var oldStart = this.startDate.startOf('second'); // LUXON - ADD
                    this.reverseSelection = true; // LUXON - ADD
                    this.setStartDate(date); // LUXON - ADD
                    this.setEndDate(oldStart); // LUXON - ADD
                    this.autoApplyCheck(); // LUXON - ADD
                } else { // LUXON - ADD
                    this.endDate = null;
                    this.setStartDate(date.startOf('minute')); // LUXON 
                } // LUXON - ADD
            } else if (!this.endDate && date.day == this.startDate.day && date.month == this.startDate.month) { // LUXON
                //special case: clicking the same date for start/end,
                //but the time of the end date is before the start date
                this.setEndDate(this.startDate.startOf('minute')); // LUXON
            } else { // picking end
                if (this.timePicker) {
                    var hour = parseInt(this.container.find('.right .hourselect').val(), 10);
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.right .ampmselect').val();
                        if (ampm === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm === 'AM' && hour === 12)
                            hour = 0;
                    }
                    var minute = parseInt(this.container.find('.right .minuteselect').val(), 10);
                    if (isNaN(minute)) {
                        minute = parseInt(this.container.find('.right .minuteselect option:last').val(), 10);
                    }
                    var second = this.timePickerSeconds ? parseInt(this.container.find('.right .secondselect').val(), 10) : 0;
                    date = date.set({hour: hour, minute: minute, second: second}); // LUXON
                }
                this.setEndDate(date.startOf('minute')); // LUXON
                this.autoApplyCheck(); // LUXON
            }
            
            if (this.singleDatePicker) {
                this.setEndDate(this.startDate);
                if (!this.timePicker && this.autoApply)
                    this.clickApply();
            }
            
            this.updateView();
            
            //This is to cancel the blur event handler if the mouse was in one of the inputs
            e.stopPropagation();
        },

        autoApplyCheck: function() { // LUXON - ADD // centralize the auto apply check.
            if (this.autoApply) {
                this.calculateChosenLabel();
                this.clickApply();
            }
        },

        calculateChosenLabel: function () {
            var customRange = true;
            var i = 0;
            var format = 'yyy-MM-dd'; //this.timePickerSeconds ? "yyyy-MM-dd HH:mm:ss" : "yyyy-MM-dd HH:mm";
            for (var range in this.ranges) {
                //ignore times when comparing dates if time picker is not enabled
                if (this.startDate.toFormat(format) == this.ranges[range][0].toFormat(format) && this.endDate.toFormat(format) == this.ranges[range][1].toFormat(format)) {
                    customRange = false;
                    this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')').addClass('active').attr('data-range-key');
                    break;
                }
                i++;
            }
            if (customRange) {
                if (this.showCustomRangeLabel) {
                    this.chosenLabel = this.container.find('.ranges li:last').addClass('active').attr('data-range-key');
                } else {
                    this.chosenLabel = null;
                }
                this.showCalendars();
            }
        },

        clickApply: function(e) {
            this.hide();
            this.element.trigger('apply.daterangepicker', this);
        },

        clickCancel: function(e) {
            this.startDate = this.oldStartDate;
            this.endDate = this.oldEndDate;
            this.hide();
            this.element.trigger('cancel.daterangepicker', this);
        },

        monthOrYearChanged: function(e) {
            var isLeft = $(e.target).closest('.drp-calendar').hasClass('left'),
                leftOrRight = isLeft ? 'left' : 'right',
                cal = this.container.find('.drp-calendar.'+leftOrRight);

            // Month must be Number for new moment versions
            var month = parseInt(cal.find('.monthselect').val(), 10);
            var year = cal.find('.yearselect').val();

            if (!isLeft) {
                if (year < this.startDate.year() || (year == this.startDate.year() && month < this.startDate.month())) {
                    month = this.startDate.month();
                    year = this.startDate.year();
                }
            }

            if (this.minDate) {
                if (year < this.minDate.year() || (year == this.minDate.year() && month < this.minDate.month())) {
                    month = this.minDate.month();
                    year = this.minDate.year();
                }
            }

            if (this.maxDate) {
                if (year > this.maxDate.year() || (year == this.maxDate.year() && month > this.maxDate.month())) {
                    month = this.maxDate.month();
                    year = this.maxDate.year();
                }
            }

            if (isLeft) {
                this.leftCalendar.month.month(month).year(year);
                if (this.linkedCalendars)
                    this.rightCalendar.month = this.leftCalendar.month.add(1, 'month');
            } else {
                this.rightCalendar.month.month(month).year(year);
                if (this.linkedCalendars)
                    this.leftCalendar.month = this.rightCalendar.month.subtract(1, 'month');
            }
            this.updateCalendars();
        },

        timeChanged: function(e) {
            var cal = $(e.target).closest('.drp-calendar'),
                isLeft = cal.hasClass('left');
            var selhour = parseInt(cal.find('.hourselect').val(), 10);
            var selminute = parseInt(cal.find('.minuteselect').val(), 10);
            if (isNaN(selminute)) {
                selminute = parseInt(cal.find('.minuteselect option:last').val(), 10);
            }
            var selsecond = this.timePickerSeconds ? parseInt(cal.find('.secondselect').val(), 10) : 0;
            var cal = $(e.target).closest('.drp-calendar'),
                isLeft = cal.hasClass('left');  
            if (!this.timePicker24Hour) {
                var ampm = cal.find('.ampmselect').val();
                if (ampm === 'PM' && selhour < 12)
                    selhour += 12;
                if (ampm === 'AM' && selhour === 12)
                    selhour = 0;
            }
            if (isLeft) {
                var start = this.startDate.startOf('minute').set({
                    hour: selhour, 
                    minute: selminute,
                    second: selsecond
                }); // LUXON
                this.setStartDate(start);
                if (this.singleDatePicker) {
                    this.endDate = this.startDate; // LUXON
                } else if (this.endDate && this.endDate.toFormat('yyyy-MM-dd') == start.toFormat('yyyy-MM-dd') && this.endDate < start) { // LUXON
                    this.setEndDate(start.startOf('minute')); // LUXON
                }
            } else if (this.endDate) {
                var end = this.endDate.startOf('minute').set({
                    hour: selhour, 
                    minute: selminute,
                    second: selsecond
                }); // LUXON
                this.setEndDate(end);
            }
            
            //update the calendars so all clickable dates reflect the new time component
            this.updateCalendars();
            
            //update the form inputs above the calendars with the new time
            this.updateFormInputs();
            
            //re-render the time pickers because changing one selection can affect what's enabled in another
            this.renderTimePicker('left');
            this.renderTimePicker('right');
            
        },
        
        elementChanged: function() {
            if (!this.element.is('input')) return;
            if (!this.element.val().length) return;
            
            var dateString = this.element.val().split(this.locale.separator),
                start = null,
                end = null;
            
            if (dateString.length === 2) {
                start = DateTime.fromISO(dateString[0], this.locale.zone); // LUXON
                end = DateTime.fromISO(dateString[1], this.locale.zone); // LUXON
            }
            
            if (this.singleDatePicker || start === null || end === null) {
                start = DateTime.fromISO(this.element.val(), this.locale.zone); // LUXON
                end = start;
            }
            
            if (!start.isValid || !end.isValid) return; // LUXON
            
            this.setStartDate(start);
            this.setEndDate(end);
            this.updateView();
        },
        
        keydown: function(e) {
            //hide on tab or enter
            if ((e.keyCode === 9) || (e.keyCode === 13)) {
                this.hide();
            }

            //hide on esc and prevent propagation
            if (e.keyCode === 27) {
                e.preventDefault();
                e.stopPropagation();

                this.hide();
            }
        },

        updateElement: function() {
            if (this.element.is('input') && this.autoUpdateInput) {
                var newValue = this.startDate.toFormat(this.locale.format);
                if (!this.singleDatePicker) {
                    newValue += this.locale.separator + this.endDate.toFormat(this.locale.format);
                }
                if (newValue !== this.element.val()) {
                    this.element.val(newValue).trigger('change');
                }
            }
        },

        remove: function() {
            this.container.remove();
            this.element.off('.daterangepicker');
            this.element.removeData();
        }

    };

    $.fn.daterangepicker = function(options, callback) {
        var implementOptions = $.extend(true, {}, $.fn.daterangepicker.defaultOptions, options);
        this.each(function() {
            var el = $(this);
            if (el.data('daterangepicker'))
                el.data('daterangepicker').remove();
            el.data('daterangepicker', new DateRangePicker(el, implementOptions, callback));
        });
        return this;
    };

    return DateRangePicker;

}));
