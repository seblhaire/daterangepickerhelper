<?php namespace Seblhaire\DateRangePickerHelper;

interface DateRangePickerHelperServiceContract{

	public function init($calendarElement, $start, $end, $min, $max, $options = []);

public function getCalendar($calendarElement ='');

public function setSingleCalendar($momentdate, $calendarElement ='');

public function setDoubleCalendar($momentstartdate, $momentenddate, $calendarElement ='');

public function setStartDate($momentdate, $calendarElement ='');

public function setEndDate($momentdate, $calendarElement ='');

public function setCalLabelSingle($momentdate, $calendarElement ='');

public function setCalLabelDouble($momentstartdate, $momentenddate, $calendarElement ='');

public function getStartDate($calendarElement ='');

public function getEndDate($calendarElement ='');

public function output($calendarElement ='');

}
