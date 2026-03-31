import React from 'react';
import StripeAgentInterface from '@/components/billing/StripeAgentInterface';

export default function BillingAgent() {
    return (
        <div className="container mx-auto py-8">
            <StripeAgentInterface />
        </div>
    );
}