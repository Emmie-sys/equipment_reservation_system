<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EquipmentStatusType extends Model
{
    protected $table = 'equipment_status_types';
    protected $primaryKey = 'status_id';
    public $timestamps = false;

    protected $fillable = ['status_name'];

    public function equipment()
    {
        return $this->hasMany(Equipment::class, 'status_id', 'status_id');
    }
}
