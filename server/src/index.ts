import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient, Role, BookingStatus } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT ?? 3000);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) throw new Error("JWT_SECRET is not configured");

app.use(cors({ origin: process.env.CLIENT_URL?.split(',') ?? true }));
app.use(express.json());

type TokenPayload = { userId: string; role: Role };
type AuthRequest = express.Request & { user?: TokenPayload };

const tokenFor = (userId: string, role: Role) => jwt.sign({ userId, role }, jwtSecret, { expiresIn: '7d' });
const toUser = (u: {id:string;name:string;email:string;role:Role;createdAt:Date}) => ({ ...u, createdAt:u.createdAt.toISOString() });
const toListing = (l: any) => ({ id:l.id,title:l.title,city:l.city,price:l.price,rating:l.rating,description:l.description,categoryId:l.categoryId,amenities:l.amenities,image:l.image ?? '/listings/grand-hotel-center.png',isActive:!l.isHidden,ownerId:l.ownerId ?? '' });
const toBooking = (b: any) => ({ id:b.id,listingId:b.listingId,userId:b.userId,dateFrom:b.checkIn.toISOString().slice(0,10),dateTo:b.checkOut.toISOString().slice(0,10),guests:b.guests,totalPrice:b.totalPrice,status:b.status,createdAt:b.createdAt.toISOString() });
const toReview = (r: any) => ({ id:r.id,listingId:r.listingId,userId:r.userId,userName:r.user.name,rating:r.rating,comment:r.text,createdAt:r.createdAt.toISOString() });

function authRequired(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  const h=req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({message:'Требуется авторизация'});
  try { req.user=jwt.verify(h.slice(7),jwtSecret) as TokenPayload; next(); }
  catch { return res.status(401).json({message:'Недействительный токен'}); }
}
function roleRequired(...roles: Role[]) { return (req:AuthRequest,res:express.Response,next:express.NextFunction)=> !req.user || !roles.includes(req.user.role) ? res.status(403).json({message:'Недостаточно прав'}) : next(); }

app.get('/api/health', async (_req,res) => { await prisma.$queryRaw`SELECT 1`; res.json({status:'ok', database:'connected'}); });
app.get('/api/me', authRequired, async (req:AuthRequest,res) => { const user=await prisma.user.findUnique({where:{id:req.user!.userId}}); if(!user)return res.status(401).json({message:'Пользователь не найден'}); res.json(toUser(user)); });

app.post('/api/auth/register', async (req,res) => {
  const {name,email,password}=req.body ?? {};
  if(!email || !password || String(password).length<6) return res.status(400).json({message:'Укажи email и пароль минимум из 6 символов'});
  const normalized=String(email).trim().toLowerCase();
  if(await prisma.user.findUnique({where:{email:normalized}})) return res.status(409).json({message:'Пользователь уже существует'});
  const user=await prisma.user.create({data:{name:String(name||'Гость').trim()||'Гость',email:normalized,passwordHash:await bcrypt.hash(password,10)}});
  res.status(201).json({token:tokenFor(user.id,user.role),user:toUser(user)});
});
app.post('/api/auth/login', async (req,res) => {
  const {email,password}=req.body ?? {};
  const user=await prisma.user.findUnique({where:{email:String(email||'').trim().toLowerCase()}});
  if(!user || !(await bcrypt.compare(String(password||''),user.passwordHash))) return res.status(401).json({message:'Неверный email или пароль'});
  res.json({token:tokenFor(user.id,user.role),user:toUser(user)});
});

