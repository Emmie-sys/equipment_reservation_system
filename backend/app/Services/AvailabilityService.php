<?php

namespace App\Services;

use App\Models\Equipment;
use App\Models\Reservation;
use App\Models\ReservationItem;
use App\Models\ReservationStatusType;
use Illuminate\Support\Facades\DB;

class AvailabilityService
{
    /**
     * Check whether a specific equipment unit has a schedule conflict
     * Uses the half-open interval: [start, end) overlap test
     */
    public function hasConflict(int $equipmentId, string $startTime, string $endTime, ?int $excludeReservationId = null): bool
    {
        $query = ReservationItem::query()
            ->join('reservations as r', 'reservation_items.reservation_id', '=', 'r.reservation_id')
            ->join('reservation_status_types as rst', 'r.status_id', '=', 'rst.status_id')
            ->where('reservation_items.equipment_id', $equipmentId)
            ->whereIn('rst.status_name', ['pending', 'approved', 'active'])
            ->where('r.requested_start_datetime', '<', $endTime)
            ->where('r.requested_end_datetime', '>', $startTime);

        if ($excludeReservationId) {
            $query->where('r.reservation_id', '!=', $excludeReservationId);
        }

        return $query->exists();
    }

    /**
     * Returns the conflicting reservation details if any conflict exists
     */
    public function getConflict(int $equipmentId, string $startTime, string $endTime, ?int $excludeReservationId = null): ?array
    {
        $conflict = DB::table('reservation_items as ri')
            ->join('reservations as r', 'ri.reservation_id', '=', 'r.reservation_id')
            ->join('reservation_status_types as rst', 'r.status_id', '=', 'rst.status_id')
            ->where('ri.equipment_id', $equipmentId)
            ->whereIn('rst.status_name', ['pending', 'approved', 'active'])
            ->where('r.requested_start_datetime', '<', $endTime)
            ->where('r.requested_end_datetime', '>', $startTime)
            ->when($excludeReservationId, fn ($q) => $q->where('r.reservation_id', '!=', $excludeReservationId))
            ->select(
                'r.reservation_id',
                'r.requested_start_datetime as conflict_start',
                'r.requested_end_datetime as conflict_end',
                'rst.status_name as status'
            )
            ->first();

        return $conflict ? (array) $conflict : null;
    }

    /**
     * Retrieve all available equipment units for a model during a requested window
     */
    public function getAvailableUnitsByModel(int $modelId, string $startTime, string $endTime): \Illuminate\Support\Collection
    {
        $conflictingEquipmentIds = DB::table('reservation_items as ri')
            ->join('reservations as r', 'ri.reservation_id', '=', 'r.reservation_id')
            ->join('reservation_status_types as rst', 'r.status_id', '=', 'rst.status_id')
            ->whereIn('rst.status_name', ['pending', 'approved', 'active'])
            ->where('r.requested_start_datetime', '<', $endTime)
            ->where('r.requested_end_datetime', '>', $startTime)
            ->whereNotNull('ri.equipment_id')
            ->pluck('ri.equipment_id');

        return Equipment::with(['status', 'room.building'])
            ->where('model_id', $modelId)
            ->where('is_bookable', true)
            ->whereHas('status', fn ($q) => $q->whereIn('status_name', ['available', 'reserved']))
            ->whereNotIn('equipment_id', $conflictingEquipmentIds)
            ->get();
    }
}
