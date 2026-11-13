import { useLocation, useNavigate } from 'react-router-dom'
export default function ViviBubble() {
 const navigate=useNavigate(),location=useLocation()
 if(location.pathname==='/ask-dashboard') return null
 return <button type="button" aria-label="Open Ask Vivi" title="Ask Vivi" onClick={()=>navigate('/ask-dashboard')}
  className="fixed bottom-6 right-6 z-40 flex items-center justify-center rounded-full text-white shadow-xl hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-transform"
  style={{width:62,height:62,background:'radial-gradient(circle at 30% 25%,#A5B4FC 0%,#6366F1 45%,#7C3AED 85%)',boxShadow:'0 9px 30px rgba(99,102,241,.4)'}}>
  <span className="flex flex-col items-center leading-none"><span className="text-xl">✦</span><span className="text-[10px] font-bold">Vivi</span></span>
 </button>
}
