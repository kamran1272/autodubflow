const plans = [
  { name: 'Free', price: '$0', description: 'For personal experiments' },
  { name: 'Creator', price: '$19', description: 'For content creators' },
  { name: 'Pro', price: '$49', description: 'For teams and brands' },
];

export default function PricingPage() {
  return <div className="mx-auto max-w-5xl px-6 py-16"><h1 className="text-4xl font-semibold">Pricing</h1><div className="mt-8 grid gap-6 md:grid-cols-3">{plans.map((plan) => <div key={plan.name} className="card p-6"><h2>{plan.name}</h2><p className="mt-4 text-3xl font-bold">{plan.price}<span className="text-sm">/mo</span></p><p className="mt-3 text-muted-foreground">{plan.description}</p></div>)}</div></div>;
}
