<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WomenOfReproductiveAge extends Model
{
    use HasFactory;

    protected $fillable = [
        'age_category_id',
        'unmet_need_modern_fp',
        'report_status_id'
    ];

    /**
     * Get the age category associated with this record.
     */
    public function ageCategory()
    {
        return $this->belongsTo(AgeCategory::class);
    }

    /**
     * Get the report status associated with this record.
     */
    public function reportStatus()
    {
        return $this->belongsTo(ReportStatus::class);
    }
}