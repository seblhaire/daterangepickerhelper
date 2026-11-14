import $ from 'jquery';
import { DateTime } from "luxon";
import './daterangepicker.js';
var SebDateRangePicker = {
    maindiv: null,
    caldiv: null,
    calobj: null,
    calspan: null,
    options: null,
    content: null,
    startdate: null,
    enddate: null,
    luxonformat: null,
    customcallback: null,
    currentdate: null,
    initialstart: null,
    initialend: null,
    init: function (div, options, start, end, luxonformat, customcallback) {
        this.maindiv = $(div);
        this.options = options;
        this.initialstart = this.options.startDate;
        this.initialend = this.options.endDate;
        this.caldiv = $('#' + this.maindiv.prop('id') + '-caldiv');
        this.calspan = $('#' + this.maindiv.prop('id') + '-span');
        if (start.length > 0)
            this.startdate = $('#' + start);
        if (end.length > 0)
            this.enddate = $('#' + end);
        this.luxonformat = luxonformat;
        this.customcallback = customcallback;
        this.build();
        this.saveCurrentDate();
    },
    build: function () {
        if (this.customcallback != null) {
            this.caldiv.daterangepicker(this.options, this.customcallback);
        } else {
            this.caldiv.daterangepicker(this.options, this.callback);
        }
        this.calobj = this.caldiv.data('daterangepicker');
    },
    callback: function (start, end, label) {
        var self = this.element.parent('div').data('sebdaterangepicker');
        self.setResult(start, end);
    },
    setResult: function (start, end) {
        if (this.startdate != null)
            this.startdate.val(start.toFormat(this.luxonformat));
        if (this.enddate != null)
            this.enddate.val(end.toFormat(this.luxonformat));
        var span = start.toFormat(this.options.locale.format);
        if (!this.options.singleDatePicker) {
            span += this.options.locale.separator + end.toFormat(this.options.locale.format);
        }
        this.calspan.html(span);
    },
    setStartDate: function (luxondate) {
        return this.calobj.setStartDate(luxondate);
    },
    setSingleCalendar: function (luxondate) {
        this.setStartDate(luxondate);
        this.setEndDate(luxondate);
        this.setResult(luxondate, null);
    },
    setDoubleCalendar: function (luxonstartdate, luxonenddate) {
        this.setStartDate(luxonstartdate);
        this.setEndDate(luxonenddate);
        this.setResult(luxonstartdate, luxonenddate);
    },
    startDate: function () {
        return this.calobj.startDate;
    },
    setEndDate: function setEndDate(luxondate) {
        return this.calobj.setEndDate(luxondate);
    },
    endDate: function () {
        return this.calobj.endDate;
    },
    isEmpty: function () {
        return false;
    },
    hasChanged: function () {
        return this.currentdate != this.calspan.html();
    },
    saveCurrentDate: function () {
        this.currentdate = this.calspan.html();
    },
    reset: function () {
        if (this.options.singleDatePicker) {
            this.setSingleCalendar(this.initialstart);
        } else {
            this.setDoubleCalendar(this.initialstart, this.initialend);
        }
        this.saveCurrentDate();
    }
};

if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() { } // optionally move this outside the declaration and into a closure if you need more speed.
        F.prototype = o;
        return new F();
    };
}

(function ($) {
    /* Create plugin */
    $.fn.sebDateRangePicker = function (options, start, end, luxonformat, customcallback) {
        return this.each(function () {
            var element = $(this);
            if (element.prop('tagName') != 'DIV')
                throw 'not a DIV';
            // Return early if this element already has a plugin instance
            if (element.data('sebdaterangepicker'))
                return element.data('sebdaterangepicker');
            var sebdaterangepicker = Object.create(SebDateRangePicker);
            sebdaterangepicker.init(this, options, start, end, luxonformat, customcallback);
            // pass options to plugin constructor
            element.data('sebdaterangepicker', sebdaterangepicker);
        });
    };
})($);
