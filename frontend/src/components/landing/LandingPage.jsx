import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid } from '@mui/material';

/* ── Google Fonts ── */
if (!document.getElementById('lp-font')) {
    const l = document.createElement('link');
    l.id = 'lp-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
    document.head.appendChild(l);
}

/* ── Global keyframes injected once ── */
if (!document.getElementById('lp-styles')) {
    const s = document.createElement('style');
    s.id = 'lp-styles';
    s.textContent = `
    @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes orbPulse{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(25px,-20px) scale(1.08)}}
    @keyframes floatUp{0%,100%{transform:translateY(0) rotateY(-12deg) rotateX(4deg)}50%{transform:translateY(-28px) rotateY(-12deg) rotateX(4deg)}}
    @keyframes floatMid{0%,100%{transform:translateY(-8px) rotateY(8deg) rotateX(-4deg)}50%{transform:translateY(16px) rotateY(8deg) rotateX(-4deg)}}
    @keyframes floatSlow{0%,100%{transform:translateY(6px) rotateY(-6deg) rotateX(6deg)}50%{transform:translateY(-20px) rotateY(-6deg) rotateX(6deg)}}
    @keyframes pageFlip{0%{transform:rotateY(0deg)}40%{transform:rotateY(-160deg)}60%{transform:rotateY(-160deg)}100%{transform:rotateY(0deg)}}
    @keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(147,51,234,.5),0 0 60px rgba(147,51,234,.15)}50%{box-shadow:0 0 40px rgba(147,51,234,.8),0 0 100px rgba(147,51,234,.3)}}
    @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes revealUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
    @keyframes particleDrift{0%{transform:translateY(100vh);opacity:0}10%{opacity:.7}90%{opacity:.3}100%{transform:translateY(-10vh);opacity:0}}
    @keyframes spinRing{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes counterUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    html{scroll-behavior:smooth}*{box-sizing:border-box}
  `;
    document.head.appendChild(s);
}

/* ── Hooks ── */
function useScrollReveal(threshold = 0.15) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

function useCountUp(target, active) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!active) return;
        let cur = 0; const step = target / 80;
        const t = setInterval(() => { cur += step; if (cur >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(cur)); }, 25);
        return () => clearInterval(t);
    }, [target, active]);
    return count;
}

/* ── Logo SVG component ── */
const Logo = ({ size = 36 }) => (
    <img src="/sgi logo.jpg" alt="Digital Library Logo" height={size}
        style={{ width: 'auto', maxWidth: size * 3, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(147,51,234,.7))', flexShrink: 0, borderRadius: '6px' }} />
);

/* ── Open Book 3D Component ── */
const OpenBook3D = ({ color1, color2, title, floatAnim, delay }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <Box onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            sx={{
                perspective: '700px', width: 130, height: 180, flexShrink: 0, cursor: 'pointer',
                animation: `${floatAnim} ${3.5 + Math.random()}s ease-in-out infinite`,
                animationDelay: delay,
                filter: `drop-shadow(0 24px 40px ${color1}88)`,
            }}>
            {/* Book wrapper */}
            <Box sx={{
                width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d',
                transform: `rotateY(-10deg) rotateX(5deg)`
            }}>

                {/* Back cover */}
                <Box sx={{
                    position: 'absolute', inset: 0, borderRadius: '4px 14px 14px 4px',
                    background: `linear-gradient(160deg, ${color2}cc, ${color1}99)`,
                    boxShadow: `inset 0 0 30px rgba(0,0,0,.4)`
                }} />

                {/* Spine */}
                <Box sx={{
                    position: 'absolute', left: 0, top: 0, width: 18, height: '100%',
                    background: `linear-gradient(to right, ${color1}, ${color2})`,
                    borderRadius: '4px 0 0 4px',
                    boxShadow: `2px 0 12px rgba(0,0,0,.5)`
                }} />

                {/* Front cover */}
                <Box sx={{
                    position: 'absolute', inset: 0, borderRadius: '4px 14px 14px 4px',
                    background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 1.5,
                    boxShadow: `4px 4px 20px rgba(0,0,0,.5), inset 0 1px 1px rgba(255,255,255,.2)`,
                }}>
                    <Box sx={{ width: '75%', height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,.8)', mb: .5 }} />
                    <Box sx={{ width: '55%', height: 3, borderRadius: 2, bgcolor: 'rgba(255,255,255,.5)' }} />
                    <Box sx={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,.95)',
                        textAlign: 'center', lineHeight: 1.3, fontFamily: 'Inter, sans-serif', px: .5
                    }}>
                        {title}
                    </Box>
                    {/* Page lines */}
                    {[1, 2, 3].map(i => <Box key={i} sx={{ width: `${80 - i * 10}%`, height: 2, borderRadius: 1, bgcolor: 'rgba(255,255,255,.3)', mb: .5 }} />)}
                </Box>

                {/* Flipping page */}
                <Box sx={{
                    position: 'absolute', top: 8, right: 8, bottom: 8,
                    width: '52%', background: 'rgba(255,255,255,.12)',
                    borderRadius: '2px 10px 10px 2px',
                    transformOrigin: 'left center',
                    animation: hovered ? 'pageFlip 1.8s ease-in-out infinite' : 'none',
                    backfaceVisibility: 'hidden',
                    border: '1px solid rgba(255,255,255,.15)',
                }}>
                    {/* Lines on flipping page */}
                    {[1, 2, 3, 4].map(i => <Box key={i} sx={{ mx: 1, mt: `${i * 18}%`, height: 2, borderRadius: 1, bgcolor: 'rgba(255,255,255,.4)' }} />)}
                </Box>

                {/* Glow rim */}
                <Box sx={{
                    position: 'absolute', inset: -4, borderRadius: '8px 18px 18px 8px',
                    background: 'transparent',
                    boxShadow: hovered ? `0 0 30px ${color1}cc, 0 0 60px ${color1}44` : `0 0 10px ${color1}44`,
                    transition: 'box-shadow .4s ease', pointerEvents: 'none'
                }} />
            </Box>
        </Box>
    );
};

