import { handleSubscriptionWebhook } from '../lib/lemonsqueezy';

export async function handleWebhook(req: Request) {
  const signature = req.headers.get('x-signature');
  if (!signature) {
    return new Response('Signature missing', { status: 401 });
  }

  try {
    const event = await req.json();
    
    switch (event.meta.event_name) {
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_cancelled':
      case 'subscription_expired':
        await handleSubscriptionWebhook(event);
        break;
      default:
        console.log('Unhandled webhook event:', event.meta.event_name);
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
}