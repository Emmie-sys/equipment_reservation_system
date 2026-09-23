<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    protected $table = 'equipment';
    protected $primaryKey = 'equipment_id';

    protected $fillable = [
        'model_id',
        'asset_tag',
        'serial_number',
        'status_id',
        'current_room_id',
        'purchase_date',
        'purchase_cost',
        'warranty_expiry_date',
        'condition_notes',
        'barcode_value',
        'is_bookable',
    ];

    protected $casts = [
        'is_bookable' => 'boolean',
        'purchase_date' => 'date',
        'warranty_expiry_date' => 'date',
        'purchase_cost' => 'decimal:2',
    ];

    public function model()
    {
        return $this->belongsTo(EquipmentModel::class, 'model_id', 'model_id');
    }

    public function status()
    {
        return $this->belongsTo(EquipmentStatusType::class, 'status_id', 'status_id');
    }

    public function room()
    {
        return $this->belongsTo(Room::class, 'current_room_id', 'room_id');
    }

    public function reservationItems()
    {
        return $this->hasMany(ReservationItem::class, 'equipment_id', 'equipment_id');
    }

    /**
     * Determines if equipment is in a state that allows it to be booked
     */
    public function isAvailableForReservation(): bool
    {
        return $this->is_bookable
            && in_array($this->status?->status_name, ['available', 'reserved']);
    }
}
