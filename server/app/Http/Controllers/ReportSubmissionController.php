<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReportSubmission;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class ReportSubmissionController extends Controller
{
    // CRUD for the Table
    /*
    * Display a listing of the report submissions.
    *
    */
    public function index()
    {
        // Fetch all report submissions with related data
        $reportSubmissions = ReportSubmission::with(['reportTemplate', 'barangay', 'reportStatuses'])->get();

        // Return the data as a JSON response
        return response($reportSubmissions);
    }

    /**
     * Store a newly created report submission in storage.
     *
     */
    public function store(Request $request)
    {
        // Define validation rules
        $rules = [
            'report_submission_template_id' => 'required|exists:report_submission_templates,report_submission_template_id',
            'barangay_id' => 'required|exists:barangays,barangay_id',
            'status' => 'required|in:pending,submitted,submitted late',
            'due_at' => 'required|date',
        ];

        // Create validator instance
        $validator = Validator::make($request->all(), $rules);

        // Check if validation fails
        if ($validator->fails()) {
            return response(['errors' => $validator->errors()], 422);
        }

        // Create a new report submission record
        $reportSubmission = ReportSubmission::create($validator->validated());

        // Return the created record as a JSON response
        return response($reportSubmission, 201);
    }

    /**
     * Display the specified report submission.
     *
     */
    public function show(int $id)
    {
        // Find the report submission by its ID, including related data
        $reportSubmission = ReportSubmission::with(['reportTemplate', 'barangay', 'reportStatuses'])->findOrFail($id);

        // Return the found record as a JSON response
        return response($reportSubmission);
    }

    /**
     * Update the specified report submission in storage.
     *
     */
    public function update(Request $request, int $id)
    {
        // Define validation rules
        $rules = [
            'report_submission_template_id' => 'required|exists:report_submission_templates,report_submission_template_id',
            'barangay_id' => 'required|exists:barangays,barangay_id',
            'status' => 'required|in:pending,submitted,submitted late',
            'due_at' => 'required|date',
        ];

        // Create validator instance
        $validator = Validator::make($request->all(), $rules);

        // Check if validation fails
        if ($validator->fails()) {
            return response(['errors' => $validator->errors()], 422);
        }

        // Find and update the report submission record
        $reportSubmission = ReportSubmission::findOrFail($id);
        $reportSubmission->update($validator->validated());

        // Return the updated record as a JSON response
        return response($reportSubmission);
    }

    /**
     * Remove the specified report submission from storage.
     *
     */
    public function destroy(int $id)
    {
        // Find and delete the report submission record
        $reportSubmission = ReportSubmission::findOrFail($id);
        $reportSubmission->delete();

        // Return a success message
        return response(['message' => 'Report submission deleted successfully.']);
    }

    // Custom Functions
    public function createReportSubmissions(Request $request)
    {
        // Validate incoming request
        $validator = Validator::make($request->all(), [
            'report_year' => 'required|integer|digits:4',
            'report_month' => 'required|integer|between:1,12',
            'due_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $reportYear = $request->input('report_year');
        $reportMonth = $request->input('report_month');
        $dueDate = $request->input('due_date');

        // Begin database transaction
        DB::beginTransaction();

        try {
            // Ensure uniqueness of report_year and report_month combination
            $existingTemplates = DB::table('report_submission_templates')
                ->where('report_year', $reportYear)
                ->where('report_month', $reportMonth)
                ->count();

            if ($existingTemplates > 0) {
                DB::rollBack();
                return response()->json(['error' => 'Report template for this year and month already exists.'], 422);
            }

            // Create templates for report types "m1" and "m2"
            $types = ['m1', 'm2'];
            $templateIds = [];

            foreach ($types as $type) {
                $templateId = DB::table('report_submission_templates')->insertGetId([
                    'admin_id' => Auth::id(), // Assuming authenticated admin
                    'report_type' => $type,
                    'report_month' => $reportMonth,
                    'report_year' => $reportYear,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $templateIds[] = $templateId;
            }

            // Get all barangays
            $barangays = DB::table('barangays')->pluck('barangay_id');

            // Create report submissions for each barangay
            foreach ($templateIds as $templateId) {
                foreach ($barangays as $barangayId) {
                    DB::table('report_submissions')->insert([
                        'report_submission_template_id' => $templateId,
                        'barangay_id' => $barangayId,
                        'status' => 'pending',
                        'due_at' => $dueDate,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // Trigger the command to send pending report notices

            // Commit transaction
            DB::commit();

            Artisan::call('app:send-pending-report-notice', ['--send' => true]);

            return response()->json(['success' => 'Report templates and submissions created successfully.']);
        } catch (\Exception $e) {
            // Rollback transaction if any error occurs
            DB::rollBack();
            // return response()->json(['error' => 'Failed to create report templates and submissions.'], 500);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Fetch the earliest and latest report submission dates for the authenticated user's barangay,
     * considering the user's role.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchEarliestAndLatestReportSubmissionDates()
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

            // Get the user's details from the 'users' table
            $user = DB::table('users')->where('user_id', $userId)->first();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found.',
                ], 404); // Not Found status code
            }

            // Determine if the user is an admin or encoder
            $isAdmin = $user->role === 'admin';
            $isEncoder = $user->role === 'encoder';

            if (!$isAdmin && !$isEncoder) {
                return response()->json([
                    'success' => false,
                    'message' => 'User role is not authorized to fetch report dates.',
                ], 403); // Forbidden status code
            }

            // Ensure the user has a barangay_id if they are an encoder or admin
            if ($isEncoder && !$user->barangay_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'User barangay not found.',
                ], 404); // Not Found status code
            }

            if ($isEncoder) {
                // Build the query to fetch the earliest and latest report submission dates
                $dates = DB::table('report_submissions')
                    ->join('report_submission_templates', 'report_submissions.report_submission_template_id', '=', 'report_submission_templates.report_submission_template_id')
                    ->where('report_submissions.barangay_id', $user->barangay_id)
                    ->where('report_submissions.status', 'pending')
                    ->selectRaw('
                   MIN(CONCAT(report_submission_templates.report_year, "-", LPAD(report_submission_templates.report_month, 2, "0"))) as earliest_date,
                   MAX(CONCAT(report_submission_templates.report_year, "-", LPAD(report_submission_templates.report_month, 2, "0"))) as latest_date
               ')
                    ->first();
            } else if ($isAdmin) {
                // Fetch the earliest and latest report submission dates
                $dates = DB::table('report_submission_templates')
                    ->selectRaw('MIN(CONCAT(report_year, "-", LPAD(report_month, 2, "0"))) as earliest_date, 
                                                MAX(CONCAT(report_year, "-", LPAD(report_month, 2, "0"))) as latest_date')
                    ->first();
            }

            if (!$dates) {
                return response()->json([
                    'success' => false,
                    'message' => 'No report submissions found.',
                ], 404);
            }

            // Return the results
            return response()->json([
                'success' => true,
                'data' => [
                    'earliest_date' => $dates->earliest_date,
                    'latest_date' => $dates->latest_date,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching report submission dates.',
            ], 500);
        }
    }

    /**
     * Fetch report submissions based on year, month, and optional barangay_id and status.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchReportSubmissionsByFilter(Request $request)
    {
        // Validate incoming request
        $validator = Validator::make($request->all(), [
            'report_year' => 'required|integer|digits:4',
            'report_month' => 'required|integer|between:1,12',
            'barangay_id' => 'nullable|integer|exists:barangays,barangay_id',
            'status' => 'nullable|string|in:all,pending,submitted,submitted late',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $reportYear = $request->input('report_year');
        $reportMonth = $request->input('report_month');
        $status = $request->input('status', 'all'); // Default to 'all' if not provided

        try {
            $query = DB::table('report_submissions')
                ->join('report_submission_templates', 'report_submissions.report_submission_template_id', '=', 'report_submission_templates.report_submission_template_id')
                ->leftJoin('barangays', 'report_submissions.barangay_id', '=', 'barangays.barangay_id')
                ->leftJoin('report_statuses', 'report_submissions.report_submission_id', '=', 'report_statuses.report_submission_id') // Left join with report_statuses
                ->where('report_submission_templates.report_year', $reportYear)
                ->where('report_submission_templates.report_month', $reportMonth)
                ->select(
                    'barangays.barangay_id',
                    'barangays.barangay_name',
                    'report_submissions.status',
                    'report_submissions.due_at', // Select due_at from report_submissions
                    'report_statuses.submitted_at',
                    DB::raw('DATEDIFF(report_statuses.submitted_at, report_submissions.due_at) as tardy_days')
                )
                ->distinct();

            // Apply status filtering
            if ($status !== 'all') {
                if ($status === 'submitted' || $status === "submitted late") {
                    $query->whereIn('report_submissions.status', ['submitted', 'submitted late']);
                } else {
                    $query->where('report_submissions.status', $status);
                }
            }

            // Only include tardy days if the status is "submitted late"
            if ($status === 'submitted late') {
                $query->whereNotNull('report_statuses.submitted_at')
                    ->whereRaw('report_statuses.submitted_at > report_submissions.due_at');
            }

            // Fetch the results
            $submissions = $query->get();

            // Return the results   
            return response()->json([
                'success' => true,
                'data' => $submissions,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function fetchCountOfPendingBarangayReports()
    {
        try {
            $count = DB::table('report_submissions AS a')
                ->join('report_submission_templates AS b', 'a.report_submission_template_id', '=', 'b.report_submission_template_id')
                ->where('a.status', 'pending')
                ->distinct()
                ->count(DB::raw('CONCAT(a.barangay_id, "-", b.report_year, "-", b.report_month)'));

            return response()->json([
                'success' => true,
                'count' => $count,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Fetch report submissions for the authenticated user's barangay.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchReportSubmissionsForBarangay()
    {
        try {
            // Step 1: Retrieve the barangay_id of the authenticated user
            $barangayId = DB::table('users')
                ->where('user_id', Auth::id())
                ->value('barangay_id');

            // If barangay_id is not found, return a 404 error
            if (!$barangayId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sorry, we could not find the barangay associated with your account. Please contact support if this is an error.',
                ], 404);
            }

            // Step 2: Fetch report submissions filtered by barangay_id and status "pending"
            $reportSubmissions = DB::table('report_submissions as rs')
                ->join('report_submission_templates as rst', 'rs.report_submission_template_id', '=', 'rst.report_submission_template_id')
                ->where('rs.barangay_id', $barangayId) // Filter by barangay_id
                ->where('rs.status', 'pending') // Filter by "pending" status
                ->select(
                    'rs.report_submission_id',
                    'rs.status',
                    'rst.report_type',
                    DB::raw("CONCAT(rst.report_month, '-', rst.report_year) as report_month_year")
                )
                ->orderBy('rst.report_year', 'desc')
                ->orderBy('rst.report_month', 'desc')
                ->get()
                ->groupBy('report_type'); // Separate into m1 and m2 groups

            // Return the data with a 200 success status
            return response()->json([
                'success' => true,
                'data' => $reportSubmissions,
            ], 200);
        } catch (\Exception $e) {
            // Log the exception for debugging purposes
            Log::error('Error fetching report submissions for barangay: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'exception' => $e,
            ]);

            // Return a generic error response to the user without exposing sensitive information
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred while fetching the report submissions. Please try again later.',
            ], 500);
        }
    }
}
