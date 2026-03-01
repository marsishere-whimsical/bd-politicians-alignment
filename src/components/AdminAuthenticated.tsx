import { useState, useMemo } from 'react';
import GeneratedBoardData from './GeneratedBoardData';

interface SandwichPosition {
    id: string;
    name: string;
    imagePath: string;
    x: number;
    y: number;
}

interface SubmittedBoard {
    _id: string;
    sandwichesOnBoard: SandwichPosition[];
    axisLabels: { top: string; bottom: string; left: string; right: string };
    note: string;
    createdAt: string;
}

interface ConsensusSandwich {
    id: string;
    name: string;
    imagePath: string;
    avgX: number;
    avgY: number;
    count: number;
    // True consensus metrics
    stdDevX: number;        // Standard deviation on X axis
    stdDevY: number;        // Standard deviation on Y axis
    spread: number;         // Combined spread: sqrt(stdDevX² + stdDevY²)
    consensusScore: number; // Higher = more agreement (0-1 scale)
    // Individual positions for variance visualization
    positions: { x: number; y: number }[];
}

function AdminAuthenticated() {
    const [activeTab, setActiveTab] = useState<'management' | 'submissions'>('management');
    const [boardViewTab, setBoardViewTab] = useState<'individual' | 'average' | 'variance'>('average');
    const [selectedConsensusSandwich, setSelectedConsensusSandwich] = useState<ConsensusSandwich | null>(null);
    const [selectedIndividualBoard, setSelectedIndividualBoard] = useState<SubmittedBoard | null>(null);
    const [selectedIndividualSandwich, setSelectedIndividualSandwich] = useState<SandwichPosition | null>(null);
    const [distanceThreshold, setDistanceThreshold] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedData, setGeneratedData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [clearSuccess, setClearSuccess] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [submittedBoards, setSubmittedBoards] = useState<SubmittedBoard[]>([]);
    const [isFetchingBoards, setIsFetchingBoards] = useState(false);

    // Calculate consensus positions for all sandwiches
    const consensusSandwiches = useMemo(() => {
        if (submittedBoards.length === 0) return [];

        // First pass: collect all positions for each sandwich
        const sandwichPositions = new Map<string, {
            name: string;
            imagePath: string;
            positions: { x: number; y: number }[];
        }>();

        for (const board of submittedBoards) {
            for (const sandwich of board.sandwichesOnBoard) {
                const existing = sandwichPositions.get(sandwich.id);
                if (existing) {
                    existing.positions.push({ x: sandwich.x, y: sandwich.y });
                } else {
                    sandwichPositions.set(sandwich.id, {
                        name: sandwich.name,
                        imagePath: sandwich.imagePath,
                        positions: [{ x: sandwich.x, y: sandwich.y }]
                    });
                }
            }
        }

        // Second pass: calculate averages, standard deviations, and consensus scores
        const result: ConsensusSandwich[] = [];
        sandwichPositions.forEach((data, id) => {
            const count = data.positions.length;

            // Calculate averages
            const avgX = data.positions.reduce((sum, p) => sum + p.x, 0) / count;
            const avgY = data.positions.reduce((sum, p) => sum + p.y, 0) / count;

            // Calculate standard deviations
            const varianceX = data.positions.reduce((sum, p) => sum + Math.pow(p.x - avgX, 2), 0) / count;
            const varianceY = data.positions.reduce((sum, p) => sum + Math.pow(p.y - avgY, 2), 0) / count;
            const stdDevX = Math.sqrt(varianceX);
            const stdDevY = Math.sqrt(varianceY);

            // Combined spread (RMS of standard deviations)
            const spread = Math.sqrt(stdDevX * stdDevX + stdDevY * stdDevY);

            // Consensus score: higher = more agreement
            // Scale: 0-1 where 1 is perfect consensus
            // Max possible spread is sqrt(2) * 2 ≈ 2.83 (corners to corners)
            const maxSpread = Math.sqrt(2) * 2;
            const consensusScore = 1 - (spread / maxSpread);

            result.push({
                id,
                name: data.name,
                imagePath: data.imagePath,
                avgX,
                avgY,
                count,
                stdDevX,
                stdDevY,
                spread,
                consensusScore,
                positions: data.positions
            });
        });

        // Sort by count (most common first)
        return result.sort((a, b) => b.count - a.count);
    }, [submittedBoards]);

    // Filter sandwiches by distance from origin (using max of |x| or |y|)
    const filteredConsensusSandwiches = useMemo(() => {
        if (distanceThreshold === 0) return consensusSandwiches;
        return consensusSandwiches.filter(sandwich => {
            const distance = Math.max(Math.abs(sandwich.avgX), Math.abs(sandwich.avgY));
            return distance >= distanceThreshold;
        });
    }, [consensusSandwiches, distanceThreshold]);

    // Find extreme sandwiches
    const extremeSandwiches = useMemo(() => {
        if (consensusSandwiches.length === 0) return null;
        return {
            mostChaotic: consensusSandwiches.reduce((max, s) => s.avgX > max.avgX ? s : max),
            mostLawful: consensusSandwiches.reduce((min, s) => s.avgX < min.avgX ? s : min),
            mostGood: consensusSandwiches.reduce((min, s) => s.avgY < min.avgY ? s : min),
            mostEvil: consensusSandwiches.reduce((max, s) => s.avgY > max.avgY ? s : max),
        };
    }, [consensusSandwiches]);

    const handleFetchBoards = async () => {
        setIsFetchingBoards(true);
        try {
            const response = await fetch('/api/getSubmittedBoards');
            const data = await response.json();
            console.log('Fetched boards:', data);
            setSubmittedBoards(data.boards || []);
        } catch (error) {
            console.error('Error fetching boards:', error);
        } finally {
            setIsFetchingBoards(false);
        }
    };

    const handleGenerateBoard = async () => {
        setIsGenerating(true);
        setSubmissionSuccess(false);

        try {
            const response = await fetch('/api/generateBoard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            console.log('Generated data:', data);
            setGeneratedData(data);
        } catch (error) {
            console.error('Error generating board:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmitBoard = async () => {
        if (!generatedData) return;
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/submitBoard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(generatedData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit board');
            }

            setSubmissionSuccess(true);
        } catch (error) {
            console.error('Error submitting board:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClearCollection = async () => {
        setIsClearing(true);
        try {
            const response = await fetch('/api/clearCollection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to clear collection');
            }

            setClearSuccess(true);
        } catch (error) {
            console.error('Error clearing collection:', error);
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-neutral-200 p-8">
            <h1 className="text-2xl mb-6">Admin Dashboard</h1>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('management')}
                    className={`px-4 py-2 rounded transition-colors ${
                        activeTab === 'management'
                            ? 'bg-white text-black'
                            : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                    }`}
                >
                    Database Management
                </button>
                <button
                    onClick={() => setActiveTab('submissions')}
                    className={`px-4 py-2 rounded transition-colors ${
                        activeTab === 'submissions'
                            ? 'bg-white text-black'
                            : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                    }`}
                >
                    User Submissions
                </button>
            </div>

            {/* Database Management Tab */}
            {activeTab === 'management' && (
                <>
                    <div className="bg-neutral-900 rounded-lg p-6 mb-4 border border-neutral-700">
                        <h2 className="text-xl mb-4">Database Management</h2>
                        <div className='flex mb-6'>
                            <button
                                onClick={handleClearCollection}
                                className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded hover:bg-neutral-700 transition-colors border border-neutral-600"
                                disabled={isClearing}
                            >
                                {isClearing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    </div>
                                ) : clearSuccess ? (
                                    'Collection Cleared'
                                ) : (
                                    'Clear Collection'
                                )}
                            </button>
                        </div>
                        <h2 className="text-xl mb-4">Board Generation</h2>
                        <div className="flex gap-4">
                            <button
                                onClick={handleGenerateBoard}
                                className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded hover:bg-neutral-700 transition-colors"
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    </div>
                                ) : (
                                    'Generate Board'
                                )}
                            </button>
                            <button
                                onClick={handleSubmitBoard}
                                className="px-4 py-2 bg-white text-black rounded hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting || !generatedData || submissionSuccess}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                                    </div>
                                ) : submissionSuccess ? (
                                    'Board Submitted'
                                ) : (
                                    'Submit Generated Board'
                                )}
                            </button>
                        </div>
                    </div>
                    {generatedData && <GeneratedBoardData generatedData={generatedData} />}
                </>
            )}

            {/* User Submissions Tab */}
            {activeTab === 'submissions' && (
                <div className="space-y-6">
                    <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700">
                        <h2 className="text-xl mb-4">User Submitted Boards (5+ sandwiches)</h2>
                        <button
                            onClick={handleFetchBoards}
                            className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded hover:bg-neutral-700 transition-colors border border-neutral-600 mb-4"
                            disabled={isFetchingBoards}
                        >
                            {isFetchingBoards ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                </div>
                            ) : (
                                'Fetch Boards'
                            )}
                        </button>

                        {submittedBoards.length > 0 && (
                            <div className="mt-4">
                                <p className="text-neutral-400 mb-2">Found {submittedBoards.length} boards (click to view)</p>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {submittedBoards.map((board) => (
                                        <div
                                            key={board._id}
                                            className={`bg-neutral-800 p-3 rounded border cursor-pointer transition-colors hover:bg-neutral-700 ${
                                                selectedIndividualBoard?._id === board._id
                                                    ? 'border-white'
                                                    : 'border-neutral-600'
                                            }`}
                                            onClick={() => {
                                                setSelectedIndividualBoard(board);
                                                setBoardViewTab('individual');
                                                setSelectedIndividualSandwich(null);
                                            }}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm text-neutral-400">ID: {board._id}</p>
                                                    <p className="text-sm">Sandwiches: {board.sandwichesOnBoard.length}</p>
                                                    <p className="text-sm text-neutral-400">
                                                        Labels: {board.axisLabels.top} / {board.axisLabels.bottom} / {board.axisLabels.left} / {board.axisLabels.right}
                                                    </p>
                                                    {board.note && <p className="text-sm text-yellow-400 mt-1">Note: {board.note}</p>}
                                                </div>
                                                <p className="text-xs text-neutral-500">
                                                    {new Date(board.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Board Visualization with Tabs */}
                    {(submittedBoards.length > 0 || selectedIndividualBoard) && (
                        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700">
                            {/* Board View Tabs */}
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setBoardViewTab('individual')}
                                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                                        boardViewTab === 'individual'
                                            ? 'bg-white text-black'
                                            : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                                    }`}
                                >
                                    Individual
                                </button>
                                <button
                                    onClick={() => setBoardViewTab('average')}
                                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                                        boardViewTab === 'average'
                                            ? 'bg-white text-black'
                                            : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                                    }`}
                                >
                                    Average
                                </button>
                                <button
                                    onClick={() => setBoardViewTab('variance')}
                                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                                        boardViewTab === 'variance'
                                            ? 'bg-white text-black'
                                            : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                                    }`}
                                >
                                    Variance
                                </button>
                            </div>

                            {/* Tab Header & Description */}
                            {boardViewTab === 'individual' && (
                                <>
                                    <h2 className="text-xl mb-2">
                                        Individual Board {selectedIndividualBoard ? `- ${selectedIndividualBoard.sandwichesOnBoard.length} sandwiches` : ''}
                                    </h2>
                                    <p className="text-neutral-400 text-sm mb-4">
                                        {selectedIndividualBoard
                                            ? `Viewing submission from ${new Date(selectedIndividualBoard.createdAt).toLocaleString()}`
                                            : 'Select a board from the list above to view it'}
                                    </p>
                                </>
                            )}
                            {boardViewTab === 'average' && (
                                <>
                                    <h2 className="text-xl mb-2">Average Positions ({filteredConsensusSandwiches.length} / {consensusSandwiches.length} sandwiches)</h2>
                                    <p className="text-neutral-400 text-sm mb-2">
                                        Sandwiches placed at their average position across {submittedBoards.length} submissions
                                    </p>
                                    <details className="text-neutral-500 text-xs mb-4">
                                        <summary className="cursor-pointer hover:text-neutral-300">Formula used</summary>
                                        <div className="mt-2 p-2 bg-neutral-800 rounded font-mono">
                                            avgX = Σ(x) / n<br />
                                            avgY = Σ(y) / n
                                        </div>
                                    </details>
                                </>
                            )}
                            {boardViewTab === 'variance' && (
                                <>
                                    <h2 className="text-xl mb-2">True Consensus {selectedConsensusSandwich ? `- ${selectedConsensusSandwich.name}` : ''}</h2>
                                    <p className="text-neutral-400 text-sm mb-2">
                                        {selectedConsensusSandwich
                                            ? `Showing all ${selectedConsensusSandwich.count} individual placements (dots) and average position (sandwich)`
                                            : 'Select a sandwich from the lists below to see where everyone placed it'}
                                    </p>
                                    <details className="text-neutral-500 text-xs mb-4">
                                        <summary className="cursor-pointer hover:text-neutral-300">Formula used</summary>
                                        <div className="mt-2 p-3 bg-neutral-800 rounded font-mono text-xs space-y-1">
                                            <p>σx = √(Σ(x - avgX)² / n) &nbsp;&nbsp;<span className="text-neutral-400">// std dev X</span></p>
                                            <p>σy = √(Σ(y - avgY)² / n) &nbsp;&nbsp;<span className="text-neutral-400">// std dev Y</span></p>
                                            <p>spread = √(σx² + σy²) &nbsp;&nbsp;<span className="text-neutral-400">// combined spread</span></p>
                                            <p>consensus = 1 - (spread / maxSpread) &nbsp;&nbsp;<span className="text-neutral-400">// 0-1 scale</span></p>
                                        </div>
                                    </details>
                                </>
                            )}

                            {/* Distance Filter - only for Average tab */}
                            {boardViewTab === 'average' && (
                                <div className="mb-4 flex items-center gap-4">
                                    <label className="text-sm text-neutral-400 whitespace-nowrap">
                                        Min distance from center:
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={distanceThreshold}
                                        onChange={(e) => setDistanceThreshold(parseFloat(e.target.value))}
                                        className="flex-1 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white"
                                    />
                                    <span className="text-sm text-neutral-300 w-12 text-right font-mono">
                                        {distanceThreshold.toFixed(2)}
                                    </span>
                                </div>
                            )}

                            <div className="flex gap-6">
                                {/* Board Visualization */}
                                <div className="relative flex-1 aspect-[4/3] bg-neutral-100 rounded-lg overflow-visible">
                                    {/* Lines and Arrows SVG */}
                                    <svg
                                        className="w-full h-full absolute inset-0 pointer-events-none"
                                        viewBox="0 0 500 500"
                                        preserveAspectRatio="xMidYMid meet"
                                    >
                                        <line x1="250" y1="20" x2="250" y2="480" stroke="#404040" strokeWidth="2" />
                                        <line x1="-70" y1="250" x2="570" y2="250" stroke="#404040" strokeWidth="2" />
                                        <path d="M250 15 L240 35 L260 35 Z" fill="#404040" />
                                        <path d="M250 485 L240 465 L260 465 Z" fill="#404040" />
                                        <path d="M-80 250 L-60 240 L-60 260 Z" fill="#404040" />
                                        <path d="M580 250 L560 240 L560 260 Z" fill="#404040" />
                                    </svg>

                                    {/* Axis Labels */}
                                    <div className="absolute top-13 left-1/2 -translate-x-1/2 px-2 py-1 bg-white border border-neutral-400 rounded text-sm text-neutral-800">
                                        {boardViewTab === 'individual' && selectedIndividualBoard ? selectedIndividualBoard.axisLabels.top : 'Good'}
                                    </div>
                                    <div className="absolute bottom-13 left-1/2 -translate-x-1/2 px-2 py-1 bg-white border border-neutral-400 rounded text-sm text-neutral-800">
                                        {boardViewTab === 'individual' && selectedIndividualBoard ? selectedIndividualBoard.axisLabels.bottom : 'Evil'}
                                    </div>
                                    <div className="absolute left-13 top-1/2 -translate-y-1/2 px-2 py-1 bg-white border border-neutral-400 rounded text-sm text-neutral-800">
                                        {boardViewTab === 'individual' && selectedIndividualBoard ? selectedIndividualBoard.axisLabels.left : 'Lawful'}
                                    </div>
                                    <div className="absolute right-13 top-1/2 -translate-y-1/2 px-2 py-1 bg-white border border-neutral-400 rounded text-sm text-neutral-800">
                                        {boardViewTab === 'individual' && selectedIndividualBoard ? selectedIndividualBoard.axisLabels.right : 'Chaotic'}
                                    </div>

                                    {/* Individual Board Sandwiches */}
                                    {boardViewTab === 'individual' && selectedIndividualBoard && selectedIndividualBoard.sandwichesOnBoard.map((sandwich) => (
                                        <video
                                            key={sandwich.id}
                                            src={sandwich.imagePath}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            onClick={() => setSelectedIndividualSandwich(sandwich)}
                                            className={`absolute w-28 h-20 object-contain -translate-x-1/2 -translate-y-1/2 cursor-pointer z-40
                                                ${selectedIndividualSandwich?.id === sandwich.id ? 'ring-2 ring-black rounded-xl' : ''}`}
                                            style={{
                                                left: `${((sandwich.x + 1) / 2) * 100}%`,
                                                top: `${((sandwich.y + 1) / 2) * 100}%`
                                            }}
                                        />
                                    ))}

                                    {/* Average Tab Sandwiches */}
                                    {boardViewTab === 'average' && filteredConsensusSandwiches.map((sandwich) => (
                                        <video
                                            key={sandwich.id}
                                            src={sandwich.imagePath}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            onClick={() => setSelectedConsensusSandwich(sandwich)}
                                            className={`absolute w-28 h-20 object-contain -translate-x-1/2 -translate-y-1/2 cursor-pointer z-40
                                                ${selectedConsensusSandwich?.id === sandwich.id ? 'ring-2 ring-black rounded-xl' : ''}`}
                                            style={{
                                                left: `${((sandwich.avgX + 1) / 2) * 100}%`,
                                                top: `${((sandwich.avgY + 1) / 2) * 100}%`
                                            }}
                                        />
                                    ))}

                                    {/* Variance Tab - Show individual positions for selected sandwich */}
                                    {boardViewTab === 'variance' && selectedConsensusSandwich && (
                                        <>
                                            {/* Individual position markers - colored by distance from mean */}
                                            {selectedConsensusSandwich.positions.map((pos, index) => {
                                                const distance = Math.sqrt(
                                                    Math.pow(pos.x - selectedConsensusSandwich.avgX, 2) +
                                                    Math.pow(pos.y - selectedConsensusSandwich.avgY, 2)
                                                );
                                                // Max possible distance is ~2.83 (corner to corner)
                                                const normalizedDistance = Math.min(distance / 1.5, 1);
                                                // Closer = darker (0.9 opacity), farther = lighter (0.2 opacity)
                                                const opacity = 0.9 - normalizedDistance * 0.7;

                                                return (
                                                    <div
                                                        key={index}
                                                        className="absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 bg-neutral-800"
                                                        style={{
                                                            left: `${((pos.x + 1) / 2) * 100}%`,
                                                            top: `${((pos.y + 1) / 2) * 100}%`,
                                                            opacity: opacity
                                                        }}
                                                    />
                                                );
                                            })}
                                            {/* Average position - the sandwich itself */}
                                            <video
                                                src={selectedConsensusSandwich.imagePath}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="absolute w-32 h-24 object-contain -translate-x-1/2 -translate-y-1/2 z-50 ring-2 ring-black rounded-xl"
                                                style={{
                                                    left: `${((selectedConsensusSandwich.avgX + 1) / 2) * 100}%`,
                                                    top: `${((selectedConsensusSandwich.avgY + 1) / 2) * 100}%`
                                                }}
                                            />
                                        </>
                                    )}

                                    {/* Empty state for Variance tab */}
                                    {boardViewTab === 'variance' && !selectedConsensusSandwich && (
                                        <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
                                            Select a sandwich from the lists below
                                        </div>
                                    )}

                                    {/* Empty state for Individual tab */}
                                    {boardViewTab === 'individual' && !selectedIndividualBoard && (
                                        <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
                                            Select a board from the list above
                                        </div>
                                    )}
                                </div>

                                {/* Sandwich Inspector */}
                                <div className="w-80 bg-neutral-800 rounded-lg p-6">
                                    <h3 className="text-xl font-bold mb-6 text-center">Sandwich Inspector</h3>

                                    {/* Individual Tab Inspector */}
                                    {boardViewTab === 'individual' && (
                                        !selectedIndividualSandwich ? (
                                            <div className="flex flex-col items-center justify-center h-[300px] text-neutral-500">
                                                No sandwich selected
                                                <span className="text-sm mt-2">(Click on a sandwich to select)</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <video
                                                    src={selectedIndividualSandwich.imagePath}
                                                    autoPlay loop muted playsInline
                                                    className="max-w-[90%] h-48 object-contain rounded-lg mb-4"
                                                />
                                                <div className="w-full mt-4">
                                                    <div className="mb-4">
                                                        <p className="text-neutral-500 text-sm">Name:</p>
                                                        <p className="text-lg">{selectedIndividualSandwich.name}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-neutral-500 text-sm">X-Axis:</p>
                                                            <p>
                                                                {selectedIndividualSandwich.x >= 0
                                                                    ? `${Math.round(selectedIndividualSandwich.x * 100)}% ${selectedIndividualBoard?.axisLabels.right || 'Chaotic'}`
                                                                    : `${Math.round(-selectedIndividualSandwich.x * 100)}% ${selectedIndividualBoard?.axisLabels.left || 'Lawful'}`}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-neutral-500 text-sm">Y-Axis:</p>
                                                            <p>
                                                                {selectedIndividualSandwich.y <= 0
                                                                    ? `${Math.round(-selectedIndividualSandwich.y * 100)}% ${selectedIndividualBoard?.axisLabels.top || 'Good'}`
                                                                    : `${Math.round(selectedIndividualSandwich.y * 100)}% ${selectedIndividualBoard?.axisLabels.bottom || 'Evil'}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {/* Average Tab Inspector */}
                                    {boardViewTab === 'average' && (
                                        !selectedConsensusSandwich ? (
                                            <div className="flex flex-col items-center justify-center h-[300px] text-neutral-500">
                                                No sandwich selected
                                                <span className="text-sm mt-2">(Click on a sandwich to select)</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <video
                                                    src={selectedConsensusSandwich.imagePath}
                                                    autoPlay loop muted playsInline
                                                    className="max-w-[90%] h-48 object-contain rounded-lg mb-4"
                                                />
                                                <div className="w-full mt-4">
                                                    <div className="mb-4">
                                                        <p className="text-neutral-500 text-sm">Name:</p>
                                                        <p className="text-lg">{selectedConsensusSandwich.name}</p>
                                                    </div>
                                                    <div className="mb-4">
                                                        <p className="text-neutral-500 text-sm">Vote Count:</p>
                                                        <p className="text-lg">{selectedConsensusSandwich.count} / {submittedBoards.length} submissions</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-neutral-500 text-sm">X-Axis:</p>
                                                            <p>
                                                                {selectedConsensusSandwich.avgX >= 0
                                                                    ? `${Math.round(selectedConsensusSandwich.avgX * 100)}% Chaotic`
                                                                    : `${Math.round(-selectedConsensusSandwich.avgX * 100)}% Lawful`}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-neutral-500 text-sm">Y-Axis:</p>
                                                            <p>
                                                                {selectedConsensusSandwich.avgY <= 0
                                                                    ? `${Math.round(-selectedConsensusSandwich.avgY * 100)}% Good`
                                                                    : `${Math.round(selectedConsensusSandwich.avgY * 100)}% Evil`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {/* Variance Tab Inspector */}
                                    {boardViewTab === 'variance' && (
                                        !selectedConsensusSandwich ? (
                                            <div className="flex flex-col items-center justify-center h-[300px] text-neutral-500">
                                                No sandwich selected
                                                <span className="text-sm mt-2">(Click on a sandwich to select)</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <video
                                                    src={selectedConsensusSandwich.imagePath}
                                                    autoPlay loop muted playsInline
                                                    className="max-w-[90%] h-48 object-contain rounded-lg mb-4"
                                                />
                                                <div className="w-full mt-4">
                                                    <div className="mb-4">
                                                        <p className="text-neutral-500 text-sm">Name:</p>
                                                        <p className="text-lg">{selectedConsensusSandwich.name}</p>
                                                    </div>
                                                    <div className="mb-4">
                                                        <p className="text-neutral-500 text-sm">Spread (σ):</p>
                                                        <p className="text-2xl font-mono">
                                                            {selectedConsensusSandwich.spread.toFixed(2)}
                                                        </p>
                                                        <p className="text-neutral-500 text-xs mt-1">Lower = more agreement</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-neutral-500">σx:</p>
                                                            <p className="font-mono">{selectedConsensusSandwich.stdDevX.toFixed(3)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-neutral-500">σy:</p>
                                                            <p className="font-mono">{selectedConsensusSandwich.stdDevY.toFixed(3)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <p className="text-neutral-500 text-sm">Vote Count:</p>
                                                        <p>{selectedConsensusSandwich.count} submissions</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Below-board content based on tab */}
                            {/* Average Tab: Extreme Sandwiches */}
                            {boardViewTab === 'average' && extremeSandwiches && (
                                <div className="mt-6 space-y-2">
                                    <h4 className="text-sm text-neutral-400 mb-2">Extreme Positions</h4>
                                    <div
                                        className="flex items-center gap-4 p-3 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors"
                                        onClick={() => setSelectedConsensusSandwich(extremeSandwiches.mostChaotic)}
                                    >
                                        <span className="text-neutral-400 w-28 text-sm">Most Chaotic</span>
                                        <video src={extremeSandwiches.mostChaotic.imagePath} autoPlay loop muted playsInline className="w-16 h-10 object-contain" />
                                        <span className="flex-1">{extremeSandwiches.mostChaotic.name}</span>
                                        <span className="text-neutral-400">{Math.round(extremeSandwiches.mostChaotic.avgX * 100)}%</span>
                                    </div>
                                    <div
                                        className="flex items-center gap-4 p-3 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors"
                                        onClick={() => setSelectedConsensusSandwich(extremeSandwiches.mostLawful)}
                                    >
                                        <span className="text-neutral-400 w-28 text-sm">Most Lawful</span>
                                        <video src={extremeSandwiches.mostLawful.imagePath} autoPlay loop muted playsInline className="w-16 h-10 object-contain" />
                                        <span className="flex-1">{extremeSandwiches.mostLawful.name}</span>
                                        <span className="text-neutral-400">{Math.round(Math.abs(extremeSandwiches.mostLawful.avgX) * 100)}%</span>
                                    </div>
                                    <div
                                        className="flex items-center gap-4 p-3 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors"
                                        onClick={() => setSelectedConsensusSandwich(extremeSandwiches.mostGood)}
                                    >
                                        <span className="text-neutral-400 w-28 text-sm">Most Good</span>
                                        <video src={extremeSandwiches.mostGood.imagePath} autoPlay loop muted playsInline className="w-16 h-10 object-contain" />
                                        <span className="flex-1">{extremeSandwiches.mostGood.name}</span>
                                        <span className="text-neutral-400">{Math.round(Math.abs(extremeSandwiches.mostGood.avgY) * 100)}%</span>
                                    </div>
                                    <div
                                        className="flex items-center gap-4 p-3 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors"
                                        onClick={() => setSelectedConsensusSandwich(extremeSandwiches.mostEvil)}
                                    >
                                        <span className="text-neutral-400 w-28 text-sm">Most Evil</span>
                                        <video src={extremeSandwiches.mostEvil.imagePath} autoPlay loop muted playsInline className="w-16 h-10 object-contain" />
                                        <span className="flex-1">{extremeSandwiches.mostEvil.name}</span>
                                        <span className="text-neutral-400">{Math.round(extremeSandwiches.mostEvil.avgY * 100)}%</span>
                                    </div>
                                </div>
                            )}

                            {/* Variance Tab: Highest/Lowest Consensus Lists */}
                            {boardViewTab === 'variance' && (
                                <div className="mt-6 grid grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-lg mb-3">Lowest Spread</h4>
                                        <div className="space-y-2">
                                            {consensusSandwiches
                                                .filter(s => s.count >= 3)
                                                .sort((a, b) => a.spread - b.spread)
                                                .slice(0, 5)
                                                .map((sandwich, index) => (
                                                    <div
                                                        key={sandwich.id}
                                                        className="flex items-center gap-3 p-2 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors"
                                                        onClick={() => setSelectedConsensusSandwich(sandwich)}
                                                    >
                                                        <span className="text-neutral-500 w-5 text-sm">#{index + 1}</span>
                                                        <video src={sandwich.imagePath} autoPlay loop muted playsInline className="w-12 h-8 object-contain" />
                                                        <span className="flex-1 text-sm truncate">{sandwich.name}</span>
                                                        <span className="text-neutral-400 font-mono text-sm">{sandwich.spread.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg mb-3">Highest Spread</h4>
                                        <div className="space-y-2">
                                            {consensusSandwiches
                                                .filter(s => s.count >= 3)
                                                .sort((a, b) => b.spread - a.spread)
                                                .slice(0, 5)
                                                .map((sandwich, index) => (
                                                    <div
                                                        key={sandwich.id}
                                                        className="flex items-center gap-3 p-2 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors"
                                                        onClick={() => setSelectedConsensusSandwich(sandwich)}
                                                    >
                                                        <span className="text-neutral-500 w-5 text-sm">#{index + 1}</span>
                                                        <video src={sandwich.imagePath} autoPlay loop muted playsInline className="w-12 h-8 object-contain" />
                                                        <span className="flex-1 text-sm truncate">{sandwich.name}</span>
                                                        <span className="text-neutral-400 font-mono text-sm">{sandwich.spread.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Individual Tab: Board Note */}
                            {boardViewTab === 'individual' && selectedIndividualBoard?.note && (
                                <div className="mt-6 p-3 bg-neutral-800 rounded-lg">
                                    <p className="text-neutral-500 text-sm">User Note:</p>
                                    <p className="text-yellow-400">{selectedIndividualBoard.note}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminAuthenticated;
