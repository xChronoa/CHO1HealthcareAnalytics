<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Indicator Model
 *
 * Represents an indicator associated with a specific service.
 */
class Indicator extends Model
{
    use HasFactory;

    protected $table = 'indicators';
    protected $primaryKey = 'indicatorId';
    protected $fillable = ['serviceId', 'indicatorName'];

    /**
     * Get the service that the indicator is associated with.
     */
    public function service()
    {
        return $this->belongsTo(Service::class, 'serviceId');
    }

    /**
     * Get the service data entries for the indicator.
     */
    public function serviceData()
    {
        return $this->hasMany(ServiceData::class, 'indicatorId');
    }
}
