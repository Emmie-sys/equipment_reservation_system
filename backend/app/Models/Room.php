<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $table = 'rooms';
    protected $primaryKey = 'room_id';

    protected $fillable = [
        'building_id',
        'room_code',
        'room_name',
        'room_type',
        'floor_number',
        'capacity',
        'is_bookable_space',
    ];

    protected $casts = [
        'is_bookable_space' => 'boolean',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class, 'building_id', 'building_id');
    }

    public function equipment()
    {
        return $this->hasMany(Equipment::class, 'current_room_id', 'room_id');
    }
}
