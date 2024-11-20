<?php

namespace Database\Factories;

use App\Models\ReportSubmissionTemplate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReportSubmissionTemplateFactory extends Factory
{
    protected $model = ReportSubmissionTemplate::class;

    public function definition()
    {
        return [
            'admin_id' => User::factory()->create()->user_id,
            'report_type' => $this->faker->randomElement(['m1', 'm2']),
            'report_month' => $this->faker->numberBetween(1, 12),
            'report_year' => $this->faker->year(),
        ];
    }
}