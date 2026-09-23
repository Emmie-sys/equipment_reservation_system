<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(
        protected AuditService $auditService
    ) {}

    /**
     * POST /api/v1/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::where('email', $request->input('email'))->first();

        if (!$user || !Hash::check($request->input('password'), $user->password_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is inactive. Please contact an administrator.',
            ], 403);
        }

        // Create a Sanctum token
        $token = $user->createToken('equipment-reservation-app')->plainTextToken;

        $this->auditService->log($user->user_id, 'USER_LOGIN', 'User', $user->user_id);

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'user_id'     => $user->user_id,
                    'email'       => $user->email,
                    'first_name'  => $user->first_name,
                    'last_name'   => $user->last_name,
                    'roles'       => $user->roles->pluck('role_name'),
                    'profile_photo_url' => $user->profile_photo_url,
                ],
            ],
        ]);
    }

    /**
     * POST /api/v1/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        // Revoke the current access token
        $request->user()->currentAccessToken()->delete();

        $this->auditService->log($user->user_id, 'USER_LOGOUT', 'User', $user->user_id);

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * GET /api/v1/auth/me
     * Returns the authenticated user's profile and roles
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['roles', 'department']);

        return response()->json([
            'success' => true,
            'data' => [
                'user_id'       => $user->user_id,
                'email'         => $user->email,
                'first_name'    => $user->first_name,
                'last_name'     => $user->last_name,
                'display_name'  => trim("{$user->first_name} {$user->last_name}"),
                'roles'         => $user->roles->pluck('role_name'),
                'department'    => $user->department?->department_name,
                'profile_photo_url' => $user->profile_photo_url,
            ],
        ]);
    }
}
