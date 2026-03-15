'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Palette, Upload, Download, Copy, ChevronRight, Sparkles, X, Check, Layers, Shirt, Trophy, Baby, Briefcase } from 'lucide-react'

/* ─── Division & Product Config ─── */
const DIVISIONS = [
  { id: 'fashion', label: 'Fashion', icon: Shirt },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'kids', label: 'Kids', icon: Baby },
  { id: 'accessories', label: 'Accessories', icon: Briefcase },
]

interface Placement {
  w: number
  h: number
  dpi: number
  label: string
}

interface Product {
  id: string
  name: string
  printfulId: number
  placements: Record<string, Placement>
  mockupType: string
  baseColor: string
}

const PRODUCTS: Record<string, Product[]> = {
  fashion: [
    { id: 'aop-hoodie', name: 'All-Over Print Hoodie', printfulId: 388, placements: { front: { w: 6000, h: 6000, dpi: 150, label: 'Front' }, back: { w: 6000, h: 6000, dpi: 150, label: 'Back' }, sleeve_left: { w: 6000, h: 6000, dpi: 150, label: 'Left Sleeve' }, sleeve_right: { w: 6000, h: 6000, dpi: 150, label: 'Right Sleeve' }, hood: { w: 6000, h: 6000, dpi: 150, label: 'Hood' } }, mockupType: 'hoodie', baseColor: '#1a1a1a' },
    { id: 'aop-cotton-hoodie', name: 'Cotton Hoodie (DTF)', printfulId: 1419, placements: { front: { w: 6000, h: 6000, dpi: 150, label: 'Front' }, back: { w: 6000, h: 6000, dpi: 150, label: 'Back' }, sleeve_left: { w: 6000, h: 6000, dpi: 150, label: 'Left Sleeve' }, sleeve_right: { w: 6000, h: 6000, dpi: 150, label: 'Right Sleeve' }, hood: { w: 6000, h: 6000, dpi: 150, label: 'Hood' } }, mockupType: 'hoodie', baseColor: '#f5f5f5' },
    { id: 'aop-sweatshirt', name: 'Cotton Sweatshirt (DTF)', printfulId: 1418, placements: { front: { w: 5037, h: 6600, dpi: 150, label: 'Front' }, back: { w: 5037, h: 6600, dpi: 150, label: 'Back' }, sleeve_left: { w: 5037, h: 6600, dpi: 150, label: 'Left Sleeve' }, sleeve_right: { w: 5037, h: 6600, dpi: 150, label: 'Right Sleeve' } }, mockupType: 'sweatshirt', baseColor: '#f5f5f5' },
    { id: 'aop-long-sleeve', name: "Men's Long Sleeve", printfulId: 920, placements: { front: { w: 4652, h: 5428, dpi: 150, label: 'Front' }, back: { w: 4655, h: 5427, dpi: 150, label: 'Back' }, sleeve_left: { w: 3910, h: 4445, dpi: 150, label: 'Left Sleeve' }, sleeve_right: { w: 3910, h: 4445, dpi: 150, label: 'Right Sleeve' } }, mockupType: 'longsleeve', baseColor: '#f5f5f5' },
    { id: 'aop-tee-mens', name: "Men's Crew Neck Tee", printfulId: 257, placements: { front: { w: 4200, h: 5400, dpi: 150, label: 'Front' }, back: { w: 4200, h: 5400, dpi: 150, label: 'Back' }, sleeve_left: { w: 3000, h: 1800, dpi: 150, label: 'Left Sleeve' }, sleeve_right: { w: 3000, h: 1800, dpi: 150, label: 'Right Sleeve' } }, mockupType: 'tshirt', baseColor: '#f5f5f5' },
    { id: 'aop-athletic-tee', name: "Men's Athletic Tee", printfulId: 328, placements: { front: { w: 4200, h: 5400, dpi: 150, label: 'Front' }, back: { w: 4200, h: 5400, dpi: 150, label: 'Back' }, sleeve_left: { w: 3300, h: 1800, dpi: 150, label: 'Left Sleeve' }, sleeve_right: { w: 3300, h: 1800, dpi: 150, label: 'Right Sleeve' } }, mockupType: 'tshirt', baseColor: '#f5f5f5' },
    { id: 'aop-zip-hoodie', name: 'Zip Hoodie', printfulId: 717, placements: { front: { w: 6000, h: 6000, dpi: 150, label: 'Front' }, back: { w: 6000, h: 6000, dpi: 150, label: 'Back' }, sleeve_left: { w: 6000, h: 6000, dpi: 150, label: 'Left Sleeve' }, sleeve_right: { w: 6000, h: 6000, dpi: 150, label: 'Right Sleeve' }, hood: { w: 6000, h: 6000, dpi: 150, label: 'Hood' } }, mockupType: 'ziphoodie', baseColor: '#1a1a1a' },
  ],
  sports: [
    { id: 'aop-joggers-mens', name: "Men's Joggers", printfulId: 400, placements: { leg_right: { w: 4950, h: 7500, dpi: 150, label: 'Right Leg' }, leg_left: { w: 4950, h: 7500, dpi: 150, label: 'Left Leg' } }, mockupType: 'joggers', baseColor: '#1a1a1a' },
    { id: 'aop-wide-joggers', name: 'Wide-Leg Joggers', printfulId: 784, placements: { front: { w: 9750, h: 8100, dpi: 150, label: 'Front' }, back: { w: 9750, h: 8100, dpi: 150, label: 'Back' } }, mockupType: 'joggers', baseColor: '#1a1a1a' },
    { id: 'aop-warmup-hoodie', name: 'Sports Warmup Hoodie', printfulId: 919, placements: { front: { w: 6000, h: 6000, dpi: 150, label: 'Front' }, back: { w: 6000, h: 6000, dpi: 150, label: 'Back' }, sleeve_left: { w: 6000, h: 6000, dpi: 150, label: 'Left Sleeve' }, sleeve_right: { w: 6000, h: 6000, dpi: 150, label: 'Right Sleeve' } }, mockupType: 'hoodie', baseColor: '#1a1a1a' },
  ],
  kids: [
    { id: 'aop-kids-swimsuit', name: 'Kids Swimsuit', printfulId: 345, placements: { front: { w: 4350, h: 4950, dpi: 150, label: 'Front' }, back: { w: 4350, h: 4950, dpi: 150, label: 'Back' } }, mockupType: 'swimsuit', baseColor: '#f5f5f5' },
    { id: 'aop-kids-tee', name: 'Kids Crew Neck Tee', printfulId: 384, placements: { front: { w: 4200, h: 5400, dpi: 150, label: 'Front' }, back: { w: 4200, h: 5400, dpi: 150, label: 'Back' } }, mockupType: 'tshirt', baseColor: '#f5f5f5' },
  ],
  accessories: [
    { id: 'aop-beanie', name: 'Beanie', printfulId: 458, placements: { front: { w: 3000, h: 1800, dpi: 150, label: 'Full Print' } }, mockupType: 'beanie', baseColor: '#1a1a1a' },
    { id: 'aop-tote', name: 'Large Tote Bag', printfulId: 274, placements: { front: { w: 4200, h: 5400, dpi: 150, label: 'Front' }, back: { w: 4200, h: 5400, dpi: 150, label: 'Back' } }, mockupType: 'tote', baseColor: '#f5f5f5' },
    { id: 'aop-backpack', name: 'Backpack', printfulId: 279, placements: { front: { w: 4200, h: 5400, dpi: 150, label: 'Front' } }, mockupType: 'backpack', baseColor: '#1a1a1a' },
    { id: 'aop-fanny', name: 'Fanny Pack', printfulId: 350, placements: { front: { w: 4200, h: 2400, dpi: 150, label: 'Full Print' } }, mockupType: 'fannypack', baseColor: '#1a1a1a' },
  ],
}

