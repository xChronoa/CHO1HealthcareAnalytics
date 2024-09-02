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
            // 'wra.*.wra_id' => 'sometimes|integer|exists:women_of_reproductive_ages,wra_id',
            'wra.*.age_category' => 'required|string|exists:age_categories,age_category',
            'wra.*.unmet_need_modern_fp' => 'required|integer',
            // 'wra.*.report_status_id' => 'required|integer|exists:report_statuses,report_status_id',

            // 'familyplanning.*.report_id' => 'sometimes|integer|exists:family_planning_reports,report_id',
            'familyplanning.*.age_category' => 'required|string|exists:age_categories,age_category',
            'familyplanning.*.fp_method_id' => 'required|integer|exists:family_planning_methods,method_id',
            'familyplanning.*.current_users_beginning_month' => 'required|integer',
            'familyplanning.*.new_acceptors_prev_month' => 'required|integer',
            'familyplanning.*.other_acceptors_present_month' => 'required|integer',
            'familyplanning.*.drop_outs_present_month' => 'required|integer',
            'familyplanning.*.current_users_end_month' => 'required|integer',
            'familyplanning.*.new_acceptors_present_month' => 'required|integer',
            // 'familyplanning.*.report_status_id' => 'required|integer|exists:report_statuses,report_status_id',

            // 'servicedata.*.service_data_id' => 'sometimes|integer|exists:service_data,service_data_id',
            'servicedata.*.service_id' => 'required|integer|exists:services,service_id',
            'servicedata.*.indicator_id' => 'nullable|integer|exists:indicators,indicator_id',
            'servicedata.*.age_category' => 'nullable|string|exists:age_categories,age_category',
            'servicedata.*.value_type' => 'nullable|in:male,female,total',
            'servicedata.*.value' => 'required|numeric',
            'servicedata.*.remarks' => 'nullable|string',
            // 'servicedata.*.report_status_id' => 'required|integer|exists:report_statuses,report_status_id',
        ];
    }
}
