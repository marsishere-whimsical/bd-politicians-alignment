import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import boardReducer from './boardSlice'
import selectedSandwichReducer from './selectedSandwichSlice'

const persistConfig = {
  key: 'root',
  storage,
}

const persistedBoardReducer = persistReducer(persistConfig, boardReducer)

export const store = configureStore({
  reducer: {
    board: persistedBoardReducer,
    selectedSandwich: selectedSandwichReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER']
      }
    })
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch