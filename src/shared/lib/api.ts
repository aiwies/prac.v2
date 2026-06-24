const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
let token = localStorage.getItem('bookly-token');
export const getToken=()=>token;
export const setToken=(value:string|null)=>{ token=value; value?localStorage.setItem('bookly-token',value):localStorage.removeItem('bookly-token'); };
export async function api<T>(path:string, options:RequestInit={}) : Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type','application/json');
  if (token) headers.set('Authorization',`Bearer ${token}`);
  const res=await fetch(`${API_URL}${path}`,{...options,headers});
  if(res.status===204) return undefined as T;
  const body=await res.json().catch(()=>({message:'Некорректный ответ сервера'}));
  if(!res.ok) throw new Error(body.message || 'Ошибка запроса');
  return body as T;
}
