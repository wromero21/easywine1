import React, { useState, useRef, useEffect } from 'react';
import { Camera, Search, X, Globe, Thermometer, ChevronRight, Wine, Utensils, Award, User, Sparkles } from 'lucide-react';

// --- DEFINIÇÕES DE TIPOS (Para o TypeScript não reclamar) ---
interface Caracteristicas {
  corpo: number;
  acidez: number;
  taninos: number;
  docura: number;
  [key: string]: number; // Permite acessar com chaves dinâmicas
}

interface PairingResult {
  estilo: string;
  caracteristicas: Caracteristicas;
  perfil: string;
  explicacao: string;
  temperatura: string;
  paises: string[];
}

interface Filter {
  id: string;
  label: string;
  emoji: string;
}

export default function EasyWineApp() {
  // --- ESTADOS COM TIPAGEM ---
  const [userName, setUserName] = useState<string>('');
  const [isNameSet, setIsNameSet] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string>('');
  const [pairing, setPairing] = useState<PairingResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  
  // Ref tipada para input HTML
  const fileInputRef = useRef<HTMLInputElement>(null);

  const quickFilters: Filter[] = [
    { id: 'carnes', label: 'Carnes', emoji: '🥩' },
    { id: 'massas', label: 'Massas', emoji: '🍝' },
    { id: 'peixes', label: 'Peixes', emoji: '🐟' },
    { id: 'fastfood', label: 'Fast Food', emoji: '🍔' },
    { id: 'brasileira', label: 'Brasileira', emoji: '🇧🇷' },
    { id: 'sobremesas', label: 'Doces', emoji: '🍰' }
  ];

  useEffect(() => {
    const savedName = localStorage.getItem('easywine_user_name');
    if (savedName) {
      setUserName(savedName);
      setIsNameSet(true);
    }
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim().length > 1) {
      localStorage.setItem('easywine_user_name', userName);
      setIsNameSet(true);
    }
  };

  const logout = () => {
    if(window.confirm(`Até logo, ${userName}! Deseja sair?`)) {
      localStorage.removeItem('easywine_user_name');
      setIsNameSet(false);
      setUserName('');
      setPairing(null);
    }
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const renderDots = (level: number) => (
    <div className="flex gap-1.5">
      {[...Array(7)].map((_, i) => (
        <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < level ? 'bg-[#800020] shadow-sm scale-110' : 'bg-gray-200'}`} />
      ))}
    </div>
  );

  const analyzePairing = async () => {
    if (!image && !ingredients && !selectedFilter) {
      alert('Por favor, me dê uma dica: foto, texto ou categoria.');
      return;
    }
    setLoading(true);
    setPairing(null);

    try {  
      const filterText = quickFilters.find(f => f.id === selectedFilter)?.label || '';
      
      const response = await fetch('/api/harmonize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image,
          ingredients,
          category: filterText,
          userName 
        })
      });

      if (!response.ok) throw new Error('Erro na comunicação com o servidor.');
      
      const data = await response.json();
      setPairing(data);

    } catch (error) {  
      console.error(error);  
      alert('O Sommelier está indisponível no momento. Tente novamente.');  
    } finally {  
      setLoading(false);  
    }
  };

  const reset = () => {
    setImage(null);
    setIngredients('');
    setPairing(null);
    setSelectedFilter(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- RENDER ---
  if (!isNameSet) {
    return (
      <div className="min-h-screen bg-[#800020] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wine className="w-8 h-8 text-[#800020]" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">EasyWine</h1>
          <p className="text-gray-500 text-sm mb-6">Seu sommelier pessoal inteligente.</p>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Como devo te chamar?" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#800020] focus:outline-none" autoFocus />
            </div>
            <button type="submit" disabled={userName.length < 2} className="w-full bg-[#800020] text-white py-3 rounded-xl font-bold hover:bg-[#600018] disabled:opacity-50 transition-all">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <div className="max-w-lg mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-gray-100 to-white opacity-50 pointer-events-none"></div>
        {!pairing ? (  
          <>  
            <div className="relative px-6 pt-10 pb-4 text-center z-10">  
              <div className="flex items-center justify-center gap-2 mb-1 cursor-pointer" onClick={logout} title="Sair">  
                <Wine className="w-6 h-6 text-[#800020]" />  
                <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">EasyWine</h1>  
              </div>  
              <p className="text-gray-400 text-xs tracking-widest uppercase">Olá, {userName}</p>
            </div>  
            <div className="p-6 space-y-8 z-10 relative">  
              <div className="flex justify-center transform transition-all duration-300 hover:scale-105">  
                <input type="file" accept="image/*" capture="environment" onChange={handleImageCapture} ref={fileInputRef} className="hidden" id="imageInput" />  
                {image ? (  
                  <div className="relative w-full group">  
                    <img src={image} alt="Prato" className="w-full h-72 object-cover rounded-3xl shadow-xl" />  
                    <button onClick={() => setImage(null)} className="absolute top-4 right-4 bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white text-red-600 transition-colors"><X className="w-5 h-5" /></button>  
                  </div>  
                ) : (  
                  <label htmlFor="imageInput" className="cursor-pointer w-full">  
                    <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-[#800020] to-[#500010] flex flex-col items-center justify-center shadow-2xl ring-4 ring-white relative overflow-hidden group">  
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      <Camera className="w-14 h-14 text-white mb-3 drop-shadow-md" strokeWidth={1.5} />  
                      <span className="text-white font-medium text-sm tracking-wide">Foto do Prato</span>  
                    </div>  
                  </label>  
                )}  
              </div>  
              <div className="relative group">  
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />  
                <input type="text" value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder={`O que vamos comer hoje?`} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-800 focus:ring-2 focus:ring-[#800020] focus:border-transparent transition-all shadow-sm" />  
              </div>  
              <div>  
                <h3 className="text-gray-900 text-sm font-bold mb-3 ml-1 flex items-center gap-2"><Utensils className="w-4 h-4 text-gray-400" /> Categorias</h3>  
                <div className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide">  
                  {quickFilters.map((filter) => (  
                    <button key={filter.id} onClick={() => setSelectedFilter(filter.id === selectedFilter ? null : filter.id)} className={`flex-shrink-0 flex flex-col items-center justify-center w-[88px] h-[88px] rounded-2xl border transition-all ${selectedFilter === filter.id ? 'bg-[#800020] border-[#800020] text-white shadow-lg transform scale-105' : 'bg-white border-gray-100 text-gray-600 hover:border-red-100'}`}>  
                      <span className="text-3xl mb-1">{filter.emoji}</span>  
                      <span className="text-xs font-medium">{filter.label}</span>  
                    </button>  
                  ))}  
                </div>  
              </div>  
              <button onClick={analyzePairing} disabled={loading || (!image && !ingredients && !selectedFilter)} className="w-full bg-[#800020] text-white py-4 rounded-2xl font-bold text-base shadow-xl hover:bg-[#600018] flex items-center justify-center gap-3 disabled:opacity-50 transition-all transform active:scale-95">  
                {loading ? (<div className="flex items-center gap-2"><Sparkles className="w-5 h-5 animate-spin" /><span>CONSULTANDO...</span></div>) : (<><span>HARMONIZAR</span> <ChevronRight className="w-5 h-5 opacity-80" /></>)}  
              </button>  
            </div>  
          </>  
        ) : (  
          <>  
            <div className="bg-white px-6 pt-12 pb-8 border-b border-gray-100 relative shadow-sm z-20">  
               <button onClick={reset} className="absolute top-6 left-4 p-2 text-gray-400 hover:text-gray-900 transition-colors"><X className="w-6 h-6" /></button>  
              <div className="text-center space-y-2">  
                <div className="inline-flex items-center justify-center p-2 bg-green-50 text-green-700 rounded-full mb-2 border border-green-100 shadow-sm"><Award className="w-4 h-4 mr-1.5" /> <span className="text-xs font-bold tracking-wide uppercase">Para você, {userName}</span></div>  
                <h2 className="text-3xl font-serif font-bold text-gray-900 leading-tight">{pairing.estilo}</h2>  
                <div className="h-1 w-16 bg-[#800020] mx-auto rounded-full mt-4"></div>  
              </div>  
            </div>  
            <div className="p-6 space-y-6 bg-gray-50 min-h-[calc(100vh-200px)]">  
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">  
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Wine className="w-24 h-24 text-[#800020]" /></div>
                <h3 className="text-gray-900 font-bold mb-3 flex items-center gap-2 relative z-10"><span className="text-[#800020] text-2xl">❝</span> O Veredito</h3>  
                <p className="text-gray-600 leading-relaxed italic text-lg relative z-10">{pairing.explicacao}</p>  
              </div>  
              <div className="grid grid-cols-2 gap-4">  
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center hover:shadow-md transition-shadow">  
                    <Thermometer className="w-6 h-6 text-blue-500 mb-2" />  
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Temperatura</span>  
                    <div className="text-gray-900 font-bold text-lg">{pairing.temperatura}</div>  
                 </div>  
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center hover:shadow-md transition-shadow">  
                    <Globe className="w-6 h-6 text-green-600 mb-2" />  
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Origem</span>  
                    <div className="text-gray-900 font-bold text-sm leading-tight mt-1">{pairing.paises.join(', ')}</div>  
                 </div>  
              </div>  
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">  
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Perfil do Vinho</h3>  
                <div className="flex flex-wrap gap-2 mb-6">  
                   {pairing.perfil.split(',').map((tag, i) => (<span key={i} className="px-3 py-1.5 bg-red-50 text-[#800020] rounded-lg text-sm font-medium border border-red-100">{tag.trim()}</span>))}  
                </div>  
                <div className="space-y-4">  
                  {['corpo', 'acidez', 'taninos', 'docura'].map((attr) => pairing.caracteristicas[attr] > 0 && (<div key={attr} className="flex justify-between items-end"><span className="text-gray-700 font-medium text-sm capitalize">{attr}</span>{renderDots(pairing.caracteristicas[attr])}</div>))}  
                </div>  
              </div>  
              <button onClick={reset} className="w-full py-4 text-gray-500 font-medium text-sm hover:text-[#800020] hover:bg-red-50 rounded-xl transition-colors uppercase tracking-wide">Nova Análise</button>  
            </div>  
          </>  
        )}  
      </div>  
    </div>
  );
}
