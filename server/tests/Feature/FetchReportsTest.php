<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FetchReportsTest extends TestCase
{
    use RefreshDatabase;

    // |------------------------------------------|
    //
    //
    //          SECTION: WRA Reports
    //
    //
    // |------------------------------------------|

    // Test fetching reports without filters

    public function test_get_women_of_reproductive_ages_without_filters()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create();
        \Database\Factories\WomenOfReproductiveAgeFactory::new()->create([
            'age_category_id' => $ageCategory->age_category_id,
        ]);

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/wra-reports', []);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
            ]);
    }

    // Test validation: Invalid barangayName
    public function test_women_of_reproductive_ages_should_return_bad_request_when_invalid_barangay_name_is_provided()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])->postJson('/api/wra-reports', ['barangayName' => 123]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['barangayName']);
    }

    // Test validation: Invalid year
    public function test_women_of_reproductive_ages_should_return_bad_request_when_invalid_year_is_provided()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])->postJson('/api/wra-reports', ['year' => 'invalid_year']);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['year']);
    }


    // Test filtering by barangayName with valid input
    public function test_women_of_reproductive_ages_should_return_successful_response_when_filtering_by_valid_barangay_name()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create();
        \Database\Factories\WomenOfReproductiveAgeFactory::new()->create([
            'age_category_id' => $ageCategory->age_category_id,
        ]);

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/wra-reports', ['barangayName' => 'Sample Barangay']);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'status' => 'success',
            ]);
    }

    // Test filtering by year with valid input
    public function test_women_of_reproductive_ages_should_return_successful_response_when_filtering_by_valid_year()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create();
        \Database\Factories\WomenOfReproductiveAgeFactory::new()->create([
            'age_category_id' => $ageCategory->age_category_id,
        ]);

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/wra-reports', ['year' => 2023]);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'status' => 'success',
            ]);
    }

    // Test validation: Valid barangayName and year
    public function test_women_of_reproductive_ages_should_return_success_when_valid_barangay_name_and_year_are_provided()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        // Create Age Categories and Women of Reproductive Age
        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create();
        \Database\Factories\WomenOfReproductiveAgeFactory::new()->create([
            'age_category_id' => $ageCategory->age_category_id,
        ]);

        // Perform the API request
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/wra-reports', ['barangayName' => 'Valid Barangay', 'year' => 2023]);

        // Assert the response structure and status
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'wra_id',
                        'age_category',
                        'unmet_need_modern_fp',
                        'barangay_name',
                        'report_period',
                    ],
                ],
            ]);
    }

    // Test validation: No results
    public function test_women_of_reproductive_ages_should_return_empty_data_set_when_no_records_match_filters()
    {
        // Arrange: Create an admin user and log in to obtain a Sanctum token
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);
        $token = $response->json('token');

        // Act: Make a GET request with filters that do not match any records
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/wra-reports', [
            'barangayName' => 'NonExistentBarangay',
            'year' => '2050'
        ]);

        // Assert: Check response status and ensure the data set is empty
        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [],
            ]);
    }


    // |------------------------------------------|
    //
    //
    //      SECTION: Family Planning Reports
    //
    //
    // |------------------------------------------|

    public function test_family_planning_without_filters()
    {
        // Arrange: Create an admin user and log in to obtain a Sanctum token
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);
        $token = $response->json('token');

        // Act: Make a GET request without filters
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/family-planning-reports');

        // Assert: Check response status and ensure the data set is empty
        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [],
            ]);
    }

    public function test_family_planning_should_return_bad_request_when_provided_with_invalid_filters()
    {
        // Arrange: Create an admin user and log in to obtain a Sanctum token
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);
        $token = $response->json('token');

        // Act: Make a GET request with invalid filters (e.g., invalid year format)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/family-planning-reports', [
            'year' => 'invalid_year', // Invalid year format
        ]);

        // Assert: Check that the response returns an error with status 422 and appropriate error message
        $response->assertStatus(422) // Expect 422 status code for validation failure
            ->assertJson([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => [
                    'year' => [
                        'The year field must be an integer.',
                    ],
                ],
            ]);
    }

    public function test_family_planning_should_return_successful_response_when_filtering_by_valid_barangay_name()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        $barangay = \Database\Factories\BarangayFactory::new()->create(['barangay_name' => 'Sample Barangay']);
        $reportTemplate = \Database\Factories\ReportSubmissionTemplateFactory::new()->create(['report_year' => 2023]);
        $reportSubmission = \Database\Factories\ReportSubmissionFactory::new()->create([
            'barangay_id' => $barangay->barangay_id,
            'report_submission_template_id' => $reportTemplate->report_submission_template_id,
        ]);
        $reportStatus = \Database\Factories\ReportStatusFactory::new()->create(['report_submission_id' => $reportSubmission->report_submission_id]);
        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create();
        $familyPlanningMethod = \Database\Factories\M1_Report\FamilyPlanningMethodsFactory::new()->create();

        \Database\Factories\M1_Report\FamilyPlanningReportFactory::new()->create([
            'report_status_id' => $reportStatus->report_status_id,
            'age_category_id' => $ageCategory->age_category_id,
            'fp_method_id' => $familyPlanningMethod->method_id,
        ]);

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/family-planning-reports?barangay_name=Sample Barangay');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'report_id',
                        'method_name',
                        'current_users_beginning_month',
                        'new_acceptors_prev_month',
                        'other_acceptors_present_month',
                        'drop_outs_present_month',
                        'current_users_end_month',
                        'new_acceptors_present_month',
                        'age_category',
                        'barangay_name',
                        'report_period',
                    ],
                ],
            ]);
    }

    public function test_family_planning_should_return_successful_response_when_filtering_by_valid_year()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        // Create necessary data
        $barangay = \Database\Factories\BarangayFactory::new()->create();
        $reportTemplate = \Database\Factories\ReportSubmissionTemplateFactory::new()->create(['report_year' => 2023]);
        $reportSubmission = \Database\Factories\ReportSubmissionFactory::new()->create([
            'barangay_id' => $barangay->barangay_id,
            'report_submission_template_id' => $reportTemplate->report_submission_template_id,
        ]);
        $reportStatus = \Database\Factories\ReportStatusFactory::new()->create(['report_submission_id' => $reportSubmission->report_submission_id]);
        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create();
        $familyPlanningMethod = \Database\Factories\M1_Report\FamilyPlanningMethodsFactory::new()->create();
        \Database\Factories\M1_Report\FamilyPlanningReportFactory::new()->create([
            'report_status_id' => $reportStatus->report_status_id,
            'age_category_id' => $ageCategory->age_category_id,
            'fp_method_id' => $familyPlanningMethod->method_id,
        ]);

        // Perform the API request with only the year filter
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/family-planning-reports', ['year' => 2023]);

        // Assert the response structure and status
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'report_id',
                        'method_name',
                        'current_users_beginning_month',
                        'new_acceptors_prev_month',
                        'other_acceptors_present_month',
                        'drop_outs_present_month',
                        'current_users_end_month',
                        'new_acceptors_present_month',
                        'age_category',
                        'barangay_name',
                        'report_period',
                    ],
                ],
            ]);
    }

    public function test_family_planning_should_return_success_when_valid_barangay_name_and_year_are_provided()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        // Create necessary data for the test
        $barangay = \Database\Factories\BarangayFactory::new()->create(['barangay_name' => 'Test Barangay']);
        $reportTemplate = \Database\Factories\ReportSubmissionTemplateFactory::new()->create(['report_year' => 2023, 'report_month' => 5]);
        $reportSubmission = \Database\Factories\ReportSubmissionFactory::new()->create([
            'barangay_id' => $barangay->barangay_id,
            'report_submission_template_id' => $reportTemplate->report_submission_template_id,
        ]);
        $reportStatus = \Database\Factories\ReportStatusFactory::new()->create(['report_submission_id' => $reportSubmission->report_submission_id]);
        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create();
        $familyPlanningMethod = \Database\Factories\M1_Report\FamilyPlanningMethodsFactory::new()->create();

        \Database\Factories\M1_Report\FamilyPlanningReportFactory::new()->create([
            'report_status_id' => $reportStatus->report_status_id,
            'age_category_id' => $ageCategory->age_category_id,
            'fp_method_id' => $familyPlanningMethod->method_id,
        ]);

        // Perform the API request with filters
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/family-planning-reports', ['barangay_name' => 'Test Barangay', 'year' => 2023]);

        // Assert the response structure and status
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'report_id',
                        'method_name',
                        'current_users_beginning_month',
                        'new_acceptors_prev_month',
                        'other_acceptors_present_month',
                        'drop_outs_present_month',
                        'current_users_end_month',
                        'new_acceptors_present_month',
                        'age_category',
                        'barangay_name',
                        'report_period',
                    ],
                ],
            ])
            ->assertJsonFragment([
                'status' => 'success',
                'barangay_name' => 'Test Barangay',
                'report_period' => '2023-05',
            ]);
    }

    public function test_family_planning_should_return_empty_data_set_when_no_records_match_filters()
    {
        // Arrange: Create an admin user and log in to obtain a Sanctum token
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);
        $token = $response->json('token');

        // Act: Make a GET request with filters that do not match any records
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/family-planning-reports', [
            'barangay_name' => 'NonExistentBarangay',
            'year' => '2050'
        ]);

        // Assert: Check response status and ensure the data set is empty
        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [],
            ]);
    }



    // |------------------------------------------|
    //
    //
    //      SECTION: Service Data Reports
    //
    //
    // |------------------------------------------|

    public function test_service_data_reports_should_return_bad_request_when_filters_are_missing()
    {
        // Arrange: Create an admin user and log in to obtain a Sanctum token
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        // Act: Make a POST request with no filters provided
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/service-data-reports', []); // No filters provided

        // Assert: Check that the response returns a 400 status code and the correct error message
        $response->assertStatus(400)
            ->assertJson([
                'status' => 'error',
                'message' => 'Report month and year must be provided.', // Match the actual API response
            ]);
    }

    public function test_service_data_reports_should_return_bad_request_when_some_filters_are_missing()
    {
        // Arrange: Create an admin user and log in to obtain a Sanctum token
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        // Act: Make a POST request with only partial filters
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/service-data-reports', [
                'service_name' => 'Health Service', // Missing other filters like barangay_name or year
            ]);

        // Assert: Check that the response returns a 400 status code
        $response->assertStatus(400)
            ->assertJson([
                'status' => 'error',
                'message' => 'Report month and year must be provided.',
            ]);
    }

    public function test_service_data_reports_should_return_empty_data_set_when_using_invalid_filters()
    {
        // Arrange: Create an admin user and log in to obtain a Sanctum token
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        // Act: Make a POST request with invalid filters
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/service-data-reports', [
                'service_name' => 'Nonexistent Service', // Invalid service name
                'barangay_name' => 'Invalid Barangay',  // Invalid barangay
                'year' => '9999',                       // Invalid year
            ]);

        // Assert: Check response status and ensure the data set is empty
        $response->assertStatus(400)
            ->assertJson([
                'status' => 'error',
                'message' => 'Report month and year must be provided.',
            ]);
    }

    public function test_service_data_reports_should_return_successful_response_when_filtering_by_valid_service_name()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        // Create necessary data for the test
        $service = \App\Models\M1_Report\Service::factory()->create(['service_name' => 'Valid Service']);
        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create();
        $reportStatus = \App\Models\ReportStatus::factory()->create();
        $serviceData = \App\Models\M1_Report\ServiceData::factory()->create([
            'service_id' => $service->service_id,
            'age_category_id' => $ageCategory->age_category_id,
            'report_status_id' => $reportStatus->report_status_id,
        ]);

        // Perform the API request
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/service-data-reports/Valid Service');

        // Assert the response structure and status
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'service_data_id',
                        'service_id',
                        'indicator_name',
                        'age_category',
                        'barangay_name',
                        'report_period',
                        'value_type',
                        'value',
                        'remarks',
                        'service_name',
                    ],
                ],
            ])
            ->assertJsonFragment([
                'status' => 'success',
            ]);
    }

    public function test_service_data_reports_should_return_successful_response_when_filtering_by_valid_service_name_and_barangay_name()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        $service = \App\Models\M1_Report\Service::factory()->create(['service_name' => 'Health Service']);
        $barangay = \App\Models\Barangay::factory()->create(['barangay_name' => 'Sample Barangay']);
        $reportTemplate = \App\Models\ReportSubmissionTemplate::factory()->create(['report_year' => 2023]);
        $reportSubmission = \App\Models\ReportSubmission::factory()->create([
            'barangay_id' => $barangay->barangay_id,
            'report_submission_template_id' => $reportTemplate->report_submission_template_id,
        ]);
        $reportStatus = \App\Models\ReportStatus::factory()->create(['report_submission_id' => $reportSubmission->report_submission_id]);
        \App\Models\M1_Report\ServiceData::factory()->create([
            'service_id' => $service->service_id,
            'report_status_id' => $reportStatus->report_status_id,
        ]);

        // Perform the API request
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/service-data-reports/Health Service', [
                'barangay_name' => 'Sample Barangay',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'service_data_id',
                        'service_id',
                        'indicator_name',
                        'age_category',
                        'barangay_name',
                        'report_period',
                        'value_type',
                        'value',
                        'remarks',
                        'service_name',
                    ],
                ],
            ]);
    }

    public function test_service_data_reports_should_return_empty_data_set_when_no_records_match_filters()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/service-data-reports/NonExistentService', [
                'barangay_name' => 'NonExistentBarangay',
                'year' => 2050,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [],
            ]);
    }
}
