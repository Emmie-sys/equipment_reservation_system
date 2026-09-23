<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EquipmentController;
use App\Http\Controllers\Api\ReservationController;

/*
|--------------------------------------------------------------------------
| API Routes  —  Equipment Reservation System  (v1)
|--------------------------------------------------------------------------
|
| All routes here are prefixed with /api/v1 via RouteServiceProvider.
|
*/

// ─── Public ───────────────────────────────────────────────────────────────────

Route::prefix('v1')->group(function () {

    // Authentication
    Route::prefix('auth')->group(function () {
        Route::post('login',  [AuthController::class, 'login']);
        Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
        Route::get('me',      [AuthController::class, 'me'])->middleware('auth:sanctum');
    });

    // ─── Protected ────────────────────────────────────────────────────────────

    Route::middleware('auth:sanctum')->group(function () {

        // ── Equipment ──────────────────────────────────────────────────────────
        Route::prefix('equipment')->group(function () {
            Route::get('/',            [EquipmentController::class, 'index']);    // Catalog
            Route::post('/',           [EquipmentController::class, 'store']);    // Admin/Tech add
            Route::get('{id}',         [EquipmentController::class, 'show']);     // Single unit
            Route::patch('{id}',       [EquipmentController::class, 'update']);   // Admin/Tech update
            Route::delete('{id}',      [EquipmentController::class, 'destroy']);  // Admin delete
            Route::get('{id}/availability', [EquipmentController::class, 'checkAvailability']); // Availability window
        });

        // ── Reservations ───────────────────────────────────────────────────────
        Route::prefix('reservations')->group(function () {
            Route::get('/',                        [ReservationController::class, 'index']);   // List (scoped)
            Route::post('/',                       [ReservationController::class, 'store']);   // Submit
            Route::get('{id}',                     [ReservationController::class, 'show']);    // Detail
            Route::patch('{id}/approve',           [ReservationController::class, 'approve']); // Admin/Tech approve
            Route::patch('{id}/reject',            [ReservationController::class, 'reject']);  // Admin/Tech reject
            Route::patch('{id}/cancel',            [ReservationController::class, 'cancel']);  // Owner/Admin cancel
        });

    });
});
