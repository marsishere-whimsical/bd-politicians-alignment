import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../store/store"
import { addSandwich, Sandwich, updateSandwichPosition } from "../store/boardSlice"
import LinesAndArrows from "./LinesAndArrows"
import { setSelectedSandwich } from "../store/selectedSandwichSlice"


function AlignmentBoard() {
  const dispatch = useDispatch()
  const labels = useSelector((state: RootState) => state.board.axisLabels)
  const sandwichesOnBoard = useSelector((state: RootState) => state.board.sandwichesOnBoard)
  const selectedSandwich = useSelector((state: RootState) => state.selectedSandwich.selectedSandwich)


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleSandwichDragStart = (e: React.DragEvent, sandwich: Sandwich) => {
    e.dataTransfer.setData('sandwich-id', sandwich.id)
  }

  const handleSandwichClick = (e: React.MouseEvent, sandwich: Sandwich) => {
    e.stopPropagation()
    dispatch(setSelectedSandwich(sandwich))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const sandwichId = e.dataTransfer.getData('sandwich-id')
    const board = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - board.left) / board.width) * 2 - 1
    const y = ((e.clientY - board.top) / board.height) * 2 - 1
  
    if (sandwichId) {
      dispatch(updateSandwichPosition({ id: sandwichId, x, y }))
      const updatedSandwich = sandwichesOnBoard.find(s => s.id === sandwichId)
      if (updatedSandwich) {
        dispatch(setSelectedSandwich({ ...updatedSandwich, x, y }))
      }
    } else {
      const sandwich = JSON.parse(e.dataTransfer.getData('application/json'))
      const newSandwich = { ...sandwich, x, y }
      dispatch(addSandwich(newSandwich))
      dispatch(setSelectedSandwich(newSandwich))
    }
  }

  return (
    <div
      className="relative w-full h-full bg-neutral-100 rounded-lg"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <LinesAndArrows />

      {/* Sandwiches */}
      {sandwichesOnBoard.map(sandwich => (
        <img
  key={sandwich.id}
  src={sandwich.imagePath}
  alt={sandwich.name}
  draggable
  onDragStart={(e) => handleSandwichDragStart(e, sandwich)}
  onClick={(e) => handleSandwichClick(e, sandwich)}
  className={`absolute w-28 h-20 object-contain -translate-x-1/2 -translate-y-1/2 cursor-move z-40
    ${selectedSandwich?.id === sandwich.id ? 'ring-2 ring-black rounded-xl' : ''}`}
  style={{
    left: `${((sandwich.x! + 1) / 2) * 100}%`,
    top: `${((sandwich.y! + 1) / 2) * 100}%`
  }}
/>
      ))}

      {/* Labels as HTML elements instead of SVG text */}
      <div className="text-neutral-800 select-none">
        <div className="absolute top-13 left-1/2 -translate-x-1/2 px-2 py-1 bg-white border border-neutral-400 rounded text-sm">{labels.top}</div>
        <div className="absolute bottom-13 left-1/2 -translate-x-1/2 px-2 py-1 bg-white border border-neutral-400 rounded text-sm">{labels.bottom}</div>
        <div className="absolute left-13 top-1/2 -translate-y-1/2 px-2 py-1 bg-white border border-neutral-400 rounded text-sm">{labels.left}</div>
        <div className="absolute right-13 top-1/2 -translate-y-1/2 px-2 py-1 bg-white border border-neutral-400 rounded text-sm">{labels.right}</div>
      </div>
    </div>
  )
}

export default AlignmentBoard
