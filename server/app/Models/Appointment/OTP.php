<?php

namespace App\Models\Appointment;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OTP extends Model
{
    use HasFactory;

    protected $fillable = ['patient_id', 'otp_code', 'is_verified', 'expires_at'];

    /**
     * Get the patient associated with this OTP.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
