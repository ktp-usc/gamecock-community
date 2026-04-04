"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    timeEntryQueryKey,
    fetchTimeEntries,
    clockInVolunteer,
    clockOutVolunteer,
} from "@/lib/api/time-entries";
import type {
    ClockInInput, ClockOutInput
} from "@/lib/time-entries";

// Loads in the time entry list
export function useTimeEntries(volunteerId?: string) {
    return useQuery({
        queryKey: [...timeEntryQueryKey, volunteerId ?? "all"],
        queryFn: () => fetchTimeEntries(volunteerId)
    });
}


// Clocks in a volunteer
export function useClockInVolunteer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: ClockInInput) => clockInVolunteer(input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: timeEntryQueryKey });
        },
    });
}

// Clocks out a volunteer
export function useClockOutVolunteer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: ClockOutInput) => clockOutVolunteer(input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: timeEntryQueryKey });
        },
    });
}
