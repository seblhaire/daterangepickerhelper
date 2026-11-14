<?php

namespace Seblhaire\DateRangePickerHelper\Facades;

use Illuminate\Support\Facades\Facade;

class DateRangePickerHelper extends Facade {

    protected static function getFacadeAccessor() {
        return 'DateRangePickerHelperService';
    }
}
