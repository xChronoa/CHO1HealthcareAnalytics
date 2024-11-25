<?php

namespace App\Http\Controllers\M1_Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

// Model
use App\Models\M1_Report\FamilyPlanningReport;
use Illuminate\Support\Facades\Validator;

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
            // Validate input parameters
            $validator = Validator::make($request->all(), [
                'barangayName' => 'nullable|string|max:255',
                'year' => 'nullable|integer',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            // Get barangay and year from the request query parameters
            $barangayName = $request->input('barangay_name'); // Adjust the key as necessary
            $year = $request->input('year'); // Adjust the key as necessary

            // Eager load necessary relationships to prevent N+1 queries
            $query = FamilyPlanningReport::with([
                'reportStatus.reportSubmission.barangay',
                'ageCategory', // Ensure ageCategory is loaded for further processing
                'familyPlanningMethod' // Ensure familyPlanningMethod is loaded
            ]);

            // Apply filtering if barangay and year are provided
            if ($barangayName !== "all") {
                $query->whereHas('reportStatus.reportSubmission.barangay', function ($q) use ($barangayName) {
                    $q->where('barangay_name', $barangayName);
                });
            }

            if ($year) {
                $query->whereHas('reportStatus.reportSubmission.reportTemplate', function ($q) use ($year) {
                    $q->where('report_year', $year);
                });
            }

            $reports = $query->get();

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
                        'age_category' => $report->ageCategory ? $report->ageCategory->age_category : 'Unknown',
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
                'message' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getFilteredFamilyPlanningReports(Request $request): JsonResponse
    {
        try {
            // Validate request inputs
            $validator = Validator::make($request->all(), [
                'barangay_id' => 'nullable|sometimes|integer|exists:barangays,barangay_id',
                'report_month' => 'required|integer',
                'report_year' => 'required|integer',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Get the authenticated user and request parameters
            $user = Auth::user();
            $barangayId = $request->barangay_id;
            $reportMonth = $request->report_month;
            $reportYear = $request->report_year;

            // Initialize the query with necessary relationships
            $query = FamilyPlanningReport::with([
                'ageCategory',
                'familyPlanningMethod',
                'reportStatus.reportSubmission.barangay',
                'reportStatus.reportSubmission.reportTemplate'
            ]);

            // Apply filtering based on the user's role
            if ($user->role === 'admin') {
                if ($barangayId) {
                    $query->whereHas('reportStatus.reportSubmission', function ($q) use ($barangayId) {
                        $q->where('barangay_id', $barangayId);
                    });
                }
            } elseif ($user->role === 'encoder') {
                $encoderBarangayId = $user->barangay_id;
                if ($encoderBarangayId) {
                    $query->whereHas('reportStatus.reportSubmission', function ($q) use ($encoderBarangayId) {
                        $q->where('barangay_id', $encoderBarangayId);
                    });
                } else {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Encoder does not have an affiliated barangay.',
                    ], Response::HTTP_FORBIDDEN);
                }
            }

            // Apply filtering for the report period
            if ($reportMonth && $reportYear) {
                $query->whereHas('reportStatus.reportSubmission.reportTemplate', function ($q) use ($reportMonth, $reportYear) {
                    $q->where('report_month', $reportMonth)
                        ->where('report_year', $reportYear);
                });
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Report month and year must be provided.',
                ], Response::HTTP_BAD_REQUEST);
            }

            // Fetch the filtered family planning reports
            $reports = $query->get();

            // Initialize totals
            $totals = [
                '10-14' => [
                    'total_current_users_beginning_month' => 0,
                    'total_new_acceptors_prev_month' => 0,
                    'total_other_acceptors_present_month' => 0,
                    'total_drop_outs_present_month' => 0,
                    'total_current_users_end_month' => 0,
                    'total_new_acceptors_present_month' => 0,
                ],
                '15-19' => [
                    'total_current_users_beginning_month' => 0,
                    'total_new_acceptors_prev_month' => 0,
                    'total_other_acceptors_present_month' => 0,
                    'total_drop_outs_present_month' => 0,
                    'total_current_users_end_month' => 0,
                    'total_new_acceptors_present_month' => 0,
                ],
                '20-49' => [
                    'total_current_users_beginning_month' => 0,
                    'total_new_acceptors_prev_month' => 0,
                    'total_other_acceptors_present_month' => 0,
                    'total_drop_outs_present_month' => 0,
                    'total_current_users_end_month' => 0,
                    'total_new_acceptors_present_month' => 0,
                ],
            ];

            // Group reports by report_period
            $formattedData = $reports->groupBy(function ($report) {
                // Create the report period from year and month
                return $report->reportStatus->reportSubmission->reportTemplate->report_year . '-' . str_pad($report->reportStatus->reportSubmission->reportTemplate->report_month, 2, '0', STR_PAD_LEFT);
            })->map(function ($reportsByPeriod) use (&$totals) {
                // For each report period, group by family planning methods
                $methodsData = $reportsByPeriod->groupBy('fp_method_id')->map(function ($methodReports) use (&$totals) {
                    // Group by age categories for each method
                    $ageCategoryMethods = $methodReports->groupBy('age_category_id')->mapWithKeys(function ($ageCategoryReports) use (&$totals) {
                        $firstAgeCategoryReport = $ageCategoryReports->first();
                        $ageCategory = $firstAgeCategoryReport->ageCategory->age_category;

                        // Sum totals for each age category
                        $totals[$ageCategory]['total_current_users_beginning_month'] += $ageCategoryReports->sum('current_users_beginning_month');
                        $totals[$ageCategory]['total_new_acceptors_prev_month'] += $ageCategoryReports->sum('new_acceptors_prev_month');
                        $totals[$ageCategory]['total_other_acceptors_present_month'] += $ageCategoryReports->sum('other_acceptors_present_month');
                        $totals[$ageCategory]['total_drop_outs_present_month'] += $ageCategoryReports->sum('drop_outs_present_month');
                        $totals[$ageCategory]['total_current_users_end_month'] += $ageCategoryReports->sum('current_users_end_month');
                        $totals[$ageCategory]['total_new_acceptors_present_month'] += $ageCategoryReports->sum('new_acceptors_present_month');

                        return [
                            $ageCategory => [
                                'current_users_beginning_month' => $ageCategoryReports->sum('current_users_beginning_month'),
                                'new_acceptors_prev_month' => $ageCategoryReports->sum('new_acceptors_prev_month'),
                                'other_acceptors_present_month' => $ageCategoryReports->sum('other_acceptors_present_month'),
                                'drop_outs_present_month' => $ageCategoryReports->sum('drop_outs_present_month'),
                                'current_users_end_month' => $ageCategoryReports->sum('current_users_end_month'),
                                'new_acceptors_present_month' => $ageCategoryReports->sum('new_acceptors_present_month'),
                            ]
                        ];
                    });

                    // Getting the method details
                    $firstMethodReport = $methodReports->first();
                    return [
                        'method_id' => $firstMethodReport->familyPlanningMethod->method_id,
                        'method_name' => $firstMethodReport->familyPlanningMethod->method_name,
                        'age_categories' => $ageCategoryMethods,
                    ];
                });

                // Getting report submission details
                $reportSubmission = $reportsByPeriod->first()->reportStatus->reportSubmission; // Directly get report submission object
                // Create the report period from year and month
                $reportPeriod = $reportSubmission->reportTemplate->report_year . '-' . str_pad($reportSubmission->reportTemplate->report_month, 2, '0', STR_PAD_LEFT);
                $status = $reportsByPeriod->first()->reportStatus->status;

                return [
                    'report_submission_id' => $reportSubmission->report_submission_id,
                    'report_period' => $reportPeriod,
                    'status' => $status,
                    'methods' => $methodsData->values(),  // Return all methods for the report period
                    'totals' => $totals,  // Include the totals
                ];
            });

            // Return the formatted data
            return response()->json([
                'status' => 'success',
                'data' => $formattedData->first(), // Return the first report period data
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            // Log the exception for debugging purposes
            Log::error('Error fetching filtered family planning reports: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while fetching family planning reports. ' . $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
