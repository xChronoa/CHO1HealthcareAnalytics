<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Service Data Model
 *
 * Represents data associated with a specific service indicator.
 */
class ServiceData extends Model
{
    use HasFactory;

    protected $table = 'service_data';
    protected $primaryKey = 'serviceDataId';
    protected $fillable = [
        'serviceId', 'indicatorId', 'userId', 'ageId', 
        'totalMale', 'totalFemale', 'remarks', 'month', 'year'
    ];

    /**
     * Get the service that the data is associated with.
     */
    public function service()
    {
        return $this->belongsTo(Service::class, 'serviceId');
    }

    /**
     * Get the indicator that the data is associated with.
     */
    public function indicator()
    {
        return $this->belongsTo(Indicator::class, 'indicatorId');
    }

    /**
     * Get the user that recorded the data.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }

    /**
     * Get the age category for the service data.
     */
    public function ageCategory()
    {
        return $this->belongsTo(AgeCategory::class, 'ageId');
    }
}
