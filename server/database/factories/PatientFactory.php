<?php

namespace Database\Factories;

use App\Models\Appointment\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Appointment\Patient>
 */
class PatientFactory extends Factory
{
    protected $model = Patient::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName,
            'last_name' => $this->faker->lastName,
            'sex' => $this->faker->randomElement(['male', 'female']),
            'birthdate' => $this->faker->date(),
            'address' => $this->faker->address,
            'phone_number' => $this->faker->phoneNumber,
            'email' => $this->faker->unique()->safeEmail,
        ];
    }
}
