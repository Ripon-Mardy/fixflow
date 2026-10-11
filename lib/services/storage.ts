export type StoredFile = { url: string; caption?: string };

export const SAMPLE_ISSUE_PHOTOS: { url: string; label: string }[] = [
  {
    url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=70",
    label: "Under-sink leak",
  },
  {
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=70",
    label: "Electrical panel",
  },
  {
    url: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=70",
    label: "HVAC unit",
  },
  {
    url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=70",
    label: "Kitchen appliance",
  },
  {
    url: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=70",
    label: "Water-damaged ceiling",
  },
  {
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=70",
    label: "Broken fixture",
  },
];

export async function uploadFile(_file: File): Promise<StoredFile> {
  throw new Error(
    "Direct uploads are not enabled in demo mode. Wire lib/services/storage.ts to a provider to enable.",
  );
}

export function isAllowedImageUrl(url: string) {
  try {
    const u = new URL(url);
    return [
      "images.unsplash.com",
      "plus.unsplash.com",
      "res.cloudinary.com",
    ].includes(u.hostname);
  } catch {
    return false;
  }
}
