import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Sandwich {
  id: string
  name: string
  imagePath: string
  x?: number
  y?: number
}

interface BoardState {
  axisLabels: {
    top: string
    bottom: string
    left: string
    right: string
  }
  sandwichesOnBoard: Sandwich[]
}

const initialState: BoardState = {
  axisLabels: {
    top: 'Good',
    bottom: 'Evil',
    left: 'Lawful',
    right: 'Chaotic'
  },
  sandwichesOnBoard: []
}

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setAxisLabels: (state, action: PayloadAction<BoardState['axisLabels']>) => {
      state.axisLabels = action.payload
    },
    addSandwich: (state, action: PayloadAction<Sandwich>) => {
      state.sandwichesOnBoard.push(action.payload)
    },
    removeSandwich: (state, action: PayloadAction<string>) => {
      state.sandwichesOnBoard = state.sandwichesOnBoard.filter(
        sandwich => sandwich.id !== action.payload
      )
    },
    updateSandwichPosition: (
      state,
      action: PayloadAction<{ id: string; x: number; y: number }>
    ) => {
      const sandwich = state.sandwichesOnBoard.find(s => s.id === action.payload.id)
      if (sandwich) {
        sandwich.x = action.payload.x
        sandwich.y = action.payload.y
      }
    },
    clearBoard: (state) => {
      state.sandwichesOnBoard = []
    }
  }
})

export const { setAxisLabels, addSandwich, removeSandwich, updateSandwichPosition, clearBoard } = boardSlice.actions
export default boardSlice.reducer
