<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppointmentCategory extends Model
{
    use HasFactory;

    protected $fillable = ['appointment_category_name'];

    /**
     * Get all appointments associated with this category.
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}
