import {useEffect,useState,useCallback} from 'react'
import {useFilters} from '../context/FiltersContext'
import {useProject} from '../context/ProjectContext'
import {fetchIntelligence,intelligenceParams} from '../services/intelligenceApi'
export function useIntelligence(){
 const shared=useFilters(),filters={...shared,device:shared.intelligenceDevice,setDevice:shared.setIntelligenceDevice},{projectId}=useProject(),query=intelligenceParams(filters)
 const [state,setState]=useState({data:null,loading:true,error:null}),[revision,setRevision]=useState(0)
 const key=`${projectId}:${query}:${revision}`
 useEffect(()=>{const controller=new AbortController();let active=true;setState({key,data:null,loading:true,error:null});
 if(!projectId){setState({key,data:null,loading:false,error:'Select a project to load analytics.'});return()=>controller.abort()}
 fetchIntelligence(query,controller.signal).then(data=>{if(active)setState({key,data,loading:false,error:null})}).catch(e=>{if(active&&e.name!=='AbortError')setState({key,data:null,loading:false,error:e.message})})
 return()=>{active=false;controller.abort()}
 },[key,projectId,query])
 const retry=useCallback(()=>setRevision(n=>n+1),[])
 return {...(state.key===key?state:{data:null,loading:true,error:null}),retry,filters,query,projectId}
}
