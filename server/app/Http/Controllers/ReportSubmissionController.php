<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReportSubmission;
use Illuminate\Support\Facades\Validator;

class ReportSubmissionController extends Controller
{
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
}
