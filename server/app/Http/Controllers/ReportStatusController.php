<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReportStatus;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\M1_Report\WomenOfReproductiveAge;
use App\Models\M1_Report\FamilyPlanningReport;
use App\Models\M1_Report\ServiceData;
use App\Http\Requests\StoreDataRequest;
use App\Models\AgeCategory;

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
    public function submitReport(StoreDataRequest $request) {
        $validated = $request->validated();
    
        // Fetch all age categories to map names to IDs
        $ageCategoryMap = AgeCategory::pluck('age_category_id', 'age_category')->toArray();
    
        // Use database transaction to ensure atomic operations
        DB::beginTransaction();
    
        try {
            // Process WRA data
            foreach ($validated['wra'] as $wra) {
                $ageCategoryId = isset($wra['age_category']) ? $ageCategoryMap[$wra['age_category']] ?? null : null;
    
                if ($ageCategoryId === null && isset($wra['age_category'])) {
                    throw new \Exception("Invalid age_category: {$wra['age_category']}");
                }
    
                WomenOfReproductiveAge::updateOrCreate(
                    [
                        // 'wra_id' => $wra['wra_id'], // Uncomment if needed
                        'age_category_id' => $ageCategoryId,
                    ],
                    [
                        'unmet_need_modern_fp' => $wra['unmet_need_modern_fp'],
                        // 'report_status_id' => $wra['report_status_id'] // Uncomment if needed
                    ]
                );
            }
    
            // Process Family Planning data
            foreach ($validated['familyplanning'] as $fp) {
                $ageCategoryId = isset($fp['age_category']) ? $ageCategoryMap[$fp['age_category']] ?? null : null;
    
                if ($ageCategoryId === null && isset($fp['age_category'])) {
                    throw new \Exception("Invalid age_category: {$fp['age_category']}");
                }
    
                FamilyPlanningReport::updateOrCreate(
                    [
                        // 'report_id' => $fp['report_id'], // Uncomment if needed
                        'age_category_id' => $ageCategoryId,
                        'fp_method_id' => $fp['fp_method_id'],
                    ],
                    [
                        'current_users_beginning_month' => $fp['current_users_beginning_month'],
                        'new_acceptors_prev_month' => $fp['new_acceptors_prev_month'],
                        'other_acceptors_present_month' => $fp['other_acceptors_present_month'],
                        'drop_outs_present_month' => $fp['drop_outs_present_month'] ?? 0, // Default to 0 if missing
                        'current_users_end_month' => $fp['current_users_end_month'],
                        'new_acceptors_present_month' => $fp['new_acceptors_present_month'],
                        // 'report_status_id' => $fp['report_status_id'] // Uncomment if needed
                    ]
                );
            }
    
            // Process Service Data
            foreach ($validated['servicedata'] as $service) {
                $ageCategoryId = isset($service['age_category']) ? $ageCategoryMap[$service['age_category']] ?? null : null;
    
                if ($ageCategoryId === null && isset($service['age_category'])) {
                    throw new \Exception("Invalid age_category: {$service['age_category']}");
                }
    
                ServiceData::updateOrCreate(
                    [
                        'service_id' => $service['service_id'],
                        'indicator_id' => $service['indicator_id'],
                        'age_category_id' => $ageCategoryId,
                        'value_type' => $service['value_type'] ?? null,
                    ],
                    [
                        'value' => $service['value'] ?? null,
                        'remarks' => trim($service['remarks'] ?? '') === '' ? null : $service['remarks'],
                    ]
                );
            }
            
    
            // Commit transaction
            DB::commit();
    
            return response()->json(['message' => 'Data processed successfully.', 'sent-data' => $request->all()]);
    
        } catch (\Exception $e) {
            // Rollback transaction on error
            DB::rollBack();
    
            return response()->json(['error' => $e->getMessage()], 500);
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
}