/* ─── Garment SVG Paths ─── */
const GARMENT_PATHS: Record<string, string> = {
  hoodie: 'M100,80 L100,40 Q100,20 120,15 L140,10 Q160,5 160,25 L160,35 Q160,45 170,45 L180,45 Q190,45 190,35 L190,25 Q190,5 210,10 L230,15 Q250,20 250,40 L250,80 L280,100 L280,160 L250,150 L250,340 L100,340 L100,150 L70,160 L70,100 Z',
  sweatshirt: 'M105,60 L105,40 Q130,20 155,15 L165,15 Q200,20 225,40 L225,60 L270,80 L270,140 L225,125 L225,340 L105,340 L105,125 L60,140 L60,80 Z',
  longsleeve: 'M110,55 L110,40 Q135,20 160,15 L170,15 Q195,20 220,40 L220,55 L285,85 L285,145 L220,120 L220,340 L110,340 L110,120 L45,145 L45,85 Z',
  tshirt: 'M110,60 L110,40 Q135,20 160,15 L170,15 Q195,20 220,40 L220,60 L260,80 L260,120 L220,105 L220,340 L110,340 L110,105 L70,120 L70,80 Z',
  joggers: 'M110,60 L110,40 Q140,30 165,30 Q190,30 220,40 L220,60 L220,200 L235,340 L195,340 L165,230 L135,340 L95,340 L110,200 Z',
  ziphoodie: 'M100,80 L100,40 Q100,20 120,15 L140,10 Q160,5 160,25 L160,35 Q160,45 170,45 L180,45 Q190,45 190,35 L190,25 Q190,5 210,10 L230,15 Q250,20 250,40 L250,80 L280,100 L280,160 L250,150 L250,340 L100,340 L100,150 L70,160 L70,100 Z',
  swimsuit: 'M120,60 Q130,40 150,35 L180,35 Q200,40 210,60 L215,100 L215,200 Q215,240 200,260 L200,340 L180,340 L175,280 L155,280 L150,340 L130,340 L130,260 Q115,240 115,200 L115,100 Z',
  beanie: 'M85,120 Q85,80 165,80 Q245,80 245,120 L245,220 Q245,280 165,290 Q85,280 85,220 Z',
  tote: 'M100,100 L230,100 L230,320 L100,320 Z',
  backpack: 'M95,80 Q95,68 107,68 L223,68 Q235,68 235,80 L235,320 L95,320 Z',
  fannypack: 'M80,150 Q80,120 110,120 L220,120 Q250,120 250,150 L250,210 Q250,240 220,240 L110,240 Q80,240 80,210 Z',
}

