<?php

namespace App\Policies;

use App\Models\Reservation;
use App\Models\User;

class ReservationPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can access — controller filters by ownership
    }

    public function view(User $user, Reservation $reservation): bool
    {
        if ($user->hasRole('ADMIN') || $user->hasRole('TECHNICIAN')) {
            return true;
        }
        return $reservation->requested_by_user_id === $user->user_id;
    }

    public function create(User $user): bool
    {
        return in_array(true, [
            $user->hasRole('STUDENT'),
            $user->hasRole('STAFF'),
            $user->hasRole('ADMIN'),
        ]);
    }

    public function approve(User $user, Reservation $reservation): bool
    {
        return $user->hasRole('ADMIN') || $user->hasRole('TECHNICIAN');
    }

    public function reject(User $user, Reservation $reservation): bool
    {
        return $user->hasRole('ADMIN') || $user->hasRole('TECHNICIAN');
    }

    public function cancel(User $user, Reservation $reservation): bool
    {
        if ($user->hasRole('ADMIN')) {
            return true;
        }
        return $reservation->requested_by_user_id === $user->user_id
            && in_array($reservation->status?->status_name, ['pending', 'approved']);
    }
}
