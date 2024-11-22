<?php

namespace App\Http\Controllers\M1_Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\M1_Report\WomenOfReproductiveAge;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class WomenOfReproductiveAgeController extends Controller
{
    public function getWomenOfReproductiveAges(Request $request): JsonResponse
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
            
            // Get the input parameters from the request
            $barangayName = $request->input('barangayName');
            $year = $request->input('year');
    
            // Start the query
            $query = WomenOfReproductiveAge::with([
                'ageCategory',
                'reportStatus',
            ]);
    
            // Apply filters if provided
            if ($barangayName) {
                $query->whereHas('reportStatus.reportSubmission.barangay', function ($q) use ($barangayName) {
                    $q->where('barangay_name', $barangayName);
                });
            }
    
            if ($year) {
                $query->whereHas('reportStatus.reportSubmission.reportTemplate', function ($q) use ($year) {
                    $q->where('report_year', $year);
                });
            }
    
            // Fetch the data
            $data = $query->get();
    
            // Transform the data for frontend consumption
            $formattedData = $data->map(function ($item) {
                return [
                    'wra_id' => $item->wra_id,
                    'age_category' => $item->ageCategory ? $item->ageCategory->age_category : null,
                    'unmet_need_modern_fp' => $item->unmet_need_modern_fp,
                    'barangay_name' => $item->reportStatus->reportSubmission->barangay->barangay_name,
                    'report_period' => Carbon::create(
                        $item->reportStatus->reportSubmission->reportTemplate->report_year,
                        $item->reportStatus->reportSubmission->reportTemplate->report_month,
                        1
                    )->format('Y-m'),
                ];
            });
    
            return response()->json([
                'status' => 'success',
                'data' => $formattedData,
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            // Log the exception for debugging
            Log::error('Error fetching women of reproductive ages data: ' . $e->getMessage());
    
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getFilteredWomenOfReproductiveAges(Request $request): JsonResponse
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
            $query = WomenOfReproductiveAge::with([
                'ageCategory',
                'reportStatus.reportSubmission.barangay',
                'reportStatus.reportSubmission.reportTemplate',
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

            // Fetch the filtered data
            $reports = $query->get();

            // Initialize totals for age categories
            $totals = [
                '10-14' => 0,
                '15-19' => 0,
                '20-49' => 0,
            ];

            // Group reports by report period and calculate totals
            $formattedData = $reports->groupBy(function ($report) {
                return $report->reportStatus->reportSubmission->reportTemplate->report_year . '-' . str_pad($report->reportStatus->reportSubmission->reportTemplate->report_month, 2, '0', STR_PAD_LEFT);
            })->map(function ($reportsByPeriod) use (&$totals) {
                // Reset totals for each period
                $totals = [
                    '10-14' => 0,
                    '15-19' => 0,
                    '20-49' => 0,
                ];

                // Sum totals for each age category based on unmet_need_modern_fp
                $reportsByPeriod->each(function ($report) use (&$totals) {
                    $ageCategory = $report->ageCategory->age_category;

                    if ($ageCategory === '10-14') {
                        $totals['10-14'] += $report->unmet_need_modern_fp;
                    } elseif ($ageCategory === '15-19') {
                        $totals['15-19'] += $report->unmet_need_modern_fp;
                    } elseif ($ageCategory === '20-49') {
                        $totals['20-49'] += $report->unmet_need_modern_fp;
                    }
                });

                // Calculate the total for the 15-49 age group (sum of 15-19 and 20-49)
                $totals['15-49'] = $totals['15-19'] + $totals['20-49'];

                // Get the report submission and status details
                $reportSubmission = $reportsByPeriod->first()->reportStatus->reportSubmission;
                $reportPeriod = $reportSubmission->reportTemplate->report_year . '-' . str_pad($reportSubmission->reportTemplate->report_month, 2, '0', STR_PAD_LEFT);
                $status = $reportsByPeriod->first()->reportStatus->status;

                // Calculate total
                $total = array_sum($totals);

                return [
                    'report_submission_id' => $reportSubmission->report_submission_id,
                    'report_period' => $reportPeriod,
                    '10-14' => $totals['10-14'],
                    '15-19' => $totals['15-19'],
                    '20-49' => $totals['20-49'],
                    '15-49' => $totals['15-49'],  // Add the calculated 15-49 age group total
                    'total' => $total,
                    'status' => $status,
                ];
            });

            // Return the first report period data
            return response()->json([
                'status' => 'success',
                'data' => $formattedData->first(),
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            // Log the exception for debugging purposes
            Log::error('Error fetching filtered women of reproductive ages data: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while fetching women of reproductive ages data. ' . $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
