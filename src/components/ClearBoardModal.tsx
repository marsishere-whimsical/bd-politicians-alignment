interface ClearBoardModalProps {
    onClose: () => void
    onConfirm: () => void
  }
  
  function ClearBoardModal({ onClose, onConfirm }: ClearBoardModalProps) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-700">
          <h2 className="text-xl text-neutral-200 mb-4">Clear Board?</h2>
          <p className="text-neutral-300 mb-6">This will remove all sandwiches from the board.</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded hover:bg-neutral-700 cursor-pointer"
            >
              No
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-white text-black rounded hover:bg-neutral-200 cursor-pointer"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  export default ClearBoardModal
  