<?php

namespace App\Models\Appointment;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    const STATUS_PENDING = 'pending';
    const STATUS_COMPLETE = 'complete';
    const STATUS_NO_SHOW = 'no-show';

    protected $primaryKey = 'appointment_id';

    protected $fillable = [
        'patient_id', 
        'appointment_date', 
        'appointment_category_id', 
        'patient_note', 
        'queue_number',
        'status'
    ];

    /**
     * Get the patient associated with the appointment.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    /**
     * Get the category associated with the appointment.
     */
    public function category()
    {
        return $this->belongsTo(AppointmentCategory::class, 'appointment_category_id');
    }

    /**
     * Scope a query to include appointments with their related patient and category.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithPatientAndCategory($query)
    {
        return $query->with(['patient', 'category']);
    }

    /**
     * Format the appointment data for the front-end.
     *
     * @return array
     */
    public function formatForFrontEnd()
    {
        return [
            'patient' => [
                'id' => $this->patient->patient_id,
                'name' => $this->patient->name,
                'sex' => $this->patient->sex,
                'birthdate' => $this->patient->birthdate,
                'address' => $this->patient->address,
                'email' => $this->patient->email,
                'phone_number' => $this->patient->phone_number,
            ],
            'appointment_date' => $this->appointment_date,
            'appointment_category' => [
                'id' => $this->category->appointment_category_id,
                'name' => $this->category->appointment_category_name,
            ],
        ];
    }
}
