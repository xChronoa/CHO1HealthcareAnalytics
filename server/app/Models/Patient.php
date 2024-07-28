<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Patient Model
 *
 * Represents a patient in the system.
 */
class Patient extends Model
{
    use HasFactory;

    protected $table = 'patients';
    protected $primaryKey = 'patientId';
    protected $fillable = ['name', 'sex', 'dateOfBirth', 'address', 'phoneNumber', 'email'];

    /**
     * Get the appointments for the patient.
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'patientId');
    }
}
