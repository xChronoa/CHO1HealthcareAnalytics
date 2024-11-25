<?php


namespace App\Http\Controllers\M2_Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\M2_Report\MorbidityReport;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

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
            // Validate input parameters
            $validator = Validator::make($request->all(), [
                'barangay_name' => 'nullable|string|max:255', // barangay_name is nullable, string, max 255 characters
                'year' => 'nullable|integer'
            ]);

            // Check if validation fails
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], Response::HTTP_UNPROCESSABLE_ENTITY); // 422 Unprocessable Entity for validation errors
            }

            // Ensure at least one filter is present
            if (!$request->filled('barangay_name') && !$request->filled('year')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Filters are required.',
                ], Response::HTTP_BAD_REQUEST); // 400 Bad Request for missing filters
            }

            // Get parameters from the request body
            $barangayName = $request->input('barangay_name'); // Get barangay name from request body
            $year = $request->input('year'); // Get year from request body

            // Eager load necessary relationships to prevent N+1 queries
            $query = MorbidityReport::with([
                'disease',
                'ageCategory',
                'reportStatus.reportSubmission.reportTemplate' // Eager load report template for year and month
            ]);

            // Apply filtering if barangay_name is provided
            if ($barangayName !== "all") {
                $query->whereHas('reportStatus.reportSubmission.barangay', function ($q) use ($barangayName) {
                    $q->where('barangay_name', $barangayName);
                });
            }

            // Apply filtering if year is provided
            if ($year) {
                $query->whereHas('reportStatus.reportSubmission.reportTemplate', function ($q) use ($year) {
                    $q->where('report_year', $year);
                });
            }

            // Get reports with applied filters
            $reports = $query->get();

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
                        'barangay_name' => $report->reportStatus->reportSubmission->barangay->barangay_name, // Add barangay_name
                        'report_period' => Carbon::create(
                            $report->reportStatus->reportSubmission->reportTemplate->report_year,
                            $report->reportStatus->reportSubmission->reportTemplate->report_month,
                            1
                        )->format('Y-m'), // Add report_period
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

    /**
     * Fetch and return filtered morbidity report data based on user role and report period.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFilteredMorbidityReports(Request $request)
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
            $barangayId = $request->input('barangay_id');
            $reportMonth = $request->input('report_month'); // Extracted month
            $reportYear = $request->input('report_year');   // Extracted year

            // Initialize the query with necessary relationships
            $query = MorbidityReport::with([
                'disease',         // Eager load disease details
                'ageCategory',     // Eager load age category details
                'reportStatus.reportSubmission.barangay', // Eager load barangay details
            ]);

            // Apply filtering based on the user's role
            if ($user->role === 'admin') {
                // Admin: use the provided barangay_id or return all if not provided
                if ($barangayId) {
                    $query->whereHas('reportStatus.reportSubmission', function ($q) use ($barangayId) {
                        $q->where('barangay_id', $barangayId);
                    });
                }
            } elseif ($user->role === 'encoder') {
                // Encoder: restrict data to the user's affiliated barangay_id
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

            // Apply filtering for the report period if both month and year are provided
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

            // Fetch the filtered morbidity reports
            $morbidityReports = $query->get();

            // Group data by disease name, age category, and gender
            $groupedData = [];
            $reportPeriod = null;
            $reportStatus = null;
            $reportId = null;

            foreach ($morbidityReports as $report) {
                // Ensure relationships exist to avoid null errors
                if ($report->disease && $report->ageCategory && $report->reportStatus) {
                    $diseaseName = $report->disease->disease_name;
                    $ageCategory = $report->ageCategory->age_category;
                    $maleCount = $report->male;
                    $femaleCount = $report->female;
                    $statusName = $report->reportStatus->status;

                    // Set report_id, status, and report_period for the response
                    $reportId = $report->report_id;
                    $reportStatus = $statusName;
                    $reportPeriod = Carbon::create(
                        $report->reportStatus->reportSubmission->reportTemplate->report_year,
                        $report->reportStatus->reportSubmission->reportTemplate->report_month,
                        1
                    )->format('Y-m');

                    // Initialize disease if not present
                    if (!isset($groupedData[$diseaseName])) {
                        $groupedData[$diseaseName] = [
                            'disease_code' => $report->disease->disease_code,
                            'Total' => ['M' => 0, 'F' => 0],  // Initialize total male and female counts
                        ];
                    }

                    // Initialize age category if not present
                    if (!isset($groupedData[$diseaseName][$ageCategory])) {
                        $groupedData[$diseaseName][$ageCategory] = ['M' => 0, 'F' => 0];
                    }

                    // Aggregate male and female counts for the age category
                    $groupedData[$diseaseName][$ageCategory]['M'] += $maleCount;
                    $groupedData[$diseaseName][$ageCategory]['F'] += $femaleCount;

                    // Increment total male and female counts for the disease
                    $groupedData[$diseaseName]['Total']['M'] += $maleCount;
                    $groupedData[$diseaseName]['Total']['F'] += $femaleCount;
                }
            }

            // Prepare the final response structure
            $response = [
                'report_id' => $reportId,
                'report_status' => $reportStatus,
                'report_period' => $reportPeriod,
                'data' => $groupedData
            ];

            return response()->json([
                'status' => 'success',
                'data' => $response,
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            // Log the exception for debugging purposes
            Log::error('Error fetching morbidity reports: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while fetching morbidity reports.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
