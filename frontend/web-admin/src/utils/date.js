export function formatDate(value) {  
  if (!value) return '-';  
  const date = new Date(value);  
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-IN');  
}  
  
export function formatDateTime(value) {  
  if (!value) return '-';  
  const date = new Date(value);  
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('en-IN');  
}  
  
export function getRelativeTime(value) {  
  if (!value) return '-';  
  const date = new Date(value);  
  if (Number.isNaN(date.getTime())) return '-';  
  const now = new Date();  
  const diff = now - date;  
  const seconds = Math.floor(diff / 1000);  
  const minutes = Math.floor(seconds / 60);  
  const hours = Math.floor(minutes / 60);  
  const days = Math.floor(hours / 24);  
  if (days > 0) return days + 'd ago';  
  if (hours > 0) return hours + 'h ago';  
  if (minutes > 0) return minutes + 'm ago';  
  return 'Just now';  
} 
