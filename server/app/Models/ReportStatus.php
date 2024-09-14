<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportStatus extends Model
{
    use HasFactory;

    protected $primaryKey = "report_status_id";

    protected $fillable = [
        'report_submission_id', 'user_id', 'status', 'submitted_at', 'admin_note'
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
}
