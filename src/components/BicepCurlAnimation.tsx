import React from 'react';

export function BicepCurlAnimation() {
    const colors = {
        '--cor-pele': '#e0ac87',
        '--cor-roupa': '#ef4444',
        '--cor-cinto': '#4b5563',
        '--cor-barra': '#9ca3af',
        '--cor-peso': '#1f2937',
        '--cor-sapato': '#111827',
    };

    return (
        <div className="w-full h-auto" style={{aspectRatio: '1'}}>
            <svg viewBox="0 0 100 100" className="w-full h-full" style={{overflow: 'visible'}}>
                <g transform="translate(0, -5)">
                    <line x1="-10" y1="95" x2="110" y2="95" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
                    
                    <g transform="translate(0, 32)">
                        {/* Shoes */}
                        <g>
                            <path d="M 35 94 Q 37 90 44 90 Q 50 90 52 94 Z" fill={colors['--cor-sapato']} />
                            <path d="M 65 94 Q 63 90 56 90 Q 50 90 48 94 Z" fill={colors['--cor-sapato']} />
                        </g>
                        {/* Legs */}
                        <g>
                            <path d="M 42 65 C 40 75, 40 85, 40 90 H 47 C 47 85, 47 75, 45 65 Z" fill={colors['--cor-roupa']} />
                            <path d="M 58 65 C 60 75, 60 85, 60 90 H 53 C 53 85, 53 75, 55 65 Z" fill={colors['--cor-roupa']} />
                        </g>

                        {/* Torso & Belt */}
                        <path d="M 42 40 C 40 50, 40 60, 45 68 H 55 C 60 60, 60 50, 58 40 Z" fill={colors['--cor-roupa']} />
                        <rect x="42" y="58" width="16" height="5" fill={colors['--cor-cinto']} rx="2" />

                        {/* Head */}
                        <circle cx="50" cy="28" r="10" fill={colors['--cor-pele']} />
                        <path d="M 42 20 Q 50 15, 58 20" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />

                        {/* Arms (Animated) */}
                        <g id="bicep-curl-arms">
                            <path d="M 40 35 C 35 45, 35 55, 40 60 C 45 55, 45 45, 42 35 Z" fill={colors['--cor-pele']} />
                            <path d="M 60 35 C 65 45, 65 55, 60 60 C 55 55, 55 45, 58 35 Z" fill={colors['--cor-pele']} />
                        </g>

                        {/* Barbell & Weights (Animated) */}
                        <g id="bicep-curl-barbell">
                            <rect x="0" y="58" width="100" height="4" fill={colors['--cor-barra']} rx="2" />
                            <circle cx="15" cy="60" r="12" fill={colors['--cor-peso']} />
                            <circle cx="85" cy="60" r="12" fill={colors['--cor-peso']} />
                            <circle cx="15" cy="60" r="4" fill="#f9fafb" />
                            <circle cx="85" cy="60" r="4" fill="#f9fafb" />
                        </g>
                    </g>
                </g>
            </svg>
        </div>
    );
}
