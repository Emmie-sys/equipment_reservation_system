<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservationItem extends Model
{
    protected $table = 'reservation_items';
    protected $primaryKey = 'reservation_item_id';
    public $timestamps = false;

    protected $fillable = [
        'reservation_id',
        'model_id',
        'equipment_id',
        'kit_id',
        'quantity_requested',
        'line_status',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'reservation_id', 'reservation_id');
    }

    public function equipment()
    {
        return $this->belongsTo(Equipment::class, 'equipment_id', 'equipment_id');
    }

    public function model()
    {
        return $this->belongsTo(EquipmentModel::class, 'model_id', 'model_id');
    }
}
