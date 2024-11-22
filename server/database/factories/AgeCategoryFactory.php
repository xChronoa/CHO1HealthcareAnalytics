<?php

namespace Database\Factories;

use App\Models\AgeCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AgeCategory>
 */
class AgeCategoryFactory extends Factory
{
    protected $model = AgeCategory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'age_category' => $this->faker->randomElement(['10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49']),
        ];
    }
}
