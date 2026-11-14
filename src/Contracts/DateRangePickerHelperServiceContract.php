<?php

namespace Seblhaire\DateRangePickerHelper\Contracts;

interface DateRangePickerHelperServiceContract {

    public function init($calendarElement, $start, $end, $min, $max, $options = []);

    public function getCalendar($calendarElement = '');

    public function setSingleCalendar($luxondate, $calendarElement = '');

    public function setDoubleCalendar($luxonstartdate, $luxonenddate, $calendarElement = '');

    public function setStartDate($luxondate, $calendarElement = '');

    public function setEndDate($luxondate, $calendarElement = '');

    public function setCalLabelSingle($luxondate, $calendarElement = '');

    public function setCalLabelDouble($luxonstartdate, $luxonenddate, $calendarElement = '');

    public function getStartDate($calendarElement = '');

    public function getEndDate($calendarElement = '');

    public function output($calendarElement = '');
}
