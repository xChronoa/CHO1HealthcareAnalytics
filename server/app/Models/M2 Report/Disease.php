<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disease extends Model
{
    use HasFactory;

    protected $fillable = [
        'disease_name',
        'disease_code'
    ];

    /**
     * Get the morbidity reports for this disease.
     */
    public function morbidityReports()
    {
        return $this->hasMany(MorbidityReport::class);
    }
}