app.get('/api/listings', async (req:AuthRequest,res) => {
  const token=req.headers.authorization?.replace('Bearer ',''); let role:Role|undefined;
  try { if(token) role=(jwt.verify(token,jwtSecret) as TokenPayload).role; } catch {}
  const rows=await prisma.listing.findMany({where:role===Role.ADMIN||role===Role.OWNER?{}:{isHidden:false},orderBy:{createdAt:'desc'}});
  res.json(rows.map(toListing));
});
app.post('/api/listings',authRequired,roleRequired(Role.OWNER),async(req,res)=>{
  const b=req.body ?? {}; if(!b.title||!b.city||!b.description) return res.status(400).json({message:'Заполни название, город и описание'});
  const row=await prisma.listing.create({data:{title:b.title,city:b.city,description:b.description,price:Number(b.price),rating:Number(b.rating ?? 0),categoryId:b.categoryId ?? 'hotel',amenities:Array.isArray(b.amenities)?b.amenities:['wifi','parking'],image:b.image ?? null,ownerId:(req as AuthRequest).user!.userId}});res.status(201).json(toListing(row));
});
app.patch('/api/listings/:id',authRequired,roleRequired(Role.OWNER),async(req,res)=>{ const b=req.body ?? {}; const row=await prisma.listing.update({where:{id:req.params.id},data:{title:b.title,city:b.city,description:b.description,price:b.price===undefined?undefined:Number(b.price),rating:b.rating===undefined?undefined:Number(b.rating),categoryId:b.categoryId,amenities:b.amenities,image:b.image}});res.json(toListing(row)); });
app.patch('/api/listings/:id/visibility',authRequired,roleRequired(Role.ADMIN,Role.OWNER),async(req,res)=>{const row=await prisma.listing.update({where:{id:req.params.id},data:{isHidden:Boolean(req.body?.isHidden)}});res.json(toListing(row));});
app.delete('/api/listings/:id',authRequired,roleRequired(Role.OWNER),async(req,res)=>{await prisma.listing.delete({where:{id:req.params.id}});res.status(204).end();});

app.get('/api/reviews',async(_req,res)=>{const rows=await prisma.review.findMany({include:{user:true},orderBy:{createdAt:'desc'}});res.json(rows.map(toReview));});
app.post('/api/listings/:id/reviews',authRequired,async(req:AuthRequest,res)=>{const {rating,text}=req.body??{};if(!text||Number(rating)<1||Number(rating)>5)return res.status(400).json({message:'Укажи оценку от 1 до 5 и текст отзыва'});const row=await prisma.review.create({data:{listingId:req.params.id,userId:req.user!.userId,rating:Number(rating),text:String(text)},include:{user:true}});res.status(201).json(toReview(row));});
app.delete('/api/reviews/:id',authRequired,roleRequired(Role.ADMIN,Role.OWNER),async(req,res)=>{await prisma.review.delete({where:{id:req.params.id}});res.status(204).end();});

app.get('/api/bookings/me',authRequired,async(req:AuthRequest,res)=>{const rows=await prisma.booking.findMany({where:{userId:req.user!.userId},orderBy:{createdAt:'desc'}});res.json(rows.map(toBooking));});
app.get('/api/bookings',authRequired,roleRequired(Role.ADMIN,Role.OWNER),async(_req,res)=>{const rows=await prisma.booking.findMany({orderBy:{createdAt:'desc'}});res.json(rows.map(toBooking));});
app.post('/api/bookings',authRequired,async(req:AuthRequest,res)=>{const {listingId,checkIn,checkOut,guests}=req.body??{};if(!listingId||!checkIn||!checkOut||!guests)return res.status(400).json({message:'Заполни все поля бронирования'});const listing=await prisma.listing.findUnique({where:{id:listingId}});if(!listing)return res.status(404).json({message:'Объект не найден'});const a=new Date(checkIn),b=new Date(checkOut);if(!(b>a))return res.status(400).json({message:'Дата выезда должна быть позже даты заезда'});const conflict=await prisma.booking.findFirst({where:{listingId,status:{not:BookingStatus.CANCELLED},checkIn:{lt:b},checkOut:{gt:a}}});if(conflict)return res.status(409).json({message:'На эти даты объект уже занят'});const nights=Math.max(1,Math.round((b.getTime()-a.getTime())/86400000));const row=await prisma.booking.create({data:{listingId,userId:req.user!.userId,checkIn:a,checkOut:b,guests:Number(guests),totalPrice:listing.price*nights}});res.status(201).json(toBooking(row));});
app.patch('/api/bookings/:id/cancel',authRequired,async(req:AuthRequest,res)=>{const b=await prisma.booking.findUnique({where:{id:req.params.id}});if(!b)return res.status(404).json({message:'Бронирование не найдено'});if(b.userId!==req.user!.userId&&req.user!.role===Role.USER)return res.status(403).json({message:'Недостаточно прав'});const row=await prisma.booking.update({where:{id:b.id},data:{status:BookingStatus.CANCELLED}});res.json(toBooking(row));});

app.use((err:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{console.error(err);res.status(500).json({message:'Внутренняя ошибка сервера'});});
app.listen(port,()=>console.log(`API started on http://localhost:${port}`));
