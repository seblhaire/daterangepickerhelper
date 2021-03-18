<?php namespace Seblhaire\DateRangePickerHelper;

use Carbon\Carbon;
use App;
class DateRangePickerProvider{
		private $calendarElement = null;
	  private $start = null;
	  private $send = null;
	  private $min = null;
	  private $max = null;
		private $options = array();


		public function __construct($calendarElement, $start, $end, $min, $max, $options = []){
		    $this->calendarElement = $calendarElement;
		    if (!is_a($start, 'Carbon\Carbon')){
		        throw new \Exception('wrong date object');
		    }
		    if (!is_a($end, 'Carbon\Carbon')){
		        throw new \Exception('wrong date object');
		    }
		    if (!is_null($min) && !is_a($min, 'Carbon\Carbon')){
		        throw new \Exception('wrong date object');
		    }
		    if (!is_null($max) && !is_a($max, 'Carbon\Carbon')){
		        throw new \Exception('wrong date object');
		    }
		    $this->start = $start;
		    $this->end = $end;
		    if (!is_null($min)){
		        $this->min = $min;
		    }
		    if (!is_null($max)){
		        $this->max = $max;
		    }
		    if ($this->checkOptions($options)){
						$configid = sprintf('daterangepickerhelper.locales.%s', App::getLocale());
						if (is_null(config($configid))){
								$config = config('daterangepickerhelper.locales.en');
						}else{
							$config = config($configid);
						}
		        $this->options = array_replace(
		            array_merge(config('daterangepickerhelper.default'), $config),
		            $options
		        );
		    }else{
		        throw new \Exception('wrong option');
		    }
				//var_dump($this->options); die();
	}

	private function translateOrPrint($key)
  {
    if (preg_match('/^\#(.+)\#$/', $key, $matches)){
      return addslashes(__($matches[1]));
    }
    return $key;
  }

	private function outputarray($arr){
			$str = '';
			foreach($arr as $val){
					$elt = '"' . $this->translateOrPrint($val) . '"';
					$str .= (strlen($str) > 0 ? ',' : '') . $elt;
			}
			return "[" . $str . "]";
	}

	private function checkOptions($aOptions){
      if (is_array($aOptions)){
          $aCheckOptions = array(
						'usehiddeninputs' => 'is_bool',
		        'hiddeninputstart' => 'is_string',
		        'hiddeninputend' => 'is_string',
		        'submitfunction' =>'is_string',
						'icon' => 'is_string',
		        "opens" => 'is_string',
		        "drops" => 'is_string',
		        'maxSpan' => 'is_string',
		        'maxYear' => 'is_numeric',
		        'minYear' => 'is_numeric',
						'momentinputdate' => 'is_string',
		        'momentinputdatetime' => 'is_string',
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
		        'applylabel' =>  'is_string',
		        'cancellabel' =>  'is_string',
		        'fromlabel' =>  'is_string',
		        'tolabel'   =>  'is_string',
		        'customrange' =>  'is_string',
		        'weeklabel' => 'is_string',
		        'singleDatePicker' =>  'is_bool',
						'autoApply' =>  'is_bool',
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
		        "cancel.daterangepicker" => 'is_string'
          );
          $aKeys = array_keys($aCheckOptions);
          foreach($aOptions as $sKey => $sValue){
              if (!in_array($sKey, $aKeys) || !$aCheckOptions[$sKey]($sValue)){
                  return false;
              }
          }
          return true;
      }
      return false;
	}

	public function setSingleCalendar($momentdate){
		return $this->setStartDate($momentdate) . "\n" .
				$this->setEndDate($momentdate) . "\n" .
				$this->setCalLabelSingle($momentdate);
	}

	public function setDoubleCalendar($momentstartdate, $momentenddate){
		return $this->setStartDate($momentstartdate) . "\n" .
				$this->setEndDate($momentenddate) . "\n" .
				$this->setCalLabelDouble($momentstartdate, $momentenddate);
	}

