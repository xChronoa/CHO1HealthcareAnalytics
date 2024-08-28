<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        User::create([
            'username' => 'admin',
            'password' => Hash::make('admin'),
            'email' => 'admin@email.com',
            'role' => 'Admin',
            'status' => 'active'
        ]);

        User::create([
            'username' => 'encoder',
            'password' => Hash::make('encoder'),
            'email' => 'encoder@email.com',
            'role' => 'Encoder',
            'status' => 'active'
        ]);

        $this->call(AppointmentCategorySeeder::class);
        $this->call(BarangaySeeder::class);
        $this->call(AgeCategorySeeder::class);
        $this->call(DiseaseSeeder::class);
        $this->call(FamilyPlanningMethodSeeder::class);
        $this->call(ServiceSeeder::class);
        $this->call(IndicatorSeeder::class);
    }
}
