<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Approval extends Model
{
    protected $table = 'approvals';
    protected $primaryKey = 'approval_id';

    const UPDATED_AT = null;
    const CREATED_AT = 'decided_at';

    protected $fillable = [
        'reservation_id',
        'approver_user_id',
        'decision',
        'decision_reason',
    ];

    protected $casts = [
        'decided_at' => 'datetime',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'reservation_id', 'reservation_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_user_id', 'user_id');
    }
}
