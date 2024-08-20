<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamilyPlanningMethods extends Model
{
    use HasFactory;

    protected $fillable = ['method_name', 'parent_method_id'];

    /**
     * Get the parent method for this method.
     */
    public function parentMethod()
    {
        return $this->belongsTo(FamilyPlanningMethods::class, 'parent_method_id');
    }

    /**
     * Get the child methods for this method.
     */
    public function childMethods()
    {
        return $this->hasMany(FamilyPlanningMethods::class, 'parent_method_id');
    }
}
