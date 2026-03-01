import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Sandwich } from './boardSlice'

interface SelectedSandwichState {
  selectedSandwich: Sandwich | null
}

const initialState: SelectedSandwichState = {
  selectedSandwich: null
}

const selectedSandwichSlice = createSlice({
  name: 'selectedSandwich',
  initialState,
  reducers: {
    setSelectedSandwich: (state, action: PayloadAction<Sandwich | null>) => {
      state.selectedSandwich = action.payload
    }
  }
})

export const { setSelectedSandwich } = selectedSandwichSlice.actions
export default selectedSandwichSlice.reducer
