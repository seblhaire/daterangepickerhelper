var SebDateRangePicker = {
  maindiv : null,
  caldiv : null,
  calobj : null,
  calspan : null,
  options : null,
  content : null,
  startdate : null,
  enddate : null,
  phpformat : null,
  customcallback : null,
  currentdate : null,
  init: function(div, options, start, end, phpformat, customcallback){
    this.maindiv = jQuery(div);
    this.options = options;
    this.caldiv = jQuery('#' + this.maindiv.prop('id') + '-caldiv');
    this.calspan = jQuery('#' + this.maindiv.prop('id') + '-span');
    if (start.length > 0) this.startdate = jQuery('#' + start);
    if (end.length > 0) this.enddate = jQuery('#' + end);
    this.phpformat = phpformat;
    this.customcallback = customcallback;
    this.build();
    this.saveCurrentDate();
  },
  build: function(){
    if (this.customcallback != null){
      this.caldiv.daterangepicker(this.options, this.customcallback);
    } else {
      this.caldiv.daterangepicker(this.options, this.callback);
    }
    this.calobj = this.caldiv.data('daterangepicker');
  },
  callback : function(start, end, label) {
    var self = this.element.parent('div').data('sebdaterangepicker');
		if (self.startdate != null) self.startdate.val(start.format(self.phpformat));
		if (self.enddate != null) self.enddate.val(end.format(self.phpformat));
    var span = start.format(self.options.locale.format);
    if (!self.options.singleDatePicker){
      span += self.options.locale.separator + end.format(self.options.locale.format);
    }
		self.calspan.html(span);
	},
  setStartDate: function(momentdate){
		 return this.calobj.setStartDate(momentdate);
	},
  setSingleCalendar: function(momentdate){
    this.setStartDate(momentdate);
    this.setEndDate(momentdate);
    this.calspan.html(momentdate.format(this.options.locale.format));
  },
  setDoubleCalendar: function(momentstartdate, momentenddate){
    this.setStartDate(momentstartdate);
    this.setEndDate(momentenddate);
		this.calspan.html(
      momentstartdate.format(this.options.locale.format) +
      this.options.locale.separator +
      momentenddate.format(this.options.locale.format)
    );
  },
  startDate : function(){
    return this.calobj.startDate;
  },
	setEndDate : function setEndDate(momentdate){
		 return this.calobj.setEndDate(momentdate);
  },
  endDate : function(){
    return this.calobj.endDate;
  },
  isEmpty: function(){
    return false;
  },
  hasChanged: function(){
    return this.currentdate != this.calspan.html();
  },
  saveCurrentDate : function(){
    this.currentdate = this.calspan.html();
  }
};

if (typeof Object.create !== 'function') {
	Object.create = function(o) {
		function F() { } // optionally move this outside the declaration and into a closure if you need more speed.
		F.prototype = o;
		return new F();
	};
}
// table builder function
(function(jQuery) {
	/* Create plugin */
	jQuery.fn.sebDateRangePicker = function(options, start, end, phpformat, customcallback)  {
		return this.each(function() {
			var element = jQuery(this);
			if (element.prop('tagName') != 'DIV') throw 'not a DIV';
			// Return early if this element already has a plugin instance
			if (element.data('sebdaterangepicker')) return element.data('sebdaterangepicker');
			var sebdaterangepicker = Object.create(SebDateRangePicker);
			sebdaterangepicker.init(this, options,  start, end, phpformat, customcallback);
			// pass options to plugin constructor
			element.data('sebdaterangepicker', sebdaterangepicker);
		});
	};
})(jQuery);
