<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * User Model
 *
 * Represents a user in the system.
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */

    protected $table = 'users';
    protected $primaryKey = 'userId';
    protected $fillable = [
        'username',
        'email',
        'password',
        'role',
        'barangayId',
        'status'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => 'string'
        ];
    }

    /**
     * Get the barangay that the user belongs to.
     */
    public function barangay()
    {
        return $this->belongsTo(Barangay::class, 'barangayId');
    }

    /**
     * Get the report statuses associated with the user.
     */
    public function reportStatuses()
    {
        return $this->hasMany(ReportStatus::class, 'userId');
    }

    /**
     * Get the family planning reports submitted by the user.
     */
    public function familyPlanningReports()
    {
        return $this->hasMany(FamilyPlanningReport::class, 'userId');
    }

    /**
     * Get the morbidity reports submitted by the user.
     */
    public function morbidityReports()
    {
        return $this->hasMany(MorbidityReport::class, 'userId');
    }

    /**
     * Get the service data entries created by the user.
     */
    public function serviceData()
    {
        return $this->hasMany(ServiceData::class, 'userId');
    }
}
