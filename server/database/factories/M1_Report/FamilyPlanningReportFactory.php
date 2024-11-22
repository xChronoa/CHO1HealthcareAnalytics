<?php

namespace Database\Factories\M1_Report;

use App\Models\AgeCategory;
use App\Models\M1_Report\FamilyPlanningMethods;
use App\Models\M1_Report\FamilyPlanningReport;
use App\Models\ReportStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\M1_Report\FamilyPlanningReport>
 */
class FamilyPlanningReportFactory extends Factory
{
    protected $model = FamilyPlanningReport::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'age_category_id' => AgeCategory::factory(), // Automatically creates an AgeCategory
            'fp_method_id' => FamilyPlanningMethods::factory(), // Automatically creates a FamilyPlanningMethod
            'current_users_beginning_month' => $this->faker->numberBetween(0, 100),
            'new_acceptors_prev_month' => $this->faker->numberBetween(0, 100),
            'other_acceptors_present_month' => $this->faker->numberBetween(0, 100),
            'drop_outs_present_month' => $this->faker->numberBetween(0, 100),
            'current_users_end_month' => $this->faker->numberBetween(0, 100),
            'new_acceptors_present_month' => $this->faker->numberBetween(0, 100),
            'report_status_id' => ReportStatus::factory(), // Automatically creates a ReportStatus
        ];
    }
}
