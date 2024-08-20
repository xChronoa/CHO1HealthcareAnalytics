<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgeCategory extends Model
{
    use HasFactory;

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
