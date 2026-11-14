<?php

namespace Seblhaire\DateRangePickerHelper\Classes;

use Carbon\Carbon;
use App;
use function Stringy\create as stringy;

class DateRangePickerProvider {

    private $calendarElement = null;
    private $start = null;
    private $end = null;
    private $min = null;
    private $max = null;
    private $inputDateId = null;
    private $inputDateEndId = null;
    private $options = array();
    private $weeknumbers = null;
    private $carboninput = null;
    private $luxoninput = null;
    private $formatdisplay = null;
    private $carbonformat = null;
    private $inputDateName = null;
    private $inputDateEndName = null;

    public function __construct($calendarElement, $start, $end, $min, $max, $options = []) {
        $this->calendarElement = $calendarElement;
        if (!is_a($start, Carbon::class)) {
            throw new \Exception('wrong date object');
        }
        if (!is_a($end, Carbon::class)) {
            throw new \Exception('wrong date object');
        }
        if (!is_null($min) && !is_a($min, Carbon::class)) {
            throw new \Exception('wrong date object');
        }
        if (!is_null($max) && !is_a($max, Carbon::class)) {
            throw new \Exception('wrong date object');
        }
        $this->start = $start;
        $this->end = $end;
        if (!is_null($min)) {
            $this->min = $min;
        }
        if (!is_null($max)) {
            $this->max = $max;
        }
        if ($this->checkOptions($options)) {
            $configid = sprintf('daterangepickerhelper.locales.%s', App::getLocale());
            if (is_null(config($configid))) {
                $config = config('daterangepickerhelper.locales.en');
            } else {
                $config = config($configid);
            }
            $this->options = array_replace(
                    array_merge(config('daterangepickerhelper.default'), $config),
                    $options
            );
            if (!isset($options['ranges'])) {
                $this->options['ranges'] =  [
                    __('daterangepickerhelper::messages.today') => [
                        'DateTime.now().setZone("' . $this->options['zone'] . '").startOf("day")', 
                        'DateTime.now().setZone("' . $this->options['zone'] . '").endOf("day")'
                    ],
                    __('daterangepickerhelper::messages.yesterday') => [
                        'DateTime.now().minus({ days: 1 }).setZone("' . $this->options['zone'] . '").startOf("day")', 
                        'DateTime.now().minus({ days: 1 }).setZone("' . $this->options['zone'] . '").endOf("day")'
                    ],
                    __('daterangepickerhelper::messages.last7d') => [
                        'DateTime.now().minus({ days: 6 }).setZone("' . $this->options['zone'] . '").startOf("day")',
                        'DateTime.now().setZone("' . $this->options['zone'] . '").endOf("day")'
                    ],
                    __('daterangepickerhelper::messages.last30d') => [
                        'DateTime.now().minus({ days: 29 }).setZone("' . $this->options['zone'] . '").startOf("day")',
                        'DateTime.now().setZone("' . $this->options['zone'] . '").endOf("day")'
                    ],
                    __('daterangepickerhelper::messages.thismonth') => [
                        'DateTime.now().startOf("month").setZone("' . $this->options['zone'] . '").startOf("day")', 
                        'DateTime.now().endOf("month").setZone("' . $this->options['zone'] . '").endOf("day")', 
                    ],
                    __('daterangepickerhelper::messages.lastmonth') => [
                        'DateTime.now().minus({ months: 1 }).startOf("month").setZone("' . $this->options['zone'] . '").startOf("day")',  
                        'DateTime.now().minus({ months: 1 }).endOf("month").setZone("' . $this->options['zone'] . '").endOf("day")'
                    ]
                ];
            }
        } else {
            throw new \Exception('wrong option');
        }
        if ($this->options['singleDatePicker']) {
            $this->inputDateId = $this->calendarElement . '-hidden-date';
        } else {
            $this->inputDateId = $this->calendarElement . '-hidden-startdate';
            $this->inputDateEndId = $this->calendarElement . '-hidden-enddate';
        }
        if ($this->options['showISOWeekNumbers']) {
            $this->weeknumbers = 'iso';
        } elseif ($this->options['showWeekNumbers']) {
            $this->weeknumbers = 'us';
        } else {
            $this->weeknumbers = '';
        }
        if ($this->options['timePicker']) {
            $this->carboninput = $this->options["carboninputdatetime"];
            $this->luxoninput = $this->options["luxoninputdatetime"];
            if ($this->options["timePickerSeconds"]) {
                $this->formatdisplay = $this->options["formatdisplaytimeseconds"];
                $this->carbonformat = $this->options["carbonformattimeseconds"];
            } else {
                $this->formatdisplay = $this->options["formatdisplaytime"];
                $this->carbonformat = $this->options["carbonformattime"];
            }
        } else {
            $this->carboninput = $this->options["carboninputdate"];
            $this->luxoninput = $this->options["luxoninputdate"];
            $this->formatdisplay = $this->options["formatdisplay"];
            $this->carbonformat = $this->options["carbonformat"];
        }
        if ($this->options['usehiddeninputs']) {
            if ($this->options['singleDatePicker']) {
                if ($this->options['hiddensingleinput'] != '') {
                    $this->inputDateName = $this->options['hiddensingleinput'];
                } else {
                    $this->inputDateName = $this->calendarElement;
                }
            } else {
                if ($this->options['hiddeninputstart'] != '') {
                    $this->inputDateName = $this->options['hiddeninputstart'];
                } else {
                    $this->inputDateName = $this->calendarElement . '-start';
                }
                if ($this->options['hiddeninputend'] != '') {
                    $this->inputDateEndName = $this->options['hiddeninputend'];
                } else {
                    $this->inputDateEndName = $this->calendarElement . '-end';
                }
            }
        }
    }

