<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDataRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Validation rules for m1Report
            'm1Report.familyplanning.*.age_category' => 'required|string|exists:age_categories,age_category',
            'm1Report.familyplanning.*.fp_method_id' => 'required|integer|exists:family_planning_methods,method_id',
            'm1Report.familyplanning.*.current_users_beginning_month' => 'required|integer',
            'm1Report.familyplanning.*.new_acceptors_prev_month' => 'required|integer',
            'm1Report.familyplanning.*.other_acceptors_present_month' => 'required|integer',
            'm1Report.familyplanning.*.drop_outs_present_month' => 'required|integer',
            'm1Report.familyplanning.*.current_users_end_month' => 'required|integer',
            'm1Report.familyplanning.*.new_acceptors_present_month' => 'required|integer',
            
            'm1Report.servicedata.*.service_id' => 'required|integer|exists:services,service_id',
            'm1Report.servicedata.*.indicator_id' => 'nullable|integer|exists:indicators,indicator_id',
            'm1Report.servicedata.*.age_category' => 'nullable|string|exists:age_categories,age_category',
            'm1Report.servicedata.*.value_type' => 'nullable|in:male,female,total',
            'm1Report.servicedata.*.value' => 'required|numeric',
            'm1Report.servicedata.*.remarks' => 'nullable|string',
            
            'm1Report.wra.*.age_category' => 'required|string|exists:age_categories,age_category',
            'm1Report.wra.*.unmet_need_modern_fp' => 'required|integer',
    
            // Validation rules for m2Report
            'm2Report.*.disease_id' => 'required|integer|exists:diseases,disease_id',
            'm2Report.*.disease_name' => 'required|string', // This field is just for validation but may not exist in the database
            'm2Report.*.age_category_id' => 'required|integer|exists:age_categories,age_category_id',
            'm2Report.*.male' => 'required|integer|min:0',
            'm2Report.*.female' => 'required|integer|min:0',
    
            // Validation rules for report IDs
            'm1ReportId' => 'required|integer|exists:report_submissions,report_submission_id',
            'm2ReportId' => 'required|integer|exists:report_submissions,report_submission_id',
        ];
    }
}
