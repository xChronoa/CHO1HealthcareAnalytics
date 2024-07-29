<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Family Planning Category Model
 *
 * Represents a category for family planning methods.
 */
class FamilyPlanningCategory extends Model
{
    use HasFactory;

    protected $table = 'family_planning_categories';
    protected $primaryKey = 'fpCategoryId';
    protected $fillable = ['fpCategoryName'];

    /**
     * Get the family planning reports for the category.
     */
    public function familyPlanningReports()
    {
        return $this->hasMany(FamilyPlanningReport::class, 'fpCategoryId');
    }
}
