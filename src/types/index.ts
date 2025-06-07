export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  limits: {
    appointments: number;
    services: number;
    staff: number;
    voice_messages: boolean;
    calendar_integration: boolean;
    analytics: boolean;
  };
  recommended?: boolean;
}
