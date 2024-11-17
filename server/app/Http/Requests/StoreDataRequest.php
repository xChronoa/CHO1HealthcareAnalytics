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
            'm1Report.projectedPopulation' => "nullable|integer",
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
            'm1Report.servicedata.*.value' => 'required|integer', // Ensuring value is an integer
            'm1Report.servicedata.*.remarks' => 'nullable|string',
            
            'm1Report.wra.*.age_category' => 'required|string|exists:age_categories,age_category',
            'm1Report.wra.*.unmet_need_modern_fp' => 'required|integer',
    
            // Validation rules for m2Report
            'm2Report.*.disease_id' => 'required|integer|exists:diseases,disease_id',
            'm2Report.*.disease_name' => 'required|string', // This field is just for validation but may not exist in the database
            'm2Report.*.age_category_id' => 'required|integer|exists:age_categories,age_category_id',
            'm2Report.*.male' => 'required|integer|min:0', // Ensuring male is an integer
            'm2Report.*.female' => 'required|integer|min:0', // Ensuring female is an integer
    
            // Validation rules for report IDs
            'm1ReportId' => 'required|integer|exists:report_submissions,report_submission_id',
            'm2ReportId' => 'required|integer|exists:report_submissions,report_submission_id',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // m1Report
            'm1Report.projectedPopulation.integer' => 'The projected population must be an integer.',
            'm1Report.familyplanning.*.age_category.required' => 'The age category is required.',
            'm1Report.familyplanning.*.age_category.exists' => 'The selected age category is invalid.',
            'm1Report.familyplanning.*.fp_method_id.required' => 'Family planning method is required.',
            'm1Report.familyplanning.*.fp_method_id.exists' => 'The selected family planning method is invalid.',
            'm1Report.familyplanning.*.current_users_beginning_month.required' => 'Current users at the beginning of the month is required.',
            'm1Report.familyplanning.*.current_users_beginning_month.integer' => 'Current users must be an integer.',
            'm1Report.servicedata.*.service_id.required' => 'Service ID is required.',
            'm1Report.servicedata.*.service_id.exists' => 'The selected service ID is invalid.',
            'm1Report.servicedata.*.value.required' => 'The value for the service data is required.',
            'm1Report.servicedata.*.value.integer' => 'The value for the service data must be an integer.',
            'm1Report.wra.*.age_category.required' => 'Age category is required for WRA.',
            'm1Report.wra.*.unmet_need_modern_fp.required' => 'Unmet need for modern FP is required for WRA.',
            
            // m2Report
            'm2Report.*.disease_id.required' => 'Disease ID is required.',
            'm2Report.*.disease_name.required' => 'Disease name is required.',
            'm2Report.*.age_category_id.required' => 'Age category ID is required.',
            'm2Report.*.male.required' => 'The male count is required.',
            'm2Report.*.male.integer' => 'The male count must be an integer.',
            'm2Report.*.female.required' => 'The female count is required.',
            'm2Report.*.female.integer' => 'The female count must be an integer.',
            
            // report IDs
            'm1ReportId.required' => 'The M1 report ID is required.',
            'm1ReportId.exists' => 'The M1 report ID does not exist.',
            'm2ReportId.required' => 'The M2 report ID is required.',
            'm2ReportId.exists' => 'The M2 report ID does not exist.',
        ];
    }
}