/* ─── Midjourney Prompt Suggestions ─── */
const PROMPTS = [
  { style: 'Y2K Cyber Tribal', prompt: 'seamless tribal flame pattern, Y2K cyber aesthetic, bold flowing shapes, halftone dot texture, blue on white, all-over print textile design --tile --ar 1:1' },
  { style: 'Graffiti Streetwear', prompt: 'graffiti spray paint pattern, urban streetwear, dripping ink, bold letters and tags, black gold color scheme, all-over print fabric design --tile --ar 1:1' },
  { style: 'Dark Luxury', prompt: 'luxury monogram pattern, dark black with gold metallic accents, ornate filigree, baroque inspired, premium streetwear textile, seamless repeating --tile --ar 1:1' },
  { style: 'Pit Bull Camo', prompt: 'abstract camouflage pattern with subtle pit bull silhouettes, military olive black grey, aggressive streetwear textile design, seamless --tile --ar 1:1' },
  { style: 'Futuristic Circuit', prompt: 'futuristic circuit board pattern, neon lines on matte black, tech streetwear, geometric precision, glowing accents, all-over print --tile --ar 1:1' },
]

/* ─── Garment Mockup Component ─── */
function GarmentMockup({ type, color, designImage }: { type: string; color: string; designImage?: string }) {
  const path = GARMENT_PATHS[type] || GARMENT_PATHS.tshirt
  return (
    <svg viewBox="0 0 330 400" className="w-full max-w-[300px]">
      <defs>
        <clipPath id={`clip-${type}`}><path d={path} /></clipPath>
      </defs>
      {designImage && (
        <image href={designImage} x="45" y="0" width="240" height="400" preserveAspectRatio="xMidYMid slice" clipPath={`url(#clip-${type})`} className="opacity-90" />
      )}
      <path d={path} fill={designImage ? 'none' : color} stroke="rgba(208,185,112,0.2)" strokeWidth="1.5" />
      {type === 'ziphoodie' && <line x1="175" y1="45" x2="175" y2="340" stroke="rgba(208,185,112,0.15)" strokeWidth="2" strokeDasharray="4,4" />}
      {!designImage && <text x="165" y="210" textAnchor="middle" fill="rgba(208,185,112,0.15)" fontSize="13" fontFamily="monospace">DROP DESIGN</text>}
    </svg>
  )
}

