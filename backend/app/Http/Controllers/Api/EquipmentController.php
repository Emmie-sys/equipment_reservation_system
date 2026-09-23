<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Services\AvailabilityService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EquipmentController extends Controller
{
    public function __construct(
        protected AvailabilityService $availabilityService
    ) {}

    /**
     * GET /api/v1/equipment
     * Paginated, filterable equipment catalog
     */
    public function index(Request $request): JsonResponse
    {
        $query = Equipment::with([
            'model.category',
            'status',
            'room.building.campus',
        ]);

        if ($request->has('category_id')) {
            $query->whereHas('model', fn ($q) => $q->where('category_id', $request->query('category_id')));
        }

        if ($request->has('status')) {
            $query->whereHas('status', fn ($q) => $q->where('status_name', $request->query('status')));
        }

        if ($request->boolean('bookable_only', false)) {
            $query->where('is_bookable', true);
        }

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(fn ($q) =>
                $q->where('asset_tag', 'ilike', "%{$search}%")
                  ->orWhere('serial_number', 'ilike', "%{$search}%")
                  ->orWhereHas('model', fn ($mq) =>
                      $mq->where('model_name', 'ilike', "%{$search}%")
                         ->orWhere('manufacturer', 'ilike', "%{$search}%")
                  )
            );
        }

        $equipment = $query
            ->orderBy('created_at', 'desc')
            ->paginate($request->query('per_page', 20));

        return response()->json([
            'success' => true,
            'message' => 'Equipment catalog retrieved successfully.',
            'data' => $equipment->items(),
            'meta' => [
                'current_page' => $equipment->currentPage(),
                'total_pages' => $equipment->lastPage(),
                'total_records' => $equipment->total(),
            ],
        ]);
    }

    /**
     * GET /api/v1/equipment/{id}
     */
    public function show(int $id): JsonResponse
    {
        $equipment = Equipment::with([
            'model.category',
            'status',
            'room.building.campus',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Equipment details retrieved.',
            'data' => $equipment,
        ]);
    }

    /**
     * GET /api/v1/equipment/{id}/availability
     * Check if a specific unit is available for a given time window
     */
    public function checkAvailability(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'start_time' => 'required|date',
            'end_time'   => 'required|date|after:start_time',
        ]);

        $equipment = Equipment::findOrFail($id);

        $conflict = $this->availabilityService->getConflict(
            $id,
            $request->query('start_time'),
            $request->query('end_time')
        );

        return response()->json([
            'success' => true,
            'data' => [
                'equipment_id' => $id,
                'asset_tag' => $equipment->asset_tag,
                'is_available' => $conflict === null && $equipment->isAvailableForReservation(),
                'conflict' => $conflict,
            ],
        ]);
    }

    /**
     * POST /api/v1/equipment  (Admin / Technician only)
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Equipment::class);

        $validated = $request->validate([
            'model_id'        => 'required|integer|exists:equipment_models,model_id',
            'asset_tag'       => 'required|string|max:50|unique:equipment,asset_tag',
            'serial_number'   => 'nullable|string|max:100|unique:equipment,serial_number',
            'status_id'       => 'required|integer|exists:equipment_status_types,status_id',
            'current_room_id' => 'nullable|integer|exists:rooms,room_id',
            'purchase_date'   => 'nullable|date',
            'purchase_cost'   => 'nullable|numeric|min:0',
            'condition_notes' => 'nullable|string',
            'is_bookable'     => 'boolean',
        ]);

        $equipment = Equipment::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Equipment unit added to inventory.',
            'data' => $equipment->load(['model.category', 'status', 'room']),
        ], 201);
    }

    /**
     * PATCH /api/v1/equipment/{id}  (Admin / Technician only)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $equipment = Equipment::findOrFail($id);
        $this->authorize('update', $equipment);

        $validated = $request->validate([
            'status_id'       => 'sometimes|integer|exists:equipment_status_types,status_id',
            'current_room_id' => 'sometimes|nullable|integer|exists:rooms,room_id',
            'condition_notes' => 'sometimes|nullable|string',
            'is_bookable'     => 'sometimes|boolean',
        ]);

        $equipment->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Equipment record updated.',
            'data' => $equipment->refresh()->load(['model.category', 'status', 'room']),
        ]);
    }

    /**
     * DELETE /api/v1/equipment/{id}  (Admin only)
     */
    public function destroy(int $id): JsonResponse
    {
        $equipment = Equipment::findOrFail($id);
        $this->authorize('delete', $equipment);

        $equipment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Equipment unit removed from inventory.',
        ]);
    }
}
