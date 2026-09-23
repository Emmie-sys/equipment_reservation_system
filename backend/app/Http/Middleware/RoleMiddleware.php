<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request and ensure user has one of the allowed roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !in_array($user->role, $roles)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. Insufficient permissions for this resource.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