	public function setStartDate($momentdate){
		 return "jQuery('#" . $this->calendarElement ."').data('daterangepicker').setStartDate(" . $momentdate . ");";
	}

	public function setEndDate($momentdate){
		 return "jQuery('#" . $this->calendarElement ."').data('daterangepicker').setEndDate(" . $momentdate . ");";
	}

	public function setCalLabelSingle($momentdate){
			return "jQuery('#" . $this->calendarElement . " span').html(" . $momentdate . ".format('" . $this->options["formatdisplay"] . "'));";
	}

	public function setCalLabelDouble($momentstartdate, $momentenddate){
			return "jQuery('#" . $this->calendarElement . " span').html(" . $momentstartdate . ".format('" . $this->options["formatdisplay"] .
					"') + '" . $this->options['dateseparator'] . "' + " . $momentstartdate . ".format('" . $this->options["formatdisplay"] . "'));";
	}

	public function getStartDate(){
			if ($this->options['usehiddeninputs']){
					return "jQuery('#" . $this->options['hiddeninputstart'] . "').val()";
			}else{
					return "jQuery('#" . $this->calendarElement ."').data('daterangepicker').startDate.format('" . $this->options["momentinputdate"] . "')";
			}
	}

	public function getEndDate(){
		if ($this->options['usehiddeninputs']){
				return "jQuery('#" . $this->options['hiddeninputend'] . "').val()";
		}else{
				return "jQuery('#" . $this->calendarElement ."').data('daterangepicker').endDate.format('" . $this->options["momentinputdate"] . "')";
		}
	}

