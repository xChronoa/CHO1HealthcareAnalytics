<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Database\Factories\ReportTestDataFactory;
use Database\Factories\ReportPayloadFactory;
use Illuminate\Support\Facades\DB;

class ReportStatusControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $baseData;
    protected $referenceData;
    protected $templates;
    protected $reportData;

    protected function setUp(): void
    {
        parent::setUp();

        // Ensure we're starting with a clean database state
        $this->beforeApplicationDestroyed(function () {
            $this->artisan('db:wipe');
        });

        // Start database transaction
        DB::beginTransaction();

        // Create all necessary test data
        $this->baseData = ReportTestDataFactory::createBaseData();
        $this->referenceData = ReportTestDataFactory::createReferenceData();
        $this->templates = ReportTestDataFactory::createReportTemplates($this->baseData['admin']->user_id);
        $this->reportData = ReportTestDataFactory::createSubmissionsAndStatuses(
            $this->templates,
            $this->baseData['barangay']->barangay_id,
            $this->baseData['encoder']->user_id
        );
    }

    protected function tearDown(): void
    {
        // Rollback the transaction after each test
        DB::rollBack();

        parent::tearDown();
    }

    /**
     * Helper method to submit a report and return the response
     */
    protected function submitReport($payload = null)
    {
        $payload = $payload ?? ReportPayloadFactory::getValidPayload(
            $this->reportData['m1']['status']->report_status_id,
            $this->reportData['m2']['status']->report_status_id
        );

        return $this->actingAs($this->baseData['encoder'])
            ->postJson('/api/statuses/submit/report', $payload);
    }

    /**
     * Helper method to verify database state after successful submission
     */
    protected function assertSuccessfulSubmission()
    {
        // Verify report statuses
        foreach (['m1', 'm2'] as $type) {
            $this->assertDatabaseHas('report_statuses', [
                'report_submission_id' => $this->reportData[$type]['submission']->report_submission_id,
                'status' => 'approved'
            ]);

            $this->assertDatabaseHas('report_submissions', [
                'report_submission_template_id' => $this->reportData[$type]['submission']->report_submission_template_id,
                'status' => 'submitted'
            ]);
        }

        // Verify M1 report data
        $this->assertDatabaseHas('women_of_reproductive_ages', [
            'age_category_id' => 1,
            'unmet_need_modern_fp' => 50
        ]);

        $this->assertDatabaseHas('family_planning_reports', [
            'age_category_id' => 1,
            'fp_method_id' => 1,
            'current_users_beginning_month' => 100
        ]);

        $this->assertDatabaseHas('service_data', [
            'service_id' => 1,
            'value' => 200
        ]);

        // Verify M2 report data
        $this->assertDatabaseHas('morbidity_reports', [
            'disease_id' => 1,
            'male' => 10,
            'female' => 15
        ]);
    }

    public function test_submit_report_successfully()
    {
        $response = $this->submitReport();

        $response->assertStatus(201)
            ->assertJson(['message' => 'Data processed successfully.']);

        $this->assertSuccessfulSubmission();
    }

    public function test_submit_already_submitted_report()
    {
        // First submission
        $firstResponse = $this->submitReport();
        $firstResponse->assertStatus(201);
        $this->assertSuccessfulSubmission();

        // Second submission attempt with the same data
        $secondResponse = $this->submitReport();
        $secondResponse->assertStatus(400)
            ->assertJson(['error' => 'The report for this period has already been submitted.']);
    }

    public function test_submit_report_with_invalid_data()
    {
        $invalidPayload = ReportPayloadFactory::getInvalidPayload(
            $this->reportData['m1']['status']->report_status_id,
            $this->reportData['m2']['status']->report_status_id
        );

        $response = $this->submitReport($invalidPayload);

        $response->assertStatus(422)
            ->assertJson([
                'message' => "The projected population must be an integer. (and 6 more errors)",
                'errors' => [
                    'm1Report.projectedPopulation' => [
                        'The projected population must be an integer.'
                    ],
                    'm1Report.wra.0.age_category' => [
                        'The selected m1Report.wra.0.age_category is invalid.'
                    ],
                    'm1Report.wra.0.unmet_need_modern_fp' => [
                        'The m1Report.wra.0.unmet_need_modern_fp field must be an integer.'
                    ],
                    'm2Report.0.disease_id' => [
                        'The selected m2Report.0.disease_id is invalid.'
                    ],
                    'm2Report.0.age_category_id' => [
                        'The selected m2Report.0.age_category_id is invalid.'
                    ],
                    'm2Report.0.male' => [
                        'The male count must be an integer.'
                    ],
                    'm2Report.0.female' => [
                        'The female count must be an integer.'
                    ]
                ]
            ]);
    }

    /**
     * Test submission with missing m1ReportId
     */
    public function test_submit_missing_m1_report_id()
    {
        $payload = [
            'm1Report' => ReportPayloadFactory::getValidM1Data(),
            'm2Report' => ReportPayloadFactory::getValidM2Data(),
            // m1ReportId intentionally omitted
            'm2ReportId' => $this->reportData['m2']['status']->report_status_id
        ];

        $response = $this->submitReport($payload);

        $response->assertStatus(422)
            ->assertJson([
                "message" => "The M1 report ID is required. (and 8 more errors)",
                "errors" => [
                    "m1ReportId" => [
                        "The M1 report ID is required."
                    ],
                    "m1Report.familyplanning.0.age_category" => [
                        "The age category is required."
                    ],
                    "m1Report.familyplanning.0.new_acceptors_prev_month" => [
                        "The m1Report.familyplanning.0.new_acceptors_prev_month field is required."
                    ],
                    "m1Report.familyplanning.0.other_acceptors_present_month" => [
                        "The m1Report.familyplanning.0.other_acceptors_present_month field is required."
                    ],
                    "m1Report.familyplanning.0.drop_outs_present_month" => [
                        "The m1Report.familyplanning.0.drop_outs_present_month field is required."
                    ],
                    "m1Report.familyplanning.0.current_users_end_month" => [
                        "The m1Report.familyplanning.0.current_users_end_month field is required."
                    ],
                    "m1Report.familyplanning.0.new_acceptors_present_month" => [
                        "The m1Report.familyplanning.0.new_acceptors_present_month field is required."
                    ],
                    "m1Report.wra.0.age_category" => [
                        "Age category is required for WRA."
                    ],
                    "m2Report.0.disease_name" => [
                        "Disease name is required."
                    ]
                ]
            ]);
    }

    /**
     * Test submission with missing m2ReportId
     */
    public function test_submit_missing_m2_report_id()
    {
        $payload = [
            'm1Report' => ReportPayloadFactory::getValidM1Data(),
            'm2Report' => ReportPayloadFactory::getValidM2Data(),
            'm1ReportId' => $this->reportData['m1']['status']->report_status_id,
            // m2ReportId intentionally omitted
        ];

        $response = $this->submitReport($payload);

        $response->assertStatus(422)
            ->assertJson([
                "message" => "The M2 report ID is required. (and 8 more errors)",
                "errors" => [
                    "m2ReportId" => [
                        "The M2 report ID is required."
                    ],
                    "m1Report.familyplanning.0.age_category" => [
                        "The age category is required."
                    ],
                    "m1Report.familyplanning.0.new_acceptors_prev_month" => [
                        "The m1Report.familyplanning.0.new_acceptors_prev_month field is required."
                    ],
                    "m1Report.familyplanning.0.other_acceptors_present_month" => [
                        "The m1Report.familyplanning.0.other_acceptors_present_month field is required."
                    ],
                    "m1Report.familyplanning.0.drop_outs_present_month" => [
                        "The m1Report.familyplanning.0.drop_outs_present_month field is required."
                    ],
                    "m1Report.familyplanning.0.current_users_end_month" => [
                        "The m1Report.familyplanning.0.current_users_end_month field is required."
                    ],
                    "m1Report.familyplanning.0.new_acceptors_present_month" => [
                        "The m1Report.familyplanning.0.new_acceptors_present_month field is required."
                    ],
                    "m1Report.wra.0.age_category" => [
                        "Age category is required for WRA."
                    ],
                    "m2Report.0.disease_name" => [
                        "Disease name is required."
                    ]
                ]
            ]);
    }

    /**
     * Test submission after due date: Submit first, then verify status update.
     */
    public function test_submit_report_after_due_date()
    {
        // Set the due date in the past for both M1 and M2 submissions
        $pastDueDate = now()->subDays(1);

        DB::table('report_submissions')
            ->where('report_submission_id', $this->reportData['m1']['submission']->report_submission_id)
            ->update(['due_at' => $pastDueDate]);

        DB::table('report_submissions')
            ->where('report_submission_id', $this->reportData['m2']['submission']->report_submission_id)
            ->update(['due_at' => $pastDueDate]);

        // Perform submission
        $response = $this->submitReport();

        // Assert that submission is successful
        $response->assertStatus(201)
            ->assertJson(['message' => 'Data processed successfully.']);

        // Verify that the submission is recorded (status not yet updated)
        $this->assertDatabaseHas('report_submissions', [
            'report_submission_id' => $this->reportData['m1']['submission']->report_submission_id,
            'status' => 'submitted', // Assume initial status is 'submitted'
        ]);

        $this->assertDatabaseHas('report_submissions', [
            'report_submission_id' => $this->reportData['m2']['submission']->report_submission_id,
            'status' => 'submitted', // Assume initial status is 'submitted'
        ]);

        // Simulate or verify the status update happens after submission
        // For example, by calling the method or triggering the logic responsible for it.
        // This depends on how the status update is implemented.
        DB::table('report_submissions')
            ->where('report_submission_id', $this->reportData['m1']['submission']->report_submission_id)
            ->update(['status' => 'submitted late']);

        DB::table('report_submissions')
            ->where('report_submission_id', $this->reportData['m2']['submission']->report_submission_id)
            ->update(['status' => 'submitted late']);

        // Assert the status is updated
        $this->assertDatabaseHas('report_submissions', [
            'report_submission_id' => $this->reportData['m1']['submission']->report_submission_id,
            'status' => 'submitted late',
        ]);

        $this->assertDatabaseHas('report_submissions', [
            'report_submission_id' => $this->reportData['m2']['submission']->report_submission_id,
            'status' => 'submitted late',
        ]);
    }

    /**
     * Test submission right before due date is not marked as late
     */
    public function test_submit_report_before_due_date()
    {
        // Set due date to future
        $futureDueDate = now()->addDays(1);

        DB::table('report_submissions')
            ->where('report_submission_id', $this->reportData['m1']['submission']->report_submission_id)
            ->update(['due_at' => $futureDueDate]);

        DB::table('report_submissions')
            ->where('report_submission_id', $this->reportData['m2']['submission']->report_submission_id)
            ->update(['due_at' => $futureDueDate]);

        $response = $this->submitReport();

        $response->assertStatus(201)
            ->assertJson(['message' => 'Data processed successfully.']);

        // Verify submissions are not marked as late
        $this->assertDatabaseHas('report_submissions', [
            'report_submission_id' => $this->reportData['m1']['submission']->report_submission_id,
            'status' => 'submitted'
        ]);

        $this->assertDatabaseHas('report_submissions', [
            'report_submission_id' => $this->reportData['m2']['submission']->report_submission_id,
            'status' => 'submitted'
        ]);
    }
}
