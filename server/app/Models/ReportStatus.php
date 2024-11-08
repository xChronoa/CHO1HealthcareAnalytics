<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\M1_Report\WomenOfReproductiveAge;
use App\Models\M1_Report\FamilyPlanningReport;
use App\Models\M1_Report\ServiceData;

class ReportStatus extends Model
{
    use HasFactory;

    protected $primaryKey = "report_status_id";

    protected $fillable = [
        'report_submission_id', 'user_id', 'status', 'submitted_at', 'admin_note', "projected_population"
    ];

    /**
     * Get the report submission associated with this status.
     */
    public function reportSubmission()
    {
        return $this->belongsTo(ReportSubmission::class, 'report_submission_id');
    }

    /**
     * Get the user associated with this status.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the women of reproductive age data associated with this report status.
     */
    public function womenOfReproductiveAge()
    {
        return $this->hasMany(WomenOfReproductiveAge::class, 'wra_id');
    }

    /**
     * Get the family planning reports associated with this report status.
     */
    public function familyPlanningReports()
    {
        return $this->hasMany(FamilyPlanningReport::class, 'report_id');
    }

    /**
     * Get the service data associated with this report status.
     */
    public function serviceData()
    {
        return $this->hasMany(ServiceData::class, 'service_data_id');
    }
}
