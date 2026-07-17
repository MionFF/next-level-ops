function escapePostgrestFilterValue(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
}

export function getMembersSearchFilter(search: string) {
  const escapedSearch = escapePostgrestFilterValue(search)
  const pattern = `"*${escapedSearch}*"`

  return [`full_name.ilike.${pattern}`, `email.ilike.${pattern}`, `phone.ilike.${pattern}`].join(
    ',',
  )
}
