<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Morbidity Report Model
 *
 * Represents a report on morbidity cases for a specific disease.
 */
class MorbidityReport extends Model
{
    use HasFactory;

    protected $table = 'morbidity_reports';
    protected $primaryKey = 'morbidityReportId';
    protected $fillable = [
        'userId', 'diseaseId', 'ageId', 
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
     * Get the disease that the report is about.
     */
    public function disease()
    {
        return $this->belongsTo(Disease::class, 'diseaseId');
    }

    /**
     * Get the age category for the report.
     */
    public function ageCategory()
    {
        return $this->belongsTo(AgeCategory::class, 'ageId');
    }
}
