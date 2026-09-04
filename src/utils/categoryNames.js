const CACHE_KEY = 'job_categories_cache'

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}
  } catch {
    return {}
  }
}

export function getCategoryName(slug) {
  if (!slug) return ''
  const map = loadFromStorage()
  if (map[slug]) return map[slug]
  return slugToName(slug)
}

export function getCategorySlug(name) {
  if (!name) return ''
  const map = loadFromStorage()
  const entry = Object.entries(map).find(([, v]) => v === name)
  return entry?.[0] || name.toLowerCase().replace(/\s+/g, '-')
}

function capitalize(word) {
  if (!word) return ""
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export default function slugToName(slug = "") {
  const table = { and: "&", at: "@", plus: "+", hash: "#", slash: "/", dash: "-", dot: "." }
  return slug.trim().toLowerCase().split("-").map(w => table[w] ?? capitalize(w)).join(" ")
}
