<?php

namespace Tests\Feature;

use App\Models\AgeCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

use App\Models\M1_Report\FamilyPlanningMethods;
use App\Models\M1_Report\Service;
use App\Models\M2_Report\Disease;

class StoreDataRequestTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test the validation rules for m1Report and m2Report.
     *
     * @return void
     */
    public function test_m1_report_validation()
    {
        // Fetch existing data from the database
        $ageCategory = AgeCategory::first(); // Ensure you have at least one record in the database
        $method = FamilyPlanningMethods::first(); // Ensure you have at least one record in the database
        $service = Service::first(); // Ensure you have at least one record in the database

        // Prepare request data using the fetched models
        $data = [
            'm1Report' => [
                'projectedPopulation' => 1000,
                'familyplanning' => [
                    [
                        'age_category' => $ageCategory->age_category,
                        'fp_method_id' => $method->id,
                        'current_users_beginning_month' => 500,
                        'new_acceptors_prev_month' => 100,
                        'other_acceptors_present_month' => 50,
                        'drop_outs_present_month' => 10,
                        'current_users_end_month' => 450,
                        'new_acceptors_present_month' => 120,
                    ]
                ],
                'servicedata' => [
                    [
                        'service_id' => $service->id,
                        'indicator_id' => null,
                        'age_category' => $ageCategory->age_category,
                        'value_type' => 'total',
                        'value' => 150,
                        'remarks' => 'Test remarks',
                    ]
                ],
                'wra' => [
                    [
                        'age_category' => $ageCategory->age_category,
                        'unmet_need_modern_fp' => 30,
                    ]
                ],
            ],
            'm1ReportId' => 1, // Adjust according to actual ID
            'm2ReportId' => 1, // Adjust according to actual ID
        ];

        $response = $this->json('POST', '/api/store-report', $data);

        $response->assertStatus(200); // Ensure status code is OK
    }

    public function test_m1_report_validation_required_fields()
    {
        // Test missing required fields in m1Report
        $data = [
            'm1Report' => [
                'projectedPopulation' => 1000,
                'familyplanning' => [
                    [
                        'age_category' => '', // Missing valid age category
                        'fp_method_id' => null, // Missing family planning method ID
                        'current_users_beginning_month' => null, // Missing value
                        'new_acceptors_prev_month' => null, // Missing value
                        'other_acceptors_present_month' => null, // Missing value
                        'drop_outs_present_month' => null, // Missing value
                        'current_users_end_month' => null, // Missing value
                        'new_acceptors_present_month' => null, // Missing value
                    ]
                ],
                'servicedata' => [],
                'wra' => [],
            ],
            'm1ReportId' => 1,
            'm2ReportId' => 1,
        ];

        $response = $this->json('POST', '/api/store-report', $data);

        $response->assertStatus(422); // Expect validation errors
        $response->assertJsonValidationErrors([
            'm1Report.familyplanning.0.age_category',
            'm1Report.familyplanning.0.fp_method_id',
            'm1Report.familyplanning.0.current_users_beginning_month',
            // Add other field names based on validation errors
        ]);
    }

    public function test_m2_report_validation()
    {
        // Fetch existing data from the database
        $ageCategory = AgeCategory::first(); // Ensure you have at least one record in the database
        $disease = Disease::first(); // Ensure you have at least one record in the database

        // Prepare request data using the fetched models
        $data = [
            'm2Report' => [
                [
                    'disease_id' => $disease->id,
                    'disease_name' => 'Test Disease',
                    'age_category_id' => $ageCategory->id,
                    'male' => 5,
                    'female' => 10,
                ]
            ],
            'm1ReportId' => 1,
            'm2ReportId' => 1,
        ];

        $response = $this->json('POST', '/api/store-report', $data);

        $response->assertStatus(200);
    }

    public function test_m2_report_validation_required_fields()
    {
        // Test missing fields in m2Report
        $data = [
            'm2Report' => [
                [
                    'disease_id' => null, // Missing disease ID
                    'disease_name' => '', // Missing disease name
                    'age_category_id' => null, // Missing age category ID
                    'male' => -5, // Invalid value
                    'female' => -10, // Invalid value
                ]
            ],
            'm1ReportId' => 1,
            'm2ReportId' => 1,
        ];

        $response = $this->json('POST', '/api/store-report', $data);

        $response->assertStatus(422); // Expect validation errors
        $response->assertJsonValidationErrors([
            'm2Report.0.disease_id',
            'm2Report.0.disease_name',
            'm2Report.0.age_category_id',
            'm2Report.0.male',
            'm2Report.0.female',
        ]);
    }
}
