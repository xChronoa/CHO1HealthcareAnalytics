<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BarangaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $barangays = [
            ['barangay_name' => 'Butong', 'created_at' => now()],
            ['barangay_name' => 'Bigaa', 'created_at' => now()],
            ['barangay_name' => 'Gulod', 'created_at' => now()],
            ['barangay_name' => 'Marinig', 'created_at' => now()],
            ['barangay_name' => 'Niugan', 'created_at' => now()],
            ['barangay_name' => 'Poblacion Uno', 'created_at' => now()],
            ['barangay_name' => 'Poblacion Dos', 'created_at' => now()],
            ['barangay_name' => 'Poblacion Tres', 'created_at' => now()],
            ['barangay_name' => 'Sala', 'created_at' => now()],
        ];

        DB::table('barangays')->insert($barangays);
    }
}
