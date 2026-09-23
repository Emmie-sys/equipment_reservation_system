<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\IncidentController;
use App\Http\Controllers\Api\SanctionController;
use App\Http\Controllers\Api\StudentController;

/*
|--------------------------------------------------------------------------
| API Routes (Section 6 Endpoints)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // 6.1 Authentication Routes (Public)
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login'])->name('auth.login');
        Route::post('refresh', [AuthController::class, 'refresh'])->name('auth.refresh');

        // Authenticated Auth Endpoints
        Route::middleware(['auth:api'])->group(function () {
            Route::get('me', [AuthController::class, 'me'])->name('auth.me');
            Route::post('logout', [AuthController::class, 'logout'])->name('auth.logout');
        });
    });

    // Protected Business Routes
    Route::middleware(['auth:api'])->group(function () {
        // 6.2 Student Endpoints
        Route::prefix('students')->group(function () {
            Route::get('/', [StudentController::class, 'index'])->name('students.index');
            Route::get('{id}', [StudentController::class, 'show'])->name('students.show');
            Route::get('{id}/demerit-summary', [StudentController::class, 'demeritSummary'])->name('students.demerits');
            Route::post('{id}/remit', [StudentController::class, 'remit'])
                ->middleware('role:ADMIN,DISCIPLINARY_OFFICER')
                ->name('students.remit');
        });

        // 6.3 Incident Endpoints
        Route::prefix('incidents')->group(function () {
            Route::get('/', [IncidentController::class, 'index'])->name('incidents.index');
            Route::post('/', [IncidentController::class, 'store'])
                ->middleware('role:ADMIN,DISCIPLINARY_OFFICER,TEACHER')
                ->name('incidents.store');
            Route::get('{id}', [IncidentController::class, 'show'])->name('incidents.show');
            Route::patch('{id}/status', [IncidentController::class, 'updateStatus'])
                ->middleware('role:ADMIN,DISCIPLINARY_OFFICER')
                ->name('incidents.status');
        });

        // 6.4 Sanction Endpoints
        Route::prefix('sanctions')->group(function () {
            Route::get('/', [SanctionController::class, 'index'])->name('sanctions.index');
            Route::post('/', [SanctionController::class, 'store'])
                ->middleware('role:ADMIN,DISCIPLINARY_OFFICER')
                ->name('sanctions.store');
            Route::get('{id}', [SanctionController::class, 'show'])->name('sanctions.show');
            Route::patch('{id}/complete', [SanctionController::class, 'complete'])
                ->middleware('role:ADMIN,DISCIPLINARY_OFFICER')
                ->name('sanctions.complete');
            Route::post('{id}/appeal', [SanctionController::class, 'appeal'])->name('sanctions.appeal');
        });
    });
});
