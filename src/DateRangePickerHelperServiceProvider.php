<?php

namespace Seblhaire\DateRangePickerHelper;

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
          __DIR__.'/../config/daterangepickerhelper.php' => config_path('daterangepickerhelper.php'),
          __DIR__.'/../lang' => resource_path('lang/vendor/daterangepickerhelper'),
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
            __DIR__.'/../config/daterangepickerhelper.php', 'daterangepickerhelper'
        );
        $this->app->singleton('DateRangePickerHelperService', function ($app) {
          return new DateRangePickerHelperService();
        });
    }

    public function provides() {
        return [DateRangePickerHelperServiceContract::class];
    }
}
