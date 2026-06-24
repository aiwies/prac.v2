import type { Listing } from '../entities/types'
import { categories, amenities } from '../shared/lib/storage'
import { formatPrice } from '../shared/lib/date'
import { Button } from '../shared/ui/Button'
export function ListingCard({listing,onOpen}:{listing:Listing;onOpen:(listing:Listing)=>void}) {
 const category=categories.find(x=>x.id===listing.categoryId)
 return <article className="listing-card"><div className="listing-image"><img src={listing.image} alt={listing.title}/><span>{category?.icon} {category?.name}</span></div>
 <div className="listing-body"><div><h3>{listing.title}</h3><p className="city">📍 {listing.city}</p><p className="description">{listing.description}</p></div>
 <div className="amenities">{listing.amenities.map(id=><span key={id} title={amenities.find(x=>x.id===id)?.name}>{amenities.find(x=>x.id===id)?.icon}</span>)}</div>
 <div className="listing-footer"><div><strong>{formatPrice(listing.price)}</strong><small>за ночь · ★ {listing.rating}</small></div><Button onClick={()=>onOpen(listing)}>Подробнее</Button></div></div></article>
}
