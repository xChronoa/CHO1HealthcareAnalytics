<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReportStatus;
use Illuminate\Support\Facades\Validator;
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
}
