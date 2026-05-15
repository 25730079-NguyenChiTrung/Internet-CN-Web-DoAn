<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            return redirect()->route('login');
        }

        if ($request->user()->role !== 'admin') {
            Log::channel('security')->warning('Unauthorized admin access attempt', [
                'user_id' => $request->user()->id,
                'route' => $request->path(),
                'ip' => $request->ip(),
            ]);

            abort(403, 'Bạn không có quyền truy cập trang này');
        }

        return $next($request);
    }
}
