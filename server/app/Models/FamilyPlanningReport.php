<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Family Planning Report Model
 *
 * Represents a family planning report.
 */
class FamilyPlanningReport extends Model
{
    use HasFactory;

    protected $table = 'family_planning_reports';
    protected $primaryKey = 'fpId';
    protected $fillable = [
        'userId', 'ageId', 'fpMethodId', 'fpCategoryId', 
        'totalMale', 'totalFemale', 'month', 'year'
    ];

    /**
     * Get the user that submitted the report.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }

    /**
     * Get the age category for the report.
     */
    public function ageCategory()
    {
        return $this->belongsTo(AgeCategory::class, 'ageId');
    }

    /**
     * Get the family planning method for the report.
     */
    public function fpMethod()
    {
        return $this->belongsTo(FamilyPlanningMethod::class, 'fpMethodId');
    }

    /**
     * Get the family planning category for the report.
     */
    public function fpCategory()
    {
        return $this->belongsTo(FamilyPlanningCategory::class, 'fpCategoryId');
    }
}
