<?php

namespace App\Models\Appointment;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    protected $primaryKey = 'patient_id';

    protected $fillable = [
        'first_name',
        'last_name',
        'sex',
        'birthdate',
        'address',
        'email',
        'phone_number',
    ];

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
