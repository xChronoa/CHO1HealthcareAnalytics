<?php

namespace Database\Factories\M1_Report;

use App\Models\M1_Report\FamilyPlanningMethods;
use Illuminate\Database\Eloquent\Factories\Factory;


/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\M1_Report\FamilyPlanningMethods>
 */
class FamilyPlanningMethodsFactory extends Factory
{
    protected $model = FamilyPlanningMethods::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generate a parent method ID based on the existing records in the same table
        $parentMethodId = $this->faker->optional()->randomElement(
            FamilyPlanningMethods::pluck('method_id')->toArray() // Get existing method IDs for the parent relationship
        );

        return [
            'method_name' => $this->faker->word(),
            'parent_method_id' => $parentMethodId, // Randomly assigns a parent method or null
        ];
    }
}
