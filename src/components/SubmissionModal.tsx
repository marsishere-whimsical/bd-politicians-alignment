import React, { useState } from 'react';

interface SubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (note: string) => void;
    sandwichesOnBoard: any[]; // Adjust the type as needed
    isSubmitting: boolean;
    submissionSuccess: boolean;
}

const SubmissionModal: React.FC<SubmissionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    sandwichesOnBoard,
    isSubmitting,
    submissionSuccess,
}) => {
    const [note, setNote] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-neutral-900 p-6 rounded-lg w-[500px] border border-neutral-700">
                <h2 className="text-xl text-neutral-200 mb-4">Submit Board</h2>
                <p className="text-neutral-300 mb-4">
                    You have {sandwichesOnBoard.length} sandwiches on the board.
                </p>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note (optional)"
                    className="w-full p-2 mb-4 rounded bg-neutral-800 text-neutral-200 border border-neutral-600 focus:border-white outline-none"
                    rows={1}
                    maxLength={200}
                    style={{ maxHeight: '100px', minHeight: '44px', overflow: 'auto' }}
                />

                {isSubmitting ? (
                    <div className="flex items-center justify-center mb-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                ) : submissionSuccess ? (
                    <p className="text-neutral-200 mb-6">Submission successful!</p>
                ) : (
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded hover:bg-neutral-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSubmit(note)}
                            className="px-4 py-2 bg-white text-black rounded hover:bg-neutral-200"
                        >
                            Submit
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmissionModal;