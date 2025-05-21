export function assignUniqueNames(names: any[]): string[] {
  const uniqueNames: Map<string, number> = new Map();
  return names.map((rawName) => {
    let name = String(rawName);
    if (uniqueNames.has(name)) {
      const newName = uniqueNames.get(name)! + 1;
      name = `${name} (${newName})`;
    } else {
      uniqueNames.set(name, 1);
    }
    return name;
  });
}
