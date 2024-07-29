<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Report Status Model
 *
 * Represents the status of a report submitted by a user.
 */

class ReportStatus extends Model
{
    use HasFactory;

    protected $table = 'report_statuses';
    protected $primaryKey = 'reportStatusId';
    protected $fillable = ['userId', 'dateSubmitted', 'status'];

    /**
     * Get the user that submitted the report.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }
}
