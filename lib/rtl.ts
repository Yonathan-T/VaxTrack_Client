export function getLocaleDirection(locale: string): "ltr" | "rtl" {
  return locale === "am" ? "rtl" : "ltr"
}
