<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Appointment Category Model
 *
 * Represents a category of appointments.
 */
class AppointmentCategory extends Model
{
    use HasFactory;

    protected $table = 'appointment_categories';
    protected $primaryKey = 'apptCategoryId';
    protected $fillable = ['apptCategoryName'];

    /**
     * Get the appointments for the category.
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'apptCategoryId');
    }
}