	public function output(){
			if ($this->options['timePicker']){
					$carboninput = $this->options["carboninputdatetime"];
					$momentinput = $this->options["momentinputdatetime"];
					if ($this->options["timePickerSeconds"]){
							$formatdisplay = $this->options["formatdisplaytimeseconds"];
							$carbonformat =  $this->options["carbonformattimeseconds"];
					}else{
							$formatdisplay = $this->options["formatdisplaytime"];
							$carbonformat =  $this->options["carbonformattime"];
					}
			}else{
					$carboninput = $this->options["carboninputdate"];
					$momentinput = $this->options["momentinputdate"];
					$formatdisplay = $this->options["formatdisplay"];
					$carbonformat =  $this->options["carbonformat"];
			}
			if ($this->options['showISOWeekNumbers']){
					$weeknumbers = 'iso';
			}elseif ($this->options['showWeekNumbers']){
					$weeknumbers = 'us';
			}else{
					$weeknumbers = '';
			}
      $sStr = '';
      if ($this->options['cal_in_form']){
          $sStr = '<div class="' . $this->options['formdivclass'] . '"><label class="' . $this->options['formlabelclass'] . '" for="'. $this->calendarElement. '">' . $this->options['formlabel'] . '</label>';
      }
      $sStr .= "<div id=\"" . $this->calendarElement . "\" class=\"" . $this->options["caldivclass"] . "\">\n";
      $sStr .= $this->options['icon'] .'&nbsp;';
      $sStr .= "<span>" . $this->start->format($carbonformat) . ($this->options['singleDatePicker'] ? '' : $this->options['dateseparator'].
              $this->end->format($carbonformat));
      $sStr .= "</span> <b class=\"fas fa-angle-down caret\"></b>";
			if ($this->options['usehiddeninputs']){
					$sStr .= '<input type="hidden" id="' . $this->options['hiddeninputstart'] . '" name="' . $this->options['hiddeninputstart'] .
						'" value="' . $this->start->format($carboninput) . '"/>';
					if (!$this->options['singleDatePicker']){
							$sStr .= '<input type="hidden" id="' . $this->options['hiddeninputend'] . '" name="' . $this->options['hiddeninputend'] .
							'" value="' . $this->end->format($carboninput) . '"/>';
					}
			}
			$sStr .= "</div>\n";
      if ($this->options['cal_in_form']){
          $sStr .= "</div>\n";
      }
      $sStr .= "<script type=\"text/javascript\">\njQuery(function() {\n";
      $sStr .= "jQuery('#" . $this->calendarElement . "').daterangepicker({\n";
			$sStr .= "\"opens\": '" . $this->options['opens'] . "',\n";
			$sStr .= "\"drops\": '" . $this->options['drops'] . "',\n";

			if ($weeknumbers =='iso'){
					$sStr .= "\"showISOWeekNumbers\": true,\n";
			} else if ($weeknumbers =='us'){
					$sStr .= "\"showWeekNumbers\": true,\n";
			}
			$sStr .= "\"alwaysShowCalendars\": " . (($this->options['alwaysShowCalendars']) ? 'true' : 'false'). ",\n";
			if (strlen($this->options['maxSpan']) > 0){
					$sStr .= "\"alwaysShowCalendars\": {" . $this->options['maxSpan'] . "},\n";
			}
			if ($this->options['showDropdowns']){
					$sStr .= "\"showDropdowns\": true,\n";
			}
			if ($this->options['minYear']  > 0){
					$sStr .= "\"minYear\": " . $this->options['minYear'] . ",\n";
			}
			if ($this->options['maxYear'] > 0){
					$sStr .= "\"maxYear\": " . $this->options['maxYear'] . ",\n";
			}
			if ($this->options['timePicker']){
					$sStr .= "\"timePicker\": true,\n";
					if ($this->options['timePicker24Hour']){
							$sStr .= "\"timePicker24Hour\": true,\n";
					}
					if ($this->options['timePickerIncrement'] > 1){
							$sStr .= "\"timePickerIncrement\": " . $this->options['timePickerIncrement'] . ",\n";
					}
					if ($this->options['timePickerSeconds']){
							$sStr .= "\"timePickerSeconds\": true,\n";
					}
			}
			if (strlen($this->options['buttonClasses']) > 0){
					$sStr .= "\"buttonClasses\": '" . $this->options['buttonClasses'] . "',\n";
			}
			if (strlen($this->options['applyButtonClasses']) > 0){
					$sStr .= "\"applyButtonClasses\": '" . $this->options['applyButtonClasses'] . "',\n";
			}
			if (strlen($this->options['cancelButtonClasses']) > 0){
					$sStr .= "\"cancelButtonClasses\": '" . $this->options['cancelButtonClasses'] . "',\n";
			}
			if ($this->options['autoApply']){
					$sStr .= "\"autoApply\": true,\n";
			}
			if ($this->options['linkedCalendars']){
					$sStr .= "\"linkedCalendars\": true,\n";
			}
      if ($this->options['singleDatePicker']){
          $sStr .= "\"singleDatePicker\" : true,\n";
      }else{
					$ranges = '';
					foreach ($this->options['ranges'] as $label => $functions){
						$ranges .= (strlen($ranges) > 0 ? ",\n" : "") . "'" . $this->translateOrPrint($label) . "' : [" . $functions[0] . ", " . $functions[1] . "]";
					}
          $sStr .= "\"ranges\": {\n" . $ranges . "\n},\n";
					if (!$this->options['showCustomRangeLabel']){
							$sStr .= "\"showCustomRangeLabel\": false,\n";
					}
      }
      $sStr .= "\"locale\": {\n";
      $sStr .= "\"format\": \"" . $formatdisplay . "\",\n";
      $sStr .= "\"separator\": \"" .  $this->options['dateseparator'] . "\",\n";
      $sStr .= "\"applyLabel\": \"" .  $this->translateOrPrint($this->options['applylabel']) . "\",\n";
      $sStr .= "\"cancelLabel\": \"" .  $this->translateOrPrint($this->options['cancellabel']) . "\",\n";
      $sStr .= "\"fromLabel\": \"" .  $this->translateOrPrint($this->options['fromlabel']) . "\",\n";
      $sStr .= "\"toLabel\": \"" .  $this->translateOrPrint($this->options['tolabel']) . "\",\n";
      $sStr .= "\"customRangeLabel\": \"" .  $this->translateOrPrint($this->options['customrange']) . "\",\n";
      $sStr .= "\"weekLabel\": \"" .  $this->translateOrPrint($this->options['weeklabel']) . "\",\n";
      $sStr .= "\"daysOfWeek\": " .  $this->outputarray($this->options['daysofweek']) . ",\n";
      $sStr .= "\"monthNames\": " .  $this->outputarray($this->options['monthnames']) . ",\n";
      $sStr .= "\"firstDay\" : " . $this->options['firstday']. "\n},\n";
      $sStr .= "\"startDate\": moment(\"" . $this->start->format($carboninput) . "\"),\n";
      $sStr .= "\"endDate\": moment(\"" . $this->end->format($carboninput) . "\")\n";
      if (!is_null($this->min)){
          $sStr .= ",\"minDate\": moment(\"" . $this->min->format($carboninput) . "\")\n";
      }
      if (!is_null($this->max)){
          $sStr .= ",\"maxDate\": moment(\"" . $this->max->format($carboninput) . "\")\n";
      }
			$sStr .= "}";
			if (strlen($this->options['submitfunction']) > 0){
					$sStr .= ", function(start, end, label) {\n" . $this->options['submitfunction'] . "\n}";
			}else{
					$sStr .= ", function(start, end, label) {\n";
					if ($this->options['singleDatePicker']){
							if ($this->options['usehiddeninputs']){
								$sStr .= 'jQuery("#' . $this->options['hiddeninputstart'] . '").val(start.format("' . $momentinput .'"));' . "\n";
							}
							$sStr .= 'jQuery("#' . $this->calendarElement . ' span").html(start.format("' .  $formatdisplay  . '"));';
					}else{
							if ($this->options['usehiddeninputs']){
								$sStr .= 'jQuery("#' .  $this->options['hiddeninputstart'] . '").val(start.format("' . $momentinput .'"));' . "\n";
								$sStr .= 'jQuery("#' . $this->options['hiddeninputend'] . '").val(end.format("' .  $momentinput  .'"));' . "\n";
							}
							$sStr .= 'jQuery("#' . $this->calendarElement . ' span").html(start.format("' .  $formatdisplay .
							'") + "' . $this->options['dateseparator'] . '" + end.format("' .  $formatdisplay .
							'"));';
					}
					$sStr .= "\n}";
			}
			$sStr .=");\n});\n";
			if (strlen($this->options['show.daterangepicker']) > 0){
					$sStr .= 'jQuery("#' . $this->calendarElement . '").on("show.daterangepicker", function(ev, picker) { ' . $this->options['show.daterangepicker'] . ' });';
			}
			if (strlen($this->options['hide.daterangepicker']) > 0){
					$sStr .= 'jQuery("#' . $this->calendarElement . '").on("hide.daterangepicker", function(ev, picker) { ' . $this->options['hide.daterangepicker'] . ' });';
			}
			if (strlen($this->options['showCalendar.daterangepicker']) > 0){
					$sStr .= 'jQuery("#' . $this->calendarElement . '").on("showCalendar.daterangepicker", function(ev, picker) { ' . $this->options['showCalendar.daterangepicker'] . ' });';
			}
			if (strlen($this->options['hideCalendar.daterangepicker']) > 0){
					$sStr .= 'jQuery("#' . $this->calendarElement . '").on("hideCalendar.daterangepicker", function(ev, picker) { ' . $this->options['hideCalendar.daterangepicker'] . ' });';
			}
			if (strlen($this->options['apply.daterangepicker']) > 0){
					$sStr .= 'jQuery("#' . $this->calendarElement . '").on("apply.daterangepicker", function(ev, picker) { ' . $this->options['apply.daterangepicker'] . ' });';
			}
			if (strlen($this->options['cancel.daterangepicker']) > 0){
					$sStr .= 'jQuery("#' . $this->calendarElement . '").on("cancel.daterangepicker", function(ev, picker) { ' . $this->options['cancel.daterangepicker'] . ' });';
			}
			$sStr .= "</script>\n";
      return $sStr;
	}

}
