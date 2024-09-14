<?php

namespace App\Http\Controllers\M1_Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\M1_Report\FamilyPlanningReport;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class FamilyPlanningReportController extends Controller
{
        /**
         * Fetch and return family planning report data with barangay and report period details.
         *
         * @param \Illuminate\Http\Request $request
         * @return \Illuminate\Http\JsonResponse
         */
        public function getFamilyPlanningReports(Request $request)
        {
            try {
                // Eager load necessary relationships to prevent N+1 queries
                $reports = FamilyPlanningReport::with([
                    'reportStatus.reportSubmission.barangay'
                ])
                ->get();

                // Transform the data for frontend consumption
                $formattedReports = $reports->map(function ($report) {
                    // Ensure related models exist to avoid null errors
                    if ($report->reportStatus && $report->reportStatus->reportSubmission && $report->reportStatus->reportSubmission->barangay) {
                        return [
                            'report_id' => $report->report_id,
                            'method_name' => $report->familyPlanningMethod->method_name,
                            'current_users_beginning_month' => $report->current_users_beginning_month,
                            'new_acceptors_prev_month' => $report->new_acceptors_prev_month,
                            'other_acceptors_present_month' => $report->other_acceptors_present_month,
                            'drop_outs_present_month' => $report->drop_outs_present_month,
                            'current_users_end_month' => $report->current_users_end_month,
                            'new_acceptors_present_month' => $report->new_acceptors_present_month,
                            'age_category' => $report->ageCategory->age_category,
                            'barangay_name' => $report->reportStatus->reportSubmission->barangay->barangay_name,
                            'report_period' => Carbon::create(
                                $report->reportStatus->reportSubmission->reportTemplate->report_year,
                                $report->reportStatus->reportSubmission->reportTemplate->report_month,
                                1
                            )->format('Y-m'),
                        ];
                    }

                    // Return null if the related models are missing
                    return null;
                })->filter(); // Filter out null values from missing relationships

                return response()->json([
                    'status' => 'success',
                    'data' => $formattedReports,
                ], Response::HTTP_OK);

            } catch (\Exception $e) {
                // Log the exception for debugging
                Log::error('Error fetching family planning reports: ' . $e->getMessage());

                return response()->json([
                    'status' => 'error',
                    // 'message' => 'Failed to fetch family planning reports. Please try again later.'
                    'message' => $e->getMessage(),
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }
}
