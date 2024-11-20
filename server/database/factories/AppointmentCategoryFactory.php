<?php

namespace Database\Factories;

use App\Models\Appointment\AppointmentCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Appointment\AppointmentCategory>
 */
class AppointmentCategoryFactory extends Factory
{
    protected $model = AppointmentCategory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'appointment_category_name' => $this->faker->unique()->word(), // Generate a unique category name
        ];
    }
}
