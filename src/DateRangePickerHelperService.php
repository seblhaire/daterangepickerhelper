<?php namespace Seblhaire\DateRangePickerHelper;

use Seblhaire\DateRangePickerHelper\DateRangePickerProvider;

class DateRangePickerHelperService implements DateRangePickerHelperServiceContract{
		public static $instances = [];


		public function init($calendarElement, $start, $end, $min, $max, $options = []){
		 		self::$instances[$calendarElement] = new DateRangePickerProvider($calendarElement, $start, $end, $min, $max, $options);
				return self::$instances[$calendarElement];
	}

	public function getCalendar($calendarElement ='')
	{
		 if ($calendarElement == ''){
			 return reset(self::$instances);
		 }
		 return self::$instances[$calendarElement];
	}

	public function setSingleCalendar($momentdate, $calendarElement =''){
		return $this->getCalendar($calendarElement)->setSingleCalendar($momentdate);
	}

	public function setDoubleCalendar($momentstartdate, $momentenddate, $calendarElement =''){
		return $this->getCalendar($calendarElement)->setDoubleCalendar($momentstartdate, $momentenddate);
	}

	public function setStartDate($momentdate, $calendarElement =''){
		 return $this->getCalendar($calendarElement)->setStartDate($momentdate);
	}

	public function setEndDate($momentdate, $calendarElement =''){
		 return $this->getCalendar($calendarElement)->setEndDate($momentdate);
	}

	public function setCalLabelSingle($momentdate, $calendarElement =''){
			return $this->getCalendar($calendarElement)->setCalLabelSingle($momentdate);
	}

	public function setCalLabelDouble($momentstartdate, $momentenddate, $calendarElement =''){
			return $this->getCalendar($calendarElement)->setCalLabelDouble($momentstartdate, $momentenddate);
	}

	public function getStartDate($calendarElement =''){
			return $this->getCalendar($calendarElement)->getStartDate();
	}

	public function getEndDate($calendarElement =''){
		return $this->getCalendar($calendarElement)->getEndDate();
	}

	public function output($calendarElement =''){
			return $this->getCalendar($calendarElement)->output();
	}

}