    private function buildCalIcon(): string{
        if (stringy($this->options['icon'])->startswith('<')){
            return $this->options['icon'];
        }else{
            return '<em class="' . $this->options['icon'] . '"></em>';
        }
    }

    private function buildJsCalIcon(): string{
        $icon = stringy($this->options['icon']);
        if ($icon->startswith('<')){
            return "'" . $icon->replace("'", '"') . "'";
        }else{
            return '$("<em/>").addClass("' . $this->options['icon'] .'")';
        }
    }

    public function printTags() : string {
        $sStr = '<div id="' . $this->calendarElement . '" class="' . $this->options['formdivclass'] . '">' . PHP_EOL .
                '<label class="' . $this->options['formlabelclass'] .
                '" for="' . $this->calendarElement . '">' . $this->options['formlabel'] . '</label>' . PHP_EOL;
        $sStr .= "<div id=\"" . $this->calendarElement . "-caldiv\" class=\"" . $this->options["caldivclass"] . "\">\n";
        $sStr .= $this->buildCalIcon() . '&nbsp;';
        $sStr .= "<span id=\"" . $this->calendarElement . "-span\">" . $this->start->format($this->carbonformat) . ($this->options['singleDatePicker'] ? '' : $this->options['dateseparator'] .
                $this->end->format($this->carbonformat));
        $sStr .= "</span>&nbsp;<em class=\"fas fa-angle-down caret\"></em>";
        if ($this->options['usehiddeninputs']) {
            $sStr .= PHP_EOL . '<input type="hidden" id="' . $this->inputDateId . '" name="' . $this->inputDateName . '" value="' . $this->start->format($this->carboninput) . '"/>';
            if (!$this->options['singleDatePicker']) {
                $sStr .= PHP_EOL . '<input type="hidden" id="' . $this->inputDateEndId . '" name="' . $this->inputDateEndName . '" value="' . $this->end->format($this->carboninput) . '"/>';
            }
        }
        $sStr .= PHP_EOL . "</div>\n";
        $sStr .= "</div>\n";
        return $sStr;
    }

    public function insertJsTags($caldiv = 'caldiv', $label = 'label', $inner = 'inner', $span = 'span', $caret = 'caret') {
        $sStr = "var " . $label . " = $('<label/>').addClass('" . $this->options['formlabelclass'] . "').attr('for', '" . $this->calendarElement . "').html('" . addslashes($this->options['formlabel']) . "');\n";
        $sStr .= "var " . $inner . " = $('<div/>').attr('id', '" . $this->calendarElement . "-caldiv').addClass('" . $this->options['caldivclass'] . "');\n";
        $sStr .= "var " . $span ." = $('<span/>').attr('id', '" . $this->calendarElement . "-span').append('" . $this->options['caldivclass'] . "').html('" .  $this->start->format($this->carbonformat) . ($this->options['singleDatePicker'] ? '' : $this->options['dateseparator'] . $this->end->format($this->carbonformat)). "');\n";
        $sStr .= "var ". $caret . " = $('<em/>').addClass('fas fa-angle-down caret');\n";
        $sStr .= $inner . ".append(". $this->buildJsCalIcon() . ").append('&nbsp;').append(". $span . ").append('&nbsp;').append(". $caret . ");\n";
        if ($this->options['usehiddeninputs']) {
            $sStr .= $inner . ".append($('<input/>').attr('type', 'hidden').attr('id', '". $this->inputDateId . "').attr('name', '" . $this->inputDateName . "').val('". $this->start->format($this->carboninput) ."'));\n";
            if (!$this->options['singleDatePicker']) {
                $sStr .= $inner . ".append($('<input/>').attr('type', 'hidden').attr('id', '". $this->inputDateEndId . "').attr('name', '" . $this->inputDateEndName . "').val('". $this->end->format($this->carboninput) ."'));\n";
            }
        }
        $sStr .= "var " . $caldiv . " = $('<div/>').attr('id', '" . $this->calendarElement . "').addClass('" . $this->options['formdivclass'] . "').append(" . $label . ").append(" . $inner . ");\n";
        return $sStr;
    }

