<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ReportSubmission;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\PendingReportNotice;
use Carbon\Carbon;

class SendPendingReportNotice extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-pending-report-notice {--check} {--send}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and send email notifications for pending reports';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Fetch pending reports with related barangay data
        $pendingReports = ReportSubmission::where('status', 'pending')->with('barangay')->get();

        // Get the current date
        $today = Carbon::today();

        // Group reports by barangay
        $reportsByBarangay = $pendingReports->groupBy('barangay_id');

        // Check if the user wants to check for conditions or just send emails
        $isCheckOnly = $this->option('check');
        $isSendOnly = $this->option('send');

        foreach ($reportsByBarangay as $barangayId => $reports) {
            // Get active users associated with the barangay
            $users = User::where('barangay_id', $barangayId)->where('status', 'active')->get();

            // Collect reports to send based on the pending reports
            $reportsToSend = $reports->filter(function ($report) use ($today) {
                $dueDate = Carbon::parse($report->due_at);
                $daysLeft = $today->diffInDays($dueDate, false); // Negative if overdue

                // Filter reports based on deadline conditions (7, 3, 1 day(s) away, or overdue)
                return in_array(abs($daysLeft), [7, 3, 1]) || $daysLeft < 0;
            });

            // Collect unique report periods with their due dates and barangay name for this barangay
            $uniqueReports = $reportsToSend->unique(function ($report) {
                return $report->report_period . '-' . $report->due_at;
            })->map(function ($report) {
                $dueDate = Carbon::parse($report->due_at);
                $daysLeft = Carbon::today()->diffInDays($dueDate, false); // Negative if overdue

                return [
                    'report_period' => $report->report_period,
                    'due_date' => $dueDate->format('F j, Y'),
                    'barangay_name' => $report->barangay->barangay_name,
                    'days_left' => $daysLeft
                ];
            });

            // Condition 1: If user chooses to check only, display results
            if ($isCheckOnly) {
                $this->info("Pending reports for barangay: {$reports[0]->barangay->barangay_name}");
                foreach ($uniqueReports as $report) {
                    $this->info("Report Period: {$report['report_period']}, Due Date: {$report['due_date']}, Days Left: {$report['days_left']}");
                }
            }

            // Condition 2: If user chooses to send emails or if neither is chosen (i.e., both options are considered)
            if ($isSendOnly || (!$isCheckOnly && !$isSendOnly)) {
                // Send a single email to each user with all unique report periods
                foreach ($users as $user) {
                    // Send email with pending reports
                    Mail::to($user->email)->send(new PendingReportNotice($uniqueReports));
                }
                $this->info("Email sent to users of barangay: {$reports[0]->barangay->barangay_name}");
            }

            // If --check is selected, and there are pending reports, send the emails automatically
            if ($isCheckOnly && $reportsToSend->isNotEmpty()) {
                foreach ($users as $user) {
                    Mail::to($user->email)->send(new PendingReportNotice($uniqueReports));
                    $this->info("Email automatically sent to: {$user->email} for pending reports.");
                }
            }
        }

        $this->info('Process completed.');
    }
}
