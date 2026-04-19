import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCheck, HiOutlineColorSwatch, HiRefresh } from 'react-icons/hi';
import AdminLayout from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { updateThemeApi } from '@/services/api';
import { useTheme, applyThemeToDOM } from '@/context/ThemeContext';

// ─── Preset Themes ───────────────────────────────────────────────
const PRESET_THEMES = [
    {
        id: 'luxury-gold',
        name: 'Luxury Gold',
        description: 'Warm gold & ivory — the Vionara signature',
        preview: ['#C9A14A', '#FFFDF8', '#1A1A1A', '#B08D57'],
        theme: { primaryColor: '#C9A14A', bgColor: '#FFFDF8', textColor: '#1A1A1A', secondaryColor: '#B08D57' },
    },
    {
        id: 'dark-mode',
        name: 'Dark Elegance',
        description: 'Sleek dark background with gold accents',
        preview: ['#D4AF37', '#0F0F0F', '#FFFFFF', '#666666'],
        theme: { primaryColor: '#D4AF37', bgColor: '#0F0F0F', textColor: '#FFFFFF', secondaryColor: '#666666' },
    },
    {
        id: 'minimal-white',
        name: 'Minimal White',
        description: 'Clean, modern, pure white aesthetic',
        preview: ['#222222', '#FFFFFF', '#111111', '#AAAAAA'],
        theme: { primaryColor: '#222222', bgColor: '#FFFFFF', textColor: '#111111', secondaryColor: '#AAAAAA' },
    },
    {
        id: 'rose-luxury',
        name: 'Rose Luxury',
        description: 'Romantic rose gold with blush tones',
        preview: ['#B76E79', '#FFF5F5', '#2D1B1E', '#D4A5A5'],
        theme: { primaryColor: '#B76E79', bgColor: '#FFF5F5', textColor: '#2D1B1E', secondaryColor: '#D4A5A5' },
    },
    {
        id: 'emerald',
        name: 'Emerald Prestige',
        description: 'Rich emerald greens with ivory',
        preview: ['#2D6A4F', '#F0FAF5', '#1A2E22', '#74C69D'],
        theme: { primaryColor: '#2D6A4F', bgColor: '#F0FAF5', textColor: '#1A2E22', secondaryColor: '#74C69D' },
    },
    {
        id: 'midnight-blue',
        name: 'Midnight Blue',
        description: 'Bold navy with silver accents',
        preview: ['#1B4FD8', '#F0F4FF', '#0D1B4B', '#93A8DC'],
        theme: { primaryColor: '#1B4FD8', bgColor: '#F0F4FF', textColor: '#0D1B4B', secondaryColor: '#93A8DC' },
    },
];

// ─── Color Picker Row ─────────────────────────────────────────────
const ColorRow = ({ label, desc, value, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div>
            <p className="text-sm font-medium text-gray-800">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-500 w-20 text-right">{value}</span>
            <label className="relative cursor-pointer group">
                <div
                    className="w-10 h-10 rounded-xl border-4 border-white shadow-md ring-1 ring-gray-200 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: value }}
                />
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
            </label>
        </div>
    </div>
);

// ─── Theme Preview Box ─────────────────────────────────────────────
const ThemePreview = ({ theme }) => (
    <div
        className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg"
        style={{ backgroundColor: theme.bgColor }}
    >
        <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: theme.secondaryColor + '30' }}>
            <span className="font-bold text-sm tracking-widest" style={{ color: theme.primaryColor }}>VIONARA</span>
            <div className="flex gap-3">
                {['Shop', 'About', 'Contact'].map(t => (
                    <span key={t} className="text-xs" style={{ color: theme.textColor + 'BB' }}>{t}</span>
                ))}
            </div>
        </div>

        <div className="px-6 py-8 text-center">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: theme.secondaryColor }}>New Collection</p>
            <h2 className="text-xl font-bold mb-3" style={{ color: theme.textColor }}>The Art of Fine Jewellery</h2>
            <p className="text-xs mb-5" style={{ color: theme.secondaryColor }}>Exploring the intersection of luxury and craftsmanship</p>
            <button className="px-5 py-2 rounded text-xs font-medium text-white" style={{ backgroundColor: theme.primaryColor }}>
                SHOP NOW
            </button>
        </div>

        <div className="flex gap-2 px-4 pb-4">
            {['Rings', 'Earrings', 'Necklaces'].map(cat => (
                <div key={cat} className="flex-1 rounded-lg p-3 border text-center" style={{ borderColor: theme.primaryColor + '40', backgroundColor: theme.primaryColor + '0D' }}>
                    <p className="text-xs font-medium" style={{ color: theme.textColor }}>{cat}</p>
                    <p className="text-[10px] mt-1" style={{ color: theme.secondaryColor }}>View All</p>
                </div>
            ))}
        </div>
    </div>
);

