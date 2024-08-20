<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id', 'appointment_date', 'appointment_category_id', 
        'patient_note', 'queue_number'
    ];

    /**
     * Get the patient for this appointment.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the category for this appointment.
     */
    public function category()
    {
        return $this->belongsTo(AppointmentCategory::class, 'appointment_category_id');
    }
}