/* ── Feature Card ── */
const FeatureCard = ({ icon, title, desc, color, delay, visible }) => {
    const [hov, setHov] = useState(false);
    return (
        <Box onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            sx={{
                opacity: visible ? 1 : 0,
                transform: visible ? (hov ? 'translateY(-10px) scale(1.02)' : 'translateY(0)') : 'translateY(60px)',
                transition: `opacity .55s ease ${delay}ms, transform .55s cubic-bezier(.4,0,.2,1) ${delay}ms, box-shadow .3s ease, border .3s ease`,
                background: 'rgba(255,255,255,.04)',
                backdropFilter: 'blur(24px)',
                border: `1px solid ${hov ? color + '77' : 'rgba(255,255,255,.07)'}`,
                borderRadius: '22px', p: 4, height: '100%', cursor: 'default',
                boxShadow: hov ? `0 0 40px ${color}22, 0 20px 60px rgba(0,0,0,.35)` : '0 4px 20px rgba(0,0,0,.2)',
            }}>
            <Box sx={{
                width: 54, height: 54, borderRadius: '14px',
                background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px', mb: 3,
                boxShadow: hov ? `0 0 22px ${color}66` : 'none', transition: 'box-shadow .3s ease'
            }}>
                {icon}
            </Box>
            <Typography sx={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem', mb: 1.5, fontFamily: 'Inter, sans-serif' }}>{title}</Typography>
            <Typography sx={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '.9rem', fontFamily: 'Inter, sans-serif' }}>{desc}</Typography>
        </Box>
    );
};

