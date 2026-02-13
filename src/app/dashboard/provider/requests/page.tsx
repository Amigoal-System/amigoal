'use server';

import React from 'react';
import ProviderRequestsPage from '@/components/dashboards/pages/ProviderRequestsPage';
import { getAllTrainingCamps } from '@/ai/flows/trainingCamps';
import { getAllBootcamps } from '@/ai/flows/bootcamps';

// This is now a Server Component
export default async function Page() {
    // Fetch data on the server
    const trainingCampRequests = await getAllTrainingCamps({ source: 'all' });
    const bootcampRequests = await getAllBootcamps({ source: 'all' });

    // Pass fetched data as props to the client component
    return (
        <ProviderRequestsPage 
            initialTrainingCamps={trainingCampRequests} 
            initialBootcamps={bootcampRequests} 
        />
    );
}
