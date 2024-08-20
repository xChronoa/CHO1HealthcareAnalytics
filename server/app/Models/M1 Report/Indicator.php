<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Indicator extends Model
{
    use HasFactory;
    
    protected $fillable = ['indicator_name', 'service_id', 'parent_indicator_id'];

    /**
     * Get the parent indicator.
     */
    public function parentIndicator()
    {
        return $this->belongsTo(Indicator::class, 'parent_indicator_id');
    }

    /**
     * Get the child indicators.
     */
    public function childIndicators()
    {
        return $this->hasMany(Indicator::class, 'parent_indicator_id');
    }

    /**
     * Get the service this indicator is related to.
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
