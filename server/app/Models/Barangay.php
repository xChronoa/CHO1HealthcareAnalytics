<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Barangay Model
 *
 * Represents a barangay (local district) and its associated users.
 */
class Barangay extends Model
{
    use HasFactory;

    protected $table = 'barangays';
    protected $primaryKey = 'barangayId';
    protected $fillable = ['barangayName'];

    /**
     * Get the users for the barangay.
     */
    public function users()
    {
        return $this->hasMany(User::class, 'barangayId');
    }
}
