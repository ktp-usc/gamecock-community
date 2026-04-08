"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    volunteersQueryKey,
    createVolunteer,
    fetchVolunteers,
    updateVolunteer
} from "@/lib/api/volunteers";
import type {
    CreateVolunteerInput,
    UpdateVolunteerInput
} from "@/lib/volunteers";

// Loads in the volunteer list
export function useVolunteers() {
    return useQuery({
        queryKey: volunteersQueryKey,
        queryFn: fetchVolunteers
    });
}

// Creates a volunteer
export function useCreateVolunteer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateVolunteerInput) => createVolunteer(input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: volunteersQueryKey });
        }
    });
}

// Updates a volunteer
export function useUpdateVolunteer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         id,
                         input
                     }: {
            id: string;
            input: UpdateVolunteerInput;
        }) => updateVolunteer(id, input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: volunteersQueryKey });
        }
    });
}
