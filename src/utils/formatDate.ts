export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

export function formatDateInput(dateString: string): string {
  return new Date(dateString).toISOString().split('T')[0]
}
