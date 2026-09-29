export function addImageFiles(existing: File[], incoming: File[]) {
  const files = [...existing];
  const identities = new Set(files.map(fileIdentity));
  let rejectedTooLarge = false;
  let rejectedNotImage = false;

  for (const file of incoming) {
    if (!file.type.startsWith("image/")) {
      rejectedNotImage = true;
      continue;
    }
    if (file.size > 4 * 1024 * 1024) {
      rejectedTooLarge = true;
      continue;
    }
    const identity = fileIdentity(file);
    if (identities.has(identity)) continue;
    identities.add(identity);
    files.push(file);
  }

  return { files, rejectedTooLarge, rejectedNotImage };
}

function fileIdentity(file: File) {
  return `${file.name}\u0000${file.size}\u0000${file.lastModified}`;
}
