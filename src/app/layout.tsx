import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Monte Seu Treino',
  description: 'Adicione os exercícios para sua rotina.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com" async></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
            body {
                font-family: 'Inter', sans-serif;
                background-color: #030712;
                overflow: hidden;
            }
            .gym-background {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2575&auto=format&fit=crop');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                z-index: 0;
            }
            .gym-background::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(3, 7, 18, 0.8);
                backdrop-filter: blur(5px);
            }
            .phone-frame {
                max-width: 390px;
                max-height: 844px;
                width: 100%;
                height: 100%;
                aspect-ratio: 390 / 844;
                border: 8px solid #1f2937;
                border-top-width: 16px;
                border-bottom-width: 16px;
                border-radius: 40px;
                position: relative;
                background: rgba(3, 7, 18, 0.5);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 15px rgba(0, 255, 255, 0.1);
                overflow: hidden;
                margin: 2rem auto;
                z-index: 10;
                display: flex;
                flex-direction: column;
            }
            .phone-frame::before {
                content: '';
                position: absolute;
                top: -2px;
                left: 50%;
                transform: translateX(-50%);
                width: 150px;
                height: 24px;
                background: #1f2937;
                border-bottom-left-radius: 12px;
                border-bottom-right-radius: 12px;
                z-index: 20;
            }
            .phone-content {
                width: 100%;
                height: 100%;
                overflow-y: auto;
            }
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
            .gradient-border {
                position: relative;
                background: #111827;
                border-radius: 1.25rem;
                padding: 2px;
                overflow: hidden;
            }
            .gradient-border::before {
                content: '';
                position: absolute;
                top: 0; right: 0; bottom: 0; left: 0;
                background: linear-gradient(135deg, #06b6d4, #10b981);
                z-index: 0;
            }
            .gradient-border-content {
                background: #1f2937;
                padding: 1.25rem;
                border-radius: 1.15rem;
                position: relative;
                z-index: 1;
            }
            @keyframes slide-in {
                from { opacity: 0; transform: translateX(-20px); }
                to { opacity: 1; transform: translateX(0); }
            }
            .animate-slide-in {
                animation: slide-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            }
            @keyframes fade-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in {
                animation: fade-in 0.8s ease-out forwards;
            }
            /* Hide number input arrows */
            input[type=number]::-webkit-inner-spin-button,
            input[type=number]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            input[type=number] {
                -moz-appearance: textfield; /* Firefox */
            }
            #bicep-curl-arms {
                animation: curl-arms 2.5s ease-in-out infinite;
                transform-origin: center 40px;
            }
            #bicep-curl-barbell {
                animation: curl-barbell 2.5s ease-in-out infinite;
            }
            @keyframes curl-arms {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(0.5); }
            }
            @keyframes curl-barbell {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-15px); }
            }
             @media (max-width: 420px) {
                body {
                    padding: 0;
                }
                .phone-frame {
                    width: 100vw;
                    height: 100vh;
                    max-height: none;
                    border-radius: 0;
                    border: none;
                    margin: 0;
                }
                .phone-frame::before {
                   display: none;
                }
            }

            /* Animações customizadas tela final */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes popIn {
                0% {
                    opacity: 0;
                    transform: scale(0.5);
                }
                80% {
                    opacity: 1;
                    transform: scale(1.1);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            @keyframes number-pop {
                from {
                    opacity: 0;
                    transform: scale(0.8) translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            @keyframes fillWidth {
                from {
                    width: 0%;
                }
                to {
                    width: 100%;
                }
            }
            
            /* Splash Screen */
            #splash-screen {
              position: fixed;
              inset: 0;
              z-index: 9999;
              background-color: #030712;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: opacity 0.5s ease-out;
            }
            .splash-icon-container {
              width: 80px;
              height: 80px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .animate-splash-out {
                animation: fade-out-splash 0.5s ease-out 2s forwards;
            }
            @keyframes fade-out-splash {
                to {
                    opacity: 0;
                    visibility: hidden;
                }
            }
            .animate-pop-in {
                animation: popIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s forwards;
                opacity: 0;
            }


            .animate-fade-in-up {
                animation: fadeInUp 0.6s ease-out forwards;
                opacity: 0; /* Inicia invisível */
            }
            
            .animate-pop-in {
                animation: popIn 0.6s ease-out forwards;
                opacity: 0;
            }

            .animate-number-pop {
                animation: number-pop 0.5s ease-out forwards;
                opacity: 0;
            }

            .animate-fill-width {
                animation: fillWidth 1.5s 1s ease-out forwards; /* 1s de delay */
            }

            .delay-100 { animation-delay: 0.1s; }
            .delay-200 { animation-delay: 0.2s; }
            .delay-300 { animation-delay: 0.3s; }
            .delay-400 { animation-delay: 0.4s; }
            .delay-500 { animation-delay: 0.5s; }
            .delay-600 { animation-delay: 0.6s; }
            .delay-700 { animation-delay: 0.7s; }
            .delay-800 { animation-delay: 0.8s; }
            .delay-900 { animation-delay: 0.9s; }
        ` }} />
      </head>
      <body className="text-white antialiased flex items-center justify-center min-h-screen">
        {children}
      </body>
    </html>
  );
}
