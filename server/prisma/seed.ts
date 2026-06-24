import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();
const demoListings = [
  { title:'Гранд Отель Центр', city:'Москва', price:4200, rating:4.8, categoryId:'hotel', amenities:['wifi','breakfast','parking'], image:'/listings/grand-hotel-center.png', description:'Современный отель в историческом центре, в пяти минутах от метро. Здесь легко совместить прогулки по старым улицам, деловые встречи и спокойный отдых после насыщенного дня. Гостей ждут уютные номера, внимательный сервис и всё необходимое для комфортного проживания.' },
  { title:'Sea View Apart', city:'Сочи', price:5600, rating:4.6, categoryId:'apartment', amenities:['wifi','sea','kitchen'], image:'/listings/sea-view-apart.png', description:'Светлые апартаменты с видом на море, балконом и полностью оборудованной кухней. Утро начинается с морского воздуха и мягкого света, а до прогулочной зоны и кафе можно добраться без долгих поездок. Пространство подойдёт для отдыха вдвоём, с друзьями или небольшой семьёй.' },
  { title:'Business Hotel', city:'Казань', price:3900, rating:4.5, categoryId:'hotel', amenities:['wifi','breakfast','parking'], image:'/listings/business-hotel.png', description:'Практичный вариант для коротких поездок: тихие номера, рабочая зона и быстрый Wi‑Fi. Отель расположен так, чтобы было удобно добираться до деловых кварталов, вокзала и городских маршрутов. После рабочего дня можно спокойно отдохнуть в комфортной обстановке и начать утро с завтрака.' },
  { title:'Family Residence', city:'Санкт-Петербург', price:6100, rating:4.9, categoryId:'house', amenities:['wifi','kitchen','parking'], image:'/listings/family-residence.png', description:'Просторные семейные апартаменты рядом с достопримечательностями и набережной. Внутри достаточно места для совместного отдыха, хранения вещей и неспешных домашних вечеров после прогулок по городу. Рядом есть магазины, кафе и удобные маршруты к главным местам Санкт‑Петербурга.' },
];

async function main() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const ownerHash = await bcrypt.hash('owner123', 10);
  const admin = await prisma.user.upsert({ where:{email:'admin@bookly.ru'}, update:{name:'Администратор', role:Role.ADMIN}, create:{name:'Администратор',email:'admin@bookly.ru',passwordHash:adminHash,role:Role.ADMIN} });
  const owner = await prisma.user.upsert({ where:{email:'owner@bookly.ru'}, update:{name:'Анна Смирнова', role:Role.OWNER}, create:{name:'Анна Смирнова',email:'owner@bookly.ru',passwordHash:ownerHash,role:Role.OWNER} });
  for (const item of demoListings) {
    await prisma.listing.upsert({ where:{ title_city:{ title:item.title, city:item.city } }, update:{...item, ownerId:owner.id}, create:{...item, ownerId:owner.id} });
  }
  console.log(`Seed complete. Admin: ${admin.email}; Owner: ${owner.email}`);
}
main().finally(()=>prisma.$disconnect());
