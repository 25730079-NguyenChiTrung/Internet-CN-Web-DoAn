<?php

namespace App\Http\Requests;

class DepositRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'integer', 'min:1', 'max:10000000000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'Vui lòng nhập số tiền cần nạp.',
            'amount.integer' => 'Số tiền nạp phải là số nguyên.',
            'amount.min' => 'Số tiền nạp tối thiểu là 1 ₫.',
            'amount.max' => 'Số tiền nạp tối đa là 10.000.000.000 ₫.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'amount' => 'số tiền',
        ];
    }
}
