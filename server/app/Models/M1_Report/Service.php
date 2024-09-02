<?php

namespace App\Models\M1_Report;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $primaryKey = "service_id";

    protected $fillable = ['service_name'];

    /**
     * Get the indicators related to this service.
     */
    public function indicators()
    {
        return $this->hasMany(Indicator::class, "indicator_id");
    }
}