    public function printInitJs() : string {
        $sStr = "$('#" . $this->calendarElement . "').sebDateRangePicker({";
        $sStr .= "opens: '" . $this->options['opens'] . "', ";
        $sStr .= "drops: '" . $this->options['drops'] . "', ";
        if ($this->weeknumbers == 'iso') {
            $sStr .= "showISOWeekNumbers: true, ";
        } else if ($this->weeknumbers == 'us') {
            $sStr .= "showWeekNumbers: true, ";
        }
        $sStr .= "alwaysShowCalendars: " . (($this->options['alwaysShowCalendars']) ? 'true' : 'false') . ", ";
        if (strlen($this->options['maxSpan']) > 0) {
            $sStr .= "alwaysShowCalendars: {" . $this->options['maxSpan'] . "}, ";
        }
        if ($this->options['showDropdowns']) {
            $sStr .= "showDropdowns: true, ";
        }
        if ($this->options['minYear'] > 0) {
            $sStr .= "minYear: " . $this->options['minYear'] . ", ";
        }
        if ($this->options['maxYear'] > 0) {
            $sStr .= "maxYear: " . $this->options['maxYear'] . ", ";
        }
        if ($this->options['timePicker']) {
            $sStr .= "timePicker: true, ";
        }
        if ($this->options['timePicker24Hour']) {
            $sStr .= "timePicker24Hour: true, ";
        }
        if ($this->options['timePickerIncrement'] > 1) {
            $sStr .= "timePickerIncrement: " . $this->options['timePickerIncrement'] . ", ";
        }
        if ($this->options['timePickerSeconds']) {
            $sStr .= "timePickerSeconds: true, ";
        }
        if (strlen($this->options['buttonClasses']) > 0) {
            $sStr .= "buttonClasses: '" . $this->options['buttonClasses'] . "', ";
        }
        if (strlen($this->options['applyButtonClasses']) > 0) {
            $sStr .= "applyButtonClasses: '" . $this->options['applyButtonClasses'] . "', ";
        }
        if (strlen($this->options['cancelButtonClasses']) > 0) {
            $sStr .= "cancelButtonClasses: '" . $this->options['cancelButtonClasses'] . "', ";
        }
        if ($this->options['autoApply']) {
            $sStr .= "autoApply: true, ";
        }
        if ($this->options['linkedCalendars']) {
            $sStr .= "linkedCalendars: true, ";
        }
        if ($this->options['singleDatePicker']) {
            $sStr .= "singleDatePicker: true, ";
        } else {
            $ranges = '';
            foreach ($this->options['ranges'] as $label => $functions) {
                $ranges .= (strlen($ranges) > 0 ? ", " : "") . "'" . $this->translateOrPrint($label) . "' : [" . $functions[0] . ", " . $functions[1] . "]";
            }
            $sStr .= "ranges: {" . $ranges . "}, ";
            if (!$this->options['showCustomRangeLabel']) {
                $sStr .= "\"showCustomRangeLabel\": false, ";
            }
        }
        $sStr .= "locale: {";
        $sStr .= "format: \"" . $this->formatdisplay . "\", ";
        $sStr .= "separator: \"" . $this->options['dateseparator'] . "\", ";
        $sStr .= "applyLabel: \"" . $this->translateOrPrint($this->options['applylabel']) . "\", ";
        $sStr .= "cancelLabel: \"" . $this->translateOrPrint($this->options['cancellabel']) . "\", ";
        $sStr .= "fromLabel: \"" . $this->translateOrPrint($this->options['fromlabel']) . "\", ";
        $sStr .= "toLabel: \"" . $this->translateOrPrint($this->options['tolabel']) . "\", ";
        $sStr .= "customRangeLabel: \"" . $this->translateOrPrint($this->options['customrange']) . "\", ";
        $sStr .= "weekLabel: \"" . $this->translateOrPrint($this->options['weeklabel']) . "\", ";
        $sStr .= "daysOfWeek: " . $this->outputarray($this->options['daysofweek']) . ", ";
        $sStr .= "monthNames: " . $this->outputarray($this->options['monthnames']) . ", ";
        $sStr .= "firstDay: " . $this->options['firstday'] . ', ';
        $sStr .= 'zone: "' . $this->options['zone'] . '"}, ';
        $sStr .= 'startDate: DateTime.fromSQL("' . $this->start->format($this->carboninput) . '").setZone("' . $this->options['zone'] . '"), ';
        $sStr .= 'endDate: DateTime.fromSQL("' . $this->end->format($this->carboninput) . '").setZone("' . $this->options['zone'] . '")';
        if (!is_null($this->min)) {
            $sStr .= ', minDate: DateTime.fromSQL("' . $this->min->format($this->carboninput) . '").setZone("' . $this->options['zone'] . '")';
        }
        if (!is_null($this->max)) {
            $sStr .= ', maxDate: DateTime.fromSQL("' . $this->max->format($this->carboninput) . '").setZone("' . $this->options['zone'] . '")';
        }
        $sStr .= "}, ";
        if ($this->options['singleDatePicker']) {
            if ($this->options['usehiddeninputs']) {
                $sStr .= '"' . $this->inputDateId . '","",';
            } else {
                $sStr .= '"","",';
            }
        } else {
            if ($this->options['usehiddeninputs']) {
                $sStr .= '"' . $this->inputDateId . '","' . $this->inputDateEndId . '",';
            } else {
                $sStr .= '"","",';
            }
        }
        $sStr .= '"' . $this->luxoninput . '", ';
        if (strlen($this->options['submitfunction']) > 0) {
            $sStr .= "function(start, end, label) {" . $this->options['submitfunction'] . "}";
        } else {
            $sStr .= "null";
        }
        $sStr .= ");\n";
        $sStr .= $this->printAdditionalJs() . "\n";
        return $sStr;
    }

