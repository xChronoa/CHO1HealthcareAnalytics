<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FamilyPlanningMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define methods with prefixes
        $methods = [
            ['method_name' => 'a. BTL', 'parent_method_id' => null, 'created_at' => now()],
            ['method_name' => 'b. NSV', 'parent_method_id' => null, 'created_at' => now()],
            ['method_name' => 'c. Condom', 'parent_method_id' => null, 'created_at' => now()],
            ['method_name' => 'd. Pills', 'parent_method_id' => null, 'created_at' => now()],
            ['method_name' => 'd.1 Pills-POP', 'parent_method_id' => null, 'created_at' => now()],
            ['method_name' => 'd.2 Pills-COC', 'parent_method_id' => null, 'created_at' => now()],
            ['method_name' => 'e. Injectables (DMPA/POI)', 'parent_method_id' => null, 'created_at' => now()],
            ['method_name' => 'f. Implant', 'parent_method_id' => null, 'created_at' => now()],
            ['method_name' => 'g. IUD (IUD-I and IUD-PP)', 'parent_method_id' => null, 'created_at' => now()],
            ['method_name' => 'g.1 IUD-I', 'parent_method_id' => null, 'created_at' => now()],
            ['method_name' => 'g.2 IUD-PP', 'parent_method_id' => null, 'created_at' => now()],
            ['method_name' => 'h. NFP - LAM', 'parent_method_id' => null, 'created_at' => now()],
            ['method_name' => 'i. NFP - BBT', 'parent_method_id' => null, 'created_at' => now()],
            ['method_name' => 'j. NFP - CMM', 'parent_method_id' => null, 'created_at' => now()],
            ['method_name' => 'k. NFP - STM', 'parent_method_id' => null, 'created_at' => now()],
            ['method_name' => 'l. NFP - SDM', 'parent_method_id' => null, 'created_at' => now()],
        ];

        // Insert all methods
        DB::table('family_planning_methods')->insert($methods);

        // Map method names to their IDs
        $method_ids = DB::table('family_planning_methods')
            ->whereIn('method_name', ['d. Pills', 'g. IUD (IUD-I and IUD-PP)'])
            ->pluck('method_id', 'method_name')
            ->toArray();

        // Update parent_method_id for sub-methods
        DB::table('family_planning_methods')
            ->where('method_name', 'd.1 Pills-POP')
            ->update(['parent_method_id' => $method_ids['d. Pills'], 'updated_at' => now()]);
        
        DB::table('family_planning_methods')
            ->where('method_name', 'd.2 Pills-COC')
            ->update(['parent_method_id' => $method_ids['d. Pills'], 'updated_at' => now()]);

        DB::table('family_planning_methods')
            ->where('method_name', 'g.1 IUD-I')
            ->update(['parent_method_id' => $method_ids['g. IUD (IUD-I and IUD-PP)'], 'updated_at' => now()]);
        
        DB::table('family_planning_methods')
            ->where('method_name', 'g.2 IUD-PP')
            ->update(['parent_method_id' => $method_ids['g. IUD (IUD-I and IUD-PP)'], 'updated_at' => now()]);
    }
}
