
export const today = () => new Date().toISOString().slice(0,10)
export const formatDate = (value: string) => new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(`${value}T12:00:00`))
export const nightsBetween = (from: string, to: string) => Math.max(1, Math.round((new Date(to).getTime()-new Date(from).getTime())/86400000))
export const formatPrice = (value: number) => new Intl.NumberFormat('ru-RU').format(value)+' ₽'
export const datesOverlap = (from:string,to:string, existingFrom:string,existingTo:string) => from < existingTo && to > existingFrom
