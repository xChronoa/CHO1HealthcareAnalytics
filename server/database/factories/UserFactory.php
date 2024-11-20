<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Barangay;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = User::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'username' => $this->faker->unique()->userName(),
            'password' => bcrypt('password'), // Default password, you might want to change this
            'email' => $this->faker->unique()->safeEmail(),
            'role' => $this->faker->randomElement(['encoder', 'admin']),
            'barangay_id' => Barangay::factory(),
            'status' => $this->faker->randomElement(['active', 'disabled']),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the user is an encoder.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function encoder()
    {
        return $this->state(function (array $attributes) {
            return [
                'role' => 'encoder',
            ];
        });
    }

    /**
     * Indicate that the user is an admin.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function admin()
    {
        return $this->state(function (array $attributes) {
            return [
                'role' => 'admin',
            ];
        });
    }

    /**
     * Indicate that the user is active.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function active()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'active',
            ];
        });
    }

    /**
     * Indicate that the user is disabled.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function disabled()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'disabled',
            ];
        });
    }
}