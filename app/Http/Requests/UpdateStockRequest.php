<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateStockRequest extends BaseFormRequest
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
            'symbol' => ['prohibited'],
            'company_name' => ['required', 'string', 'max:255'],
            'sector' => ['nullable', 'string', 'max:100', Rule::in(StoreStockRequest::SECTORS)],
            'exchange' => ['required', Rule::in(['HOSE', 'HNX', 'UPCOM'])],
            'current_price' => ['required', 'numeric', 'min:0'],
            'previous_close' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'symbol.prohibited' => 'Không thể thay đổi mã cổ phiếu.',
            'company_name.required' => 'Vui lòng nhập tên công ty.',
            'company_name.string' => 'Tên công ty không hợp lệ.',
            'company_name.max' => 'Tên công ty không được vượt quá 255 ký tự.',
            'sector.string' => 'Ngành không hợp lệ.',
            'sector.max' => 'Ngành không được vượt quá 100 ký tự.',
            'sector.in' => 'Vui lòng chọn ngành hợp lệ.',
            'exchange.required' => 'Vui lòng chọn sàn giao dịch.',
            'exchange.in' => 'Vui lòng chọn sàn giao dịch hợp lệ.',
            'current_price.required' => 'Vui lòng nhập giá hiện tại.',
            'current_price.numeric' => 'Giá hiện tại phải là số.',
            'current_price.min' => 'Giá hiện tại không được âm.',
            'previous_close.required' => 'Vui lòng nhập giá đóng phiên trước.',
            'previous_close.numeric' => 'Giá đóng phiên trước phải là số.',
            'previous_close.min' => 'Giá đóng phiên trước không được âm.',
            'description.string' => 'Mô tả không hợp lệ.',
            'logo.image' => 'Logo phải là một file ảnh.',
            'logo.mimes' => 'Logo phải có định dạng jpeg, png hoặc webp.',
            'logo.max' => 'Logo không được vượt quá 2MB.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'symbol' => 'mã cổ phiếu',
            'company_name' => 'tên công ty',
            'sector' => 'ngành',
            'exchange' => 'sàn giao dịch',
            'current_price' => 'giá hiện tại',
            'previous_close' => 'giá đóng phiên trước',
            'description' => 'mô tả',
            'logo' => 'logo',
        ];
    }
}
