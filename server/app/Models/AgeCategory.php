<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Age Category Model
 *
 * Represents an age category.
 */
class AgeCategory extends Model
{
    use HasFactory;

    protected $table = 'age_categories';
    protected $primaryKey = 'ageId';
    protected $fillable = ['ageCategory'];

    /**
     * Get the family planning reports for the age category.
     */
    public function familyPlanningReports()
    {
        return $this->hasMany(FamilyPlanningReport::class, 'ageId');
    }

    /**
     * Get the morbidity reports for the age category.
     */
    public function morbidityReports()
    {
        return $this->hasMany(MorbidityReport::class, 'ageId');
    }

    /**
     * Get the service data entries for the age category.
     */
    public function serviceData()
    {
        return $this->hasMany(ServiceData::class, 'ageId');
    }
}