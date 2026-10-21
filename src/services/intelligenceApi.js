import { apiFetch } from './apiClient'
export function intelligenceParams(filters) {
 const p=new URLSearchParams({period:filters.period||'30d',platform:filters.platform||'combined'})
 if(filters.selectedPersonas?.length)p.set('personas',filters.selectedPersonas.map(x=>x.toLowerCase()).join(','))
 if(filters.device&&filters.device!=='all')p.set('device',filters.device)
 if(filters.period==='custom'&&filters.customRange?.from&&filters.customRange?.to){p.set('from',filters.customRange.from);p.set('to',filters.customRange.to)}
 return p.toString()
}
export const fetchIntelligence=(query,signal)=>apiFetch(`/api/intelligence/snapshot?${query}`,{signal})
export const askIntelligence=(query,question,signal,options={})=>apiFetch(`/api/intelligence/ask?${query}`,{method:'POST',body:JSON.stringify({question,context:options.context||null,timezone:options.timezone||'UTC'}),signal})
