import { useDispatch, useSelector } from "react-redux"
import AlignmentBoard from "./AlignmentBoard"
import ControlPanel from "./ControlPanel"
import SandwichCarousel from "./SandwichCarousel"
import SandwichInspector from "./SandwichInspector"
import SplashScreen from "./SplashScreen"
import { setSelectedSandwich } from "../store/selectedSandwichSlice"
import { useEffect } from "react"
import { removeSandwich } from "../store/boardSlice"
import { RootState } from "../store/store"

function SandwichAlignmentGame() {
  const dispatch = useDispatch();
  const selectedSandwich = useSelector((state: RootState) => state.selectedSandwich.selectedSandwich);

  const handleBackgroundClick = () => {
    dispatch(setSelectedSandwich(null))
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Backspace" && selectedSandwich) {
        dispatch(removeSandwich(selectedSandwich.id));
        dispatch(setSelectedSandwich(null));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, selectedSandwich]);

  return (
    <>
      {/* Main game content - only visible above 1024px */}
      <div className="hidden lg:flex flex-col gap-4 w-full" onClick={handleBackgroundClick}>

        <div className="w-full h-16 bg-neutral-900 rounded-lg flex items-center">
          <ControlPanel />
        </div>

        <div className="flex gap-4">
          <div className="w-[750px] h-[550px] bg-neutral-900 rounded-lg">
            <AlignmentBoard />
          </div>

          <div className="flex-1 bg-neutral-900 rounded-lg">
            <SandwichInspector />
          </div>
        </div>

        <div className="w-full h-48 bg-neutral-900 rounded-lg p-4">
          <SandwichCarousel />
        </div>
      </div>

      {/* Splash screen - only visible below 1024px */}
      <SplashScreen />
    </>
  )
}
export default SandwichAlignmentGame
