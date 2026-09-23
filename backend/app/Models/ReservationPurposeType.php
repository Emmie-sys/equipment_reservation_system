<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservationPurposeType extends Model
{
    protected $table = 'reservation_purpose_types';
    protected $primaryKey = 'purpose_type_id';
    public $timestamps = false;

    protected $fillable = ['purpose_name'];
}
