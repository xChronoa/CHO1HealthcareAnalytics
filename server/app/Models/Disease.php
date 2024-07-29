<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Disease Model
 *
 * Represents a disease and its associated morbidity reports.
 */
class Disease extends Model
{
    use HasFactory;

    protected $table = 'diseases';
    protected $primaryKey = 'diseaseId';
    protected $fillable = ['diseaseName', 'diseaseCode'];

    /**
     * Get the morbidity reports associated with the disease.
     */
    public function morbidityReports()
    {
        return $this->hasMany(MorbidityReport::class, 'diseaseId');
    }
}
