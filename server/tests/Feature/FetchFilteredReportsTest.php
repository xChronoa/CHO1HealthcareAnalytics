<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class FetchFilteredReportsTest extends TestCase
{
    use RefreshDatabase;

    // |------------------------------------------|
    //
    //
    //          SECTION: WRA Reports
    //
    //
    // |------------------------------------------|

    public function test_get_filtered_women_of_reproductive_ages_as_admin_with_valid_data()
    {
        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $token = $response->json('token');

        // Create necessary data for the test
        $barangay = \Database\Factories\BarangayFactory::new()->create();
        $reportTemplate = \Database\Factories\ReportSubmissionTemplateFactory::new()->create([
            'report_month' => "5",
            'report_year' => "2023",
        ]);
        $reportSubmission = \Database\Factories\ReportSubmissionFactory::new()->create([
            'barangay_id' => $barangay->barangay_id,
            'report_submission_template_id' => $reportTemplate->report_submission_template_id,
        ]);
        $reportStatus = \Database\Factories\ReportStatusFactory::new()->create([
            'report_submission_id' => $reportSubmission->report_submission_id,
        ]);
        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create([
            'age_category' => '15-19',
        ]);
        $wra = \Database\Factories\WomenOfReproductiveAgeFactory::new()->create([
            'age_category_id' => $ageCategory->age_category_id,
            'report_status_id' => $reportStatus->report_status_id,
            'unmet_need_modern_fp' => 5,
        ]);

        // Act: Make a GET request to fetch filtered women of reproductive ages
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/wra-reports/filtered', [
            'barangay_id' => $barangay->barangay_id,
            'report_month' => "5",
            'report_year' => "2023",
        ]);

        // Assert: Check response status and data structure
        $response->assertJson([
            'status' => 'success',
            'data' => [
                'report_submission_id' => $reportSubmission->report_submission_id,
                'report_period' => '2023-05',
                '10-14' => 0,
                '15-19' => 5,
                '20-49' => 0,
                '15-49' => 5,
                'total' => 10, // Update this value if 10 is the correct total
                'status' => $reportStatus->status,
            ],
        ]);
    }

    public function test_get_filtered_women_of_reproductive_ages_as_encoder_with_valid_data()
    {
        // Arrange: Create an encoder user with an affiliated barangay
        $barangay = \Database\Factories\BarangayFactory::new()->create();
        $encoder = \App\Models\User::factory()->create([
            'role' => 'encoder',
            'barangay_id' => $barangay->barangay_id,
        ]);

        // Log in to obtain the Sanctum token for the encoder
        $loginResponse = $this->post('/api/login', [
            'email' => $encoder->email,
            'password' => 'password',
        ]);

        $token = $loginResponse->json('token');

        // Create necessary data for reports
        $reportTemplate = \Database\Factories\ReportSubmissionTemplateFactory::new()->create([
            'report_month' => "5",
            'report_year' => "2023",
        ]);

        $reportSubmission = \Database\Factories\ReportSubmissionFactory::new()->create([
            'barangay_id' => $barangay->barangay_id,
            'report_submission_template_id' => $reportTemplate->report_submission_template_id,
        ]);

        $reportStatus = \Database\Factories\ReportStatusFactory::new()->create([
            'report_submission_id' => $reportSubmission->report_submission_id,
            'status' => 'approved', // Use a valid status
        ]);

        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create([
            'age_category' => '15-19',
        ]);

        \Database\Factories\WomenOfReproductiveAgeFactory::new()->create([
            'age_category_id' => $ageCategory->age_category_id,
            'report_status_id' => $reportStatus->report_status_id,
            'unmet_need_modern_fp' => 5,
        ]);

        // Act: Make a GET request to fetch filtered women of reproductive ages
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/wra-reports/filtered', [
            'report_month' => "5",
            'report_year' => "2023",
        ]);

        // Assert: Check response status and data structure
        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'report_submission_id' => $reportSubmission->report_submission_id,
                    'report_period' => '2023-05',
                    '10-14' => 0,
                    '15-19' => 5,
                    '20-49' => 0,
                    '15-49' => 5,
                    'total' => 10,
                    'status' => 'approved',
                ],
            ]);
    }

    public function test_women_of_reproductive_ages_should_return_error_when_report_month_is_missing()
    {
        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $token = $response->json('token');

        // Act: Make a POST request without the report month
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/wra-reports/filtered', [
            'barangay_id' => 1,
            'report_year' => "2023",
        ]);

        // Assert: Check that the response status is 400 and the error message is correct
        $response->assertStatus(422)
            ->assertJson([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => [
                    'report_month' => [
                        'The report month field is required.',
                    ],
                ],
            ]);
    }

    public function test_women_of_reproductive_ages_return_error_response_when_report_year_is_missing()
    {
        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $token = $response->json('token');

        // Act: Make a POST request without the report year
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/wra-reports/filtered', [
            'barangay_id' => 1,
            'report_month' => "5",
            // 'report_year' is intentionally missing
        ]);

        // Assert: Check response status and error message
        $response->assertStatus(422)
            ->assertJson([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => [
                    'report_year' => [
                        'The report year field is required.',
                    ],
                ],
            ]);
    }

    public function test_women_of_reproductive_ages_return_error_when_report_month_and_year_are_missing()
    {
        // Arrange: Create a user (admin or encoder)
        $user = \App\Models\User::factory()->create([
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the user
        $loginResponse = $this->post('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $token = $loginResponse->json('token');

        // Act: Make a POST request without report month and year
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/wra-reports/filtered', [
            // Intentionally leaving out 'report_month' and 'report_year'
        ]);

        // Assert: Check for error response
        $response->assertStatus(422)
            ->assertJson([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => [
                    "report_month" => [
                        "The report month field is required."
                    ],
                    "report_year" => [
                        "The report year field is required."
                    ]
                ],
            ]);
    }



    // |------------------------------------------|
    //
    //
    //      SECTION: Family Planning Reports
    //
    //
    // |------------------------------------------|

    public function test_get_filtered_family_planning_reports_as_admin_with_valid_data()
    {
        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $token = $response->json('token');

        // Create necessary data for the test
        $barangay = \Database\Factories\BarangayFactory::new()->create();
        $reportTemplate = \Database\Factories\ReportSubmissionTemplateFactory::new()->create([
            'report_month' => "5",
            'report_year' => "2023",
        ]);
        $reportSubmission = \Database\Factories\ReportSubmissionFactory::new()->create([
            'barangay_id' => $barangay->barangay_id,
            'report_submission_template_id' => $reportTemplate->report_submission_template_id,
        ]);
        $reportStatus = \Database\Factories\ReportStatusFactory::new()->create([
            'report_submission_id' => $reportSubmission->report_submission_id,
        ]);
        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create([
            'age_category' => '15-19',
        ]);
        $familyPlanningMethod = \Database\Factories\M1_Report\FamilyPlanningMethodsFactory::new()->create();

        $report = \Database\Factories\M1_Report\FamilyPlanningReportFactory::new()->create([
            'age_category_id' => $ageCategory->age_category_id,
            'report_status_id' => $reportStatus->report_status_id,
            'fp_method_id' => $familyPlanningMethod->method_id,
            'current_users_beginning_month' => 10,
            'new_acceptors_prev_month' => 5,
            'other_acceptors_present_month' => 3,
            'drop_outs_present_month' => 2,
            'current_users_end_month' => 16,
            'new_acceptors_present_month' => 4,
        ]);

        // Act: Make a GET request to fetch filtered family planning reports
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/family-planning-reports/filtered', [
            'barangay_id' => $barangay->barangay_id,
            'report_month' => "5",
            'report_year' => "2023",
        ]);

        // Assert: Check response status and data structure
        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'report_submission_id' => $reportSubmission->report_submission_id,
                    'report_period' => '2023-05',
                    'status' => $reportStatus->status,
                    'methods' => [
                        [
                            'method_id' => $familyPlanningMethod->method_id,
                            'method_name' => $familyPlanningMethod->method_name,
                            'age_categories' => [
                                '15-19' => [
                                    'current_users_beginning_month' => 10,
                                    'new_acceptors_prev_month' => 5,
                                    'other_acceptors_present_month' => 3,
                                    'drop_outs_present_month' => 2,
                                    'current_users_end_month' => 16,
                                    'new_acceptors_present_month' => 4,
                                ]
                            ]
                        ]
                    ],
                    'totals' => [
                        '10-14' => [
                            'total_current_users_beginning_month' => 0,
                            'total_new_acceptors_prev_month' => 0,
                            'total_other_acceptors_present_month' => 0,
                            'total_drop_outs_present_month' => 0,
                            'total_current_users_end_month' => 0,
                            'total_new_acceptors_present_month' => 0,
                        ],
                        '15-19' => [
                            'total_current_users_beginning_month' => 10,
                            'total_new_acceptors_prev_month' => 5,
                            'total_other_acceptors_present_month' => 3,
                            'total_drop_outs_present_month' => 2,
                            'total_current_users_end_month' => 16,
                            'total_new_acceptors_present_month' => 4,
                        ],
                        '20-49' => [
                            'total_current_users_beginning_month' => 0,
                            'total_new_acceptors_prev_month' => 0,
                            'total_other_acceptors_present_month' => 0,
                            'total_drop_outs_present_month' => 0,
                            'total_current_users_end_month' => 0,
                            'total_new_acceptors_present_month' => 0,
                        ],
                    ],
                ],
            ]);
    }

    public function test_get_filtered_family_planning_reports_as_encoder_with_valid_data()
    {
        // Create necessary data for the test
        $barangay = \Database\Factories\BarangayFactory::new()->create([
            'barangay_id' => 1,
        ]);

        // Arrange: Create an encoder user with an affiliated barangay
        $encoder = \App\Models\User::factory()->create([
            'role' => 'encoder',
            'barangay_id' => 1,
        ]);

        // Log in to obtain the Sanctum token for the encoder
        $response = $this->post('/api/login', [
            'email' => $encoder->email,
            'password' => 'password',
        ]);

        $token = $response->json('token');


        $reportTemplate = \Database\Factories\ReportSubmissionTemplateFactory::new()->create([
            'report_month' => "5",
            'report_year' => "2023",
        ]);
        $reportSubmission = \Database\Factories\ReportSubmissionFactory::new()->create([
            'barangay_id' => $barangay->barangay_id,
            'report_submission_template_id' => $reportTemplate->report_submission_template_id,
        ]);
        $reportStatus = \Database\Factories\ReportStatusFactory::new()->create([
            'report_submission_id' => $reportSubmission->report_submission_id,
        ]);
        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create([
            'age_category' => '15-19',
        ]);
        $familyPlanningMethod = \Database\Factories\M1_Report\FamilyPlanningMethodsFactory::new()->create();

        \Database\Factories\M1_Report\FamilyPlanningReportFactory::new()->create([
            'age_category_id' => $ageCategory->age_category_id,
            'report_status_id' => $reportStatus->report_status_id,
            'fp_method_id' => $familyPlanningMethod->method_id,
            'current_users_beginning_month' => 10,
            'new_acceptors_prev_month' => 5,
            'other_acceptors_present_month' => 3,
            'drop_outs_present_month' => 2,
            'current_users_end_month' => 16,
            'new_acceptors_present_month' => 4,
        ]);

        // Act: Make a GET request to fetch filtered family planning reports
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/family-planning-reports/filtered', [
            'report_month' => "5",
            'report_year' => "2023",
        ]);

        // Assert: Check response status and data structure
        $response->assertJson([
            'status' => 'success',
            'data' => [
                'report_submission_id' => $reportSubmission->report_submission_id,
                'report_period' => '2023-05',
                'status' => $reportStatus->status,
                'methods' => [
                    [
                        'method_id' => $familyPlanningMethod->method_id,
                        'method_name' => $familyPlanningMethod->method_name,
                        'age_categories' => [
                            '15-19' => [
                                'current_users_beginning_month' => 10,
                                'new_acceptors_prev_month' => 5,
                                'other_acceptors_present_month' => 3,
                                'drop_outs_present_month' => 2,
                                'current_users_end_month' => 16,
                                'new_acceptors_present_month' => 4,
                            ]
                        ]
                    ]
                ],
                'totals' => [
                    '15-19' => [
                        'total_current_users_beginning_month' => 10,
                        'total_new_acceptors_prev_month' => 5,
                        'total_other_acceptors_present_month' => 3,
                        'total_drop_outs_present_month' => 2,
                        'total_current_users_end_month' => 16,
                        'total_new_acceptors_present_month' => 4,
                    ]
                ]
            ],
        ]);
    }

    public function test_family_planning_reports_should_return_error_when_report_month_is_missing()
    {
        // Arrange: Create a user with admin role
        $admin = \App\Models\User::factory()->create([
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $token = $response->json('token');

        // Act: Make a POST request without the report_month
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/family-planning-reports/filtered', [
            'barangay_id' => 1,
            'report_year' => "2023",
        ]);

        // Assert: Check response status and error message
        $response->assertStatus(422);
        $response->assertJson([
            'status' => 'error',
            'message' => 'Validation failed',
            'errors' => [
                'report_month' => ['The report month field is required.'],
            ],
        ]);
    }

    public function test_family_planning_reports_should_return_error_when_report_year_is_missing()
    {
        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $token = $response->json('token');

        // Act: Make a POST request without the report year
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/family-planning-reports/filtered', [
            'barangay_id' => 1,
            'report_month' => "5",
            // 'report_year' is intentionally missing
        ]);

        // Assert: Check that the response indicates a validation error
        $response->assertStatus(422)
            ->assertJson([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => [
                    'report_year' => ['The report year field is required.'],
                ],
            ]);
    }

    public function test_family_planning_reports_should_return_error_when_report_month_and_year_are_missing()
    {
        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $token = $response->json('token');

        // Act: Make a POST request without the report month and year
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/family-planning-reports/filtered', [
            'barangay_id' => 1,
            // 'report_month' and 'report_year' are intentionally missing
        ]);

        // Assert: Check that the response indicates a validation error
        $response->assertStatus(422)
            ->assertJson([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => [
                    'report_month' => ['The report month field is required.'],
                    'report_year' => ['The report year field is required.'],
                ],
            ]);
    }


    // |------------------------------------------|
    //
    //
    //      SECTION: Service Data Reports
    //
    //
    // |------------------------------------------|

    public function test_get_service_data_reports_as_admin_with_valid_data()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        $service = \App\Models\M1_Report\Service::factory()->create(['service_name' => 'Health Service']);
        $barangay = \App\Models\Barangay::factory()->create(['barangay_name' => 'Sample Barangay']);
        $reportTemplate = \App\Models\ReportSubmissionTemplate::factory()->create(['report_year' => "2023", 'report_month' => "5"]);
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
            ->postJson('/api/service-data-reports', [
                'barangay_name' => 'Sample Barangay',
                'service_name' => 'Health Service',
                'report_year' => 2023,
                'report_month' => 5,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'Health Service' => [
                        'indicators' => [
                            '*' => [
                                'indicator_id',
                                'indicator_name',
                                'age_categories' => [
                                    '*' => [
                                        'value'
                                    ]
                                ],
                                'total',
                                'male',
                                'female',
                                'remarks',
                            ]
                        ]
                    ]
                ]
            ]);
    }


    public function test_get_service_data_reports_as_encoder_with_valid_data()
    {
        $barangay = \App\Models\Barangay::factory()->create(['barangay_name' => 'Sample Barangay']);
        $encoder = \App\Models\User::factory()->create(['role' => 'encoder', 'barangay_id' => $barangay->barangay_id]);
        $response = $this->post('/api/login', ['email' => $encoder->email, 'password' => 'password']);
        $token = $response->json('token');

        $service = \App\Models\M1_Report\Service::factory()->create(['service_name' => 'Health Service']);
        $reportTemplate = \App\Models\ReportSubmissionTemplate::factory()->create(['report_year' => "2023", 'report_month' => "5"]);
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
            ->postJson('/api/service-data-reports', [
                'barangay_name' => 'Sample Barangay',
                'service_name' => 'Health Service',
                'report_year' => 2023,
                'report_month' => 5,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'Health Service' => [
                        'indicators' => [
                            '*' => [
                                'indicator_id',
                                'indicator_name',
                                'age_categories' => [
                                    '*' => [
                                        'value'
                                    ]
                                ],
                                'total',
                                'male',
                                'female',
                                'remarks',
                            ]
                        ]
                    ]
                ]
            ]);
    }

    public function test_service_data_reports_should_return_error_when_report_month_is_missing()
    {
        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $token = $response->json('token');

        // Act: Make a POST request without the report_month
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/service-data-reports', [
            'service_name' => 'Health Service',
            'barangay_id' => 1,
            'report_year' => 2023,
        ]);

        // Assert: Check that the response indicates a validation error
        $response->assertStatus(422)
            ->assertJson([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => [
                    'report_month' => ['The report month field is required.'],
                ],
            ]);
    }

    public function test_service_data_reports_should_return_error_response_when_report_year_is_missing()
    {
        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $token = $response->json('token');

        // Act: Make a POST request without the report_year
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/service-data-reports', [
            'service_name' => 'Health Service',
            'barangay_id' => 1,
            'report_month' => 5,
            // 'report_year' is intentionally omitted to test validation
        ]);

        // Assert: Check response status and error message
        $response->assertStatus(422)
            ->assertJson([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => [
                    'report_year' => ['The report year field is required.'],
                ],
            ]);
    }

    public function test_get_filtered_service_data_reports_should_return_error_when_report_month_and_year_are_missing()
    {
        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $token = $response->json('token');

        // Act: Make a POST request without report_month and report_year
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/service-data-reports', [
            // 'report_month' => "5", // Intentionally omitted
            // 'report_year' => "2023", // Intentionally omitted
        ]);

        // Assert: Check response status and error message
        $response->assertStatus(422)
            ->assertJson([
                'status' => 'error',
                'message' => 'Validation failed',
                "errors" => [
                    "report_month" => [
                        "The report month field is required."
                    ],
                    "report_year" => [
                        "The report year field is required."
                    ]
                ]
            ]);
    }

    // |------------------------------------------|
    //
    //
    //      SECTION: Morbidity Reports
    //
    //
    // |------------------------------------------|

    public function test_get_morbidity_reports_as_admin_with_valid_data()
    {
        // Arrange: Create an admin user and log in to obtain a Sanctum token
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);
        $token = $response->json('token');

        // Create necessary data for the test
        $barangay = \Database\Factories\BarangayFactory::new()->create(['barangay_name' => 'Valid Barangay']);
        $reportTemplate = \Database\Factories\ReportSubmissionTemplateFactory::new()->create(['report_year' => 2023, 'report_month' => 5]);
        $reportSubmission = \Database\Factories\ReportSubmissionFactory::new()->create([
            'barangay_id' => $barangay->barangay_id,
            'report_submission_template_id' => $reportTemplate->report_submission_template_id,
        ]);
        $reportStatus = \Database\Factories\ReportStatusFactory::new()->create(['report_submission_id' => $reportSubmission->report_submission_id]);
        $disease = \Database\Factories\M2_Report\DiseaseFactory::new()->create(['disease_code' => 'L02.9', 'disease_name' => 'Abscess']);
        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create(['age_category' => '0-6 days']);

        // Create morbidity report entry with gender counts
        \Database\Factories\M2_Report\MorbidityReportFactory::new()->create([
            'report_status_id' => $reportStatus->report_status_id,
            'disease_id' => $disease->disease_id,
            'age_category_id' => $ageCategory->age_category_id,
            'male' => 1,
            'female' => 0,
        ]);

        // Create another age category for the total count
        $ageCategoryTotal = \Database\Factories\AgeCategoryFactory::new()->create(['age_category' => 'Total']);
        \Database\Factories\M2_Report\MorbidityReportFactory::new()->create([
            'report_status_id' => $reportStatus->report_status_id,
            'disease_id' => $disease->disease_id,
            'age_category_id' => $ageCategoryTotal->age_category_id,
            'male' => 1,
            'female' => 0,
        ]);

        // Act: Make a POST request with valid filters
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/morbidity-reports/filtered', [
            'barangay_id' => $barangay->barangay_id,
            'report_year' => 2023,
            'report_month' => 5,
        ]);

        // Assert: Check response status and structure
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'report_id',
                    'report_status',
                    'report_period',
                    'data' => [
                        '*' => [
                            'disease_code', // Check disease code
                            'Total' => [
                                'M', // Male count
                                'F', // Female count
                            ],
                            '0-6 days' => [
                                'M', // Male count for age group
                                'F', // Female count for age group
                            ],
                        ],
                    ],
                ],
            ]);
    }

    public function test_get_morbidity_reports_as_encoder_with_valid_data()
    {
        $barangay = \Database\Factories\BarangayFactory::new()->create(['barangay_name' => 'Valid Barangay']);

        // Arrange: Create an admin user and log in to obtain a Sanctum token
        $encoder = \App\Models\User::factory()->create(['role' => 'encoder', 'barangay_id' => $barangay->barangay_id]);
        $response = $this->post('/api/login', [
            'email' => $encoder->email,
            'password' => 'password',
        ]);
        $token = $response->json('token');

        // Create necessary data for the test
        $reportTemplate = \Database\Factories\ReportSubmissionTemplateFactory::new()->create(['report_year' => 2023, 'report_month' => 5]);
        $reportSubmission = \Database\Factories\ReportSubmissionFactory::new()->create([
            'barangay_id' => $barangay->barangay_id,
            'report_submission_template_id' => $reportTemplate->report_submission_template_id,
        ]);
        $reportStatus = \Database\Factories\ReportStatusFactory::new()->create(['report_submission_id' => $reportSubmission->report_submission_id]);
        $disease = \Database\Factories\M2_Report\DiseaseFactory::new()->create(['disease_code' => 'L02.9', 'disease_name' => 'Abscess']);
        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create(['age_category' => '0-6 days']);

        // Create morbidity report entry with gender counts
        \Database\Factories\M2_Report\MorbidityReportFactory::new()->create([
            'report_status_id' => $reportStatus->report_status_id,
            'disease_id' => $disease->disease_id,
            'age_category_id' => $ageCategory->age_category_id,
            'male' => 1,
            'female' => 0,
        ]);

        // Create another age category for the total count
        $ageCategoryTotal = \Database\Factories\AgeCategoryFactory::new()->create(['age_category' => 'Total']);
        \Database\Factories\M2_Report\MorbidityReportFactory::new()->create([
            'report_status_id' => $reportStatus->report_status_id,
            'disease_id' => $disease->disease_id,
            'age_category_id' => $ageCategoryTotal->age_category_id,
            'male' => 1,
            'female' => 0,
        ]);

        // Act: Make a POST request with valid filters
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/morbidity-reports/filtered', [
            'report_year' => 2023,
            'report_month' => 5,
        ]);

        // Assert: Check response status and structure
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'report_id',
                    'report_status',
                    'report_period',
                    'data' => [
                        '*' => [
                            'disease_code', // Check disease code
                            'Total' => [
                                'M', // Male count
                                'F', // Female count
                            ],
                            '0-6 days' => [
                                'M', // Male count for age group
                                'F', // Female count for age group
                            ],
                        ],
                    ],
                ],
            ]);
    }

    public function test_morbidity_reports_should_return_error_when_report_month_is_missing()
    {
        // Arrange: Create an admin user and log in to obtain a Sanctum token
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);
        $token = $response->json('token');

        // Create necessary data for the test
        $barangay = \Database\Factories\BarangayFactory::new()->create(['barangay_name' => 'Valid Barangay']);
        $reportTemplate = \Database\Factories\ReportSubmissionTemplateFactory::new()->create(['report_year' => 2023, 'report_month' => 5]);
        $reportSubmission = \Database\Factories\ReportSubmissionFactory::new()->create([
            'barangay_id' => $barangay->barangay_id,
            'report_submission_template_id' => $reportTemplate->report_submission_template_id,
        ]);
        $reportStatus = \Database\Factories\ReportStatusFactory::new()->create(['report_submission_id' => $reportSubmission->report_submission_id]);
        $disease = \Database\Factories\M2_Report\DiseaseFactory::new()->create(['disease_code' => 'L02.9', 'disease_name' => 'Abscess']);
        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create(['age_category' => '0-6 days']);

        // Create morbidity report entry with gender counts
        \Database\Factories\M2_Report\MorbidityReportFactory::new()->create([
            'report_status_id' => $reportStatus->report_status_id,
            'disease_id' => $disease->disease_id,
            'age_category_id' => $ageCategory->age_category_id,
            'male' => 1,
            'female' => 0,
        ]);

        // Create another age category for the total count
        $ageCategoryTotal = \Database\Factories\AgeCategoryFactory::new()->create(['age_category' => 'Total']);
        \Database\Factories\M2_Report\MorbidityReportFactory::new()->create([
            'report_status_id' => $reportStatus->report_status_id,
            'disease_id' => $disease->disease_id,
            'age_category_id' => $ageCategoryTotal->age_category_id,
            'male' => 1,
            'female' => 0,
        ]);

        // Act: Make a POST request with valid filters
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/morbidity-reports/filtered', [
            'barangay_id' => $barangay->barangay_id,
            'report_year' => 2023,
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => [
                    'report_month' => ['The report month field is required.'],
                ],
            ]);
    }

    public function test_morbidity_reports_should_return_error_when_report_year_is_missing()
    {
        // Arrange: Create an admin user and log in to obtain a Sanctum token
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);
        $token = $response->json('token');

        // Create necessary data for the test
        $barangay = \Database\Factories\BarangayFactory::new()->create(['barangay_name' => 'Valid Barangay']);
        $reportTemplate = \Database\Factories\ReportSubmissionTemplateFactory::new()->create(['report_year' => 2023, 'report_month' => 5]);
        $reportSubmission = \Database\Factories\ReportSubmissionFactory::new()->create([
            'barangay_id' => $barangay->barangay_id,
            'report_submission_template_id' => $reportTemplate->report_submission_template_id,
        ]);
        $reportStatus = \Database\Factories\ReportStatusFactory::new()->create(['report_submission_id' => $reportSubmission->report_submission_id]);
        $disease = \Database\Factories\M2_Report\DiseaseFactory::new()->create(['disease_code' => 'L02.9', 'disease_name' => 'Abscess']);
        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create(['age_category' => '0-6 days']);

        // Create morbidity report entry with gender counts
        \Database\Factories\M2_Report\MorbidityReportFactory::new()->create([
            'report_status_id' => $reportStatus->report_status_id,
            'disease_id' => $disease->disease_id,
            'age_category_id' => $ageCategory->age_category_id,
            'male' => 1,
            'female' => 0,
        ]);

        // Create another age category for the total count
        $ageCategoryTotal = \Database\Factories\AgeCategoryFactory::new()->create(['age_category' => 'Total']);
        \Database\Factories\M2_Report\MorbidityReportFactory::new()->create([
            'report_status_id' => $reportStatus->report_status_id,
            'disease_id' => $disease->disease_id,
            'age_category_id' => $ageCategoryTotal->age_category_id,
            'male' => 1,
            'female' => 0,
        ]);

        // Act: Make a POST request with valid filters
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/morbidity-reports/filtered', [
            'barangay_id' => $barangay->barangay_id,
            'report_month' => 5,
        ]);

        // Assert: Check response status and error message
        $response->assertStatus(422)
            ->assertJson([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => [
                    'report_year' => ['The report year field is required.'],
                ],
            ]);
    }

    public function test_morbidity_reports_should_return_error_when_report_month_and_year_is_missing()
    {
        // Arrange: Create an admin user and log in to obtain a Sanctum token
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);
        $token = $response->json('token');

        // Create necessary data for the test
        $barangay = \Database\Factories\BarangayFactory::new()->create(['barangay_name' => 'Valid Barangay']);
        $reportTemplate = \Database\Factories\ReportSubmissionTemplateFactory::new()->create(['report_year' => 2023, 'report_month' => 5]);
        $reportSubmission = \Database\Factories\ReportSubmissionFactory::new()->create([
            'barangay_id' => $barangay->barangay_id,
            'report_submission_template_id' => $reportTemplate->report_submission_template_id,
        ]);
        $reportStatus = \Database\Factories\ReportStatusFactory::new()->create(['report_submission_id' => $reportSubmission->report_submission_id]);
        $disease = \Database\Factories\M2_Report\DiseaseFactory::new()->create(['disease_code' => 'L02.9', 'disease_name' => 'Abscess']);
        $ageCategory = \Database\Factories\AgeCategoryFactory::new()->create(['age_category' => '0-6 days']);

        // Create morbidity report entry with gender counts
        \Database\Factories\M2_Report\MorbidityReportFactory::new()->create([
            'report_status_id' => $reportStatus->report_status_id,
            'disease_id' => $disease->disease_id,
            'age_category_id' => $ageCategory->age_category_id,
            'male' => 1,
            'female' => 0,
        ]);

        // Create another age category for the total count
        $ageCategoryTotal = \Database\Factories\AgeCategoryFactory::new()->create(['age_category' => 'Total']);
        \Database\Factories\M2_Report\MorbidityReportFactory::new()->create([
            'report_status_id' => $reportStatus->report_status_id,
            'disease_id' => $disease->disease_id,
            'age_category_id' => $ageCategoryTotal->age_category_id,
            'male' => 1,
            'female' => 0,
        ]);

        // Act: Make a POST request with valid filters
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/morbidity-reports/filtered', [
            'barangay_id' => $barangay->barangay_id,
        ]);

        // Assert: Check response status and error message
        $response->assertStatus(422)
        ->assertJson([
            'status' => 'error',
            'message' => 'Validation failed',
            "errors" => [
                "report_month" => [
                    "The report month field is required."
                ],
                "report_year" => [
                    "The report year field is required."
                ]
            ]
        ]);
    }
}
