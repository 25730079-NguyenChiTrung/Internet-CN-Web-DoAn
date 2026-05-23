<?php

namespace App\Http\Requests;

class WatchlistRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stock_id' => ['required', 'integer', 'exists:stocks,id'],
        ];
    }
}
