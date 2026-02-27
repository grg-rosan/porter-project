export function getSurgeMultiplier(currentDemand) {
  // simple demo logic
  if (currentDemand > 80) return 1.5;
  if (currentDemand > 50) return 1.3;
  if (currentDemand > 30) return 1.1;

  return 1;
}
