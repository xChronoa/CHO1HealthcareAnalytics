<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportSubmission extends Model
{
    use HasFactory;

    protected $fillable = ['report_submission_template_id', 'barangay_id', 'status', 'due_at'];

    /**
     * Get the report submission template associated with this submission.
     */
    public function reportTemplate()
    {
        return $this->belongsTo(ReportSubmissionTemplate::class, 'report_submission_template_id');
    }

    /**
     * Get the barangay associated with this submission.
     */
    public function barangay()
    {
        return $this->belongsTo(Barangay::class, 'barangay_id');
    }

    /**
     * Get the statuses for this report submission.
     */
    public function reportStatuses()
    {
        return $this->hasMany(ReportStatus::class);
    }
}
