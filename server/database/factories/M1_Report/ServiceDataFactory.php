<?php

namespace Database\Factories\M1_Report;

use App\Models\AgeCategory;
use App\Models\M1_Report\Indicator;
use App\Models\M1_Report\Service;
use App\Models\M1_Report\ServiceData;
use App\Models\ReportStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\M1_Report\ServiceData>
 */
class ServiceDataFactory extends Factory
{
    protected $model = ServiceData::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'service_id' => Service::factory(), // Creates a related Service record
            'indicator_id' => Indicator::factory(), // Creates a related Indicator record or use nullable value
            'age_category_id' => AgeCategory::factory(), // Creates a related AgeCategory record or use nullable value
            'value_type' => $this->faker->randomElement(['male', 'female', 'total']),
            'value' => $this->faker->randomFloat(2, 0, 1000), // Random float value
            'remarks' => $this->faker->optional()->sentence(),
            'report_status_id' => ReportStatus::factory(), // Creates a related ReportStatus record
        ];
    }
}
