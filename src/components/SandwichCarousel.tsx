import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/store'
import sandwichData from '../data/sandwiches.json'
import { setSelectedSandwich } from '../store/selectedSandwichSlice'
import { useRef } from 'react'

function SandwichCarousel() {
  const dispatch = useDispatch()
  const carouselRef = useRef<HTMLDivElement>(null)
  const sandwichesOnBoard = useSelector((state: RootState) => state.board.sandwichesOnBoard)
  const selectedSandwich = useSelector((state: RootState) => state.selectedSandwich.selectedSandwich)

  const availableSandwiches = sandwichData.sandwiches.filter(
    sandwich => !sandwichesOnBoard.some(placed => placed.id === sandwich.id)
  )

  const handleSandwichClick = (e: React.MouseEvent, sandwich: typeof sandwichData.sandwiches[0]) => {
    e.stopPropagation()
    dispatch(setSelectedSandwich(sandwich))
  }

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 200
      const newScrollLeft = carouselRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      carouselRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

const handleDragStart = (e: React.DragEvent, sandwich: typeof sandwichData.sandwiches[0]) => {
    e.dataTransfer.setData('application/json', JSON.stringify(sandwich));
  };

  return (
    <div className="w-full h-full rounded-lg flex items-center select-none">

      <button
        onClick={() => scroll('left')}
        className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded-l hover:bg-neutral-700 h-full"
      >
        ←
      </button>

      <div
        ref={carouselRef}
        className="flex gap-2 overflow-x-auto overflow-y-hidden hide-scrollbar h-full p-2 px-4 flex-1"
      >
        {availableSandwiches.map(sandwich => (
          <div
            key={sandwich.id}
            onClick={(e) => handleSandwichClick(e, sandwich)}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, sandwich)}
            className={`flex flex-col flex-shrink-0 cursor-grab transition-transform h-full justify-center origin-top p-4
            ${selectedSandwich?.id === sandwich.id ? 'ring-1 ring-white rounded-lg' : ''}`}
          >
            <img
  src={sandwich.imagePath}
  alt={sandwich.name}
  draggable={false}
  className="w-24 h-16 object-contain"
/>
            <p
              className="text-neutral-200 text-xs mt-1 text-center w-24 select-none"
              draggable={false}
            >
              {sandwich.name}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded-r hover:bg-neutral-700 h-full"
      >
        →
      </button>
    </div>
  )
}

export default SandwichCarousel

