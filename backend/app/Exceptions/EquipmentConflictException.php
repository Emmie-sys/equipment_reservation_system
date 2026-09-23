<?php

namespace App\Exceptions;

use RuntimeException;

class EquipmentConflictException extends RuntimeException
{
    protected array $conflict;

    public function __construct(string $message, array $conflict)
    {
        parent::__construct($message);
        $this->conflict = $conflict;
    }

    public function getConflict(): array
    {
        return $this->conflict;
    }
}
