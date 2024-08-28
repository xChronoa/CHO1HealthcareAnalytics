<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            ['service_name' => 'B1. Prenatal Care', 'created_at' => now()],
            ['service_name' => 'B2. Intrapartum Care and Delivery Outcome', 'created_at' => now()],
            ['service_name' => 'B3. Postpartum and Newborn Care', 'created_at' => now()],
            ['service_name' => 'C1. Immunization Services for Newborns, Infants and School-Aged Children/Adolescents', 'created_at' => now()],
            ['service_name' => 'C2. Nutrition Services for Infants and Children', 'created_at' => now()],
            ['service_name' => 'Nutritional Assessment of Children 0-59 mos. Old', 'created_at' => now()],
            ['service_name' => 'Deworming Services for Infants, Children and Adolescents (Community Based)', 'created_at' => now()],
            ['service_name' => 'School-Based Deworming Services (Annual Reporting)', 'created_at' => now()],
            ['service_name' => 'Soil Transmitted Helminthiasis Prevention and Control', 'created_at' => now()],
            ['service_name' => 'E8. Rabies Prevention and Control', 'created_at' => now()],
            ['service_name' => 'Part 2. Natality', 'created_at' => now()],
            ['service_name' => 'Management of Sick Infants and Children', 'created_at' => now()],
            ['service_name' => 'Non-Communicable Disease Prevention and Control Services', 'created_at' => now()],
            ['service_name' => 'Teenage Pregnancy', 'created_at' => now()],
        ];

        DB::table('services')->insert($services);

    }
}
