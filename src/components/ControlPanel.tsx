import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearBoard } from '../store/boardSlice'
import { setSelectedSandwich } from '../store/selectedSandwichSlice'
import AxisLabelModal from './AxisLabelModal'
import { RootState } from '../store/store'
import sandwichData from '../data/sandwiches.json'
import ClearBoardModal from './ClearBoardModal'
import Celebration from './Celebration'
import SubmissionModal from './SubmissionModal'

function ControlPanel() {
    const dispatch = useDispatch()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isClearModalOpen, setIsClearModalOpen] = useState(false)
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submissionSuccess, setSubmissionSuccess] = useState(false)

    const sandwichesOnBoard = useSelector((state: RootState) => state.board.sandwichesOnBoard)
    const axisLabels = useSelector((state: RootState) => state.board.axisLabels);


    const handleClearConfirm = () => {
        dispatch(clearBoard())
        dispatch(setSelectedSandwich(null))
        setIsClearModalOpen(false)
    }

    const handleSubmitBoard = async (note: string) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/submitBoard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sandwichesOnBoard,
                    axisLabels,
                    note,
                    source: 'user-submitted-on-site'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit board');
            }

            const data = await response.json();
            console.log('Board submitted:', data);
            setSubmissionSuccess(true);
            setTimeout(() => {
                setIsSubmissionModalOpen(false);
                setSubmissionSuccess(false);
            }, 3000); // Close modal after 3 seconds
        } catch (error) {
            console.error('Error submitting board:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-between items-center w-full rounded-lg mx-4">
            <div className="text-neutral-200 ms-4">
                Sandwiches placed: {sandwichesOnBoard.length} / {sandwichData.sandwiches.length}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => setIsClearModalOpen(true)}
                    className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded hover:bg-neutral-700 cursor-pointer"
                >
                    Clear Board
                </button>
                <button
                    className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded hover:bg-neutral-700 cursor-pointer"
                    onClick={() => setIsModalOpen(true)}
                >
                    Set Axis Labels
                </button>
                <button
                    onClick={() => setIsSubmissionModalOpen(true)}
                    className="px-4 py-2 bg-white text-black rounded hover:bg-neutral-200 cursor-pointer"
                >
                    Submit Board
                </button>
            </div>

            {isModalOpen && (
                <AxisLabelModal onClose={() => setIsModalOpen(false)} />
            )}

            {isClearModalOpen && (
                <ClearBoardModal onClose={() => setIsClearModalOpen(false)} onConfirm={handleClearConfirm} />
            )}

            {isSubmissionModalOpen && (
                <SubmissionModal
                    isOpen={isSubmissionModalOpen}
                    onClose={() => setIsSubmissionModalOpen(false)}
                    onSubmit={handleSubmitBoard}
                    sandwichesOnBoard={sandwichesOnBoard}
                    isSubmitting={isSubmitting}
                    submissionSuccess={submissionSuccess}
                />
            )}

            {sandwichesOnBoard.length === sandwichData.sandwiches.length && <Celebration />}
        </div>
    )
}

export default ControlPanel