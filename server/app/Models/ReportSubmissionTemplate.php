<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportSubmissionTemplate extends Model
{
    use HasFactory;

    protected $primaryKey = 'report_submission_template_id';

    protected $fillable = ['admin_id', 'report_type', 'report_month', 'report_year'];

    /**
     * Get the admin who created this report submission template.
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get the report submissions for this template.
     */
    public function reportSubmissions()
    {
        return $this->hasMany(ReportSubmission::class, 'report_submission_id');
    }
}
