<?php

namespace Seblhaire\DateRangePickerHelper\Services;

use Seblhaire\DateRangePickerHelper\Classes\DateRangePickerProvider;
use Seblhaire\DateRangePickerHelper\Contracts\DateRangePickerHelperServiceContract;

class DateRangePickerHelperService implements DateRangePickerHelperServiceContract {

    public static $instances = [];

    public function init($calendarElement, $start, $end, $min, $max, $options = []) {
        self::$instances[$calendarElement] = new DateRangePickerProvider($calendarElement, $start, $end, $min, $max, $options);
        return self::$instances[$calendarElement];
    }

    public function getCalendar($calendarElement = '') {
        if ($calendarElement == '') {
            return reset(self::$instances);
        }
        return self::$instances[$calendarElement];
    }

    public function setSingleCalendar($luxondate, $calendarElement = '') {
        return $this->getCalendar($calendarElement)->setSingleCalendar($luxondate);
    }

    public function setDoubleCalendar($luxonstartdate, $luxonenddate, $calendarElement = '') {
        return $this->getCalendar($calendarElement)->setDoubleCalendar($luxonstartdate, $luxonenddate);
    }

    public function setStartDate($luxondate, $calendarElement = '') {
        return $this->getCalendar($calendarElement)->setStartDate($luxondate);
    }

    public function setEndDate($luxondate, $calendarElement = '') {
        return $this->getCalendar($calendarElement)->setEndDate($luxondate);
    }

    public function setCalLabelSingle($luxondate, $calendarElement = '') {
        return $this->getCalendar($calendarElement)->setCalLabelSingle($luxondate);
    }

    public function setCalLabelDouble($luxonstartdate, $luxonenddate, $calendarElement = '') {
        return $this->getCalendar($calendarElement)->setCalLabelDouble($luxonstartdate, $luxonenddate);
    }

    public function getStartDate($calendarElement = '') {
        return $this->getCalendar($calendarElement)->getStartDate();
    }

    public function getEndDate($calendarElement = '') {
        return $this->getCalendar($calendarElement)->getEndDate();
    }

    public function output($calendarElement = '') {
        return $this->getCalendar($calendarElement)->output();
    }
}
