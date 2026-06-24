import type { User } from '../entities/types'
import { Button } from '../shared/ui/Button'
type Props={ page:string; setPage:(page:string)=>void; user:User|null; unread:number; onLogout:()=>void }
export function Header({page,setPage,user,unread,onLogout}:Props) {
 const links=[['home','Главная'],['profile','Мои бронирования'],['admin',user?.role==='OWNER'?'Управление объектами':'Админ-панель']]
 return <header className="header"><button className="brand" onClick={()=>setPage('home')}>book<span>ly</span></button>
 <nav>{links.filter(([key])=>key!=='admin'||user?.role==='ADMIN'||user?.role==='OWNER').map(([key,label])=><button className={page===key?'nav-active':''} key={key} onClick={()=>setPage(key)}>{label}{key==='profile'&&unread>0?<b className="count">{unread}</b>:null}</button>)}</nav>
 <div className="user-area">{user?<><span className="user-name">{user.name}<small>{user.role==='ADMIN'?'Администратор':user.role==='OWNER'?'Владелец':'Гость'}</small></span><Button variant="ghost" onClick={onLogout}>Выйти</Button></>:<Button onClick={()=>setPage('auth')}>Войти</Button>}</div></header>
}
