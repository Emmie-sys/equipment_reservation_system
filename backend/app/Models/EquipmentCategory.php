<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EquipmentCategory extends Model
{
    protected $table = 'equipment_categories';
    protected $primaryKey = 'category_id';
    public $timestamps = false;

    protected $fillable = [
        'parent_category_id',
        'category_name',
        'category_code',
        'description',
        'requires_certification',
    ];

    protected $casts = [
        'requires_certification' => 'boolean',
    ];

    public function models()
    {
        return $this->hasMany(EquipmentModel::class, 'category_id', 'category_id');
    }

    public function parent()
    {
        return $this->belongsTo(EquipmentCategory::class, 'parent_category_id', 'category_id');
    }
}
