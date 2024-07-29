<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Service Model
 *
 * Represents a service in the health system.
 */
class Service extends Model
{
    use HasFactory;

    protected $table = 'services';
    protected $primaryKey = 'serviceId';
    protected $fillable = ['serviceName'];

    /**
     * Get the indicators associated with the service.
     */
    public function indicators()
    {
        return $this->hasMany(Indicator::class, 'serviceId');
    }

    /**
     * Get the service data entries for the service.
     */
    public function serviceData()
    {
        return $this->hasMany(ServiceData::class, 'serviceId');
    }
}
