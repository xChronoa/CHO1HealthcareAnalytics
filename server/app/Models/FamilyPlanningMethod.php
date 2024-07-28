<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Family Planning Method Model
 *
 * Represents a family planning method.
 */
class FamilyPlanningMethod extends Model
{
    use HasFactory;

    protected $table = 'family_planning_methods';
    protected $primaryKey = 'fpMethodId';
    protected $fillable = ['fpMethodName'];

    /**
     * Get the family planning reports for the method.
     */
    public function familyPlanningReports()
    {
        return $this->hasMany(FamilyPlanningReport::class, 'fpMethodId');
    }
}
