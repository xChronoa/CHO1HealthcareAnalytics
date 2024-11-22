<?php

namespace Database\Factories;

use App\Models\AgeCategory;
use App\Models\M1_Report\WomenOfReproductiveAge;
use App\Models\ReportStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\M1_Report\WomenOfReproductiveAge>
 */
class WomenOfReproductiveAgeFactory extends Factory
{
    protected $model = WomenOfReproductiveAge::class;
    
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'age_category_id' => AgeCategory::factory(),
            'unmet_need_modern_fp' => $this->faker->numberBetween(0, 100),
            'report_status_id' => ReportStatus::factory(),
        ];
    }
}
