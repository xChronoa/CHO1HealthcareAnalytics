<?php

namespace Database\Factories\M2_Report;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\M2_Report\Disease>
 */
class DiseaseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'disease_name' => $this->faker->word,
            'disease_code' => $this->faker->optional()->bothify('D-###'),
        ];
    }
}
