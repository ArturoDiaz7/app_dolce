
import React, { useState, useCallback } from 'react';
import { evaluateSituation } from './services/geminiService';
import type { EvaluationResponse, Regulation } from './types';
import { REGULATION_DOLCE_PARAISO, REGULATION_EL_MARQUES, REGULATION_JUSTICIA_CIVICA } from './constants/regulations';
import Modal from './components/Modal';

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>('');
    const [narrative, setNarrative] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<EvaluationResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeModal, setActiveModal] = useState<Regulation | null>(null);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey.trim()) {
            setError('Por favor, introduce tu clave de API de Gemini.');
            return;
        }
        if (!narrative.trim()) {
            setError('Por favor, describe la situación antes de evaluar.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await evaluateSituation(narrative, apiKey);
            setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
        } finally {
            setIsLoading(false);
        }
    }, [narrative, apiKey]);
    
    const getSeverityStyles = (severity: EvaluationResponse['severity']) => {
        switch (severity) {
            case 'Grave': return { bg: 'bg-red-100', text: 'text-red-800', icon: '🟥' };
            case 'Moderada': return { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🟧' };
            case 'Leve': return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟨' };
            case 'Sin Falta': return { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '❔' };
        }
    };

    const regulationsMap: Record<Regulation, string> = {
        'Reglamento de Condóminos de Dolce Paraíso': REGULATION_DOLCE_PARAISO,
        'Reglamento del Fraccionamiento El Marqués': REGULATION_EL_MARQUES,
        'Reglamento de Justicia Cívica': REGULATION_JUSTICIA_CIVICA
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
                <header className="bg-white shadow-md">
                    <div className="container mx-auto px-4 py-6">
                        <h1 className="text-3xl font-bold text-gray-900">Asistente de Convivencia Condominal</h1>
                        <p className="mt-1 text-gray-600">Evalúa situaciones vecinales con IA basada en reglamentos oficiales.</p>
                    </div>
                </header>

                <main className="container mx-auto p-4 md:p-8">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4">Consulta de Reglamentos</h2>
                        <div className="flex flex-wrap gap-3">
                            {Object.keys(regulationsMap).map(key => (
                                <button
                                    key={key}
                                    onClick={() => setActiveModal(key as Regulation)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
                                    {key}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
                        <form onSubmit={handleSubmit}>
                            <h2 className="text-2xl font-semibold mb-4">Configuración y Narrativa</h2>
                            <div className="mb-6">
                                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">Tu Clave de API de Google Gemini</label>
                                <input
                                    type="password"
                                    id="apiKey"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Pega tu clave de API aquí"
                                    className="w-full p-2 border rounded-md transition duration-300 bg-gray-100 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isLoading}
                                    aria-label="Clave de API de Google Gemini"
                                />
                                <p className="text-xs text-gray-500 mt-1">Tu clave se usa solo para esta sesión y no se guarda. <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Obtén una clave aquí.</a></p>
                            </div>

                            <div>
                                <label htmlFor="narrative" className="block text-sm font-medium text-gray-700 mb-1">1. Narra los Hechos</label>
                                <p className="text-gray-600 mb-2 text-sm">Describe la situación de la manera más detallada y objetiva posible. Puedes incluir las perspectivas de ambas partes.</p>
                                <textarea
                                    id="narrative"
                                    value={narrative}
                                    onChange={(e) => setNarrative(e.target.value)}
                                    placeholder="Ej: 'Mi vecino de la casa 15 estaciona su auto bloqueando parte de mi cochera. Le he comentado varias veces pero la situación continúa...'"
                                    className="w-full h-48 p-4 border rounded-md transition duration-300 bg-gray-900 text-white placeholder-gray-400 border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isLoading}
                                    aria-label="Narración de los hechos"
                                ></textarea>
                            </div>
                            <div className="mt-4 text-right">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 flex items-center gap-2 float-right"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Evaluando...' : 'Evaluar con IA'}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>
                                </button>
                            </div>
                        </form>
                    </div>

                    {isLoading && (
                        <div className="flex justify-center items-center mt-8" role="status" aria-label="Cargando evaluación">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                        </div>
                    )}

                    {error && <div className="mt-8 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg" role="alert">{error}</div>}

                    {result && (
                        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg" aria-live="polite">
                            <h2 className="text-2xl font-semibold mb-4">2. Resultado de la Evaluación</h2>
                            <div className={`p-4 rounded-lg ${getSeverityStyles(result.severity).bg} ${getSeverityStyles(result.severity).text}`}>
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <span>{getSeverityStyles(result.severity).icon}</span>
                                    Severidad: {result.severity}
                                </h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                                    <h4 className="font-bold text-gray-700">Clasificación</h4>
                                    <p className="mt-1">{result.classification}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                                    <h4 className="font-bold text-gray-700">Fundamento Legal</h4>
                                    <p className="mt-1">{result.legal_reference}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-md border border-gray-200 md:col-span-2">
                                    <h4 className="font-bold text-gray-700">Sanción Sugerida</h4>
                                    <p className="mt-1">{result.suggested_sanction}</p>
                                </div>
                                {result.convivencia_warning && (
                                     <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200 md:col-span-2">
                                        <h4 className="font-bold text-yellow-800 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                                            Comentario sobre Sana Convivencia
                                        </h4>
                                        <p className="mt-2 text-gray-700 italic">"{result.convivencia_comment}"</p>
                                    </div>
                                )}
                            </div>

                            {result.legal_reference && result.legal_reference !== 'N/A' && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Análisis Detallado</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-bold text-gray-700 mb-2">Cita del Reglamento (Fundamento Legal)</h4>
                                            <blockquote className="p-4 bg-gray-100 border-l-4 border-gray-400 text-gray-700">
                                                <pre className="whitespace-pre-wrap font-sans text-sm">{result.legal_text}</pre>
                                            </blockquote>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-700 mb-2">Interpretación Aplicada a los Hechos</h4>
                                            <p className="text-gray-700 leading-relaxed">{result.interpretation}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
                
                <footer className="text-center py-6 mt-8">
                    <p className="text-xs text-gray-500">Esta es una herramienta de consulta y orientación. Los resultados generados por IA no constituyen una resolución legal definitiva y no reemplazan la asesoría profesional.</p>
                </footer>
            </div>
            {activeModal && (
                 <Modal
                    isOpen={!!activeModal}
                    onClose={() => setActiveModal(null)}
                    title={activeModal}
                >
                    {regulationsMap[activeModal]}
                </Modal>
            )}
        </>
    );
};

export default App;
