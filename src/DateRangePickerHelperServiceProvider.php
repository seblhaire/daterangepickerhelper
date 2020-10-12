<?php

namespace Seb\DateRangePickerHelper;

use Illuminate\Support\ServiceProvider;
use App;

class DateRangePickerHelperServiceProvider extends ServiceProvider
{
     protected $defer = true;
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
      $this->loadTranslationsFrom(__DIR__.'/../lang', 'daterangepickerhelper');
      $this->publishes([
          __DIR__.'/../config/' => config_path('vendor/seb/daterangepickerhelper'),
          __DIR__.'/../lang' => resource_path('lang/vendor/seb/daterangepickerhelper'),
        ]);
    }

    /**
     * Register the application services.
     *
     * @return void
     */

    public function register()
    {

        $this->mergeConfigFrom(
            __DIR__.'/../config/calendar.php', 'daterangepickerhelper'
        );
        $this->mergeConfigFrom(
            __DIR__.'/../config/' . App::getLocale() . '/locales.php', 'daterangepickerhelperlocales'
        );
        $this->app->singleton('DateRangePickerHelperService', function ($app) {
          return new DateRangePickerHelperService();
        });
    }

    public function provides() {
        return [DateRangePickerHelperServiceContract::class];
    }
}
