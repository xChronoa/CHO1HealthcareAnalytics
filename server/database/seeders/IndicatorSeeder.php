<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IndicatorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /* #region B1 Prenatal Care */
        // Fetch the service_id for 'B1. Prenatal Care'
        $serviceId = DB::table('services')->where('service_name', 'B1. Prenatal Care')->value('service_id');

        // Insert indicators with prefixes and hierarchical structure
        $indicators = [
            // Level 1 indicators
            ['indicator_name' => '1. No. of pregnant women with at least 4 prenatal check-ups', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '2. No. of pregnant women assessed of nutritional status during the 1st tri', 'service_id' => $serviceId, 'created_at' => now()],

            // Level 3 indicators (Sub-indicators for nutritional status)
            ['indicator_name' => 'a. No. of pregnant women seen in the first trimester who have normal BMI', 'parent_indicator_id' => 2, 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => 'b. No. of pregnant women seen in the first trimester who have low BMI', 'parent_indicator_id' => 2, 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => 'c. No. of pregnant women seen in the first trimester who have high BMI', 'parent_indicator_id' => 2, 'service_id' => $serviceId, 'created_at' => now()],

            // Level 1 indicators (Continued)
            ['indicator_name' => '3. No. of pregnant women for the 1st time given at least 2 doses of Td vaccination', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '4. No. of pregnant women for the 2nd or more given at least 3 doses of Td vaccination', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '5. No. of pregnant women who completed the dose of Iron w/ folic acid supplementation', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '6. No. of pregnant women who completed doses of calcium carbonate supplementation', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '7. No. of pregnant women given iodine capsule', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '8. No. of pregnant women given one dose of deworming tablet', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '9. No. of pregnant women screened for syphilis', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '10. No. of pregnant women tested positive for syphilis', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '11. No. of pregnant women screened for Hepatitis B', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '12. No. of pregnant women tested positive for Hepatitis B', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '13. No. of pregnant women screened for HIV', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '14. No. of pregnant women tested for CBC or Hgb & Hct count', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '15. No. of pregnant women tested for CBC or Hgb & Hct count diagnose w/ anemia', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '16. No. of pregnant women screened for gestational diabetes', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '17. No. of pregnant women tested positive for gestational diabetes', 'service_id' => $serviceId, 'created_at' => now()],
        ];

        // Insert data into the indicators table
        foreach ($indicators as $indicator) {
            DB::table('indicators')->insert($indicator);
        }
        /* #endregion */


        /* #region B2 Intrapartum Care and Delivery Outcome */
        // Fetch the service_id for 'B2. Intrapartum Care and Delivery Outcome'
        $serviceId = DB::table('services')->where('service_name', 'B2. Intrapartum Care and Delivery Outcome')->value('service_id');

        // Insert indicators with prefixes and hierarchical structure
        $indicators = [
            // Level 1 indicators
            ['indicator_name' => '18. No. of Deliveries', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '19. No. of Livebirths', 'service_id' => $serviceId, 'created_at' => now()],

            // Level 2 indicators (Sub-indicators for Livebirths)
            ['indicator_name' => 'a. Normal Birth Weight', 'parent_indicator_id' => 19, 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => 'b. Low Birth Weight', 'parent_indicator_id' => 19, 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => 'c. Unknown Birth Weight', 'parent_indicator_id' => 19, 'service_id' => $serviceId, 'created_at' => now()],

            // Level 2 indicators (Number of Deliveries attended by Skilled Health Professional)
            ['indicator_name' => '20. Number of deliveries attended by Skilled Health Professional', 'service_id' => $serviceId, 'created_at' => now()],

            // Level 3 indicators (Sub-indicators for Skilled Health Professional)
            ['indicator_name' => 'a. Attended by Doctor', 'parent_indicator_id' => 20, 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => 'b. Attended by Nurse', 'parent_indicator_id' => 20, 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => 'c. Attended by Midwives', 'parent_indicator_id' => 20, 'service_id' => $serviceId, 'created_at' => now()],

            // Level 2 indicators (Number of facility-based deliveries)
            ['indicator_name' => '21. Number of facility-based deliveries', 'service_id' => $serviceId, 'created_at' => now()],

            // Level 3 indicators (Sub-indicators for facility-based deliveries)
            ['indicator_name' => 'a. Public health facility', 'parent_indicator_id' => 21, 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => 'b. Private health facility', 'parent_indicator_id' => 21, 'service_id' => $serviceId, 'created_at' => now()],

            // Level 2 indicators (Number of non-facility based deliveries)
            ['indicator_name' => '22. Number of non-facility based deliveries', 'parent_indicator_id' => 21, 'service_id' => $serviceId, 'created_at' => now()],

            // Level 2 indicators (Type of Delivery)
            ['indicator_name' => '23. Type of Delivery', 'service_id' => $serviceId, 'created_at' => now()],

            // Level 3 indicators (Sub-indicators for Type of Delivery)
            ['indicator_name' => 'a. No. of vaginal deliveries', 'parent_indicator_id' => 23, 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => 'b. No. of deliveries by C-section', 'parent_indicator_id' => 23, 'service_id' => $serviceId, 'created_at' => now()],

            // Level 2 indicators (Pregnancy Outcome)
            ['indicator_name' => '24. Pregnancy Outcome', 'service_id' => $serviceId, 'created_at' => now()],

            // Level 3 indicators (Sub-indicators for Pregnancy Outcome)
            ['indicator_name' => 'a. No. of full-term births', 'parent_indicator_id' => 24, 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => 'b. No. of pre-term births', 'parent_indicator_id' => 24, 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => 'c. No. of fetal deaths', 'parent_indicator_id' => 24, 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => 'd. No. of abortion/miscarriage', 'parent_indicator_id' => 24, 'service_id' => $serviceId, 'created_at' => now()],
        ];

        // Insert data into the indicators table
        foreach ($indicators as $indicator) {
            DB::table('indicators')->insert($indicator);
        }
        /* #endregion */


        /* #region B3 Postpartum and Newborn Care */
        // Fetch the service_id for 'B3. Postpartum and Newborn Care'
        $serviceId = DB::table('services')->where('service_name', 'B3. Postpartum and Newborn Care')->value('service_id');

        // Insert indicators with prefixes
        $indicators = [
            ['indicator_name' => '25. No. of postpartum women together with their newborn completed at least 2 postpartum check-ups', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '26. No. of postpartum women who completed iron with folic acid supplementation', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '27. No. of postpartum women with Vitamin A supplementation', 'service_id' => $serviceId, 'created_at' => now()],
        ];

        // Insert data into the indicators table
        foreach ($indicators as $indicator) {
            DB::table('indicators')->insert($indicator);
        }
        /* #endregion */


        /* #region C1. Immunization Services for Newborns, Infants and School-Aged Children/Adolescents */
        // Fetch the service_id for 'C1. Immunization Services for Newborns, Infants and School-Aged Children/Adolescents'
        $serviceId = DB::table('services')->where('service_name', 'C1. Immunization Services for Newborns, Infants and School-Aged Children/Adolescents')->value('service_id');

        // Insert indicators with prefixes
        $indicators = [
            ['indicator_name' => '1. CPAB', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '2. BCG', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '3. HepB, within 24 hours', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '4. DPT-HIB-HepB 1', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '5. DPT-HIB-HepB 2', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '6. DPT-HIB-HepB 3', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '7. OPV 1', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '8. OPV 2', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '9. OPV 3', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '10. IPV 1', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '11. IPV 2 (Routine)', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '12. IPV 2 (Catch-Up)', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '13. PCV 1', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '14. PCV 2', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '15. PCV 3', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '16. MCV 1', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '17. MCV 2', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '18. FIC', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '19. CIC', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '20. Td, Grade 1 (November)', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '21. MR, Grade 1 (November)', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '22. Td, Grade 7 (November)', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '23. MR, Grade 7 (November)', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => 'Enrolled Grade 1', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => 'Enrolled Grade 7', 'service_id' => $serviceId, 'created_at' => now()],
        ];

        // Insert data into the indicators table
        foreach ($indicators as $indicator) {
            DB::table('indicators')->insert($indicator);
        }
        /* #endregion */


        /* #region C2. Nutrition Services for Infants and Children */
        // Fetch the service_id for 'C2. Nutrition Services for Infants and Children'
        $serviceId = DB::table('services')->where('service_name', 'C2. Nutrition Services for Infants and Children')->value('service_id');

        // Insert indicators with prefixes
        $indicators = [
            ['indicator_name' => '24. Newborns initiated on breastfeeding immediately after birth lasting to 90 mins.', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '25. Preterm/LBW infants given iron supplementation', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '26. Infants exclusively breastfed until the 5th month and 29th day', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '27. Infants 6 months old initiated to complementary feeding with continued breastfeeding', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '28. Infants 6 months old initiated to complementary feeding but no longer or never been breastfed', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '29. Infants 6-11 months given 1 dose of Vitamin A 100,000 I.U.', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '30. Children 12-59 months old given 2 doses of Vitamin A 200,000 I.U.', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '31. Infants 6-11 months old who completed MNP supplementation', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '32. Children 12-23 months who completed MNP supplementation', 'service_id' => $serviceId, 'created_at' => now()],
        ];

        // Insert data into the indicators table
        foreach ($indicators as $indicator) {
            DB::table('indicators')->insert($indicator);
        }
        /* #endregion */


        /* #region Nutritional Assessment of Children 0-59 mos. Old */
        // Fetch the service_id for 'Nutritional Assessment of Children 0-59 mos. Old'
        $serviceId = DB::table('services')->where('service_name', 'Nutritional Assessment of Children 0-59 mos. Old')->value('service_id');
        
        $indicators = [
            ['indicator_name' => '33. Stunted', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '34. Wasted', 'service_id' => $serviceId, 'created_at' => now()],
        ];

        // Insert data into the indicators table
        foreach ($indicators as $indicator) {
            DB::table('indicators')->insert($indicator);
        }

        // Insert indicators with prefixes and hierarchy
        $indicators = [
            ['indicator_name' => 'a.1 MAM-identified in SFP', 'service_id' => $serviceId, 'parent_indicator_id' => DB::table('indicators')->where('indicator_name', '34. Wasted')->value('indicator_id'), 'created_at' => now()],
            ['indicator_name' => 'a.2 MAM-admitted in SFP', 'service_id' => $serviceId, 'parent_indicator_id' => DB::table('indicators')->where('indicator_name', '34. Wasted')->value('indicator_id'), 'created_at' => now()],
            ['indicator_name' => 'a.3 MAM-cured in SFP', 'service_id' => $serviceId, 'parent_indicator_id' => DB::table('indicators')->where('indicator_name', '34. Wasted')->value('indicator_id'), 'created_at' => now()],
            ['indicator_name' => 'a.4 MAM-died in SFP', 'service_id' => $serviceId, 'parent_indicator_id' => DB::table('indicators')->where('indicator_name', '34. Wasted')->value('indicator_id'), 'created_at' => now()],
            ['indicator_name' => 'b.1 SAM-identified to OTC', 'service_id' => $serviceId, 'parent_indicator_id' => DB::table('indicators')->where('indicator_name', '34. Wasted')->value('indicator_id'), 'created_at' => now()],
            ['indicator_name' => 'b.2 SAM-admitted to OTC', 'service_id' => $serviceId, 'parent_indicator_id' => DB::table('indicators')->where('indicator_name', '34. Wasted')->value('indicator_id'), 'created_at' => now()],
            ['indicator_name' => 'b.3 SAM-cured in OTC', 'service_id' => $serviceId, 'parent_indicator_id' => DB::table('indicators')->where('indicator_name', '34. Wasted')->value('indicator_id'), 'created_at' => now()],
            ['indicator_name' => 'b.4 SAM-defaulted in OTC', 'service_id' => $serviceId, 'parent_indicator_id' => DB::table('indicators')->where('indicator_name', '34. Wasted')->value('indicator_id'), 'created_at' => now()],
            ['indicator_name' => 'b.5 SAM-died in OTC', 'service_id' => $serviceId, 'parent_indicator_id' => DB::table('indicators')->where('indicator_name', '34. Wasted')->value('indicator_id'), 'created_at' => now()],
            ['indicator_name' => '34. Overweight/Obese', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '36. Normal', 'service_id' => $serviceId, 'created_at' => now()],
        ];

        // Insert data into the indicators table
        foreach ($indicators as $indicator) {
            DB::table('indicators')->insert($indicator);
        }
        /* #endregion */


        /* #region Deworming Services for Infants, Children and Adolescents (Community Based) */
        $serviceId = DB::table('services')->where('service_name', 'Deworming Services for Infants, Children and Adolescents (Community Based)')->value('service_id');
        // Insert indicators with prefixes and hierarchy
        $indicators = [
            ['indicator_name' => '37. 1-19 y/o given 2 doses of deworming drug', 'service_id' => $serviceId, 'created_at' => now()],
        ];

        // Insert data into the indicators table
        foreach ($indicators as $indicator) {
            DB::table('indicators')->insert($indicator);
        }

        // Insert indicators with prefixes and hierarchy
        $indicators = [
            ['indicator_name' => 'a. PSAC, 1-4 y/o dewormed (2 doses)', 'service_id' => $serviceId,'parent_indicator_id' => DB::table('indicators')->where('indicator_name', '37. 1-19 y/o given 2 doses of deworming drug')->value('indicator_id'), 'created_at' => now()],
            ['indicator_name' => 'b. SAC, 5-9 y/o dewormed (2 doses)', 'service_id' => $serviceId, 'parent_indicator_id' => DB::table('indicators')->where('indicator_name', '37. 1-19 y/o given 2 doses of deworming drug')->value('indicator_id'), 'created_at' => now()],
            ['indicator_name' => 'c. Adolescents, 10-19 y/o dewormed (2 doses)', 'service_id' => $serviceId, 'parent_indicator_id' => DB::table('indicators')->where('indicator_name', '37. 1-19 y/o given 2 doses of deworming drug')->value('indicator_id'), 'created_at' => now()],
        ];

        // Insert data into the indicators table
        foreach ($indicators as $indicator) {
            DB::table('indicators')->insert($indicator);
        }
        /* #endregion */


        /* #region School-Based Deworming Services (Annual Reporting) */
        $serviceId = DB::table('services')->where('service_name', 'School-Based Deworming Services (Annual Reporting)')->value('service_id');
        
        // Insert indicators with prefixes and hierarchy
        $indicators = [
            ['indicator_name' => '1-19 y/o given 2 doses of deworming drug', 'service_id' => $serviceId, 'created_at' => now()],
        ];
        // Insert data into the indicators table
        foreach ($indicators as $indicator) {
            DB::table('indicators')->insert($indicator);
        }

        // Insert indicators with prefixes and hierarchy
        $indicators = [
            ['indicator_name' => 'a. PSAC, 1-4 y/o dewormed (2 doses)', 'service_id' => $serviceId, 'parent_indicator_id' => DB::table('indicators')->where('indicator_name', '1-19 y/o given 2 doses of deworming drug')->value('indicator_id'), 'created_at' => now()],
            ['indicator_name' => 'b. SAC, 5-9 y/o dewormed (2 doses)', 'service_id' => $serviceId, 'parent_indicator_id' => DB::table('indicators')->where('indicator_name', '1-19 y/o given 2 doses of deworming drug')->value('indicator_id'), 'created_at' => now()],
            ['indicator_name' => 'c. Adolescents, 10-19 y/o dewormed (2 doses)', 'service_id' => $serviceId, 'parent_indicator_id' => DB::table('indicators')->where('indicator_name', '1-19 y/o given 2 doses of deworming drug')->value('indicator_id'), 'created_at' => now()],
        ];

        // Insert data into the indicators table
        foreach ($indicators as $indicator) {
            DB::table('indicators')->insert($indicator);
        }
        /* #endregion */


        /* #region Soil Transmitted Helminthiasis Prevention and Control */
        $serviceId = DB::table('services')->where('service_name', 'Soil Transmitted Helminthiasis Prevention and Control')->value('service_id');

        // Insert indicators with prefixes and hierarchy
        $indicators = [
            ['indicator_name' => '1. No. of WRA, 20-49 years old, who completed 2 doses of deworming tablet', 'service_id' => $serviceId, 'created_at' => now()],
        ];

        // Insert data into the indicators table
        foreach ($indicators as $indicator) {
            DB::table('indicators')->insert($indicator);
        }
        /* #endregion */


        /* #region E8. Rabies Prevention and Control */
        $serviceId = DB::table('services')->where('service_name', 'E8. Rabies Prevention and Control')->value('service_id');

        // Insert indicators with prefixes and hierarchy
        $indicators = [
            ['indicator_name' => '1. No. of animal bites', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '2. No. of deaths due to Rabies', 'service_id' => $serviceId, 'created_at' => now()],
        ];

        // Insert data into the indicators table
        foreach ($indicators as $indicator) {
            DB::table('indicators')->insert($indicator);
        }
        /* #endregion */


        /* #region Part 2. Natality */
        $serviceId = DB::table('services')->where('service_name', 'Part 2. Natality')->value('service_id');

        // Insert indicators with prefixes and hierarchy
        $indicators = [
            ['indicator_name' => 'Livebirths', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => 'Livebirths among 15-19 y/o women', 'service_id' => $serviceId, 'created_at' => now()],
        ];

        // Insert data into the indicators table
        foreach ($indicators as $indicator) {
            DB::table('indicators')->insert($indicator);
        }
        /* #endregion */


        /* #region Management of Sick Infants and Children */
        // Fetch the service_id for 'Management of Sick Infants and Children'
        $serviceId = DB::table('services')->where('service_name', 'Management of Sick Infants and Children')->value('service_id');

        // Insert indicators with prefixes and hierarchy
        $indicators = [
            ['indicator_name' => '38. Sick infants 6-11 mos. old seen', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '39. Sick infants 6-11 mos. received Vit. A', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '40. Sick infants 12-59 mos. old seen', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '41. Sick infants 12-59 mos. old received Vit. A', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '42. Diarrhea cases 0-59 mos.old seen', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '43. Diarrhea cases 0-59 mos.received ORS', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '44. Diarrhea cases 0-59 mos. recvd ORS with Zinc', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '45. Pneumonia cases 0-59 mos. old seen', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '46. Pneumonia cases 0-59 mos. completed Tx', 'service_id' => $serviceId, 'created_at' => now()],
        ];

        // Insert data into the indicators table
        foreach ($indicators as $indicator) {
            DB::table('indicators')->insert($indicator);
        }
        /* #endregion */


        /* #region Non-Communicable Disease Prevention and Control Services */
        // Fetch the service_id for 'Non-Communicable Disease Prevention and Control Services'
        $serviceId = DB::table('services')->where('service_name', 'Non-Communicable Disease Prevention and Control Services')->value('service_id');

        // Insert indicators with prefixes and hierarchy
        $indicators = [
            ['indicator_name' => '1. No. of adults risk-assessed using PhilPEN', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '2. Current smokers', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '3. Alcohol binge drinkers', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '4. Overweight / Obese', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '5. No. of adult women screened for Cervical Cancer using VIA/Pap Smear', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '6. No. of adult women found positive/suspect Cervical Cancer using VIA/Pap Smear', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '7. No. of adult women screened for breast mass', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '8. No. of adult women with suspicious breast mass', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '9. No. of newly-identified hypertensive adults', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '10. No. of newly-identified adults w/ Type 2 DM', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '11. No. of senior ctzns screened for visual acuity', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '12. No. of senior ctzns diagnosed w/ eye disease/s', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '13. No. of SC who recvd (1) dose of PPV', 'service_id' => $serviceId, 'created_at' => now()],
            ['indicator_name' => '14. No. of SC who recvd (1) dose of flu vaccine', 'service_id' => $serviceId, 'created_at' => now()],
        ];

        // Insert data into the indicators table
        foreach ($indicators as $indicator) {
            DB::table('indicators')->insert($indicator);
        }
        /* #endregion */
    }
}
