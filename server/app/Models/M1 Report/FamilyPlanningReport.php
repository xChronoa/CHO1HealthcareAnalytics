<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamilyPlanningReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'age_category_id',
        'fp_method_id',
        'current_users_beginning_month',
        'new_acceptors_prev_month',
        'other_acceptors_present_month',
        'current_users_end_month',
        'new_acceptors_present_month',
        'report_status_id'
    ];

    /**
     * Get the age category for this report.
     */
    public function ageCategory()
    {
        return $this->belongsTo(AgeCategory::class);
    }

    /**
     * Get the family planning method for this report.
     */
    public function familyPlanningMethod()
    {
        return $this->belongsTo(FamilyPlanningMethods::class, 'fp_method_id');
    }

    /**
     * Get the report status for this report.
     */
    public function reportStatus()
    {
        return $this->belongsTo(ReportStatus::class);
    }
}