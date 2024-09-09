<?php

namespace App\Models\M2_Report;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\AgeCategory;
use App\Models\ReportStatus;

class MorbidityReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'disease_id',
        'age_category_id',
        'male',
        'female',
        'report_status_id'
    ];

    /**
     * Get the disease for this morbidity report.
     */
    public function disease()
    {
        return $this->belongsTo(Disease::class);
    }

    /**
     * Get the age category for this morbidity report.
     */
    public function ageCategory()
    {
        return $this->belongsTo(AgeCategory::class);
    }

    /**
     * Get the report status for this morbidity report.
     */
    public function reportStatus()
    {
        return $this->belongsTo(ReportStatus::class);
    }
}
