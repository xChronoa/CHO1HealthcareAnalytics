<?php


namespace App\Models\M1_Report;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\AgeCategory;
use App\Models\ReportStatus;

class ServiceData extends Model
{
    use HasFactory;

    protected $primaryKey = "service_data_id";

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
        return $this->belongsTo(Service::class, "service_id");
    }

    /**
     * Get the indicator associated with this data.
     */
    public function indicator()
    {
        return $this->belongsTo(Indicator::class, "indicator_id");
    }

    /**
     * Get the age category associated with this data.
     */
    public function ageCategory()
    {
        return $this->belongsTo(AgeCategory::class, "age_category_id");
    }

    /**
     * Get the report status associated with this data.
     */
    public function reportStatus()
    {
        return $this->belongsTo(ReportStatus::class, "report_status_id");
    }
}
