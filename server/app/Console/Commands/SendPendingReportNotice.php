<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ReportSubmission;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\PendingReportNotice;

class SendPendingReportNotice extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-pending-report-notice';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send email notifications for pending reports';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Fetch pending reports with related barangay data
        $pendingReports = ReportSubmission::where('status', 'pending')->with('barangay')->get();

        // Group reports by barangay
        $reportsByBarangay = $pendingReports->groupBy('barangay_id');

        foreach ($reportsByBarangay as $barangayId => $reports) {
            // Get active users associated with the barangay
            $users = User::where('barangay_id', $barangayId)->where('status', 'active')->get();

            // Collect unique report periods with their due dates and barangay name for this barangay
            $uniqueReports = $reports->unique(function ($report) {
                return $report->report_period . '-' . $report->due_at;
            })->map(function ($report) {
                return [
                    'report_period' => \Carbon\Carbon::parse($report->due_at)->format('F Y'),
                    'due_date' => \Carbon\Carbon::parse($report->due_at)->format('F j, Y'),
                    'barangay_name' => $report->barangay->barangay_name
                ];
            });

            // Send a single email to each user with all unique report periods
            foreach ($users as $user) {
                Mail::to($user->email)->send(new PendingReportNotice($uniqueReports));
            }
        }

        $this->info('Pending report emails sent successfully.');
    }
}
