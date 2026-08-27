/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Palette exacte extraite du logo GAT Assurances ──────────────
        gat: {
          violet:       '#6B2D8B',   // G du logo — violet/mauve foncé
          'violet-dark':'#4A1A6B',   // violet plus profond
          'violet-light':'#9B4DBB',  // violet clair
          red:          '#E5162A',   // A du logo + "ASSURANCES" + boutons
          'red-dark':   '#B5101F',   // rouge foncé hover
          'red-light':  '#FF3348',   // rouge clair
          gold:         '#F5A623',   // T du logo — jaune/or
          'gold-dark':  '#D4891A',   // or foncé
          'gold-light': '#FFB940',   // or clair
          magenta:      '#C4187A',   // bandeau latéral GAT
          'magenta-dark':'#9E1262',  // magenta foncé
          white:        '#FFFFFF',
          gray:         '#F8F7FB',   // fond app très légèrement teinté
          'gray-light': '#F3F0F8',
          'gray-border':'#E8E2F0',
          dark:         '#1A0830',   // texte très sombre
        },
        // ── Alias primary → violet GAT ────────────────────────────────
        primary: {
          50:  '#F5EEF8',
          100: '#E8D5F5',
          200: '#D4AAEA',
          300: '#BB7EDB',
          400: '#9B4DBB',
          500: '#6B2D8B',
          600: '#5A2476',
          700: '#4A1A6B',
          800: '#38135A',
          900: '#280D40',
          950: '#1A0830',
        },
        accent: {
          50:  '#FFF0F2',
          100: '#FFD9DE',
          200: '#FFB3BC',
          300: '#FF7A8A',
          400: '#FF3348',
          500: '#E5162A',
          600: '#B5101F',
          700: '#8F0D18',
          800: '#6B0B13',
          900: '#45080D',
        },
        gold: {
          50:  '#FFFBF0',
          100: '#FFF3CC',
          200: '#FFE599',
          300: '#FFD166',
          400: '#FFB940',
          500: '#F5A623',
          600: '#D4891A',
          700: '#A86D14',
          800: '#7D510F',
          900: '#52360A',
        },
        magenta: {
          50:  '#FFF0F7',
          100: '#FFD9EE',
          200: '#FFB3DD',
          300: '#FF7AC4',
          400: '#E83DA3',
          500: '#C4187A',
          600: '#9E1262',
          700: '#7D0E4E',
          800: '#5C0A3A',
          900: '#3B0625',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        // Dégradés exacts logo GAT
        'gat-main':     'linear-gradient(135deg, #6B2D8B 0%, #E5162A 100%)',
        'gat-soft':     'linear-gradient(135deg, #6B2D8B 0%, #9B4DBB 40%, #E5162A 100%)',
        'gat-gold':     'linear-gradient(135deg, #6B2D8B 0%, #F5A623 100%)',
        'gat-hot':      'linear-gradient(135deg, #E5162A 0%, #C4187A 100%)',
        'gat-tri':      'linear-gradient(135deg, #6B2D8B 0%, #E5162A 50%, #F5A623 100%)',
        'gat-sidebar':  'linear-gradient(180deg, #1A0830 0%, #4A1A6B 30%, #6B2D8B 60%, #9E1262 100%)',
        'gat-navbar':   'linear-gradient(90deg, #6B2D8B 0%, #E5162A 100%)',
        'gat-hero':     'linear-gradient(135deg, #1A0830 0%, #4A1A6B 35%, #6B2D8B 65%, #C4187A 100%)',
        'gat-card':     'linear-gradient(145deg, rgba(107,45,139,0.06) 0%, rgba(229,22,42,0.04) 100%)',
        'gat-magenta':  'linear-gradient(135deg, #C4187A 0%, #6B2D8B 100%)',
        'glass':        'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'gat':        '0 4px 24px rgba(107,45,139,0.20)',
        'gat-lg':     '0 8px 40px rgba(107,45,139,0.28)',
        'gat-xl':     '0 16px 60px rgba(107,45,139,0.35)',
        'red':        '0 4px 20px rgba(229,22,42,0.30)',
        'gold':       '0 4px 20px rgba(245,166,35,0.30)',
        'magenta':    '0 4px 20px rgba(196,24,122,0.30)',
        'card':       '0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(107,45,139,0.06)',
        'card-hover': '0 8px 32px rgba(107,45,139,0.16)',
        'navbar':     '0 2px 24px rgba(107,45,139,0.15)',
        'sidebar':    '4px 0 24px rgba(0,0,0,0.20)',
        'button':     '0 3px 10px rgba(107,45,139,0.35)',
        'button-red': '0 3px 10px rgba(229,22,42,0.35)',
        'glass':      '0 8px 32px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.22)',
        'input':      '0 0 0 3px rgba(107,45,139,0.14)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in':      'fadeIn 0.3s ease-out both',
        'slide-up':     'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'slide-down':   'slideDown 0.3s ease-out both',
        'slide-left':   'slideLeft 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in':     'scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) both',
        'shimmer':      'shimmer 1.5s ease-in-out infinite',
        'pulse-gat':    'pulseGat 2s ease-in-out infinite',
        'float':        'float 3.5s ease-in-out infinite',
        'count-up':     'countUp 0.7s ease-out both',
        'spin-slow':    'spin 4s linear infinite',
        'bounce-soft':  'bounceSoft 0.5s ease-out',
        'glow':         'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:     { from:{ opacity:'0' }, to:{ opacity:'1' } },
        slideUp:    { from:{ opacity:'0', transform:'translateY(16px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        slideDown:  { from:{ opacity:'0', transform:'translateY(-16px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        slideLeft:  { from:{ opacity:'0', transform:'translateX(-20px)' }, to:{ opacity:'1', transform:'translateX(0)' } },
        scaleIn:    { from:{ opacity:'0', transform:'scale(0.94)' }, to:{ opacity:'1', transform:'scale(1)' } },
        shimmer:    { '0%':{ backgroundPosition:'-200% 0' }, '100%':{ backgroundPosition:'200% 0' } },
        pulseGat:   { '0%,100%':{ opacity:'1', boxShadow:'0 0 0 0 rgba(107,45,139,0.4)' }, '50%':{ opacity:'0.85', boxShadow:'0 0 0 8px rgba(107,45,139,0)' } },
        float:      { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-8px)' } },
        countUp:    { from:{ opacity:'0', transform:'translateY(10px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        bounceSoft: { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-5px)' } },
        glow:       { '0%,100%':{ boxShadow:'0 0 5px rgba(107,45,139,0.3)' }, '50%':{ boxShadow:'0 0 20px rgba(107,45,139,0.6)' } },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [
    function({ addUtilities, addComponents }) {
      addUtilities({
        '.text-gat':         { background:'linear-gradient(135deg,#6B2D8B,#E5162A)', '-webkit-background-clip':'text', '-webkit-text-fill-color':'transparent', 'background-clip':'text' },
        '.text-gat-gold':    { background:'linear-gradient(135deg,#6B2D8B,#F5A623)', '-webkit-background-clip':'text', '-webkit-text-fill-color':'transparent', 'background-clip':'text' },
        '.text-gat-hot':     { background:'linear-gradient(135deg,#E5162A,#C4187A)', '-webkit-background-clip':'text', '-webkit-text-fill-color':'transparent', 'background-clip':'text' },
        '.glass-light':      { background:'rgba(255,255,255,0.10)', 'backdrop-filter':'blur(16px)', '-webkit-backdrop-filter':'blur(16px)', border:'1px solid rgba(255,255,255,0.18)' },
        '.glass-dark':       { background:'rgba(26,8,48,0.55)', 'backdrop-filter':'blur(20px)', '-webkit-backdrop-filter':'blur(20px)', border:'1px solid rgba(255,255,255,0.12)' },
        '.scrollbar-hide':   { '-ms-overflow-style':'none', 'scrollbar-width':'none', '&::-webkit-scrollbar':{ display:'none' } },
        '.no-select':        { '-webkit-user-select':'none', '-moz-user-select':'none', 'user-select':'none' },
      });
      addComponents({
        // ── Boutons GAT ────────────────────────────────────────────────
        '.btn':          { '@apply inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer select-none whitespace-nowrap':{}  },
        '.btn-gat':      { '@apply btn bg-gat-main text-white shadow-button hover:shadow-gat hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none':{}  },
        '.btn-red':      { '@apply btn bg-gat-red text-white shadow-button-red hover:bg-gat-red-dark hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50':{}  },
        '.btn-gold':     { '@apply btn bg-gat-gold text-white shadow-gold hover:bg-gat-gold-dark hover:-translate-y-0.5 disabled:opacity-50':{}  },
        '.btn-magenta':  { '@apply btn bg-gat-hot text-white shadow-magenta hover:-translate-y-0.5 disabled:opacity-50':{}  },
        '.btn-outline':  { '@apply btn border-2 border-gat-violet text-gat-violet hover:bg-gat-violet hover:text-white transition-all':{}  },
        '.btn-ghost':    { '@apply btn text-gray-600 hover:bg-gray-100 hover:text-gray-900':{}  },
        '.btn-sm':       { '@apply btn px-3 py-1.5 text-xs rounded-lg':{}  },
        '.btn-lg':       { '@apply btn px-7 py-3.5 text-base rounded-2xl':{}  },
        '.btn-icon':     { '@apply w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gat-violet transition-all':{}  },
        // ── Cards ────────────────────────────────────────────────────────
        '.card':         { '@apply bg-white rounded-2xl border border-gat-gray-border shadow-card p-5':{}  },
        '.card-hover':   { '@apply card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer':{}  },
        '.card-gat':     { '@apply card border-l-4 border-l-gat-violet':{}  },
        '.card-red':     { '@apply card border-l-4 border-l-gat-red':{}  },
        '.card-gold':    { '@apply card border-l-4 border-l-gat-gold':{}  },
        '.card-magenta': { '@apply card border-l-4 border-l-gat-magenta':{}  },
        // ── Badges ───────────────────────────────────────────────────────
        '.badge':         { '@apply inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold':{}  },
        '.badge-violet':  { '@apply badge bg-primary-100 text-primary-700 ring-1 ring-primary-200':{}  },
        '.badge-red':     { '@apply badge bg-accent-100 text-accent-600 ring-1 ring-accent-200':{}  },
        '.badge-gold':    { '@apply badge bg-gold-100 text-gold-700 ring-1 ring-gold-200':{}  },
        '.badge-magenta': { '@apply badge bg-magenta-100 text-magenta-600 ring-1 ring-magenta-200':{}  },
        '.badge-green':   { '@apply badge bg-green-100 text-green-700 ring-1 ring-green-200':{}  },
        '.badge-gray':    { '@apply badge bg-gray-100 text-gray-600 ring-1 ring-gray-200':{}  },
        '.badge-blue':    { '@apply badge bg-blue-100 text-blue-700 ring-1 ring-blue-200':{}  },
        // ── Formulaires ──────────────────────────────────────────────────
        '.form-input':   { '@apply w-full px-4 py-2.5 border border-gat-gray-border rounded-xl text-sm bg-white transition-all duration-200 focus:outline-none focus:border-gat-violet focus:ring-2 focus:ring-primary-100 placeholder:text-gray-400':{}  },
        '.form-label':   { '@apply block text-sm font-semibold text-gray-700 mb-1.5':{}  },
        '.form-error':   { '@apply text-xs text-accent-500 mt-1':{}  },
        // ── Sidebar items ─────────────────────────────────────────────────
        '.nav-item':     { '@apply flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group':{}  },
        '.nav-active':   { '@apply nav-item bg-white/20 text-white shadow-sm backdrop-blur-sm':{}  },
        '.nav-inactive': { '@apply nav-item text-white/65 hover:bg-white/12 hover:text-white':{}  },
        // ── Tableaux ──────────────────────────────────────────────────────
        '.table-wrap':   { '@apply overflow-x-auto rounded-2xl border border-gat-gray-border bg-white':{}  },
        '.data-table':   { '@apply w-full text-sm border-collapse':{}  },
        // ── Stat cards ────────────────────────────────────────────────────
        '.stat-card':    { '@apply card flex items-center gap-4 animate-count-up':{}  },
        // ── Skeleton ──────────────────────────────────────────────────────
        '.skeleton':     { '@apply animate-shimmer bg-gradient-to-r from-gray-100 via-gray-200/60 to-gray-100 bg-[length:200%_100%] rounded-xl':{}  },
        // ── Modal ─────────────────────────────────────────────────────────
        '.modal-overlay':{ '@apply fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm':{}  },
        '.modal-box':    { '@apply bg-white rounded-3xl shadow-gat-xl p-6 w-full max-w-lg animate-scale-in':{}  },
        // ── Avatar ────────────────────────────────────────────────────────
        '.avatar':       { '@apply rounded-full flex items-center justify-center font-bold text-white shrink-0 bg-gat-main':{}  },
        '.avatar-xs':    { '@apply avatar w-7 h-7 text-xs':{}  },
        '.avatar-sm':    { '@apply avatar w-9 h-9 text-sm':{}  },
        '.avatar-md':    { '@apply avatar w-11 h-11 text-base':{}  },
        '.avatar-lg':    { '@apply avatar w-14 h-14 text-lg':{}  },
        '.avatar-xl':    { '@apply avatar w-20 h-20 text-2xl':{}  },
        // ── Progress ──────────────────────────────────────────────────────
        '.progress':     { '@apply h-2 rounded-full bg-gray-100 overflow-hidden':{}  },
        '.progress-bar': { '@apply h-full rounded-full bg-gat-main transition-all duration-500':{}  },
        // ── Divider ───────────────────────────────────────────────────────
        '.divider':      { '@apply h-px bg-gradient-to-r from-transparent via-gat-gray-border to-transparent':{}  },
        // ── Page headers ──────────────────────────────────────────────────
        '.page-header':  { '@apply flex items-center justify-between mb-6':{}  },
        '.page-title':   { '@apply text-2xl font-bold text-gray-900':{}  },
        '.page-subtitle':{ '@apply text-sm text-gray-500 mt-0.5':{}  },
        '.section-title':{ '@apply text-base font-semibold text-gray-800 mb-4':{}  },
        // ── Step workflow ─────────────────────────────────────────────────
        '.step-active':  { '@apply bg-gat-main text-white':{}  },
        '.step-done':    { '@apply bg-green-500 text-white':{}  },
        '.step-pending': { '@apply bg-gray-100 text-gray-400':{}  },
        '.step-error':   { '@apply bg-accent-500 text-white':{}  },
      });
    },
  ],
};
