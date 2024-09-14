<?php


namespace App\Http\Controllers\M2_Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\M2_Report\MorbidityReport;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class MorbidityReportController extends Controller
{
    /**
     * Fetch and return morbidity report data with disease, age category, and report status details.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMorbidityReports(Request $request)
    {
        try {
            // Eager load necessary relationships to prevent N+1 queries
            $reports = MorbidityReport::with([
                'disease',
                'ageCategory',
                'reportStatus'
            ])
            ->get();

            // Transform the data for frontend consumption
            $formattedReports = $reports->map(function ($report) {
                // Ensure related models exist to avoid null errors
                if ($report->disease && $report->ageCategory && $report->reportStatus) {
                    return [
                        'report_id' => $report->report_id,
                        'disease_name' => $report->disease->disease_name,
                        'age_category' => $report->ageCategory->age_category,
                        'male' => $report->male,
                        'female' => $report->female,
                        'report_status' => $report->reportStatus->status_name,
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
            Log::error('Error fetching morbidity reports: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
