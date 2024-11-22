<?php

namespace Database\Factories\M1_Report;

use App\Models\M1_Report\Indicator;
use App\Models\M1_Report\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\M1_Report\Indicator>
 */
class IndicatorFactory extends Factory
{
    protected $model = Indicator::class;
    
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'indicator_name' => $this->faker->unique()->word(),
            'parent_indicator_id' => $this->faker->optional()->randomElement(
                Indicator::pluck('indicator_id')->toArray()
            ),
            'service_id' => Service::factory(), // Creates a related Service record
        ];
    }
}
