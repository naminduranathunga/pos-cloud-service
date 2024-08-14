
export interface SingleValueAddedFeature {
    name: string;
    label: string;
    limit: number;
    price: number;
}

export interface SingleUsageMetric {
    name: string;
    label: string;
    value: number;
}

export interface CompanySubscription {
    _id?: string;
    packageName: string;
    packageDescription: string;
    packagePrice: number;
    reccuringTime: "monthly|yearly|one-time|6-month"; /* Monthly, Yearly, One-time */
    packageExpires: Date;
    nextInvoicingDate?: Date;
    lastPaymentDate?: Date;
    nextPaymentDate?: Date;
    isTrial: boolean;

    trialExpires?: Date;
    trialStart?: Date;
    isExpired?: boolean;
    
    packageFeatures: Array<any>;

    /** 
     * Value-Added Features
     */
    valueAddedFeatures: Array<any>;

    usageMetrics: Array<SingleUsageMetric>; // max_branches, max_users, max_

}