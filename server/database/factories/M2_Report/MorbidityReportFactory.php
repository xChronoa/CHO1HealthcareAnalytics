<?php

namespace Database\Factories\M2_Report;

use App\Models\AgeCategory;
use App\Models\M2_Report\Disease;
use App\Models\M2_Report\MorbidityReport;
use App\Models\ReportStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\M2_Report\MorbidityReport>
 */
class MorbidityReportFactory extends Factory
{
    protected $model = MorbidityReport::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'disease_id' => Disease::factory(),
            'age_category_id' => AgeCategory::factory(),
            'male' => $this->faker->numberBetween(0, 100),
            'female' => $this->faker->numberBetween(0, 100),
            'report_status_id' => ReportStatus::factory(),
        ];
    }
}
