<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceData extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'indicator_id',
        'age_category_id',
        'value_type',
        'value',
        'remarks',
        'report_status_id'
    ];

    /**
     * Get the service associated with this data.
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get the indicator associated with this data.
     */
    public function indicator()
    {
        return $this->belongsTo(Indicator::class);
    }

    /**
     * Get the age category associated with this data.
     */
    public function ageCategory()
    {
        return $this->belongsTo(AgeCategory::class);
    }

    /**
     * Get the report status associated with this data.
     */
    public function reportStatus()
    {
        return $this->belongsTo(ReportStatus::class);
    }
}
