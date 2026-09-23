<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
use App\Models\Reservation;
use App\Services\ReservationService;
use App\Exceptions\EquipmentConflictException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReservationController extends Controller
{
    public function __construct(
        protected ReservationService $reservationService
    ) {}

    /**
     * GET /api/v1/reservations
     * Admins/Technicians see all; students/staff see only their own
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Reservation::with([
            'status',
            'purposeType',
            'requester',
            'items.equipment.model.category',
            'approvals.approver',
        ]);

        // Scope to own reservations unless admin or technician
        if (!$user->hasRole('ADMIN') && !$user->hasRole('TECHNICIAN')) {
            $query->where('requested_by_user_id', $user->user_id);
        }

        if ($request->has('status')) {
            $query->whereHas('status', fn ($q) => $q->where('status_name', $request->query('status')));
        }

        $reservations = $query
            ->orderBy('submitted_at', 'desc')
            ->paginate($request->query('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Reservations retrieved successfully.',
            'data' => $reservations->items(),
            'meta' => [
                'current_page' => $reservations->currentPage(),
                'total_pages' => $reservations->lastPage(),
                'total_records' => $reservations->total(),
            ],
        ]);
    }

    /**
     * GET /api/v1/reservations/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $reservation = Reservation::with([
            'status',
            'purposeType',
            'requester',
            'items.equipment.model.category',
            'items.equipment.room',
            'approvals.approver',
            'statusHistory.changedBy',
            'pickupRoom.building',
        ])->findOrFail($id);

        $this->authorize('view', $reservation);

        return response()->json([
            'success' => true,
            'message' => 'Reservation details retrieved.',
            'data' => $reservation,
        ]);
    }

    /**
     * POST /api/v1/reservations
     */
    public function store(StoreReservationRequest $request): JsonResponse
    {
        $this->authorize('create', Reservation::class);

        try {
            $reservation = $this->reservationService->create(
                $request->validated(),
                $request->user()->user_id
            );

            return response()->json([
                'success' => true,
                'message' => 'Reservation submitted successfully and is pending approval.',
                'data' => $reservation,
            ], 201);

        } catch (EquipmentConflictException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => [
                    'conflict' => $e->getConflict(),
                ],
            ], 409);
        }
    }

    /**
     * PATCH /api/v1/reservations/{id}/approve
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $reservation = Reservation::findOrFail($id);
        $this->authorize('approve', $reservation);

        if ($reservation->status?->status_name !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only reservations with a pending status can be approved.',
            ], 422);
        }

        $updated = $this->reservationService->approve(
            $reservation,
            $request->user()->user_id,
            $request->input('comments')
        );

        return response()->json([
            'success' => true,
            'message' => 'Reservation approved successfully.',
            'data' => $updated,
        ]);
    }

    /**
     * PATCH /api/v1/reservations/{id}/reject
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|min:5',
        ]);

        $reservation = Reservation::findOrFail($id);
        $this->authorize('reject', $reservation);

        if (!in_array($reservation->status?->status_name, ['pending', 'approved'])) {
            return response()->json([
                'success' => false,
                'message' => 'This reservation cannot be rejected at its current status.',
            ], 422);
        }

        $updated = $this->reservationService->reject(
            $reservation,
            $request->user()->user_id,
            $request->input('reason')
        );

        return response()->json([
            'success' => true,
            'message' => 'Reservation rejected.',
            'data' => $updated,
        ]);
    }

    /**
     * PATCH /api/v1/reservations/{id}/cancel
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $reservation = Reservation::findOrFail($id);
        $this->authorize('cancel', $reservation);

        if (in_array($reservation->status?->status_name, ['completed', 'cancelled', 'rejected'])) {
            return response()->json([
                'success' => false,
                'message' => 'This reservation has already been finalised and cannot be cancelled.',
            ], 422);
        }

        $updated = $this->reservationService->cancel($reservation, $request->user()->user_id);

        return response()->json([
            'success' => true,
            'message' => 'Reservation cancelled successfully.',
            'data' => $updated,
        ]);
    }
}
