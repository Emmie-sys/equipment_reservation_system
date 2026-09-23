<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EquipmentModel extends Model
{
    protected $table = 'equipment_models';
    protected $primaryKey = 'model_id';

    protected $fillable = [
        'category_id',
        'supplier_id',
        'model_name',
        'manufacturer',
        'model_number',
        'specifications',
        'standard_usage_instructions',
        'unit_of_measure',
        'replacement_cost',
        'requires_certification',
        'is_active',
    ];

    protected $casts = [
        'requires_certification' => 'boolean',
        'is_active' => 'boolean',
        'replacement_cost' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(EquipmentCategory::class, 'category_id', 'category_id');
    }

    public function equipment()
    {
        return $this->hasMany(Equipment::class, 'model_id', 'model_id');
    }
}
