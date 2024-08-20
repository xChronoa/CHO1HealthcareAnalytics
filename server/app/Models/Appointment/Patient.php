<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    /**
     * Get all appointments for the patient.
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get all OTP verifications for the patient.
     */
    public function otpVerifications()
    {
        return $this->hasMany(OTP::class);
    }
}
