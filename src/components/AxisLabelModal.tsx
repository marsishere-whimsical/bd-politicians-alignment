import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setAxisLabels } from '../store/boardSlice'
import type { RootState } from '../store/store'

interface AxisLabelModalProps {
  onClose: () => void
}

const defaultLabels = {
  top: 'Good',
  bottom: 'Evil',
  left: 'Lawful',
  right: 'Chaotic'
}

function AxisLabelModal({ onClose }: AxisLabelModalProps) {
  const dispatch = useDispatch()
  const currentLabels = useSelector((state: RootState) => state.board.axisLabels)
  const [labels, setLabels] = useState(currentLabels)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(setAxisLabels(labels))
    onClose()
  }

  const handleReset = () => {
    setLabels(defaultLabels)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-neutral-900 p-8 rounded-lg w-[500px] border border-neutral-700">
        <h2 className="text-2xl text-neutral-200 mb-6">Set Axis Labels</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex justify-center">
            <input
              type="text"
              value={labels.top}
              onChange={e => setLabels({...labels, top: e.target.value})}
              className="w-48 p-2 rounded text-center border border-neutral-600 bg-neutral-800 text-neutral-200 focus:border-white outline-none"
            />
          </div>

          <div className="flex justify-between">
            <input
              type="text"
              value={labels.left}
              onChange={e => setLabels({...labels, left: e.target.value})}
              className="w-48 p-2 rounded text-center border border-neutral-600 bg-neutral-800 text-neutral-200 focus:border-white outline-none"
            />
            <input
              type="text"
              value={labels.right}
              onChange={e => setLabels({...labels, right: e.target.value})}
              className="w-48 p-2 rounded text-center border border-neutral-600 bg-neutral-800 text-neutral-200 focus:border-white outline-none"
            />
          </div>

          <div className="flex justify-center">
            <input
              type="text"
              value={labels.bottom}
              onChange={e => setLabels({...labels, bottom: e.target.value})}
              className="w-48 p-2 rounded text-center border border-neutral-600 bg-neutral-800 text-neutral-200 focus:border-white outline-none"
            />
          </div>

          <div className="flex gap-4 justify-between mt-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded hover:bg-neutral-700 cursor-pointer"
            >
              Reset to Default
            </button>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded hover:bg-neutral-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black rounded hover:bg-neutral-200 cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AxisLabelModal
