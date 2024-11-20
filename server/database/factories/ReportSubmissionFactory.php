<?php

namespace Database\Factories;

use App\Models\ReportSubmission;
use App\Models\ReportSubmissionTemplate;
use App\Models\Barangay;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReportSubmissionFactory extends Factory
{
    protected $model = ReportSubmissionTemplate::class;

    public function definition()
    {
        return [
            'report_submission_template_id' => ReportSubmissionTemplate::factory(),
            'barangay_id' => Barangay::factory(),
            'status' => $this->faker->randomElement(['pending', 'submitted', 'submitted late']),
            'due_at' => $this->faker->dateTimeBetween('-1 month', '+1 month')->format('Y-m-d'),
        ];
    }

    /**
     * Indicate that the status is pending.
     */
    public function pending()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
            ];
        });
    }

    /**
     * Indicate that the status is submitted.
     */
    public function submitted()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'submitted',
            ];
        });
    }

    /**
     * Indicate that the status is submitted late.
     */
    public function submittedLate()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'submitted late',
            ];
        });
    }
}