    private function printAdditionalJs(): string {
        $sStr = '';
        if (strlen($this->options['show.daterangepicker']) > 0) {
            $sStr .= '$("#' . $this->calendarElement . '").on("show.daterangepicker", function(ev, picker) { ' . $this->options['show.daterangepicker'] . ' });';
        }
        if (strlen($this->options['hide.daterangepicker']) > 0) {
            $sStr .= '$("#' . $this->calendarElement . '").on("hide.daterangepicker", function(ev, picker) { ' . $this->options['hide.daterangepicker'] . ' });';
        }
        if (strlen($this->options['showCalendar.daterangepicker']) > 0) {
            $sStr .= '$("#' . $this->calendarElement . '").on("showCalendar.daterangepicker", function(ev, picker) { ' . $this->options['showCalendar.daterangepicker'] . ' });';
        }
        if (strlen($this->options['hideCalendar.daterangepicker']) > 0) {
            $sStr .= '$("#' . $this->calendarElement . '").on("hideCalendar.daterangepicker", function(ev, picker) { ' . $this->options['hideCalendar.daterangepicker'] . ' });';
        }
        if (strlen($this->options['apply.daterangepicker']) > 0) {
            $sStr .= '$("#' . $this->calendarElement . '").on("apply.daterangepicker", function(ev, picker) { ' . $this->options['apply.daterangepicker'] . ' });';
        }
        if (strlen($this->options['cancel.daterangepicker']) > 0) {
            $sStr .= '$("#' . $this->calendarElement . '").on("cancel.daterangepicker", function(ev, picker) { ' . $this->options['cancel.daterangepicker'] . ' });';
        }
        return $sStr;
    }

    public function setSingleCalendar($luxondate) {
        return "$('#" . $this->calendarElement . "').data('sebdaterangepicker').setSingleCalendar(" . $luxondate . ");";
    }

    public function setDoubleCalendar($luxonstartdate, $luxonenddate) {
        return "$('#" . $this->calendarElement . "').data('sebdaterangepicker').setDoubleCalendar(" . $luxonstartdate . "," . $luxonenddate . ");";
    }

    public function setStartDate($luxondate) {
        return "$('#" . $this->calendarElement . "').data('sebdaterangepicker').setStartDate(" . $luxondate . ");";
    }

    public function setEndDate($luxondate) {
        return "$('#" . $this->calendarElement . "').data('sebdaterangepicker').setEndDate(" . $luxondate . ");";
    }