// ─── Main Component ────────────────────────────────
const AdminTheme = () => {
    const { theme: globalTheme, updateTheme: applyGlobalTheme } = useTheme();
    const [localTheme, setLocalTheme] = useState({ primaryColor: '#C9A14A', bgColor: '#FFFFFF', textColor: '#121212', secondaryColor: '#999999' });
    const [themeSaving, setThemeSaving] = useState(false);
    const [activePreset, setActivePreset] = useState(null);

    useEffect(() => {
        if (globalTheme) setLocalTheme(globalTheme);
    }, [globalTheme]);

    const handleColorChange = (key, val) => {
        setLocalTheme(prev => ({ ...prev, [key]: val }));
        setActivePreset(null);
    };

    const applyPreset = (preset) => {
        setLocalTheme(preset.theme);
        setActivePreset(preset.id);
    };

    const resetTheme = () => {
        const defaults = { primaryColor: '#C9A14A', bgColor: '#FFFFFF', textColor: '#121212', secondaryColor: '#999999' };
        setLocalTheme(defaults);
        setActivePreset(null);
    };

    const handleSaveTheme = async () => {
        setThemeSaving(true);
        try {
            const { data } = await updateThemeApi(localTheme);
            if (data.success) {
                applyGlobalTheme(localTheme);
                applyThemeToDOM(localTheme);
                toast.success('🎨 Theme saved & applied globally!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save theme');
        } finally {
            setThemeSaving(false);
        }
    };

    return (
        <div className="w-full">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-heading font-semibold text-lg text-charcoal">Store Theme</h3>
                            <p className="text-xs text-gray-400 mt-1">Customize your website's colors — changes apply instantly.</p>
                        </div>
                        <button onClick={resetTheme} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-charcoal transition-colors px-3 py-1.5 border border-gray-200 rounded-lg hover:border-gray-300">
                            <HiRefresh size={13} /> Reset
                        </button>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Left: Controls */}
                        <div className="space-y-6">
                            {/* Preset Themes */}
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">Preset Themes</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {PRESET_THEMES.map(preset => (
                                        <motion.button
                                            key={preset.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => applyPreset(preset)}
                                            className={`relative text-left p-3 rounded-xl border-2 transition-all ${activePreset === preset.id ? 'border-gold shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                                        >
                                            {activePreset === preset.id && (
                                                <span className="absolute top-2 right-2 w-4 h-4 bg-gold rounded-full flex items-center justify-center">
                                                    <HiOutlineCheck size={10} className="text-white" />
                                                </span>
                                            )}
                                            <div className="flex gap-1 mb-2">
                                                {preset.preview.map((c, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex-1 h-4 rounded-sm first:rounded-l-md last:rounded-r-md border border-gray-100"
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs font-semibold text-gray-800 leading-tight">{preset.name}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{preset.description}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Colors */}
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">Custom Colors</p>
                                <div className="space-y-2">
                                    <ColorRow label="Primary Color" desc="Buttons, highlights, links" value={localTheme.primaryColor} onChange={v => handleColorChange('primaryColor', v)} />
                                    <ColorRow label="Background Color" desc="Main site background" value={localTheme.bgColor} onChange={v => handleColorChange('bgColor', v)} />
                                    <ColorRow label="Text Color" desc="Headings & body content" value={localTheme.textColor} onChange={v => handleColorChange('textColor', v)} />
                                    <ColorRow label="Secondary Color" desc="Accents, muted text, borders" value={localTheme.secondaryColor} onChange={v => handleColorChange('secondaryColor', v)} />
                                </div>
                            </div>

                            {/* CSS Variables Info */}
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">Generated CSS Variables</p>
                                <pre className="text-[11px] text-gray-600 font-mono leading-relaxed">
{`:root {
  --theme-primary: ${localTheme.primaryColor};
  --theme-bg:      ${localTheme.bgColor};
  --theme-text:    ${localTheme.textColor};
  --theme-secondary: ${localTheme.secondaryColor};
}`}
                                </pre>
                            </div>
                        </div>

                        {/* Right: Live Preview */}
                        <div>
                            <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">Live Preview</p>
                            <ThemePreview theme={localTheme} />
                            <p className="text-[11px] text-gray-400 text-center mt-3">Preview updates in real-time as you adjust colors</p>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400">Saved theme is applied globally to all visitors.</p>
                        <button
                            onClick={handleSaveTheme}
                            disabled={themeSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gold text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-all disabled:opacity-60 shadow-sm hover:shadow-md"
                        >
                            <HiOutlineColorSwatch size={16} />
                            {themeSaving ? 'Saving...' : 'Save Theme'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminTheme;
