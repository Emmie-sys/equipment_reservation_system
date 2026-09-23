<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservationStatusHistory extends Model
{
    protected $table = 'reservation_status_history';
    protected $primaryKey = 'history_id';

    const UPDATED_AT = null;

    protected $fillable = [
        'reservation_id',
        'old_status_id',
        'new_status_id',
        'changed_by_user_id',
        'notes',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'reservation_id', 'reservation_id');
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by_user_id', 'user_id');
    }
}
