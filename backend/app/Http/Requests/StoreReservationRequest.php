<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'equipment_id'    => 'required|integer|exists:equipment,equipment_id',
            'purpose_type_id' => 'required|integer|exists:reservation_purpose_types,purpose_type_id',
            'purpose_details' => 'nullable|string|max:1000',
            'start_time'      => 'required|date|after:now',
            'end_time'        => 'required|date|after:start_time',
            'pickup_room_id'  => 'nullable|integer|exists:rooms,room_id',
        ];
    }

    public function messages(): array
    {
        return [
            'start_time.after'    => 'Reservation start time must be a future date and time.',
            'end_time.after'      => 'Reservation end time must be after the start time.',
            'equipment_id.exists' => 'The selected equipment does not exist in the system.',
        ];
    }
}
