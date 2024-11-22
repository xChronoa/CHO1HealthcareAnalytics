<?php

namespace Database\Factories;

use App\Models\ReportStatus;
use App\Models\ReportSubmission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ReportStatus>
 */
class ReportStatusFactory extends Factory
{
    protected $model = ReportStatus::class;
    
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'report_submission_id' => ReportSubmission::factory(),
            'user_id' => User::factory(),
            'status' => $this->faker->randomElement(['pending', 'overdue', 'for verification', 'approved', 'rejected']),
            'submitted_at' => $this->faker->optional()->dateTime,
            'admin_note' => $this->faker->optional()->text(200),
            'projected_population' => $this->faker->optional()->numberBetween(1000, 5000),
        ];
    }
}