/* ─── Main Page ─── */
export default function DesignStudioPage() {
  const [division, setDivision] = useState('fashion')
  const [product, setProduct] = useState<Product | null>(null)
  const [placement, setPlacement] = useState<string | null>(null)
  const [designs, setDesigns] = useState<Record<string, string>>({})
  const [dragOver, setDragOver] = useState(false)
  const [showPrompts, setShowPrompts] = useState(false)
  const [exportProgress, setExportProgress] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const products = PRODUCTS[division] || []

  useEffect(() => {
    if (products.length && !product) {
      setProduct(products[0])
      setPlacement(Object.keys(products[0].placements)[0])
    }
  }, [division])

  useEffect(() => {
    if (product) {
      setPlacement(Object.keys(product.placements)[0])
      setDesigns({})
    }
  }, [product?.id])

  const handleFile = useCallback((file: File) => {
    if (!file?.type.startsWith('image/') || !placement) return
    const reader = new FileReader()
    reader.onload = (e) => setDesigns(prev => ({ ...prev, [placement]: e.target?.result as string }))
    reader.readAsDataURL(file)
  }, [placement])

  const handleExport = useCallback(() => {
    if (!product || !placement || !designs[placement]) return
    const spec = product.placements[placement]
    setExportProgress('Rendering...')
    const canvas = document.createElement('canvas')
    canvas.width = spec.w; canvas.height = spec.h
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const scale = Math.max(spec.w / img.width, spec.h / img.height)
      const sw = img.width * scale, sh = img.height * scale
      ctx.drawImage(img, (spec.w - sw) / 2, (spec.h - sh) / 2, sw, sh)
      canvas.toBlob((blob) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob!)
        a.download = `crunchtyme-${product.id}-${placement}-${spec.w}x${spec.h}.png`
        a.click()
        setExportProgress(null)
      }, 'image/png')
    }
    img.onerror = () => { setExportProgress(null) }
    img.src = designs[placement]
  }, [product, placement, designs])

  const applyToAll = useCallback(() => {
    if (!product || !placement || !designs[placement]) return
    const img = designs[placement]
    const next: Record<string, string> = {}
    Object.keys(product.placements).forEach(k => { next[k] = img })
    setDesigns(next)
  }, [product, placement, designs])

  const spec = product?.placements?.[placement || '']
  const currentDesign = designs[placement || '']
  const filledCount = product ? Object.keys(product.placements).filter(k => designs[k]).length : 0
  const totalPlacements = product ? Object.keys(product.placements).length : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Palette size={16} className="text-gold" />
            </div>
            <h1 className="text-xl font-display text-white">Design Studio</h1>
          </div>
          <p className="text-white/40 text-xs font-heading tracking-wider">Map AI-generated designs onto Printful products</p>
        </div>
        <button onClick={() => setShowPrompts(!showPrompts)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-heading tracking-wider transition-all ${showPrompts ? 'bg-gold/15 text-gold border border-gold/30' : 'bg-white/5 text-white/50 border border-white/10 hover:text-gold hover:border-gold/20'}`}>
          <Sparkles size={14} /> AI Prompts
        </button>
      </div>

      <div className="flex gap-4">
        {/* Left: Division + Products */}
        <div className="w-60 shrink-0 space-y-3">
          {/* Division tabs */}
          <div className="grid grid-cols-4 gap-1 bg-brand-charcoal rounded-lg p-1">
            {DIVISIONS.map(d => {
              const Icon = d.icon
              return (
                <button key={d.id} onClick={() => { setDivision(d.id); setProduct(null) }} className={`flex flex-col items-center gap-0.5 py-2 rounded-md text-[10px] font-heading tracking-wider transition-all ${division === d.id ? 'bg-gold/10 text-gold' : 'text-white/30 hover:text-white/50'}`}>
                  <Icon size={14} />{d.label}
                </button>
              )
            })}
          </div>

          {/* Product list */}
          <div className="space-y-1">
            <p className="text-[9px] text-white/30 font-heading tracking-[0.2em] uppercase px-1">Products</p>
            {products.map(p => (
              <button key={p.id} onClick={() => setProduct(p)} className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${product?.id === p.id ? 'bg-gold/8 border border-gold/20 text-gold' : 'text-white/50 hover:text-white/70 border border-transparent'}`}>
                <div className="text-xs font-heading">{p.name}</div>
                <div className="text-[10px] text-white/25 mt-0.5">{Object.keys(p.placements).length} zones · #{p.printfulId}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Workspace */}
        <div className="flex-1 space-y-4">
          {product ? (
            <>
              {/* Placement pills */}
              <div className="flex flex-wrap gap-2 items-center">
                {Object.entries(product.placements).map(([key, val]) => (
                  <button key={key} onClick={() => setPlacement(key)} className={`px-3 py-1.5 rounded-full text-xs font-heading tracking-wider transition-all border ${placement === key ? (designs[key] ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-gold/10 border-gold/25 text-gold') : (designs[key] ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400/50' : 'bg-white/3 border-white/8 text-white/35')}`}>
                    {designs[key] && <Check size={10} className="inline mr-1" />}{val.label}
                  </button>
                ))}
                <span className="text-[10px] text-white/25 ml-auto">{filledCount}/{totalPlacements} filled</span>
                {currentDesign && totalPlacements > 1 && (
                  <button onClick={applyToAll} className="px-3 py-1.5 rounded-full text-[11px] font-heading tracking-wider bg-gold/8 border border-gold/15 text-gold/70 hover:text-gold transition-colors">
                    <Copy size={10} className="inline mr-1" />Apply to all
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                {/* Mockup Preview */}
                <div className="w-[300px] shrink-0 space-y-3">
                  <div className="bg-brand-charcoal/50 border border-white/5 rounded-xl p-5 flex justify-center items-center min-h-[380px]">
                    <GarmentMockup type={product.mockupType} color={product.baseColor} designImage={currentDesign} />
                  </div>
                  {spec && (
                    <div className="bg-gold/4 border border-gold/10 rounded-lg p-3 grid grid-cols-3 gap-2 text-center">
                      <div><p className="text-[9px] text-white/30 font-heading tracking-widest uppercase">Size</p><p className="text-sm text-gold font-display mt-0.5">{spec.w}×{spec.h}</p></div>
                      <div><p className="text-[9px] text-white/30 font-heading tracking-widest uppercase">DPI</p><p className="text-sm text-gold font-display mt-0.5">{spec.dpi}</p></div>
                      <div><p className="text-[9px] text-white/30 font-heading tracking-widest uppercase">Print</p><p className="text-sm text-gold font-display mt-0.5">{Math.round(spec.w/spec.dpi)}″×{Math.round(spec.h/spec.dpi)}″</p></div>
                    </div>
                  )}
                </div>

                {/* Upload + Actions */}
                <div className="flex-1 space-y-3">
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
                    onClick={() => fileRef.current?.click()}
                    className={`relative min-h-[240px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${dragOver ? 'border-gold bg-gold/5' : currentDesign ? 'border-emerald-500/30 bg-emerald-500/3' : 'border-white/10 bg-white/[0.01] hover:border-gold/20'}`}
                  >
                    <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
                    {currentDesign ? (
                      <div className="p-4 text-center">
                        <img src={currentDesign} alt="" className="max-h-[200px] mx-auto rounded-lg object-contain" />
                        <p className="text-emerald-400 text-xs font-heading mt-3 tracking-wider">✓ Design loaded · Click to replace</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-gold/8 flex items-center justify-center mb-3"><Upload size={20} className="text-gold/50" /></div>
                        <p className="text-white/50 text-sm font-heading">Drop your AI-generated design here</p>
                        <p className="text-white/25 text-xs font-heading mt-1">PNG or JPG from Midjourney, DALL-E, etc.</p>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleExport} disabled={!currentDesign} className={`flex-1 py-3 rounded-lg text-sm font-display tracking-wider transition-all ${currentDesign ? 'bg-gradient-to-r from-gold to-gold-dark text-brand-black hover:opacity-90' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}>
                      <Download size={14} className="inline mr-2" />{exportProgress || (spec ? `Export ${spec.w}×${spec.h}px` : 'Export')}
                    </button>
                    {currentDesign && (
                      <button onClick={() => setDesigns(prev => { const n = { ...prev }; delete n[placement!]; return n })} className="px-4 py-3 rounded-lg bg-red-500/8 border border-red-500/15 text-red-400 text-xs font-heading hover:bg-red-500/15 transition-colors">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Workflow */}
                  <div className="bg-brand-charcoal/30 border border-white/5 rounded-lg p-3">
                    <p className="text-[9px] text-white/30 font-heading tracking-[0.2em] uppercase mb-2">Workflow</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { n: '1', t: 'Generate', s: 'Midjourney --tile' },
                        { n: '2', t: 'Upload', s: 'Drag & drop PNG' },
                        { n: '3', t: 'Export', s: 'Auto-sized' },
                        { n: '4', t: 'Printful', s: 'Upload & print' },
                      ].map((step, i) => (
                        <div key={i} className="text-center">
                          <div className="w-6 h-6 rounded-full bg-gold/10 text-gold text-[10px] font-display inline-flex items-center justify-center mb-1">{step.n}</div>
                          <p className="text-[11px] text-white/50 font-heading">{step.t}</p>
                          <p className="text-[9px] text-white/25">{step.s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center py-24 text-center">
              <div><Layers size={40} className="text-white/10 mx-auto mb-3" /><p className="text-white/30 text-sm font-heading">Select a product to start designing</p></div>
            </div>
          )}
        </div>

        {/* Right: AI Prompts Panel */}
        {showPrompts && (
          <div className="w-72 shrink-0 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-gold font-heading tracking-[0.2em] uppercase">Prompt Library</p>
              <button onClick={() => setShowPrompts(false)} className="text-white/30 hover:text-white/50"><X size={14} /></button>
            </div>
            <p className="text-[11px] text-white/30 leading-relaxed">Copy into Midjourney. Use <code className="text-gold bg-gold/8 px-1 rounded text-[10px]">--tile</code> for seamless patterns.</p>
            {PROMPTS.map((p, i) => {
              const [copied, setCopied] = useState(false)
              return (
                <button key={i} onClick={() => { navigator.clipboard.writeText(p.prompt); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="w-full text-left bg-gold/[0.03] border border-gold/10 rounded-lg p-3 hover:border-gold/25 transition-all">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gold text-xs font-heading tracking-wider">{p.style}</span>
                    <span className={`text-[10px] ${copied ? 'text-emerald-400' : 'text-white/20'}`}>{copied ? '✓ Copied' : 'Click to copy'}</span>
                  </div>
                  <p className="text-white/30 text-[10px] leading-relaxed font-mono">{p.prompt}</p>
                </button>
              )
            })}
            <div className="bg-gold/[0.03] border border-gold/10 rounded-lg p-3">
              <p className="text-[11px] text-white/35 leading-relaxed"><span className="text-gold font-heading">Pro tip:</span> Upscale to 4000px+ using <span className="text-white/50">Topaz Gigapixel</span> or free <span className="text-white/50">Upscayl</span> before uploading.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

