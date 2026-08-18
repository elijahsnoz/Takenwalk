const POOR_ACCURACY_THRESHOLD_METERS = 30;

export function AccuracyBadge({ accuracyMeters }: { accuracyMeters: number }) {
  const poor = accuracyMeters > POOR_ACCURACY_THRESHOLD_METERS;

  return (
    <div className={`rounded-lg px-3 py-2 text-sm ${poor ? "bg-orange-soft text-orange" : "bg-green-soft text-green"}`}>
      <p>Location accuracy: ±{Math.round(accuracyMeters)} meters</p>
      {poor ? (
        <p className="mt-1 text-xs">⚠️ Location accuracy is low. Move closer to the storefront and try again.</p>
      ) : null}
    </div>
  );
}
