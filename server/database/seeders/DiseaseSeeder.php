<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DiseaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $diseases = [
            ['disease_name' => 'Abscess', 'disease_code' => 'L02.9', 'created_at' => now()],
            ['disease_name' => 'Acute Rhinitis (Colds)', 'disease_code' => 'J00', 'created_at' => now()],
            ['disease_name' => 'Age', 'disease_code' => 'A09', 'created_at' => now()],
            ['disease_name' => 'Animal Bite', 'disease_code' => null, 'created_at' => now()],
            ['disease_name' => 'Arthritis', 'disease_code' => 'M13.99', 'created_at' => now()],
            ['disease_name' => 'Asthma', 'disease_code' => 'J45.9', 'created_at' => now()],
            ['disease_name' => 'Conjunctivitis', 'disease_code' => 'H10', 'created_at' => now()],
            ['disease_name' => 'Costochondritis', 'disease_code' => 'M94.08', 'created_at' => now()],
            ['disease_name' => 'Dyslipidemia Hypercholesterolemia', 'disease_code' => 'E78.9', 'created_at' => now()],
            ['disease_name' => 'Ear Infection', 'disease_code' => 'H66.9', 'created_at' => now()],
            ['disease_name' => 'Food Allergy', 'disease_code' => 'T78.1', 'created_at' => now()],
            ['disease_name' => 'Gastritis', 'disease_code' => 'K29.7', 'created_at' => now()],
            ['disease_name' => 'Headache', 'disease_code' => 'R51', 'created_at' => now()],
            ['disease_name' => 'Herpes Zoster', 'disease_code' => 'B02.9', 'created_at' => now()],
            ['disease_name' => 'Hypertension', 'disease_code' => 'I10.9', 'created_at' => now()],
            ['disease_name' => 'Influenza-like Illness', 'disease_code' => 'A49.2', 'created_at' => now()],
            ['disease_name' => 'UTI (Urinary Tract Infection)', 'disease_code' => 'N39.0', 'created_at' => now()],
            ['disease_name' => 'Fever', 'disease_code' => 'R50', 'created_at' => now()],
            ['disease_name' => 'SVI (Systemic Viral Infection)', 'disease_code' => 'B34.9', 'created_at' => now()],
            ['disease_name' => 'PTB (Pulmonary TB)', 'disease_code' => 'A15.3', 'created_at' => now()],
            ['disease_name' => 'Scabies', 'disease_code' => 'B86', 'created_at' => now()],
            ['disease_name' => 'Skin Allergy', 'disease_code' => 'L23.9', 'created_at' => now()],
            ['disease_name' => 'URTI', 'disease_code' => 'J06.9', 'created_at' => now()],
            ['disease_name' => 'Allergy', 'disease_code' => 'T78.4', 'created_at' => now()],
            ['disease_name' => 'ATP (Acute Tonsillo Pharyngitis)', 'disease_code' => 'J06.8', 'created_at' => now()],
            ['disease_name' => 'Wound', 'disease_code' => 'T01.9', 'created_at' => now()],
            ['disease_name' => 'Vertigo (Dizziness)', 'disease_code' => 'R42', 'created_at' => now()],
            ['disease_name' => 'Diarrhea', 'disease_code' => 'K52.9', 'created_at' => now()],
        ];

        DB::table('diseases')->insert($diseases);
    }
}
