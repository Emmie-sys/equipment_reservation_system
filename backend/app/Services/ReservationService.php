<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\ReservationItem;
use App\Models\ReservationStatusType;
use App\Models\ReservationStatusHistory;
use App\Models\Approval;
use Illuminate\Support\Facades\DB;

class ReservationService
{
    public function __construct(
        protected AvailabilityService $availabilityService,
        protected AuditService $auditService
    ) {}

    /**
     * Create a new reservation with conflict validation
     * Returns the created Reservation or throws on conflict/validation failure
     */
    public function create(array $data, int $requestingUserId): Reservation
    {
        return DB::transaction(function () use ($data, $requestingUserId) {
            // Resolve "pending" status ID
            $pendingStatus = ReservationStatusType::where('status_name', 'pending')->firstOrFail();

            // Create the reservation header
            $reservation = Reservation::create([
                'requested_by_user_id' => $requestingUserId,
                'purpose_type_id' => $data['purpose_type_id'],
                'purpose_details' => $data['purpose_details'] ?? null,
                'status_id' => $pendingStatus->status_id,
                'requested_start_datetime' => $data['start_time'],
                'requested_end_datetime' => $data['end_time'],
                'pickup_room_id' => $data['pickup_room_id'] ?? null,
            ]);

            // Check availability before committing equipment
            $conflict = $this->availabilityService->getConflict(
                $data['equipment_id'],
                $data['start_time'],
                $data['end_time']
            );

            if ($conflict) {
                // Roll back by throwing — DB::transaction will catch this
                throw new \App\Exceptions\EquipmentConflictException(
                    "Equipment is already reserved during the requested period.",
                    $conflict
                );
            }

            // Attach equipment line item
            ReservationItem::create([
                'reservation_id' => $reservation->reservation_id,
                'model_id' => $data['model_id'] ?? null,
                'equipment_id' => $data['equipment_id'],
                'quantity_requested' => 1,
                'line_status' => 'pending',
            ]);

            // Log initial status history
            $this->recordStatusChange($reservation, null, $pendingStatus->status_id, $requestingUserId, 'Reservation submitted by user.');

            $this->auditService->log($requestingUserId, 'RESERVATION_CREATED', 'Reservation', $reservation->reservation_id);

            return $reservation->load(['status', 'items.equipment.model', 'purposeType']);
        });
    }

    /**
     * Approve a pending reservation
     */
    public function approve(Reservation $reservation, int $approverUserId, ?string $reason = null): Reservation
    {
        return DB::transaction(function () use ($reservation, $approverUserId, $reason) {
            $approvedStatus = ReservationStatusType::where('status_name', 'approved')->firstOrFail();

            $oldStatusId = $reservation->status_id;
            $reservation->status_id = $approvedStatus->status_id;
            $reservation->save();

            Approval::create([
                'reservation_id' => $reservation->reservation_id,
                'approver_user_id' => $approverUserId,
                'decision' => 'approved',
                'decision_reason' => $reason,
            ]);

            $this->recordStatusChange($reservation, $oldStatusId, $approvedStatus->status_id, $approverUserId, $reason ?? 'Approved by administrator.');
            $this->auditService->log($approverUserId, 'RESERVATION_APPROVED', 'Reservation', $reservation->reservation_id);

            return $reservation->refresh()->load(['status', 'items', 'approvals.approver']);
        });
    }

    /**
     * Reject a pending reservation
     */
    public function reject(Reservation $reservation, int $approverUserId, string $reason): Reservation
    {
        return DB::transaction(function () use ($reservation, $approverUserId, $reason) {
            $rejectedStatus = ReservationStatusType::where('status_name', 'rejected')->firstOrFail();

            $oldStatusId = $reservation->status_id;
            $reservation->status_id = $rejectedStatus->status_id;
            $reservation->save();

            Approval::create([
                'reservation_id' => $reservation->reservation_id,
                'approver_user_id' => $approverUserId,
                'decision' => 'rejected',
                'decision_reason' => $reason,
            ]);

            $this->recordStatusChange($reservation, $oldStatusId, $rejectedStatus->status_id, $approverUserId, $reason);
            $this->auditService->log($approverUserId, 'RESERVATION_REJECTED', 'Reservation', $reservation->reservation_id);

            return $reservation->refresh()->load(['status', 'approvals.approver']);
        });
    }

    /**
     * Cancel a reservation (by owner or admin)
     */
    public function cancel(Reservation $reservation, int $cancellingUserId): Reservation
    {
        return DB::transaction(function () use ($reservation, $cancellingUserId) {
            $cancelledStatus = ReservationStatusType::where('status_name', 'cancelled')->firstOrFail();

            $oldStatusId = $reservation->status_id;
            $reservation->status_id = $cancelledStatus->status_id;
            $reservation->save();

            $this->recordStatusChange($reservation, $oldStatusId, $cancelledStatus->status_id, $cancellingUserId, 'Reservation cancelled.');
            $this->auditService->log($cancellingUserId, 'RESERVATION_CANCELLED', 'Reservation', $reservation->reservation_id);

            return $reservation->refresh()->load(['status']);
        });
    }

    protected function recordStatusChange(Reservation $reservation, ?int $oldStatusId, int $newStatusId, int $userId, string $notes): void
    {
        ReservationStatusHistory::create([
            'reservation_id' => $reservation->reservation_id,
            'old_status_id' => $oldStatusId,
            'new_status_id' => $newStatusId,
            'changed_by_user_id' => $userId,
            'notes' => $notes,
        ]);
    }
}
