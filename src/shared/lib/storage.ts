import type { AppData, Amenity, Category, Listing, User } from '../../entities/types'

const KEY = 'bookly-data-v3'
const SESSION_KEY = 'bookly-session-v3'

export const categories: Category[] = [
  { id: 'hotel', name: 'Отели', icon: '🏨' },
  { id: 'apartment', name: 'Апартаменты', icon: '🏡' },
  { id: 'house', name: 'Дома', icon: '🏠' },
]
export const amenities: Amenity[] = [
  { id: 'wifi', name: 'Wi‑Fi', icon: '📶' },
  { id: 'breakfast', name: 'Завтрак', icon: '🥐' },
  { id: 'parking', name: 'Парковка', icon: '🅿️' },
  { id: 'sea', name: 'У моря', icon: '🌊' },
  { id: 'kitchen', name: 'Кухня', icon: '🍳' },
]
const admin: User = { id: 'admin', name: 'Администратор', email: 'admin@bookly.ru', password: 'admin123', role: 'ADMIN', createdAt: '2026-06-01' }
const owner: User = { id: 'owner', name: 'Анна Смирнова', email: 'owner@bookly.ru', password: 'owner123', role: 'OWNER', createdAt: '2026-06-01' }
const demoListings: Listing[] = [
  { id:'l1', title:'Гранд Отель Центр', city:'Москва', price:4200, rating:4.8, description:'Современный отель в историческом центре, в пяти минутах от метро. Здесь легко совместить прогулки по старым улицам, деловые встречи и спокойный отдых после насыщенного дня. Гостей ждут уютные номера, внимательный сервис и всё необходимое для комфортного проживания.', categoryId:'hotel', amenities:['wifi','breakfast','parking'], image:'/listings/grand-hotel-center.png', isActive:true, ownerId:'owner' },
  { id:'l2', title:'Sea View Apart', city:'Сочи', price:5600, rating:4.6, description:'Светлые апартаменты с видом на море, балконом и полностью оборудованной кухней. Утро начинается с морского воздуха и мягкого света, а до прогулочной зоны и кафе можно добраться без долгих поездок. Пространство подойдёт для отдыха вдвоём, с друзьями или небольшой семьёй.', categoryId:'apartment', amenities:['wifi','sea','kitchen'], image:'/listings/sea-view-apart.png', isActive:true, ownerId:'owner' },
  { id:'l3', title:'Business Hotel', city:'Казань', price:3900, rating:4.5, description:'Практичный вариант для коротких поездок: тихие номера, рабочая зона и быстрый Wi‑Fi. Отель расположен так, чтобы было удобно добираться до деловых кварталов, вокзала и городских маршрутов. После рабочего дня можно спокойно отдохнуть в комфортной обстановке и начать утро с завтрака.', categoryId:'hotel', amenities:['wifi','breakfast','parking'], image:'/listings/business-hotel.png', isActive:true, ownerId:'owner' },
  { id:'l4', title:'Family Residence', city:'Санкт-Петербург', price:6100, rating:4.9, description:'Просторные семейные апартаменты рядом с достопримечательностями и набережной. Внутри достаточно места для совместного отдыха, хранения вещей и неспешных домашних вечеров после прогулок по городу. Рядом есть магазины, кафе и удобные маршруты к главным местам Санкт‑Петербурга.', categoryId:'house', amenities:['wifi','kitchen','parking'], image:'/listings/family-residence.png', isActive:true, ownerId:'owner' },
]
const initial: AppData = { users:[admin, owner], listings:demoListings, bookings:[], reviews:[], notifications:[] }

export function loadData(): AppData { try { return JSON.parse(localStorage.getItem(KEY) || '') as AppData } catch { saveData(initial); return initial } }
export function saveData(data: AppData) { localStorage.setItem(KEY, JSON.stringify(data)) }
export function loadSession() { return localStorage.getItem(SESSION_KEY) }
export function saveSession(userId: string | null) { userId ? localStorage.setItem(SESSION_KEY,userId) : localStorage.removeItem(SESSION_KEY) }
export function uid(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}` }
