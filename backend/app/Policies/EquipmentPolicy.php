<?php

namespace App\Policies;

use App\Models\Equipment;
use App\Models\User;

class EquipmentPolicy
{
    public function viewAny(?User $user): bool
    {
        return true; // Equipment catalog is visible to authenticated users
    }

    public function create(User $user): bool
    {
        return $user->hasRole('ADMIN') || $user->hasRole('TECHNICIAN');
    }

    public function update(User $user, Equipment $equipment): bool
    {
        return $user->hasRole('ADMIN') || $user->hasRole('TECHNICIAN');
    }

    public function delete(User $user, Equipment $equipment): bool
    {
        return $user->hasRole('ADMIN');
    }
}
