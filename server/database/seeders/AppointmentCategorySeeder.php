<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AppointmentCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['appointment_category_name' => 'General Checkup', 'created_at' => now()],
            ['appointment_category_name' => 'Animal Bite Vaccination', 'created_at' => now()],
            ['appointment_category_name' => 'Maternal Health Consultation', 'created_at' => now()],
            ['appointment_category_name' => 'Baby Vaccine', 'created_at' => now()],
            ['appointment_category_name' => 'TB DOTS', 'created_at' => now()],
        ];

        DB::table('appointment_categories')->insert($categories);
    }
}