    public function setCalLabelSingle($luxondate) {
        return "$('#" . $this->calendarElement . " span').html(" . $luxondate . ".toFormat('" . $this->options["formatdisplay"] . "'));";
    }

    public function setCalLabelDouble($luxonstartdate, $luxonenddate) {
        return "$('#" . $this->calendarElement . " span').html(" . $luxonstartdate . ".toFormat('" . $this->options["formatdisplay"] .
                "') + '" . $this->options['dateseparator'] . "' + " . $luxonstartdate . ".toFormat('" . $this->options["formatdisplay"] . "'));";
    }

    public function getStartDate() {
        if ($this->options['usehiddeninputs']) {
            return "$('#" . $this->inputDateId . "').val()";
        } else {
            return "$('#" . $this->calendarElement . "').data('sebdaterangepicker').startDate().toFormat('" . $this->options["luxoninputdate"] . "')";
        }
    }

    public function getEndDate() {
        if ($this->options['usehiddeninputs']) {
            return "$('#" . $this->inputDateEndId . "').val()";
        } else {
            return "$('#" . $this->calendarElement . "').data('sebdaterangepicker').endDate().toFormat('" . $this->options["luxoninputdate"] . "')";
        }
    }

    private function translateOrPrint($key) {
        if (preg_match('/^\#(.+)\#$/', $key, $matches)) {
            return addslashes(__($matches[1]));
        }
        return $key;
    }

    private function outputarray($arr) {
        $str = '';
        foreach ($arr as $val) {
            $elt = '"' . $this->translateOrPrint($val) . '"';
            $str .= (strlen($str) > 0 ? ',' : '') . $elt;
        }
        return "[" . $str . "]";
    }

    private function checkOptions($aOptions) {
        if (is_array($aOptions)) {
            $aCheckOptions = array(
                'usehiddeninputs' => 'is_bool',
                'hiddeninputstart' => 'is_string',
                'hiddeninputend' => 'is_string',
                'submitfunction' => 'is_string',
                'icon' => 'is_string',
                "opens" => 'is_string',
                "drops" => 'is_string',
                'maxSpan' => 'is_string',
                'maxYear' => 'is_numeric',
                'minYear' => 'is_numeric',
                'luxoninputdate' => 'is_string',
                'luxoninputdatetime' => 'is_string',
                'carboninputdate' => 'is_string',
                'carboninputdatetime' => 'is_string',
                'formatdisplay' => 'is_string',
                'formatdisplaytime' => 'is_string',
                'formatdisplaytimeseconds' => 'is_string',
                'carbonformat' => 'is_string',
                'carbonformattime' => 'is_string',
                'carbonformattimeseconds' => 'is_string',
                "showDropdowns" => 'is_bool',
                'showISOWeekNumbers' => 'is_bool',
                'showWeekNumbers' => 'is_bool',
                'timePicker' => 'is_bool',
                'timePicker24Hour' => 'is_bool',
                'timePickerSeconds' => 'is_bool',
                'timePickerIncrement' => 'is_numeric',
                'dateseparator' => 'is_string',
                'firstday' => 'is_numeric',
                'daysofweek' => 'is_array',
                'monthnames' => 'is_array',
                'ranges' => 'is_array',
                'applylabel' => 'is_string',
                'cancellabel' => 'is_string',
                'fromlabel' => 'is_string',
                'tolabel' => 'is_string',
                'customrange' => 'is_string',
                'weeklabel' => 'is_string',
                'singleDatePicker' => 'is_bool',
                'autoApply' => 'is_bool',
                'postactions' => 'is_string',
                'cal_in_form' => 'is_bool',
                "formdivclass" => 'is_string',
                'formlabel' => 'is_string',
                'formlabelclass' => 'is_string',
                'alwaysShowCalendars' => 'is_bool',
                "caldivclass" => 'is_string',
                "buttonClasses" => 'is_string',
                "applyButtonClasses" => 'is_string',
                "cancelButtonClasses" => 'is_string',
                "showCustomRangeLabel" => 'is_bool',
                'linkedCalendars' => 'is_bool',
                "show.daterangepicker" => 'is_string',
                "hide.daterangepicker" => 'is_string',
                "showCalendar.daterangepicker" => 'is_string',
                "hideCalendar.daterangepicker" => 'is_string',
                "apply.daterangepicker" => 'is_string',
                "cancel.daterangepicker" => 'is_string',
                'zone' => 'is_string',
            );
            $aKeys = array_keys($aCheckOptions);
            foreach ($aOptions as $sKey => $sValue) {
                if (!in_array($sKey, $aKeys) || !$aCheckOptions[$sKey]($sValue)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
}
