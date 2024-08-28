<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    use HasFactory;

    protected $primaryKey = "barangay_id";

    protected $fillable = ['barangay_id', 'barangay_name'];

    /**
     * Get all users associated with the barangay.
     */
    public function users()
    {
        return $this->hasMany(User::class, 'barangay_id');
    }
}
