<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReportStatus;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\M1_Report\WomenOfReproductiveAge;
use App\Models\M1_Report\FamilyPlanningReport;
use App\Models\M1_Report\ServiceData;
use App\Models\M2_Report\MorbidityReport;
use App\Http\Requests\StoreDataRequest;
use App\Models\AgeCategory;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use App\Models\ReportSubmission;

class ReportStatusController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reportStatuses = ReportStatus::with(['reportSubmission', 'user'])->get();
        return response()->json($reportStatuses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'report_submission_id' => 'required|exists:report_submissions,report_submission_id',
            'user_id' => 'required|exists:users,user_id',
            'status' => 'required|in:pending,overdue,for verification,approved,rejected',
            'submitted_at' => 'nullable|date',
            'admin_note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $reportStatus = ReportStatus::create($request->all());
        return response()->json($reportStatus, 201);
    }

    // Currently M1 Report {WRA, FamilyPlanning, ServiceData(Prenatal)}
    public function submitReport(StoreDataRequest $request)
    {
        $validated = $request->validated();

        // Access m1Report and m2Report
        $m1Report = $validated['m1Report'] ?? [];
        $m2Report = $validated['m2Report'] ?? [];

        // Check the status of m1ReportId if provided
        if (isset($validated['m1ReportId'])) {
            $m1ReportId = $validated['m1ReportId'];
            $m1ReportSubmission = DB::table('report_submissions')
                ->where('report_submission_id', $m1ReportId)
                ->first();

            if ($m1ReportSubmission) {
                if (in_array($m1ReportSubmission->status, ['submitted', 'submitted late'])) {
                    return response()->json(['error' => 'The report for this period has already been submitted.'], 400);
                }
            }
        }

        // Check the status of m2ReportId if provided
        if (isset($validated['m2ReportId'])) {
            $m2ReportId = $validated['m2ReportId'];
            $m2ReportSubmission = DB::table('report_submissions')
                ->where('report_submission_id', $m2ReportId)
                ->first();

            if ($m2ReportSubmission) {
                if (in_array($m2ReportSubmission->status, ['submitted', 'submitted late'])) {
                    return response()->json(['error' => 'The report for this period has already been submitted.'], 400);
                }
            }
        }

        // Fetch all age categories to map names to IDs
        $ageCategoryMap = AgeCategory::pluck('age_category_id', 'age_category')->toArray();

        // Use database transaction to ensure atomic operations
        DB::beginTransaction();

        try {
            // Create report statuses for m1ReportId and m2ReportId
            $m1ReportStatusId = null;
            $m2ReportStatusId = null;

            if (isset($validated['m1ReportId'])) {
                $m1ReportStatusId = DB::table('report_statuses')->insertGetId([
                    'report_submission_id' => $validated['m1ReportId'],
                    'user_id' => Auth::id(),
                    'status' => 'approved',
                    'submitted_at' => now(),
                    'admin_note' => null,
                    'projected_population' => $m1Report["projectedPopulation"] ?? 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            if (isset($validated['m2ReportId'])) {
                $m2ReportStatusId = DB::table('report_statuses')->insertGetId([
                    'report_submission_id' => $validated['m2ReportId'],
                    'user_id' => Auth::id(),
                    'status' => 'approved',
                    'submitted_at' => now(),
                    'admin_note' => null,
                    'projected_population' => $m1Report["projectedPopulation"] ?? 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Process WRA data
            foreach ($m1Report['wra'] as $wra) {
                $ageCategoryId = isset($wra['age_category']) ? $ageCategoryMap[$wra['age_category']] ?? null : null;

                if ($ageCategoryId === null && isset($wra['age_category'])) {
                    throw new \Exception("Invalid age_category: {$wra['age_category']}");
                }

                if ($m1ReportStatusId !== null) {
                    WomenOfReproductiveAge::create([
                        'age_category_id' => $ageCategoryId,
                        'unmet_need_modern_fp' => $wra['unmet_need_modern_fp'],
                        'report_status_id' => $m1ReportStatusId,
                        'created_at' => now(),  // Ensure creation timestamp is set
                        'updated_at' => now(),  // Ensure update timestamp is set
                    ]);
                }
            }

            // Process Family Planning data
            foreach ($m1Report['familyplanning'] as $fp) {
                $ageCategoryId = isset($fp['age_category']) ? $ageCategoryMap[$fp['age_category']] ?? null : null;

                if ($ageCategoryId === null && isset($fp['age_category'])) {
                    throw new \Exception("Invalid age_category: {$fp['age_category']}");
                }

                if ($m1ReportStatusId !== null) {
                    FamilyPlanningReport::create([
                        'age_category_id' => $ageCategoryId,
                        'fp_method_id' => $fp['fp_method_id'],
                        'current_users_beginning_month' => $fp['current_users_beginning_month'],
                        'new_acceptors_prev_month' => $fp['new_acceptors_prev_month'],
                        'other_acceptors_present_month' => $fp['other_acceptors_present_month'],
                        'drop_outs_present_month' => $fp['drop_outs_present_month'] ?? 0,
                        'current_users_end_month' => $fp['current_users_end_month'],
                        'new_acceptors_present_month' => $fp['new_acceptors_present_month'],
                        'report_status_id' => $m1ReportStatusId,
                        'created_at' => now(),  // Ensure creation timestamp is set
                        'updated_at' => now(),  // Ensure update timestamp is set
                    ]);
                }
            }

            // Process Service Data
            foreach ($m1Report['servicedata'] as $service) {
                $ageCategoryId = isset($service['age_category']) ? $ageCategoryMap[$service['age_category']] ?? null : null;

                if ($ageCategoryId === null && isset($service['age_category'])) {
                    throw new \Exception("Invalid age_category: {$service['age_category']}");
                }

                if ($m1ReportStatusId !== null) {
                    ServiceData::create([
                        'service_id' => $service['service_id'],
                        'indicator_id' => $service['indicator_id'] ?? null,
                        'age_category_id' => $ageCategoryId,
                        'value_type' => $service['value_type'] ?? null,
                        'value' => $service['value'] ?? null,
                        'remarks' => trim($service['remarks'] ?? '') === '' ? null : $service['remarks'],
                        'report_status_id' => $m1ReportStatusId,
                        'created_at' => now(),  // Ensure creation timestamp is set
                        'updated_at' => now(),  // Ensure update timestamp is set
                    ]);
                }
            }

            // Process Morbidity Reports (m2Report)
            if ($m2ReportStatusId !== null) {
                foreach ($m2Report as $m2) {
                    MorbidityReport::create([
                        'disease_id' => $m2['disease_id'],
                        'age_category_id' => $m2['age_category_id'],
                        'report_status_id' => $m2ReportStatusId,
                        'male' => $m2['male'],
                        'female' => $m2['female'],
                        'created_at' => now(),  // Ensure creation timestamp is set
                        'updated_at' => now(),  // Ensure update timestamp is set
                    ]);
                }
            }

            // Update Report Statuses in report_submissions
            if (isset($validated['m1ReportId'])) {
                $m1ReportSubmission = DB::table('report_submissions')
                    ->where('report_submission_id', $validated['m1ReportId'])
                    ->first();

                $m1ReportStatus = DB::table('report_statuses')
                    ->where('report_submission_id', $validated['m1ReportId'])
                    ->first();

                if ($m1ReportSubmission && $m1ReportStatus) {
                    $status = $m1ReportStatus->submitted_at > $m1ReportSubmission->due_at ? 'submitted late' : 'submitted';

                    DB::table('report_submissions')
                        ->where('report_submission_id', $validated['m1ReportId'])
                        ->update(['status' => $status]);
                }
            }

            if (isset($validated['m2ReportId'])) {
                $m2ReportSubmission = DB::table('report_submissions')
                    ->where('report_submission_id', $validated['m2ReportId'])
                    ->first();

                $m2ReportStatus = DB::table('report_statuses')
                    ->where('report_submission_id', $validated['m2ReportId'])
                    ->first();

                if ($m2ReportSubmission && $m2ReportStatus) {
                    $status = $m2ReportStatus->submitted_at > $m2ReportSubmission->due_at ? 'submitted late' : 'submitted';

                    DB::table('report_submissions')
                        ->where('report_submission_id', $validated['m2ReportId'])
                        ->update(['status' => $status]);
                }
            }

            // Commit transaction
            DB::commit();

            return response()->json(['message' => 'Data processed successfully.', 'sent-data' => $request->all()], 201);
        } catch (\Exception $e) {
            // Log the error details for debugging purposes
            Log::error('Error in report submission: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'exception' => $e
            ]);

            // Rollback transaction on error
            DB::rollBack();

            // Return a generic user-friendly error message
            return response()->json([
                'error' => 'An unexpected error occurred while processing the report. Please try again later. If the issue persists, contact support.',
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $reportStatus = ReportStatus::with(['reportSubmission', 'user'])->findOrFail($id);
        return response()->json($reportStatus);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'report_submission_id' => 'required|exists:report_submissions,report_submission_id',
            'user_id' => 'required|exists:users,user_id',
            'status' => 'required|in:pending,overdue,for verification,approved,rejected',
            'submitted_at' => 'nullable|date',
            'admin_note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $reportStatus = ReportStatus::findOrFail($id);
        $reportStatus->update($request->all());
        return response()->json($reportStatus);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $reportStatus = ReportStatus::findOrFail($id);
        $reportStatus->delete();
        return response()->json(['message' => 'Report status deleted successfully.']);
    }

    public function filterReportStatuses(Request $request)
    {
        try {
            // Retrieve the authenticated user's ID
            $userId = Auth::id();

            // Ensure the user is authenticated
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated.',
                ], 401); // Unauthorized status code
            }

            // Fetch the user's associated barangay_id
            $barangayId = DB::table('users')
                ->where('user_id', $userId)
                ->value('barangay_id');

            if (!$barangayId) {
                return response()->json([
                    'success' => false,
                    'message' => 'No associated barangay found for the user.',
                ], 404); // Not Found status code
            }

            $reportYear = $request->input('report_year');
            $reportMonth = $request->input('report_month');

            // Build the query to fetch report statuses with approved status
            $query = DB::table('report_statuses')
                ->select(
                    'report_statuses.report_status_id',
                    'report_statuses.report_submission_id',
                    'report_submission_templates.report_type',
                    'report_submission_templates.report_year',
                    'report_submission_templates.report_month',
                    'barangays.barangay_id',
                    'barangays.barangay_name',
                    'report_statuses.submitted_at',
                    'report_statuses.projected_population'
                )
                ->join('report_submissions', 'report_statuses.report_submission_id', '=', 'report_submissions.report_submission_id')
                ->join('report_submission_templates', 'report_submissions.report_submission_template_id', '=', 'report_submission_templates.report_submission_template_id')
                ->join('barangays', 'report_submissions.barangay_id', '=', 'barangays.barangay_id')
                ->where('barangays.barangay_id', $barangayId)
                ->where('report_statuses.status', 'approved'); // Filter by approved status

            // Apply year and month filters if provided
            // if ($reportYear) {
            //     $query->whereYear('report_statuses.submitted_at', $reportYear);
            // }

            // if ($reportMonth) {
            //     $query->whereMonth('report_statuses.submitted_at', $reportMonth);
            // }


            // Apply year and month filters based on report_submission_templates table
            if ($reportYear) {
                $query->where('report_submission_templates.report_year', $reportYear);
            }

            if ($reportMonth) {
                $query->where('report_submission_templates.report_month', $reportMonth);
            }

            // Execute the query and get the results
            $reportStatuses = $query->orderBy('report_statuses.submitted_at', 'desc')->get();

            // Return successful JSON response with the data
            return response()->json([
                'success' => true,
                'data' => $reportStatuses,
            ], 200); // OK status code

        } catch (\Exception $e) {
            // Handle any exceptions by returning a JSON error response
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while retrieving report statuses.',
                'error' => $e->getMessage(),
            ], 500); // Internal Server Error status code
        }
    }

    /**
     * Fetch the earliest and latest report submission dates for the authenticated user's barangay.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchEarliestAndLatestReportStatusesDates(Request $request)
    {
        try {
            // Retrieve the authenticated user's ID
            $userId = Auth::id();

            // Ensure the user is authenticated
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated.',
                ], 401); // Unauthorized status code
            }

            // Get the user's role and barangay_id from the 'users' table
            $user = DB::table('users')->where('user_id', $userId)->first();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found.',
                ], 404); // Not Found status code
            }

            // Fetch the barangay_id from the request body for admin users
            $barangayId = $request->input('barangay_id');

            // If the user is an admin, require a barangay_id in the request body
            if ($user->role === 'admin') {
                if (!$barangayId) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Barangay ID is required for admin users.',
                    ], 400); // Bad Request status code
                }
            } else {
                // If the user is an encoder, use their own barangay_id
                if ($user->role === 'encoder') {
                    if ($user->barangay_id) {
                        $barangayId = $user->barangay_id;
                    } else {
                        return response()->json([
                            'success' => false,
                            'message' => 'User barangay not found.',
                        ], 404); // Not Found status code
                    }
                }
            }

            // Prepare the query for fetching report submission dates
            $query = DB::table('report_submissions')
                ->join('report_submission_templates', 'report_submissions.report_submission_template_id', '=', 'report_submission_templates.report_submission_template_id')
                ->selectRaw('
                MIN(CONCAT(report_submission_templates.report_year, "-", LPAD(report_submission_templates.report_month, 2, "0"))) as earliest_date,
                MAX(CONCAT(report_submission_templates.report_year, "-", LPAD(report_submission_templates.report_month, 2, "0"))) as latest_date
            ')
                ->whereIn('status', ['submitted', 'submitted late']);

            // Apply the barangay_id filter
            if ($barangayId) {
                $query->where('report_submissions.barangay_id', $barangayId);
            }

            // Execute the query
            $dates = $query->first();

            // If no dates are found, return a 404 response
            if (!$dates) {
                return response()->json([
                    'success' => false,
                    'message' => 'No report submissions found for the specified barangay.',
                ], 404); // Not Found status code
            }

            // Return the earliest and latest dates in the response
            return response()->json([
                'success' => true,
                'data' => [
                    'earliest_date' => $dates->earliest_date,
                    'latest_date' => $dates->latest_date,
                ],
            ], 200); // OK status code

        } catch (\Exception $e) {
            // Handle any exceptions by returning a JSON error response
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching report submission dates.',
                'error' => $e->getMessage(), // Optionally include the exception message
            ], 500); // Internal Server Error status code
        }
    }

    public function getFilteredM1Reports(Request $request)
{
    try {
        // Get the authenticated user and request parameters
        $user = Auth::user();
        $barangayId = $request->input('barangay_id');
        $reportMonth = $request->input('report_month'); // Extracted month
        $reportYear = $request->input('report_year');   // Extracted year

        // Initialize the query with necessary relationships
        $query = ReportSubmission::with([
            'reportStatus.womenOfReproductiveAge', // Eager load WRA data via ReportStatus
            'reportStatus.familyPlanningReports',   // Eager load Family Planning data via ReportStatus
            'reportStatus.serviceData',             // Eager load Service Data via ReportStatus
            'reportStatus',                         // Eager load Report Status
            'barangay'                              // Eager load Barangay
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

        // Fetch the filtered M1 reports
        $m1Reports = $query->get();

        // Transform the data for frontend consumption
        $groupedData = [
            'wra' => [],
            'family_planning' => [],
            'service_data' => [],
        ];

        // Map and format the data
        foreach ($m1Reports as $report) {
            // Process WRA data
            foreach ($report->womenOfReproductiveAge ?? [] as $wra) {
                $groupedData['wra'][] = [
                    'age_category' => $wra->ageCategory->age_category ?? 'Unknown',
                    'unmet_need_modern_fp' => $wra->unmet_need_modern_fp,
                ];
            }

            // Process Family Planning data
            foreach ($report->familyPlanningReports ?? [] as $fp) {
                $groupedData['family_planning'][] = [
                    'age_category' => $fp->ageCategory->age_category ?? 'Unknown',
                    'fp_method' => $fp->fpMethod->method_name,
                    'current_users_beginning_month' => $fp->current_users_beginning_month,
                    'new_acceptors_prev_month' => $fp->new_acceptors_prev_month,
                    'other_acceptors_present_month' => $fp->other_acceptors_present_month,
                    'drop_outs_present_month' => $fp->drop_outs_present_month,
                    'current_users_end_month' => $fp->current_users_end_month,
                    'new_acceptors_present_month' => $fp->new_acceptors_present_month,
                ];
            }

            // Process Service Data
            foreach ($report->serviceData ?? [] as $service) {
                $groupedData['service_data'][] = [
                    'service_name' => $service->service->service_name ?? 'Unknown',
                    'indicator' => $service->indicator->indicator_name ?? 'Unknown',
                    'age_category' => $service->ageCategory->age_category ?? 'Unknown',
                    'value_type' => $service->value_type,
                    'value' => $service->value,
                    'remarks' => $service->remarks,
                ];
            }
        }

        // Prepare the final response structure
        $response = [
            'report_id' => $m1Reports->isNotEmpty() ? $m1Reports->first()->report_submission_id : null,
            // 'report_status' => $m1Reports->isNotEmpty() ? $m1Reports->first()->reportStatus->status : null,
            'report_period' => $m1Reports->isNotEmpty() ? Carbon::create($reportYear, $reportMonth, 1)->format('Y-m') : null,
            'data' => $groupedData,
        ];

        return response()->json([
            'status' => 'success',
            'data' => $response,
        ], Response::HTTP_OK);
    } catch (\Exception $e) {
        // Log the exception for debugging purposes
        Log::error('Error fetching M1 reports: ' . $e->getMessage());

        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}

}