/* ── Stat Card ── */
const StatCard = ({ value, suffix, label, color, active }) => {
    const n = useCountUp(value, active);
    return (
        <Box sx={{
            textAlign: 'center', background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(255,255,255,.07)', borderRadius: '18px',
            backdropFilter: 'blur(20px)', p: { xs: 3, md: 4.5 }
        }}>
            <Typography sx={{
                fontFamily: 'Inter, sans-serif', fontWeight: 900,
                fontSize: { xs: '2.6rem', md: '3.6rem' },
                background: `linear-gradient(135deg, ${color}, #fff)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, mb: 1
            }}>
                {n.toLocaleString()}{suffix}
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '.95rem' }}>{label}</Typography>
        </Box>
    );
};

/* ── Book Card (API) ── */
const BookCard = ({ book, index, navigate }) => {
    const [hov, setHov] = useState(false);
    const colors = ['#9333ea', '#d946ef', '#22d3ee', '#f472b6', '#fb923c', '#34d399'];
    const c = colors[index % colors.length];
    return (
        <Box onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            sx={{
                background: 'rgba(255,255,255,.04)', backdropFilter: 'blur(20px)',
                border: `1px solid ${hov ? c + '88' : 'rgba(255,255,255,.07)'}`,
                borderRadius: '20px', overflow: 'hidden', height: '100%',
                display: 'flex', flexDirection: 'column',
                transition: 'all .4s cubic-bezier(.4,0,.2,1)',
                transform: hov ? 'translateY(-10px) scale(1.02)' : 'translateY(0)',
                boxShadow: hov ? `0 0 50px ${c}33, 0 30px 60px rgba(0,0,0,.4)` : '0 4px 20px rgba(0,0,0,.2)',
            }}>
            <Box sx={{
                height: 200, position: 'relative', overflow: 'hidden',
                background: `linear-gradient(135deg, ${c}33, ${c}11)`
            }}>
                {book.cover_image
                    ? <img src={book.cover_image} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .6s ease', transform: hov ? 'scale(1.08)' : 'scale(1)' }} />
                    : <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px' }}>📖</Box>
                }
                {book.is_premium && (
                    <Box sx={{
                        position: 'absolute', top: 12, right: 12,
                        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                        color: 'white', borderRadius: '8px', px: 1.5, py: .4,
                        fontSize: '11px', fontWeight: 700, letterSpacing: .5
                    }}>PREMIUM</Box>
                )}
            </Box>
            <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ color: c, fontWeight: 700, fontSize: '.75rem', letterSpacing: 1.5, textTransform: 'uppercase', mb: 1, fontFamily: 'Inter, sans-serif' }}>{book.department || 'General'}</Typography>
                <Typography sx={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', mb: .5, lineHeight: 1.3, fontFamily: 'Inter, sans-serif' }}>{book.title}</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '.85rem', mb: 2, fontFamily: 'Inter, sans-serif' }}>by {book.author}</Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '.83rem', lineHeight: 1.6, flex: 1, fontFamily: 'Inter, sans-serif' }}>{book.description?.substring(0, 85)}...</Typography>
                <Button fullWidth onClick={() => navigate('/login')} sx={{
                    mt: 2.5, background: `linear-gradient(135deg, ${c}, ${c}aa)`,
                    color: 'white', borderRadius: '12px', py: 1.2, fontWeight: 700,
                    textTransform: 'none', fontFamily: 'Inter, sans-serif',
                    boxShadow: hov ? `0 0 20px ${c}66` : 'none', transition: 'all .3s ease',
                    '&:hover': { background: `linear-gradient(135deg, ${c}dd, ${c})` },
                }}>Read Now →</Button>
            </Box>
        </Box>
    );
};

/* ══════════════ MAIN PAGE ══════════════ */
const LandingPage = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [scrolled, setScrolled] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    const [statsRef, statsVis] = useScrollReveal(0.2);
    const [featRef, featVis] = useScrollReveal(0.1);
    const [booksRef, booksVis] = useScrollReveal(0.1);
    const [ctaRef, ctaVis] = useScrollReveal(0.2);
    const [logoRef, logoVis] = useScrollReveal(0.2);

    useEffect(() => {
        const onScroll = () => { setScrolled(window.scrollY > 80); setScrollY(window.scrollY); };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                let r = await fetch('http://localhost:8000/api/books/?featured=true');
                if (r.ok) {
                    const d = await r.json();
                    let list = d.books || d.results || [];
                    if (!list.length) {
                        r = await fetch('http://localhost:8000/api/books/');
                        const d2 = await r.json();
                        list = (d2.books || d2.results || []).slice(0, 6);
                    }
                    setBooks(list.slice(0, 6));
                }
            } catch { /* no books shown */ }
        })();
    }, []);

    const placeholderBooks = [
        { title: 'Artificial Intelligence', author: 'Russell & Norvig', department: 'CS', description: 'Comprehensive guide to modern AI algorithms and intelligent systems design for practical applications.' },
        { title: 'Data Structures & Algorithms', author: 'Thomas Cormen', department: 'CS', description: 'Fundamental algorithms, complexity analysis and data structure implementations for modern software.' },
        { title: 'Database Management', author: 'Ramez Elmasri', department: 'IT', description: 'Complete overview of relational databases, SQL optimization, and modern NoSQL architectures.' },
        { title: 'Operating Systems', author: 'Andrew Tanenbaum', department: 'CS', description: 'Deep dive into OS concepts, process management, memory allocation, and system programming.' },
        { title: 'Computer Networks', author: 'James Kurose', department: 'Networks', description: 'Layered network architecture, TCP/IP protocols, security fundamentals, and distributed systems.' },
        { title: 'Machine Learning', author: 'Christopher Bishop', department: 'Data Science', description: 'Bayesian methods, neural networks and probabilistic models for intelligent data analysis.' },
    ];

    const displayBooks = books.length ? books : placeholderBooks;

    const features = [
        { icon: '🤖', title: 'AI-Powered Search', color: '#9333ea', desc: 'Smart semantic search finds exactly what you need across thousands of academic resources instantly.' },
        { icon: '📚', title: 'Vast Library', color: '#d946ef', desc: 'Access thousands of curated books, research papers, and academic resources across all departments.' },
        { icon: '🎓', title: 'Department Filter', color: '#22d3ee', desc: 'Browse by department, semester, and subject for a focused, distraction-free learning experience.' },
        { icon: '🔐', title: 'Secure Access', color: '#38bdf8', desc: 'Enterprise-grade security with role-based access control — your data stays private and safe.' },
        { icon: '📱', title: 'Read Anywhere', color: '#ec4899', desc: 'Beautifully responsive on every device — desktop, tablet, or mobile — anytime, anywhere.' },
        { icon: '📊', title: 'Analytics Dashboard', color: '#10b981', desc: 'Track reading progress, study patterns, and library insights with a comprehensive analytics suite.' },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#03000e', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

            {/* ── NAVBAR ── */}
            <Box component="nav" sx={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                transition: 'all .4s ease',
                background: scrolled ? 'rgba(8,8,28,.88)' : 'transparent',
                backdropFilter: scrolled ? 'blur(28px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,.06)' : 'none',
                boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,.4)' : 'none',
            }}>
                <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', py: { xs: 1, md: 1.8 }, gap: 0.5 }}>
                        {/* LOGO */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, md: 1.5 }, flex: 1, minWidth: 0, overflow: 'hidden' }}>
                            <Logo size={30} />
                            <Typography sx={{
                                fontFamily: 'Inter, sans-serif', fontWeight: 800,
                                fontSize: { xs: '0.82rem', sm: '1rem', md: '1.2rem' },
                                background: 'linear-gradient(135deg, #9333ea, #d946ef, #22d3ee)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                backgroundSize: '200%', animation: 'shimmer 3s linear infinite',
                                whiteSpace: 'nowrap',
                            }}>Digital Library</Typography>
                        </Box>

                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 3 }}>
                            {[].map(l => (
                                <Button key={l} sx={{ color: '#94a3b8', fontWeight: 500, textTransform: 'none', fontFamily: 'Inter, sans-serif', '&:hover': { color: '#f1f5f9' } }}>{l}</Button>
                            ))}
                        </Box>

                        <Box sx={{ display: 'flex', gap: { xs: 0.6, md: 1.5 }, flexShrink: 0 }}>
                            <Button onClick={() => navigate('/login')} sx={{
                                color: '#94a3b8', fontWeight: 600, textTransform: 'none', fontFamily: 'Inter, sans-serif',
                                borderRadius: '8px',
                                px: { xs: 1, sm: 1.8, md: 2.5 },
                                py: { xs: 0.5, md: 0.75 },
                                fontSize: { xs: '0.72rem', sm: '0.82rem', md: '0.9rem' },
                                minWidth: 'unset',
                                border: '1px solid rgba(255,255,255,.1)',
                                '&:hover': { color: '#f1f5f9', background: 'rgba(255,255,255,.05)' },
                            }}>Sign In</Button>
                            <Button onClick={() => navigate('/register')} sx={{
                                background: 'linear-gradient(135deg, #9333ea, #d946ef)',
                                color: 'white', fontWeight: 700, textTransform: 'none', fontFamily: 'Inter, sans-serif',
                                borderRadius: '8px',
                                px: { xs: 1, sm: 1.8, md: 3 },
                                py: { xs: 0.5, md: 0.75 },
                                fontSize: { xs: '0.72rem', sm: '0.82rem', md: '0.9rem' },
                                minWidth: 'unset',
                                boxShadow: '0 0 20px rgba(147,51,234,.4)',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 0 30px rgba(147,51,234,.6)' },
                                transition: 'all .25s ease',
                            }}>Get Started</Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* ── HERO ── */}
            <Box sx={{
                minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden',
                background: 'linear-gradient(135deg, #03000e 0%, #0d003e 50%, #001530 100%)',
                backgroundSize: '400% 400%', animation: 'gradShift 14s ease infinite',
            }}>
                {/* Orbs */}
                {[
                    { w: 600, h: 600, color: 'rgba(147,51,234,.2)', top: '-100px', left: '-80px', dur: '9s' },
                    { w: 500, h: 500, color: 'rgba(34,211,238,.18)', bottom: '-60px', right: '8%', dur: '11s', dir: 'reverse' },
                    { w: 380, h: 380, color: 'rgba(217,70,239,.18)', top: '30%', right: '3%', dur: '7s' },
                ].map((o, i) => (
                    <Box key={i} sx={{
                        position: 'absolute', width: o.w, height: o.h, borderRadius: '50%',
                        background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
                        filter: 'blur(50px)', animation: `orbPulse ${o.dur} ease-in-out infinite`,
                        animationDirection: o.dir || 'normal', ...o
                    }} />
                ))}

                {/* Grid overlay */}
                <Box sx={{
                    position: 'absolute', inset: 0, opacity: .03,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
                    backgroundSize: '60px 60px'
                }} />

                {/* Particles */}
                {Array.from({ length: 10 }, (_, i) => (
                    <Box key={i} sx={{
                        position: 'absolute', borderRadius: '50%',
                        width: `${Math.random() * 5 + 3}px`, height: `${Math.random() * 5 + 3}px`,
                        left: `${10 + i * 9}%`, bottom: '-20px',
                        background: ['rgba(147,51,234,.7)', 'rgba(217,70,239,.7)', 'rgba(34,211,238,.7)', 'rgba(56,189,248,.7)'][i % 4],
                        animation: `particleDrift ${12 + i * 2}s ${i * 1.3}s linear infinite`, pointerEvents: 'none',
                    }} />
                ))}

                <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: 10 }}>
                    <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">

                        {/* Left text */}
                        <Grid item xs={12} md={6}>
                            {/* Badge */}
                           {/* <Box sx={{
                                display: 'inline-flex', alignItems: 'center', gap: 1,
                                background: 'rgba(147,51,234,.12)', border: '1px solid rgba(147,51,234,.28)',
                                borderRadius: '50px', px: 2.5, py: .8, mb: 4,
                                animation: 'revealUp .7s ease forwards'
                            }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#9333ea', animation: 'glowPulse 2s infinite' }} />
                                <Typography sx={{ color: '#a5b4fc', fontSize: '.84rem', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                                    AI-Powered Learning Platform
                                </Typography>
                            </Box>*/}

                            <Typography sx={{
                                fontFamily: 'Inter, sans-serif', fontWeight: 900, letterSpacing: '-2px',
                                fontSize: { xs: '3rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
                                lineHeight: 1.07, mb: 3,
                                background: 'linear-gradient(135deg, #fff 0%, #c7d2fe 45%, #22d3ee 85%)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                animation: 'revealUp .7s .15s ease both',
                            }}>
                                The Future of<br />
                                <Box component="span" sx={{
                                    background: 'linear-gradient(135deg, #9333ea, #d946ef, #22d3ee)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    backgroundSize: '200%', animation: 'shimmer 3s linear infinite',
                                }}>Digital Learning</Box>
                            </Typography>

                            <Typography sx={{
                                color: '#94a3b8', fontSize: { xs: '1rem', md: '1.2rem' }, lineHeight: 1.75,
                                mb: 5, maxWidth: '520px', fontFamily: 'Inter, sans-serif', fontWeight: 400,
                                animation: 'revealUp .7s .3s ease both',
                            }}>
                                Access thousands of academic books powered by AI — designed for the next generation of students and researchers.
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', animation: 'revealUp .7s .45s ease both' }}>
                                <Button onClick={() => navigate('/register')} sx={{
                                    background: 'linear-gradient(135deg, #9333ea, #d946ef)', color: 'white',
                                    fontWeight: 700, textTransform: 'none', fontFamily: 'Inter, sans-serif',
                                    fontSize: '1.05rem', borderRadius: '14px', px: 4, py: 1.8,
                                    boxShadow: '0 0 30px rgba(147,51,234,.5)', animation: 'glowPulse 3s ease infinite',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 0 50px rgba(147,51,234,.7)' },
                                    transition: 'all .3s ease',
                                }}>Start Learning Free →</Button>
                                <Button onClick={() => document.getElementById('books-section')?.scrollIntoView({ behavior: 'smooth' })} sx={{
                                    color: '#c4b5fd', fontWeight: 600, textTransform: 'none', fontFamily: 'Inter, sans-serif',
                                    fontSize: '1.05rem', borderRadius: '14px', px: 4, py: 1.8,
                                    border: '1px solid rgba(147,51,234,.3)', background: 'rgba(147,51,234,.08)',
                                    '&:hover': { background: 'rgba(147,51,234,.15)', borderColor: 'rgba(147,51,234,.6)' },
                                    transition: 'all .3s ease',
                                }}>Explore Library</Button>
                            </Box>

                            {/* Social proof */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 5, animation: 'revealUp .7s .6s ease both' }}>
                                <Box sx={{ display: 'flex' }}>
                                    {['#9333ea', '#d946ef', '#22d3ee', '#38bdf8'].map((c, i) => (
                                        <Box key={i} sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: c, border: '2px solid #03000e', ml: i ? -1.2 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: 700 }}>
                                            {['A', 'B', 'S', 'K'][i]}
                                        </Box>
                                    ))}
                                </Box>
                                <Typography sx={{ color: '#64748b', fontSize: '.9rem', fontFamily: 'Inter, sans-serif' }}>
                                    <Box component="span" sx={{ color: '#c4b5fd', fontWeight: 700 }}>2,500+</Box> students already learning
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Right — 3D books with page-flip */}
                        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{
                                position: 'relative', width: { xs: 300, md: 460 }, height: { xs: 280, md: 380 },
                                display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3,
                            }}>
                                {/* Glow beneath books */}
                                <Box sx={{
                                    position: 'absolute', bottom: -30, left: '10%', right: '10%', height: 80,
                                    background: 'radial-gradient(ellipse, rgba(147,51,234,.35) 0%, transparent 70%)',
                                    filter: 'blur(20px)', borderRadius: '50%'
                                }} />

                                <OpenBook3D color1="#7e22ce" color2="#d946ef" title="AI & ML" floatAnim="floatUp" delay="0s" />
                                <OpenBook3D color1="#0f766e" color2="#22d3ee" title="Data Science" floatAnim="floatMid" delay="0.9s" />
                                <OpenBook3D color1="#9333ea" color2="#f472b6" title="Algorithms" floatAnim="floatSlow" delay="1.8s" />

                                {/* Floating chips */}
                                {[
                                    { label: '📖 12,000+ Books', top: '5%', left: '-5%', c: '#9333ea' },
                                    { label: '⚡ Instant Access', top: '40%', right: '-8%', c: '#22d3ee' },
                                    { label: '🎓 AI Recommended', bottom: '5%', right: '-10%', c: '#d946ef' },
                                ].map((chip, i) => (
                                    <Box key={i} sx={{
                                        position: 'absolute', ...chip,
                                        background: 'rgba(3,0,14,.92)', backdropFilter: 'blur(20px)',
                                        border: `1px solid ${chip.c}44`, borderRadius: '12px', px: 2, py: 1,
                                        whiteSpace: 'nowrap', boxShadow: `0 0 20px ${chip.c}33`,
                                        animation: `floatUp ${3 + i}s ease-in-out infinite`, animationDelay: `${i * 0.8}s`,
                                    }}>
                                        <Typography sx={{ color: '#e2e8f0', fontSize: '.8rem', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{chip.label}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                </Container>

                {/* Scroll indicator */}
                <Box sx={{
                    position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, animation: 'floatMid 2s infinite'
                }}>
                    <Typography sx={{ color: '#4b5680', fontSize: '.72rem', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>Scroll</Typography>
                    <Box sx={{ width: 1.5, height: 36, background: 'linear-gradient(to bottom, rgba(147,51,234,.8), transparent)', borderRadius: 1 }} />
                </Box>
            </Box>

            {/* ── LOGO SECTION ── */}
            <Box ref={logoRef} sx={{
                py: 9,
                background: 'linear-gradient(135deg, #1f00e7ff 0%, #f0f4ff 50%, #054558ff 100%)',
                borderTop: '1px solid rgba(147,51,234,.12)',
                borderBottom: '1px solid rgba(147,51,234,.10)',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Subtle dot pattern */}
                <Box sx={{
                    position: 'absolute', inset: 0, opacity: .04,
                    backgroundImage: 'radial-gradient(#9333ea 1px, transparent 1px)',
                    backgroundSize: '28px 28px', pointerEvents: 'none'
                }} />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography sx={{ textAlign: 'center', color: '#000000ff', fontFamily: 'Inter, sans-serif', fontSize: '.88rem', letterSpacing: 3, textTransform: 'uppercase', mb: 6, fontWeight: 600 }}>Trusted by leading institutions</Typography>
                    <Box sx={{
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: { xs: 4, md: 8 },
                        flexWrap: 'wrap',
                        opacity: logoVis ? 1 : 0, transform: logoVis ? 'translateY(0)' : 'translateY(30px)',
                        transition: 'all .7s ease',
                    }}>
                        {/* Display logo — responsive size */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.2 }}>
                            <Box
                                component="img"
                                src="/sgi logo.jpg"
                                alt="Digital Library Logo"
                                sx={{
                                    height: { xs: '140px', sm: '260px', md: '360px' },
                                    width: 'auto',
                                    maxWidth: '100%',
                                    objectFit: 'contain',
                                    borderRadius: '8px',
                                    filter: 'drop-shadow(0 0 10px rgba(147,51,234,.6))',
                                }}
                            />
                            <Typography sx={{ color: '#3d39adff', fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.55rem' }, letterSpacing: 1 }}>Digital Library</Typography>
                        </Box>
                        {/* Divider */}
                        <Box sx={{ width: 1, height: 48, background: 'rgba(147,51,234,.2)', display: { xs: 'none', md: 'block' } }} />
                        {/* Partner-style brands */}
                        {[{ e: '🎓', n: 'UniVerse', c: '#9333ea' }, { e: '🔬', n: 'ResearchHub', c: '#d946ef' }, { e: '📡', n: 'TechAcad', c: '#22d3ee' }, { e: '🌐', n: 'EduCloud', c: '#38bdf8' }].map((b, i) => (
                            <Box key={i} sx={{
                                display: 'flex', alignItems: 'center', gap: 1,
                                opacity: logoVis ? 1 : 0,
                                transition: `opacity .6s ease ${i * 130}ms`,
                            }}>
                                <Typography sx={{ fontSize: '22px' }}>{b.e}</Typography>
                                <Typography sx={{ color: '#374151', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1rem' }}>{b.n}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* ── STATS ── */}
            <Box ref={statsRef} sx={{ py: 10, background: 'linear-gradient(to bottom, #040012, #060020)', borderTop: '1px solid rgba(255,255,255,.04)' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={3}>
                        {[
                            { value: 12500, suffix: '+', label: 'Academic Books', color: '#9333ea' },
                            { value: 2500, suffix: '+', label: 'Active Students', color: '#d946ef' },
                            { value: 18, suffix: '+', label: 'Departments', color: '#22d3ee' },
                            { value: 99, suffix: '%', label: 'Uptime', color: '#38bdf8' },
                        ].map((s, i) => (
                            <Grid item xs={6} md={3} key={i}>
                                <StatCard {...s} active={statsVis} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ── FEATURES ── */}
            <Box ref={featRef} sx={{ py: 14, background: 'linear-gradient(to bottom, #060020, #03000e)', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(147,51,234,.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <Container maxWidth="lg">
                    <Box textAlign="center" sx={{ mb: 10 }}>
                        <Typography sx={{ color: '#9333ea', fontWeight: 600, fontSize: '.82rem', letterSpacing: 3, textTransform: 'uppercase', mb: 2, fontFamily: 'Inter, sans-serif' }}>Features</Typography>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: { xs: '2rem', md: '3.2rem' }, letterSpacing: '-1.5px', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 2 }}>Everything you need to excel</Typography>
                        <Typography sx={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '560px', mx: 'auto', fontFamily: 'Inter, sans-serif' }}>A complete academic platform built for the modern student — powerful, beautiful, and intelligent.</Typography>
                    </Box>
                    <Grid container spacing={3}>
                        {features.map((f, i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <FeatureCard {...f} delay={i * 80} visible={featVis} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ── BOOKS ── */}
            <Box id="books-section" ref={booksRef} sx={{ py: 14, background: 'linear-gradient(to bottom, #03000e, #060020)', borderTop: '1px solid rgba(255,255,255,.04)' }}>
                <Container maxWidth="xl">
                    <Box textAlign="center" sx={{ mb: 10 }}>
                        <Typography sx={{ color: '#22d3ee', fontWeight: 600, fontSize: '.82rem', letterSpacing: 3, textTransform: 'uppercase', mb: 2, fontFamily: 'Inter, sans-serif' }}>Library</Typography>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: { xs: '2rem', md: '3.2rem' }, letterSpacing: '-1.5px', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 2 }}>Trending Resources</Typography>
                        <Typography sx={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '560px', mx: 'auto', fontFamily: 'Inter, sans-serif' }}>Handpicked books and resources to accelerate your academic journey.</Typography>
                    </Box>
                    <Grid container spacing={3}>
                        {displayBooks.map((book, i) => (
                            <Grid item xs={12} sm={6} md={4} key={book.id || i}
                                sx={{ opacity: booksVis ? 1 : 0, transform: booksVis ? 'translateY(0)' : 'translateY(60px)', transition: `all .6s ease ${i * 100}ms` }}>
                                <BookCard book={book} index={i} navigate={navigate} />
                            </Grid>
                        ))}
                    </Grid>
                    <Box textAlign="center" sx={{ mt: 8 }}>
                        <Button onClick={() => navigate('/register')} sx={{
                            background: 'transparent', color: '#9333ea', fontWeight: 700, textTransform: 'none',
                            fontFamily: 'Inter, sans-serif', fontSize: '1.05rem', borderRadius: '14px', px: 5, py: 1.8,
                            border: '1.5px solid rgba(147,51,234,.35)',
                            '&:hover': { background: 'rgba(147,51,234,.1)', borderColor: '#9333ea', transform: 'translateY(-3px)', boxShadow: '0 0 30px rgba(147,51,234,.3)' },
                            transition: 'all .3s ease',
                        }}>View Full Collection →</Button>
                    </Box>
                </Container>
            </Box>

            {/* ── CTA BANNER ── */}
            <Box ref={ctaRef} sx={{
                py: 16, position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(135deg, #1a0055 0%, #0a0035 50%, #003545 100%)',
                borderTop: '1px solid rgba(147,51,234,.12)', borderBottom: '1px solid rgba(147,51,234,.12)'
            }}>
                <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(147,51,234,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(147,51,234,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(147,51,234,.04) 1px, transparent 1px)', backgroundSize: '80px 80px', pointerEvents: 'none' }} />
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <Box sx={{ opacity: ctaVis ? 1 : 0, transform: ctaVis ? 'translateY(0)' : 'translateY(40px)', transition: 'all .8s ease' }}>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: { xs: '2.4rem', md: '3.8rem' }, letterSpacing: '-2px', background: 'linear-gradient(135deg, #fff 0%, #c7d2fe 50%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 3, lineHeight: 1.1 }}>
                            Ready to unlock your<br />academic potential?
                        </Typography>
                        <Typography sx={{ color: '#94a3b8', fontSize: '1.1rem', mb: 6, fontFamily: 'Inter, sans-serif', lineHeight: 1.75 }}>
                            Join thousands of students already learning smarter.<br />Free to start — no credit card required.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button onClick={() => navigate('/register')} sx={{
                                background: 'linear-gradient(135deg, #9333ea, #d946ef)', color: 'white',
                                fontWeight: 700, textTransform: 'none', fontFamily: 'Inter, sans-serif',
                                fontSize: '1.1rem', borderRadius: '14px', px: 5, py: 2,
                                boxShadow: '0 0 40px rgba(147,51,234,.5)', animation: 'glowPulse 3s ease infinite',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 0 60px rgba(147,51,234,.7)' },
                                transition: 'all .3s ease',
                            }}>Get Started — It's Free</Button>
                            <Button onClick={() => navigate('/admin/login')} sx={{
                                color: '#94a3b8', fontWeight: 600, textTransform: 'none', fontFamily: 'Inter, sans-serif',
                                fontSize: '1.1rem', borderRadius: '14px', px: 5, py: 2,
                                border: '1px solid rgba(255,255,255,.1)',
                                '&:hover': { color: '#f1f5f9', background: 'rgba(255,255,255,.05)' },
                                transition: 'all .25s ease',
                            }}>Admin Portal →</Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* ── FOOTER ── */}
            <Box component="footer" sx={{ py: 10, background: '#030010', borderTop: '1px solid rgba(255,255,255,.04)' }}>
                <Container maxWidth="xl">
                    <Grid container spacing={6}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                <Logo size={42} />
                                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.2rem', background: 'linear-gradient(135deg, #9333ea, #d946ef, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Digital Library</Typography>
                            </Box>
                            <Typography sx={{ color: '#5b6898', lineHeight: 1.8, maxWidth: '320px', fontFamily: 'Inter, sans-serif', fontSize: '.9rem' }}>
                                Empowering students with instant access to a world-class digital repository of knowledge.
                            </Typography>
                        </Grid>

                        <Grid item xs={6} md={2}>
                            <Typography sx={{ color: '#e2e8f0', fontWeight: 700, mb: 3, fontFamily: 'Inter, sans-serif' }}>Platform</Typography>
                            {[['Sign In', '/login'], ['Register', '/register'], ['Admin Portal', '/admin/login']].map(([l, p]) => (
                                <Box key={l} sx={{ mb: 2 }}>
                                    <Button onClick={() => navigate(p)} sx={{ color: '#5b6898', fontFamily: 'Inter, sans-serif', textTransform: 'none', p: 0, '&:hover': { color: '#9333ea' }, transition: 'color .2s ease' }}>{l}</Button>
                                </Box>
                            ))}
                        </Grid>

                        <Grid item xs={6} md={2}>
                            <Typography sx={{ color: '#e2e8f0', fontWeight: 700, mb: 3, fontFamily: 'Inter, sans-serif' }}>Support</Typography>
                            {['Documentation', 'Contact Us', 'Privacy Policy', 'Terms'].map(l => (
                                <Box key={l} sx={{ mb: 2 }}>
                                    <Button sx={{ color: '#5b6898', fontFamily: 'Inter, sans-serif', textTransform: 'none', p: 0, '&:hover': { color: '#22d3ee' }, transition: 'color .2s ease' }}>{l}</Button>
                                </Box>
                            ))}
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography sx={{ color: '#e2e8f0', fontWeight: 700, mb: 3, fontFamily: 'Inter, sans-serif' }}>Contact</Typography>
                            {[['📍', '123 University Avenue, Knowledge City'], ['📧', 'support@digitallibrary.edu'], ['📞', '+1 (555) 123-4567']].map(([icon, text]) => (
                                <Box key={text} sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'center' }}>
                                    <Typography sx={{ fontSize: '16px' }}>{icon}</Typography>
                                    <Typography sx={{ color: '#5b6898', fontFamily: 'Inter, sans-serif', fontSize: '.88rem' }}>{text}</Typography>
                                </Box>
                            ))}
                        </Grid>
                    </Grid>

                    <Box sx={{ borderTop: '1px solid rgba(255,255,255,.05)', mt: 8, pt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Logo size={24} />
                            <Typography sx={{ color: '#4b5680', fontFamily: 'Inter, sans-serif', fontSize: '.82rem' }}>
                                © 2026 Digital Library System. Crafted with ❤️ for learners worldwide.
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {['Privacy', 'Terms', 'Cookies'].map(l => (
                                <Button key={l} sx={{ color: '#4b5680', fontFamily: 'Inter, sans-serif', textTransform: 'none', fontSize: '.82rem', p: 0, '&:hover': { color: '#9333ea' }, transition: 'color .2s ease' }}>{l}</Button>
                            ))}
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default LandingPage;
