import { useMemo, useState } from 'react'
import type { Booking, Listing, Review, User } from '../entities/types'
import { amenities } from '../shared/lib/storage'
import { datesOverlap, formatPrice, nightsBetween, today } from '../shared/lib/date'
import { Button } from '../shared/ui/Button'
type Props={ listing:Listing; user:User|null; bookings:Booking[]; reviews:Review[]; onClose:()=>void; onBook:(from:string,to:string,guests:number)=>Promise<string>; onReview:(rating:number,comment:string)=>Promise<string>; onDeleteReview:(reviewId:string)=>Promise<void> }
export function ListingModal({listing,user,bookings,reviews,onClose,onBook,onReview,onDeleteReview}:Props) {
 const [from,setFrom]=useState(today()); const [to,setTo]=useState(''); const [guests,setGuests]=useState(1); const [rating,setRating]=useState(5); const [comment,setComment]=useState(''); const [notice,setNotice]=useState(''); const [busy,setBusy]=useState(false)
 const total=useMemo(()=>to&&to>from?listing.price*nightsBetween(from,to):0,[from,to,listing.price])
 const hasConflict=to>from && bookings.some(b=>b.listingId===listing.id&&b.status!=='CANCELLED'&&datesOverlap(from,to,b.dateFrom,b.dateTo))
 const canModerate=user?.role==='ADMIN'||user?.role==='OWNER'
 const submit=async()=>{setBusy(true);try{setNotice(await onBook(from,to,guests))}catch(e){setNotice(e instanceof Error?e.message:'Ошибка бронирования')}finally{setBusy(false)}}
 const submitReview=async()=>{setBusy(true);try{setNotice(await onReview(rating,comment));setComment('')}catch(e){setNotice(e instanceof Error?e.message:'Ошибка отзыва')}finally{setBusy(false)}}
 const remove=async(id:string)=>{try{await onDeleteReview(id)}catch(e){setNotice(e instanceof Error?e.message:'Ошибка удаления')}}
 return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal" onMouseDown={e=>e.stopPropagation()}><button className="close" onClick={onClose}>×</button>
 <div className="modal-hero"><img src={listing.image} alt={listing.title}/></div><h2>{listing.title}</h2><p className="city">📍 {listing.city} · ★ {listing.rating}</p><p>{listing.description}</p><div className="amenities big">{listing.amenities.map(id=>{const a=amenities.find(x=>x.id===id);return <span key={id}>{a?.icon} {a?.name}</span>})}</div>
 {notice&&<div className="message">{notice}</div>}
 <div className="booking-form"><h3>Забронировать</h3>{!user?<p className="muted">Для бронирования сначала войдите в аккаунт.</p>:<><label>Заезд<input min={today()} type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>Выезд<input min={from||today()} type="date" value={to} onChange={e=>setTo(e.target.value)}/></label><label>Гостей<input min="1" max="10" type="number" value={guests} onChange={e=>setGuests(Number(e.target.value))}/></label>{hasConflict&&<p className="error">На эти даты объект уже занят.</p>}<div className="booking-total">{total?<>Итого: <strong>{formatPrice(total)}</strong></>:'Выберите дату выезда'}</div><Button disabled={busy||!to||to<=from||hasConflict} onClick={submit}>Подтвердить бронирование</Button></>}</div>
 <div className="reviews"><h3>Отзывы</h3>{reviews.length===0?<p className="muted">Пока нет отзывов.</p>:reviews.map(r=><article className="review" key={r.id}><div className="review-head"><div><b>{r.userName} · {'★'.repeat(r.rating)}</b><p>{r.comment}</p></div>{canModerate&&<Button variant="danger" onClick={()=>remove(r.id)}>Удалить</Button>}</div></article>)}
 {user&&<div className="review-form"><select value={rating} onChange={e=>setRating(Number(e.target.value))}>{[5,4,3,2,1].map(x=><option key={x} value={x}>{x} ★</option>)}</select><input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Ваш отзыв"/><Button variant="ghost" disabled={busy||!comment.trim()} onClick={submitReview}>Оставить отзыв</Button></div>}</div></section></div>
}
