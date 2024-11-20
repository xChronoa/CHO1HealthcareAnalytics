<?php

namespace Database\Factories;

use App\Models\Appointment\Appointment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Appointment\Appointment>
 */
class AppointmentFactory extends Factory
{
    protected $model = Appointment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'appointment_date' => $this->faker->dateTimeBetween('+1 days', '+1 month'),
            'status' => $this->faker->randomElement(['pending', 'complete', 'no-show']),
            'queue_number' => $this->faker->randomNumber(3),
            'patient_id' => \Database\Factories\PatientFactory::new()->create(),
            'appointment_category_id' => \Database\Factories\AppointmentCategoryFactory::new()->create(),  // Create an appointment category

        ];
    }
}
