<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\AvailabilityService;

class AvailabilityServiceTest extends TestCase
{
    /**
     * Test interval overlap logic for reservation conflict detection.
     */
    public function test_conflict_interval_detection_formula()
    {
        // Interval [R_start, R_end) and requested [Q_start, Q_end)
        // Overlap occurs when: R_start < Q_end AND R_end > Q_start

        $rStart = strtotime('2026-10-01 10:00:00');
        $rEnd   = strtotime('2026-10-01 12:00:00');

        // Test 1: Completely before -> no conflict
        $q1Start = strtotime('2026-10-01 08:00:00');
        $q1End   = strtotime('2026-10-01 10:00:00');
        $overlap1 = ($rStart < $q1End) && ($rEnd > $q1Start);
        $this->assertFalse($overlap1);

        // Test 2: Overlapping start
        $q2Start = strtotime('2026-10-01 09:30:00');
        $q2End   = strtotime('2026-10-01 10:30:00');
        $overlap2 = ($rStart < $q2End) && ($rEnd > $q2Start);
        $this->assertTrue($overlap2);

        // Test 3: Completely inside
        $q3Start = strtotime('2026-10-01 10:30:00');
        $q3End   = strtotime('2026-10-01 11:30:00');
        $overlap3 = ($rStart < $q3End) && ($rEnd > $q3Start);
        $this->assertTrue($overlap3);

        // Test 4: Completely after -> no conflict
        $q4Start = strtotime('2026-10-01 12:00:00');
        $q4End   = strtotime('2026-10-01 14:00:00');
        $overlap4 = ($rStart < $q4End) && ($rEnd > $q4Start);
        $this->assertFalse($overlap4);
    }
}
