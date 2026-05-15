<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

abstract class BaseFormRequest extends FormRequest
{
    /**
     * Common failure response: redirect back with input.
     */
    protected function failedValidation(Validator $validator): never
    {
        throw new ValidationException($validator);
    }
}
