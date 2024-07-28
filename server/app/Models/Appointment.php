<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Appointment Model
 *
 * Represents an appointment for a patient.
 */
class Appointment extends Model
{
    use HasFactory;

    protected $table = 'appointments';
    protected $primaryKey = 'apptId';
    protected $fillable = ['patientId', 'apptDate', 'apptCategoryId'];

    /**
     * Get the patient that owns the appointment.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientId');
    }

    /**
     * Get the category of the appointment.
     */
    public function category()
    {
        return $this->belongsTo(AppointmentCategory::class, 'apptCategoryId');
    }
}