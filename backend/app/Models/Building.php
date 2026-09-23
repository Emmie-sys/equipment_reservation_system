<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Building extends Model
{
    protected $table = 'buildings';
    protected $primaryKey = 'building_id';

    protected $fillable = [
        'campus_id',
        'building_name',
        'building_code',
        'number_of_floors',
    ];

    public function campus()
    {
        return $this->belongsTo(Campus::class, 'campus_id', 'campus_id');
    }

    public function rooms()
    {
        return $this->hasMany(Room::class, 'building_id', 'building_id');
    }
}
