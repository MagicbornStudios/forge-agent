/**
 * Character workspace pure helpers.
 */

/** Compute initials from a character name. */
export function getInitials(name?: string): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Place characters in a circular layout around an active (centred) character.
 *
 * @returns A Map of characterId → { x, y } positions.
 */
export function computeCircularLayout(
  characters: { id: number }[],
  activeCharacterId: number | null,
  center: { x: number; y: number } = { x: 400, y: 300 },
  radius: number = 250,
): Map<number, { x: number; y: number }> {
  const positions = new Map<number, { x: number; y: number }>();

  if (characters.length === 0) return positions;

  // Active character at centre
  if (activeCharacterId != null) {
    positions.set(activeCharacterId, { x: center.x, y: center.y });
  }

  const others = characters.filter((c) => c.id !== activeCharacterId);
  const count = others.length;

  if (count === 0) return positions;

  others.forEach((char, index) => {
    const angle = (2 * Math.PI * index) / count - Math.PI / 2; // start at top
    positions.set(char.id, {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  });

  return positions;
}

/**
 * Extract a numeric ID from a Payload relationship field which may be
 * a plain number or a populated object with `{ id }`.
 */
export function resolveRelId(value: number | { id: number }): number {
  return typeof value === 'number' ? value : value.id;
}
