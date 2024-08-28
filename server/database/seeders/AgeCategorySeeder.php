<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AgeCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $age_categories = [
            ['age_category' => '0-6 days', 'created_at' => now()],
            ['age_category' => '7-28 days', 'created_at' => now()],
            ['age_category' => '29d-11mos', 'created_at' => now()],
            ['age_category' => '1-4', 'created_at' => now()],
            ['age_category' => '5-9', 'created_at' => now()],
            ['age_category' => '20-24', 'created_at' => now()],
            ['age_category' => '25-29', 'created_at' => now()],
            ['age_category' => '30-34', 'created_at' => now()],
            ['age_category' => '35-39', 'created_at' => now()],
            ['age_category' => '40-44', 'created_at' => now()],
            ['age_category' => '45-49', 'created_at' => now()],
            ['age_category' => '50-54', 'created_at' => now()],
            ['age_category' => '55-59', 'created_at' => now()],
            ['age_category' => '60-64', 'created_at' => now()],
            ['age_category' => '65-69', 'created_at' => now()],
            ['age_category' => '70+', 'created_at' => now()],
            
            // Service Data & M2
            ['age_category' => '10-14', 'created_at' => now()],
            ['age_category' => '15-19', 'created_at' => now()],
            ['age_category' => '20-49', 'created_at' => now()],

            // Teenage Pregnancy
            ['age_category' => '12 and below', 'created_at' => now()],
            ['age_category' => '13', 'created_at' => now()],
            ['age_category' => '14', 'created_at' => now()],
            ['age_category' => '15', 'created_at' => now()],
            ['age_category' => '16', 'created_at' => now()],
            ['age_category' => '17', 'created_at' => now()],
            ['age_category' => '18', 'created_at' => now()],
            ['age_category' => '19', 'created_at' => now()],
            ['age_category' => '20 and above', 'created_at' => now()],
        ];

        DB::table('age_categories')->insert($age_categories);
    }
}
