<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Artisan::command('inspire', function () {
//     $this->comment(Inspiring::quote());
// })->purpose('Display an inspiring quote')->hourly();

Schedule::call(function () {
    Artisan::call('app:send-pending-report-notice --check');
})->dailyAt('06:00')->name('send-pending-report-notice-06:00')->withoutOverlapping();

Schedule::call(function () {
    Artisan::call('app:send-pending-report-notice --check');
})->dailyAt('18:00')->name('send-pending-report-notice-18:00')->withoutOverlapping();

Schedule::call(function () {
    Artisan::call('queue:work --stop-when-empty');
})->everyMinute()->name('queue-worker')->withoutOverlapping();