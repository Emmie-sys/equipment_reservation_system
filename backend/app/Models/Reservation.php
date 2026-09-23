<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $table = 'reservations';
    protected $primaryKey = 'reservation_id';

    const CREATED_AT = 'submitted_at';
    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'requested_by_user_id',
        'course_offering_id',
        'purpose_type_id',
        'purpose_details',
        'status_id',
        'requested_start_datetime',
        'requested_end_datetime',
        'pickup_room_id',
    ];

    protected $casts = [
        'requested_start_datetime' => 'datetime',
        'requested_end_datetime' => 'datetime',
        'submitted_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by_user_id', 'user_id');
    }

    public function status()
    {
        return $this->belongsTo(ReservationStatusType::class, 'status_id', 'status_id');
    }

    public function purposeType()
    {
        return $this->belongsTo(ReservationPurposeType::class, 'purpose_type_id', 'purpose_type_id');
    }

    public function pickupRoom()
    {
        return $this->belongsTo(Room::class, 'pickup_room_id', 'room_id');
    }

    public function items()
    {
        return $this->hasMany(ReservationItem::class, 'reservation_id', 'reservation_id');
    }

    public function approvals()
    {
        return $this->hasMany(Approval::class, 'reservation_id', 'reservation_id');
    }

    public function statusHistory()
    {
        return $this->hasMany(ReservationStatusHistory::class, 'reservation_id', 'reservation_id');
    }
}
