<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\M1_Report\WomenOfReproductiveAge;
use App\Models\M1_Report\FamilyPlanningReport;
use App\Models\M2_Report\MorbidityReport;
use App\Models\M1_Report\ServiceData;

class AgeCategory extends Model
{
    use HasFactory;

    protected $primaryKey = "age_category_id";

    protected $fillable = [
        'age_category'
    ];

    /**
     * Get the women of reproductive age records for this category.
     */
    public function womenOfReproductiveAge()
    {
        return $this->hasMany(WomenOfReproductiveAge::class);
    }

    /**
     * Get the family planning reports for this age category.
     */
    public function familyPlanningReports()
    {
        return $this->hasMany(FamilyPlanningReport::class);
    }

    /**
     * Get the morbidity reports for this age category.
     */
    public function morbidityReports()
    {
        return $this->hasMany(MorbidityReport::class);
    }

    /**
     * Get the service data records for this age category.
     */
    public function serviceData()
    {
        return $this->hasMany(ServiceData::class);
    }
}
