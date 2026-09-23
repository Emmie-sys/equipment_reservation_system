<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservationStatusType extends Model
{
    protected $table = 'reservation_status_types';
    protected $primaryKey = 'status_id';
    public $timestamps = false;

    protected $fillable = ['status_name'];
}
